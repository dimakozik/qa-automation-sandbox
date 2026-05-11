import { Router } from 'express'
import { ALL_RECORDS } from '../data/records.js'

const router = Router()

router.get('/', (req, res) => {
  const limit = clampInt(req.query.limit, 1, 100, 10)
  const total = ALL_RECORDS.length

  if (typeof req.query.offset === 'string') {
    const offset = clampInt(req.query.offset, 0, total, 0)
    const items = ALL_RECORDS.slice(offset, offset + limit)
    return res.json({ items, offset, limit, total })
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const page = clampInt(req.query.page, 1, totalPages, 1)
  const start = (page - 1) * limit
  const items = ALL_RECORDS.slice(start, start + limit)
  res.json({ items, page, totalPages, total })
})

function clampInt(raw: unknown, min: number, max: number, fallback: number): number {
  if (typeof raw !== 'string') return fallback
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

export default router
