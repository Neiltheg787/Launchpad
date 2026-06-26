/**
 * Optional auth middleware.
 * - Existing bearer tokens still scope requests to that founder.
 * - Requests without a token run as a shared Launchpad guest founder.
 */
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const GUEST_EMAIL = 'guest@launchpad.local'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      founderId?: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization
  const qToken = req.query.token as string | undefined
  const raw = h?.startsWith('Bearer ') ? h.slice(7) : qToken
  if (!raw) {
    const founder = await getOrCreateGuestFounder()
    req.founderId = founder.id
    next()
    return
  }
  try {
    const payload = jwt.verify(raw, SECRET) as { sub: string }
    const founder = await db.getFounder(payload.sub)
    if (!founder) {
      res.status(401).json({ error: 'Unknown founder' })
      return
    }
    req.founderId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function signFounderToken(id: string): string {
  return jwt.sign({ sub: id }, SECRET, { expiresIn: '7d' })
}

async function getOrCreateGuestFounder() {
  const existing = await db.getFounderByEmail(GUEST_EMAIL)
  if (existing) return existing
  try {
    return await db.createFounder({
      email: GUEST_EMAIL,
      name: 'Launchpad Guest',
      passwordHash: '',
    })
  } catch {
    const created = await db.getFounderByEmail(GUEST_EMAIL)
    if (created) return created
    throw new Error('Unable to create guest founder')
  }
}
