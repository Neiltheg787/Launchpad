import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

/**
 * Validation score over time. Renders a Recharts line chart from a list of
 * { score, recordedAt } entries. If only 1 point exists, we add a synthetic
 * "+0d" baseline so the line is visible.
 */
export interface ScoreEntry {
  score: number
  recordedAt: number
}

export default function ScoreChart({ history }: { history: ScoreEntry[] }) {
  const data = (history.length === 1
    ? [{ ...history[0], recordedAt: history[0].recordedAt - 86400000 }, history[0]]
    : history
  ).map((h) => ({
    label: new Date(h.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.score,
  }))

  if (data.length === 0) {
    return (
      <div className="text-xs text-muted font-mono py-8 text-center">
        no score history yet — re-run validation to start tracking
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(56,189,248,0.08)" strokeDasharray="2 2" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(220,255,235,0.5)', fontSize: 10, fontFamily: 'Fragment Mono, monospace' }}
          axisLine={{ stroke: 'rgba(56,189,248,0.18)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: 'rgba(220,255,235,0.5)', fontSize: 10, fontFamily: 'Fragment Mono, monospace' }}
          axisLine={{ stroke: 'rgba(56,189,248,0.18)' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0c0f15',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: 0,
            fontFamily: 'Fragment Mono, monospace',
            fontSize: 11,
            color: '#38BDF8',
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#38BDF8"
          strokeWidth={2}
          dot={{ r: 3, fill: '#38BDF8', stroke: '#38BDF8' }}
          activeDot={{ r: 5, fill: '#38BDF8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
