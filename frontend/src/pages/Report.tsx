/**
 * Report — controller. Picks between RunningView and DashboardView.
 *
 *  - While the pipeline is running OR the user just landed → RunningView
 *  - When all 5 agents complete and the user clicks "VIEW DASHBOARD" → DashboardView
 *  - On reload of a completed report, jumps straight to DashboardView
 */
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, openAgentSocket } from '../lib/api'
import RunningView from '../components/RunningView'
import DashboardView from '../components/DashboardView'
import ErrorBoundary from '../components/ErrorBoundary'

type Status = 'pending' | 'running' | 'complete' | 'error'
const AGENTS = ['scout', 'atlas', 'forge', 'deck', 'connect'] as const

function deriveStatuses(report: any): Record<string, Status> {
  const next = Object.fromEntries(AGENTS.map((agent) => [agent, report?.[`${agent}_output`] ? 'complete' : 'pending'])) as Record<string, Status>

  if (report?.status === 'failed') {
    for (const agent of AGENTS) {
      if (next[agent] !== 'complete') next[agent] = 'error'
    }
    return next
  }

  if (report?.status === 'running' || report?.status === 'pending') {
    const firstPending = AGENTS.find((agent) => next[agent] === 'pending')
    if (firstPending) next[firstPending] = 'running'
    if (firstPending === 'forge' && next.scout === 'pending') next.scout = 'running'
    if (firstPending === 'scout') next.atlas = next.atlas === 'complete' ? 'complete' : 'running'
  }

  return next
}

function progressLog(report: any): { agent: string; msg: string; ts: number }[] {
  if (!report) return []
  const now = Date.now()
  const lines: { agent: string; msg: string; ts: number }[] = [{ agent: 'system', msg: 'Dispatch accepted. Pipeline is warming up...', ts: now }]
  for (const agent of AGENTS) {
    if (report[`${agent}_output`]) {
      lines.push({ agent, msg: `${agent} output saved`, ts: now })
    }
  }
  const running = AGENTS.find((agent) => !report[`${agent}_output`])
  if (report.status === 'running' && running) {
    lines.push({ agent: running, msg: `${running} is running. This stage can take about a minute.`, ts: now })
  }
  if (report.status === 'failed') lines.push({ agent: 'system', msg: 'Pipeline failed. Check backend logs for the provider error.', ts: now })
  return lines
}

export default function Report() {
  const { id = '' } = useParams()
  const [report, setReport] = useState<any>(null)
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    scout: 'pending',
    atlas: 'pending',
    forge: 'pending',
    deck: 'pending',
    connect: 'pending',
  })
  const [logs, setLogs] = useState<{ agent: string; msg: string; ts: number }[]>([])
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [view, setView] = useState<'running' | 'dashboard'>('running')
  const startedAt = useRef(Date.now())
  const resumed = useRef(false)

  useEffect(() => {
    let closed = false
    let sawSocketEvent = false

    const applyReport = (r: any) => {
      if (closed) return
      setReport(r)
      setStatuses((current) => ({ ...deriveStatuses(r), ...Object.fromEntries(Object.entries(current).filter(([, status]) => status === 'complete')) }))
      if (!sawSocketEvent) setLogs(progressLog(r))
      if (r.status === 'failed') setFatalError('Pipeline failed. Check backend logs for details.')
      const hasAnyOutput = AGENTS.some((agent) => r[`${agent}_output`])
      if (!hasAnyOutput && r.status === 'running' && !resumed.current && Date.now() - startedAt.current > 12_000) {
        resumed.current = true
        setLogs((l) => [...l, { agent: 'system', msg: 'No agent output yet. Nudging backend pipeline...', ts: Date.now() }])
        api.resumeReport(id).catch((e) => {
          setLogs((l) => [...l, { agent: 'system', msg: `Resume failed: ${e.message}`, ts: Date.now() }])
        })
      }
      // If the user is opening a previously completed report, skip the running view
      if (r.status === 'complete') {
        setStatuses({
          scout: 'complete',
          atlas: 'complete',
          forge: 'complete',
          deck: 'complete',
          connect: 'complete',
        })
        setView('dashboard')
      }
    }

    api.getReport(id).then(applyReport).catch((e) => setFatalError(e.message))

    const ws = openAgentSocket(id, (e) => {
      if (e.type === 'log') {
        sawSocketEvent = true
        setLogs((l) => [...l, { agent: e.agent, msg: e.msg, ts: Date.now() }])
      } else if (e.type === 'status') {
        sawSocketEvent = true
        setStatuses((s) => ({ ...s, [e.agent]: e.status }))
        if (e.status === 'complete' && e.output) {
          setReport((r: any) => (r ? { ...r, [`${e.agent}_output`]: e.output } : r))
        }
      } else if (e.type === 'complete') {
        api.getReport(id).then(setReport)
      } else if (e.type === 'error') {
        setFatalError(e.msg || 'pipeline failed')
        setStatuses((s) => {
          const next = { ...s }
          for (const k of Object.keys(next)) {
            if (next[k] === 'running' || next[k] === 'pending') next[k] = 'error'
          }
          return next
        })
      }
    })

    const poll = window.setInterval(() => {
      api.getReport(id).then(applyReport).catch(() => {})
    }, 2500)

    ws.onclose = () => {
      setTimeout(() => api.getReport(id).then(setReport).catch(() => {}), 200)
    }
    return () => {
      closed = true
      window.clearInterval(poll)
      ws.close()
    }
  }, [id])

  if (!report) {
    return (
      <main className="pt-40 min-h-screen">
        <div className="shell text-ink-dim font-mono text-xs uppercase tracking-[0.18em]">
          › loading dispatch…
        </div>
      </main>
    )
  }

  if (view === 'dashboard') {
    return (
      <ErrorBoundary>
        <DashboardView report={report} />
      </ErrorBoundary>
    )
  }

  return (
    <RunningView
      idea={report.idea}
      statuses={statuses}
      logs={logs}
      fatalError={fatalError}
      onViewDashboard={() => setView('dashboard')}
    />
  )
}
