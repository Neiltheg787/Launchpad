/**
 * Global error handler. Logs + returns a safe JSON error shape.
 * Matches the frontend's expected `{ error }` response.
 */
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[err]', err.stack || err.message)
  const status = typeof (err as any).status === 'number' ? (err as any).status : 500
  const body = typeof (err as any).body === 'string' ? (err as any).body : undefined

  res.status(status).json({
    error: process.env.NODE_ENV === 'production' && status >= 500 ? 'Internal server error' : err.message,
    ...(body && process.env.NODE_ENV !== 'production' ? { details: body } : {}),
  })
}
