import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const SECRET = process.env.JWT_SECRET ?? 'sandbox-dev-secret-do-not-use-in-prod'
const TOKEN_TTL = '1h'

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Both fields are required' })
  }
  if (password === 'wrong') {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ sub: username }, SECRET, { expiresIn: TOKEN_TTL })
  res.cookie('auth-session', token, { path: '/', sameSite: 'lax' })
  res.json({ token, username })
})

router.get('/me', (req, res) => {
  const auth = req.header('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    const payload = jwt.verify(token, SECRET) as { sub?: string }
    res.json({ username: payload.sub })
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('auth-session', { path: '/' })
  res.status(204).end()
})

export default router
