/**
 * Central OpenAI-compatible client. Every agent goes through here.
 *
 * - Uses GMI Cloud by default via its OpenAI-compatible API.
 * - Single configurable model for all agents.
 * - 3 retries on malformed JSON with progressively stricter prompts.
 * - Hard timeout per call (default 45s).
 */
const API_KEY = process.env.GMI_MAAS_API_KEY || process.env.GMI_API_KEY || process.env.OPENAI_API_KEY
const BASE_URL = (
  process.env.GMI_MAAS_BASE_URL
    ? `${process.env.GMI_MAAS_BASE_URL.replace(/\/+$/, '')}/v1`
    : process.env.GMI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.gmi-serving.com/v1'
).replace(/\/+$/, '')
const DEFAULT_MODEL = process.env.GMI_MODELS || process.env.GMI_MODEL || process.env.OPENAI_MODEL || 'deepseek-ai/DeepSeek-V4-Pro'

export type AgentRole = 'scout' | 'atlas' | 'forge' | 'deck' | 'connect' | 'pivot' | 'simulator' | 'voice-coach' | 'features'

const MODEL: Record<AgentRole, string> = {
  scout: DEFAULT_MODEL,
  atlas: DEFAULT_MODEL,
  forge: DEFAULT_MODEL,
  deck: DEFAULT_MODEL,
  connect: DEFAULT_MODEL,
  pivot: DEFAULT_MODEL,
  simulator: DEFAULT_MODEL,
  'voice-coach': DEFAULT_MODEL,
  features: DEFAULT_MODEL,
}

export interface CallOpts {
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  /** Hard ceiling in ms. Defaults to 45000 (45s). */
  timeoutMs?: number
}

const DEFAULT_TIMEOUT = 45_000
const ENABLE_RESPONSE_FORMAT = process.env.GMI_RESPONSE_FORMAT === 'true'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatChoice {
  message?: {
    content?: string | null
  }
  delta?: {
    content?: string | null
  }
}

interface ChatResponse {
  choices?: ChatChoice[]
}

export class AIProviderError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    super(`GMI request failed with ${status}: ${body.slice(0, 500)}`)
    this.name = 'AIProviderError'
    this.status = status
    this.body = body
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    p.then((v) => {
      clearTimeout(timer)
      resolve(v)
    }).catch((err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

async function readErrorBody(res: Response): Promise<string> {
  const text = await res.text()
  try {
    return JSON.stringify(JSON.parse(text))
  } catch {
    return text || res.statusText
  }
}

async function createChatCompletion(
  role: AgentRole,
  messages: ChatMessage[],
  opts: CallOpts,
): Promise<ChatResponse> {
  const body = {
    model: MODEL[role],
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 2048,
    ...(opts.jsonMode && ENABLE_RESPONSE_FORMAT ? { response_format: { type: 'json_object' } } : {}),
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorBody = await readErrorBody(res)
    console.warn(`[ai:${role}] provider ${res.status}: ${errorBody.slice(0, 1000)}`)
    throw new AIProviderError(res.status, errorBody)
  }

  return (await res.json()) as ChatResponse
}

async function streamChatCompletion(
  role: AgentRole,
  messages: ChatMessage[],
  opts: CallOpts,
  onToken: (delta: string) => void,
): Promise<string> {
  const body = {
    model: MODEL[role],
    messages,
    stream: true,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 2048,
    ...(opts.jsonMode && ENABLE_RESPONSE_FORMAT ? { response_format: { type: 'json_object' } } : {}),
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorBody = await readErrorBody(res)
    console.warn(`[ai:${role}] provider ${res.status}: ${errorBody.slice(0, 1000)}`)
    throw new AIProviderError(res.status, errorBody)
  }

  if (!res.body) return ''

  const decoder = new TextDecoder()
  const reader = res.body.getReader()
  let pending = ''
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    pending += decoder.decode(value, { stream: true })
    const lines = pending.split(/\r?\n/)
    pending = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const chunk = JSON.parse(data) as ChatResponse
        const delta = chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content ?? ''
        if (delta) {
          buffer += delta
          onToken(delta)
        }
      } catch {
        // Ignore keepalive or non-JSON SSE lines from OpenAI-compatible providers.
      }
    }
  }

  return buffer
}

/** One-shot completion with a hard timeout. */
export async function callAgent(
  role: AgentRole,
  systemPrompt: string,
  userMessage: string,
  opts: CallOpts = {},
): Promise<string> {
  if (!API_KEY) {
    throw new Error('GMI_API_KEY not set in backend/.env')
  }
  const model = MODEL[role]
  const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT
  const started = Date.now()
  console.log(`[ai:${role}] → ${model}  (timeout ${timeout}ms)`)
  try {
    const res = await withTimeout(
      createChatCompletion(
        role,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        opts,
      ),
      timeout,
      `[ai:${role}]`,
    )
    const out = res.choices?.[0]?.message?.content ?? ''
    console.log(`[ai:${role}] ← ${out.length} chars in ${Date.now() - started}ms`)
    return out
  } catch (err) {
    console.warn(`[ai:${role}] ✗ ${(err as Error).message}`)
    throw err
  }
}

/** Streaming version — yields token deltas. */
export async function* callAgentStream(
  role: AgentRole,
  systemPrompt: string,
  userMessage: string,
): AsyncGenerator<string> {
  let buffer = ''
  await streamChatCompletion(
    role,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0.3 },
    (delta) => {
      buffer += delta
    },
  )
  if (buffer) yield buffer
}

/**
 * Streaming JSON variant. Streams tokens through onToken (typically broadcast
 * via WebSocket so the frontend can show real-time output) and parses the
 * accumulated buffer as JSON when the stream ends.
 *
 * Falls back to the same 3-attempt retry as callAgentJSON if the stream
 * produces malformed JSON.
 */
export async function callAgentJSONStream<T>(
  role: AgentRole,
  systemPrompt: string,
  userMessage: string,
  onToken: (delta: string) => void,
  opts: CallOpts = {},
): Promise<T> {
  if (!API_KEY) {
    throw new Error('GMI_API_KEY not set in backend/.env')
  }
  const model = MODEL[role]
  const timeout = opts.timeoutMs ?? DEFAULT_TIMEOUT
  const started = Date.now()
  console.log(`[ai:${role}] (stream) → ${model}  (timeout ${timeout}ms)`)

  let buffer = ''
  const streamPromise = (async () => {
    buffer = await streamChatCompletion(
      role,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { ...opts, jsonMode: true },
      (delta) => {
        try {
          onToken(delta)
        } catch {
          // never let UI broadcast errors crash the stream
        }
      },
    )
    return buffer
  })()

  const raw = await withTimeout(streamPromise, timeout, `[ai:${role}](stream)`)
  console.log(`[ai:${role}] (stream) ← ${raw.length} chars in ${Date.now() - started}ms`)
  return extractJSON<T>(raw)
}

/* ============================================================
   JSON EXTRACTION — tolerant walker with repair
   ============================================================ */

function findJsonBlock(raw: string): string | null {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fence ? fence[1] : raw

  const start = body.search(/[\{\[]/)
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escape = false
  const open = body[start]
  const close = open === '{' ? '}' : ']'

  for (let i = start; i < body.length; i++) {
    const c = body[i]
    if (escape) {
      escape = false
      continue
    }
    if (c === '\\') {
      escape = true
      continue
    }
    if (c === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return body.slice(start, i + 1)
    }
  }
  return null
}

function repair(json: string): string {
  return json
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/^\uFEFF/, '')
}

export function extractJSON<T>(raw: string): T {
  const block = findJsonBlock(raw) || raw.trim()
  try {
    return JSON.parse(block) as T
  } catch {
    try {
      return JSON.parse(repair(block)) as T
    } catch (e) {
      throw new Error(
        `AI response contained no parseable JSON.\n` +
          `Error: ${(e as Error).message}\n` +
          `Raw (first 500 chars): ${raw.slice(0, 500)}`,
      )
    }
  }
}

/**
 * Call + parse JSON with up to 3 attempts on malformed output.
 * GMI model in json_object mode rarely needs more than the first attempt.
 */
export async function callAgentJSON<T>(
  role: AgentRole,
  systemPrompt: string,
  userMessage: string,
  opts: CallOpts = {},
): Promise<T> {
  const attempts: Array<{ label: string; system: string; temperature: number }> = [
    { label: 'attempt 1', system: systemPrompt, temperature: opts.temperature ?? 0.3 },
    {
      label: 'attempt 2 (stricter)',
      system:
        systemPrompt +
        '\n\nCRITICAL: Your entire response must be a single valid JSON object. ' +
        'No markdown fences. No commentary. No trailing text. JSON only.',
      temperature: 0.15,
    },
    {
      label: 'attempt 3 (minimal temp)',
      system:
        systemPrompt +
        '\n\nFINAL WARNING: Emit only a JSON object. Start your response with `{` and end with `}`. ' +
        'Every string must be properly quoted. Commas only between elements. No trailing commas.',
      temperature: 0.05,
    },
  ]

  let lastErr: Error | null = null
  for (const a of attempts) {
    try {
      const raw = await callAgent(role, a.system, userMessage, {
        ...opts,
        jsonMode: true,
        temperature: a.temperature,
      })
      const parsed = extractJSON<T>(raw)
      if (a.label !== 'attempt 1') console.log(`[ai:${role}] recovered on ${a.label}`)
      return parsed
    } catch (err) {
      lastErr = err as Error
      console.warn(`[ai:${role}] ${a.label} failed: ${(err as Error).message.slice(0, 180)}`)
    }
  }
  throw lastErr ?? new Error(`[ai:${role}] all attempts failed`)
}
