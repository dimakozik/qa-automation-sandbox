import { Router } from 'express'

const router = Router()
const FAIL_THRESHOLD = 2
const PROB_FAIL_RATE = 0.4

const attempts = new Map<string, number>()

function sessionId(req: import('express').Request) {
  return req.header('x-session-id') ?? 'anonymous'
}

router.post('/deterministic', async (req, res) => {
  await new Promise((r) => setTimeout(r, 600))
  const sid = sessionId(req)
  const next = (attempts.get(sid) ?? 0) + 1
  attempts.set(sid, next)
  if (next <= FAIL_THRESHOLD) {
    return res.status(500).json({ error: 'Transient failure', attempts: next })
  }
  res.json({ ok: true, attempts: next })
})

router.post('/deterministic/reset', (req, res) => {
  attempts.delete(sessionId(req))
  res.status(204).end()
})

router.post('/probabilistic', async (_req, res) => {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400))
  if (Math.random() < PROB_FAIL_RATE) {
    return res.status(500).json({ error: 'Random failure' })
  }
  res.json({ ok: true })
})

export default router
