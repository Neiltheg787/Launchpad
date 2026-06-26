import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import LiveClock from '../components/LiveClock'
import HowItWorks from '../components/HowItWorks'

const SESSION_KEY = 'ac_hero_shown_v5'

const HEADLINE_WORDS: Array<{ text: string; accent?: boolean }> = [
  { text: 'TURN' },
  { text: 'YOUR' },
  { text: 'STARTUP' },
  { text: 'IDEA' },
  { text: 'INTO' },
  { text: 'A' },
  { text: 'LAUNCH.', accent: true },
]

const AGENTS = [
  {
    num: '01',
    slug: 'SCOUT',
    role: 'Demand validator',
    blurb: 'Scrapes Reddit, ProductHunt, G2, and Google Trends. Synthesises a live demand score against real founder quotes.',
    output: 'DEMAND_SCORE.json',
  },
  {
    num: '02',
    slug: 'ATLAS',
    role: 'Market map',
    blurb: 'Sizes the opportunity bottom-up. TAM, SAM, SOM. Profiles the ICP. Breaks the competitive landscape.',
    output: 'MARKET_MAP.json',
  },
  {
    num: '03',
    slug: 'FORGE',
    role: 'MVP blueprint',
    blurb: 'Selects a stack. Generates a live GitHub repository with auth, DB, CI and deploy configs ready to ship.',
    output: 'REPO.git',
  },
  {
    num: '04',
    slug: 'DECK',
    role: 'Pitch narrative',
    blurb: 'Twelve slides in Sequoia format. Delivered as a real .pptx binary and a live Google Slides URL.',
    output: 'DECK.pptx',
  },
  {
    num: '05',
    slug: 'CONNECT',
    role: 'Investor match',
    blurb: 'Ranks investors by thesis fit. Writes a Google Sheet of named funds with contact vectors and warm-intro paths.',
    output: 'FUNDS.sheet',
  },
]

export default function Landing() {
  const [instant] = useState(() => {
    if (typeof window === 'undefined') return false
    const seen = sessionStorage.getItem(SESSION_KEY) === '1'
    sessionStorage.setItem(SESSION_KEY, '1')
    return seen
  })
  const BOOT_OFFSET = instant ? 0 : 250

  return (
    <main className={`relative ${instant ? 'orchestrate-instant' : ''}`}>
      {/* =========================================================
         HERO — two columns
         ========================================================= */}
      <section className="relative pt-[116px] md:pt-[148px] pb-20 md:pb-28 overflow-hidden">
        <div className="shell relative grid grid-cols-12 gap-8 md:gap-12" style={{ zIndex: 1 }}>
          {/* LEFT — command */}
          <div className="col-span-12 lg:col-span-7">
            <PreLabel instant={instant} bootOffset={BOOT_OFFSET} />

            <h1
              className="font-display font-black leading-[0.88] mt-6"
              style={{ fontSize: 'clamp(56px, 9vw, 136px)', color: 'var(--color-text-1)' }}
            >
              {HEADLINE_WORDS.map((w, i) => (
                <HeadlineWord key={i} index={i} accent={w.accent} instant={instant} bootOffset={BOOT_OFFSET}>
                  {w.text}
                </HeadlineWord>
              ))}
            </h1>

            <p
              className="mt-8 text-lg leading-[1.65] max-w-md anim-clip-wipe"
              style={{
                color: 'var(--color-text-2)',
                animationDelay: instant ? '0ms' : `${BOOT_OFFSET + 1300}ms`,
              }}
            >
              Five specialist agents interrogate your thesis in parallel. A pitch deck, MVP repository, market report and ranked investor list — in under ten minutes.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/validate"
                className="btn anim-fade-up"
                style={{ animationDelay: instant ? '0ms' : `${BOOT_OFFSET + 1450}ms` }}
                data-cursor="link"
              >
                Start validation <span className="arrow">↗</span>
              </Link>
              <a
                href="#agents"
                className="btn-ghost anim-fade-up"
                style={{ animationDelay: instant ? '0ms' : `${BOOT_OFFSET + 1530}ms` }}
                data-cursor="link"
              >
                View workflow
              </a>
            </div>
          </div>

          {/* RIGHT — terminal */}
          <div className="col-span-12 lg:col-span-5">
            <div
              className="anim-slide-right"
              style={{ animationDelay: instant ? '0ms' : `${BOOT_OFFSET + 1600}ms` }}
            >
              <Terminal instant={instant} bootOffset={BOOT_OFFSET} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         MARQUEE
         ========================================================= */}
      <section className="border-y" style={{ borderColor: 'var(--color-border-1)' }}>
        <div className="py-4 overflow-hidden relative">
          <div className="marquee-track font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-2)' }}>
            {[...Array(2)].flatMap((_, k) => [
              `[ ${214 + k} REPORTS FILED THIS WEEK ]`,
              '[ 5 AGENTS ACTIVE ]',
              '[ GMI CLOUD INFERENCE ]',
              '[ WORKSPACE READY ]',
              '[ MEAN RUNTIME 00:09:42 ]',
              '[ LIVE EXPORTS ]',
              '[ EDGE RUNTIME ]',
            ].map((t, i) => (
              <span key={`${k}-${i}`} className="inline-flex items-center gap-3">
                <span style={{ color: 'var(--color-charge)' }}>●</span>
                {t}
              </span>
            )))}
          </div>
        </div>
      </section>

      {/* =========================================================
         STATS READOUT
         ========================================================= */}
      <section className="border-b" style={{ borderColor: 'var(--color-border-1)' }}>
        <div className="shell">
          <div className="py-3 border-b" style={{ borderColor: 'var(--color-border-1)' }}>
            <div className="label">Platform metrics</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: '<10', unit: 'MINUTES', tag: 'RUNTIME PER REPORT' },
              { value: '05', unit: 'AGENTS', tag: 'COORDINATED PIPELINE' },
              { value: '04', unit: 'EXPORTS', tag: 'FILES READY TO SHARE' },
              { value: '100%', unit: 'YIELD', tag: 'REAL ARTIFACTS' },
            ].map((s, i) => (
              <Reveal key={s.tag} delay={i * 80}>
                <div
                  className={`py-10 px-8 md:px-10 ${i < 3 ? 'border-r' : ''} border-b md:border-b-0`}
                  style={{ borderColor: 'var(--color-border-1)' }}
                >
                  <div className="font-display font-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 5vw, 80px)', color: 'var(--color-text-1)' }}>
                    {s.value}
                  </div>
                  <div className="h-px bg-accent my-3" style={{ width: 32 }} />
                  <div className="label">{s.unit}</div>
                  <div className="label mt-1" style={{ color: 'var(--color-text-3)' }}>
                    {s.tag}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
         AGENTS
         ========================================================= */}
      <section id="agents" className="shell py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-16">
          <div className="col-span-12 md:col-span-5">
            <Reveal>
              <div className="tag mb-4">Agent workflow</div>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="font-display font-black leading-[0.95]"
                style={{ fontSize: 'clamp(40px, 5.5vw, 84px)' }}
              >
                Five agents.
                <br />
                <span style={{ color: 'var(--color-charge)' }}>One clean report.</span>
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 flex items-end">
            <Reveal delay={160}>
              <p className="text-lg leading-[1.65] max-w-lg" style={{ color: 'var(--color-text-2)' }}>
                Each agent adds a concrete artifact to the same workspace: market signal, technical plan, deck narrative, and investor fit.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((a, i) => (
            <Reveal key={a.slug} delay={i * 60}>
              <AgentPanel agent={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* =========================================================
         HOW IT WORKS — three-step package
         ========================================================= */}
      <div id="method" className="border-y" style={{ borderColor: 'var(--color-border-1)', background: 'var(--color-surface-1)' }}>
        <HowItWorks />
      </div>

      {/* =========================================================
         CLOSING
         ========================================================= */}
      <section
        className="relative border-y overflow-hidden"
        style={{ borderColor: 'var(--color-border-1)', background: 'var(--color-void)' }}
      >
        <div className="shell relative py-32 md:py-44 text-center pointer-events-none" style={{ zIndex: 1 }}>
          <Reveal>
            <div className="tag mb-6">Ready when you are</div>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="font-display font-black leading-[0.95] max-w-5xl mx-auto"
              style={{
                fontSize: 'clamp(44px, 7vw, 104px)',
              }}
            >
              Move from idea to evidence.
              <br />
              <span style={{ color: 'var(--color-charge)' }}>
                Ship the first version.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-12 pointer-events-auto">
              <Link to="/validate" data-cursor="link" className="btn">
                Run first report <span className="arrow">↗</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
         FOOTER
         ========================================================= */}
      <footer className="shell py-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-charge)' }}>
            LAUNCHPAD
          </span>
          <span className="label">V0.1.3 · © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          {['PRIVACY', 'TERMS', 'GITHUB', 'STATUS'].map((x) => (
            <a key={x} className="nav-link" data-cursor="link">
              {x}
            </a>
          ))}
          <div className="flex items-center gap-2 label">
            <LiveClock />
            <span>UTC</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* ================================================================
   PreLabel
   ================================================================ */
function PreLabel({ instant, bootOffset = 0 }: { instant: boolean; bootOffset?: number }) {
  const text = 'Launchpad validation studio'
  const [out, setOut] = useState(instant ? text : '')
  const [done, setDone] = useState(instant)

  useEffect(() => {
    if (instant) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOut(text)
      setDone(true)
      return
    }
    let i = 0
    const start = setTimeout(() => {
      const step = () => {
        i++
        setOut(text.slice(0, i))
        if (i < text.length) setTimeout(step, 35)
        else setDone(true)
      }
      step()
    }, 150 + bootOffset)
    return () => clearTimeout(start)
  }, [instant, bootOffset])

  return (
    <div
      className={`font-mono text-[11px] tracking-[0.14em] uppercase ${done ? '' : 'cursor-blink'}`}
      style={{ color: 'var(--color-charge)', minHeight: 16 }}
    >
      {out}
    </div>
  )
}

/* ================================================================
   HeadlineWord — clip-path up reveal, 50ms stagger
   ================================================================ */
function HeadlineWord({
  children,
  index,
  accent,
  instant,
  bootOffset = 0,
}: {
  children: React.ReactNode
  index: number
  accent?: boolean
  instant: boolean
  bootOffset?: number
}) {
  const delay = instant ? 0 : bootOffset + 850 + index * 50
  return (
    <span className="inline-block overflow-hidden align-top mr-[0.3em]">
      <span
        className="inline-block anim-word-reveal"
        style={{
          animationDelay: `${delay}ms`,
          color: accent ? 'var(--color-charge)' : undefined,
          textShadow: accent ? '0 18px 48px rgba(56,189,248,0.2)' : undefined,
          position: 'relative',
        }}
      >
        {children}
        {accent && (
          <span
            aria-hidden
            className="absolute left-0 right-0 anim-draw-rule"
            style={{
              bottom: 6,
              height: 2,
              background: 'var(--color-charge)',
              boxShadow: '0 8px 24px rgba(56,189,248,0.35)',
              animationDelay: `${instant ? 0 : bootOffset + 1400}ms`,
            }}
          />
        )}
      </span>
    </span>
  )
}

/* ================================================================
   Terminal — the centerpiece
   ================================================================ */
type AgentState = 'complete' | 'running' | 'queued'

function Terminal({ instant, bootOffset = 0 }: { instant: boolean; bootOffset?: number }) {
  const [progress, setProgress] = useState<Record<string, number>>({
    scout: 0,
    atlas: 0,
    forge: 0,
    deck: 0,
    connect: 0,
  })
  const [state, setState] = useState<Record<string, AgentState>>({
    scout: 'queued',
    atlas: 'queued',
    forge: 'queued',
    deck: 'queued',
    connect: 'queued',
  })
  const [score, setScore] = useState(instant ? 8.2 : 0)
  const [dots, setDots] = useState('···')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const base = instant ? 0 : 800 + bootOffset

    const run = (key: string, startMs: number, completeMs: number) => {
      setTimeout(() => {
        setState((s) => ({ ...s, [key]: 'running' }))
        setProgress((p) => ({ ...p, [key]: 100 }))
      }, base + startMs)
      setTimeout(() => {
        setState((s) => ({ ...s, [key]: 'complete' }))
      }, base + completeMs)
    }

    run('scout', 100, 800)
    run('atlas', 200, 1000)
    run('forge', 1000, 2000)
    run('deck', 2000, 3200)
    run('connect', 3200, 4200)

    // Score count-up
    setTimeout(() => {
      if (instant) return
      const target = 8.2
      const duration = 800
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - t0) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        setScore(Number((target * ease).toFixed(1)))
        if (t < 1) requestAnimationFrame(tick)
        else setScore(target)
      }
      requestAnimationFrame(tick)
    }, base + 300)
  }, [instant, bootOffset])

  // Dots animation on running row
  useEffect(() => {
    const frames = ['·  ', '·· ', '···']
    let i = 0
    const id = setInterval(() => {
      setDots(frames[i++ % 3])
    }, 380)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative font-mono"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(10,15,25,0.98))',
        border: '1px solid var(--color-border-1)',
        borderRadius: 18,
        boxShadow: '0 24px 80px -36px rgba(15,23,42,0.9)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-9 border-b"
        style={{ borderColor: 'var(--color-border-1)' }}
      >
        <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-2)' }}>
          Validation run
        </div>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-charge)' }}>
          <span className="live-dot live-dot--amber" />
          Live
        </div>
      </div>

      {/* Idea line */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-1)' }}>
        <div className="flex items-baseline justify-between text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--color-text-2)' }}>
          <span>Idea</span>
          <span style={{ color: 'var(--color-steel)' }}>✓</span>
        </div>
        <div className="mt-2 text-[12px]" style={{ color: 'var(--color-text-1)' }}>
          AI tutor for high-school calculus, one problem at a time
        </div>
      </div>

      {/* Agent rows */}
      <div className="py-1">
        {[
          { key: 'scout', label: 'SCOUT' },
          { key: 'atlas', label: 'ATLAS' },
          { key: 'forge', label: 'FORGE' },
          { key: 'deck', label: 'DECK' },
          { key: 'connect', label: 'CONNECT' },
        ].map((a, i) => (
          <AgentRow
            key={a.key}
            num={`0${i + 1}`}
            label={a.label}
            pct={progress[a.key]}
            state={state[a.key]}
            dots={dots}
          />
        ))}
      </div>

      {/* Readouts */}
      <div className="border-t" style={{ borderColor: 'var(--color-border-1)' }}>
        <ReadoutLine label="Score" value={`${score.toFixed(1)} / 10`} hot />
        <ReadoutLine label="Signal" value="Strong" hot />
        <ReadoutLine label="Collision" value="Low" />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 h-9 border-t text-[10px] tracking-[0.15em] uppercase"
        style={{ borderColor: 'var(--color-border-1)', color: 'var(--color-text-2)' }}
      >
        <span>Updated</span>
        <LiveClock className="text-[10px]" />
      </div>
    </div>
  )
}

function AgentRow({
  num,
  label,
  pct,
  state,
  dots,
}: {
  num: string
  label: string
  pct: number
  state: AgentState
  dots: string
}) {
  const statusText =
    state === 'complete' ? 'Done' : state === 'running' ? `Running ${dots}` : 'Queued'
  const statusColor =
    state === 'complete'
      ? 'var(--color-steel)'
      : state === 'running'
      ? 'var(--color-charge)'
      : 'var(--color-text-3)'
  const opacity = state === 'queued' ? 0.45 : 1

  return (
    <div
      className="grid items-center gap-3 px-4 py-2 hover:bg-[rgba(56,189,248,0.05)] transition-colors duration-fast"
      style={{ gridTemplateColumns: '22px 72px 1fr 76px', opacity }}
    >
      <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>
        {num}
      </span>
      <span className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--color-text-1)' }}>
        {label}
      </span>
      <div className="h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: state === 'complete' ? 'var(--color-steel)' : 'var(--color-charge)',
            transition: 'width 600ms var(--ease-out), background 200ms',
          }}
        />
      </div>
      <span className="text-[10px] tracking-[0.12em] text-right" style={{ color: statusColor }}>
        {statusText}
      </span>
    </div>
  )
}

function ReadoutLine({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div
      className="px-4 py-2 flex items-baseline justify-between text-[10px] tracking-[0.12em] uppercase border-b last:border-b-0"
      style={{ borderColor: 'var(--color-border-1)', color: 'var(--color-text-2)' }}
    >
      <span>{label}</span>
      <span style={{ color: hot ? 'var(--color-charge)' : 'var(--color-text-1)' }}>{value}</span>
    </div>
  )
}

/* ================================================================
   AgentPanel
   ================================================================ */
function AgentPanel({ agent }: { agent: (typeof AGENTS)[number] }) {
  return (
    <div data-cursor="link" className="card card-hover relative p-8 md:p-10 h-full group">
      <div className="flex items-center justify-between gap-3 mb-6">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--color-charge)' }}>
          {agent.slug}
        </span>
        <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-3)' }}>
          {agent.num}
        </span>
      </div>
        <div
          className="font-display font-black leading-[1]"
          style={{ fontSize: 'clamp(30px, 3vw, 42px)' }}
        >
          {agent.role}
        </div>
        <div className="h-px bg-accent my-5" style={{ width: 40 }} />
        <p className="text-[15px] leading-[1.65]" style={{ color: 'var(--color-text-2)' }}>
          {agent.blurb}
        </p>
        <div className="mt-8 flex items-baseline gap-2 font-mono text-[10px] tracking-[0.12em] uppercase">
          <span style={{ color: 'var(--color-text-3)' }}>Output</span>
          <span style={{ color: 'var(--color-text-1)' }}>{agent.output}</span>
        </div>
    </div>
  )
}
