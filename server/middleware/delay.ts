import type { Request, Response, NextFunction } from 'express'

export function delayFromQuery(req: Request, _res: Response, next: NextFunction) {
  const raw = req.query.mockDelay
  const ms = typeof raw === 'string' ? Math.min(Math.max(parseInt(raw, 10) || 0, 0), 10000) : 0
  if (ms === 0) return next()
  setTimeout(next, ms)
}
