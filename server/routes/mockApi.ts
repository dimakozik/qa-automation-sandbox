import { Router } from 'express'
import { delayFromQuery } from '../middleware/delay.js'

const router = Router()

const MOCK_BODIES: Record<number, unknown> = {
  200: { success: true, data: { id: 42, name: 'Jane Doe', email: 'jane@example.com', role: 'admin' } },
  201: { success: true, created: true, id: 99 },
  204: null,
  400: { success: false, error: 'Bad Request', message: 'Invalid payload structure' },
  401: { success: false, error: 'Unauthorized', message: 'Token missing or expired' },
  403: { success: false, error: 'Forbidden', message: 'Insufficient permissions' },
  404: { success: false, error: 'Not Found', message: 'Resource does not exist' },
  422: { success: false, error: 'Unprocessable Entity', errors: [{ field: 'email', message: 'Invalid format' }] },
  429: { success: false, error: 'Too Many Requests', retryAfter: 60 },
  500: { success: false, error: 'Internal Server Error', message: 'Something went wrong on the server' },
  503: { success: false, error: 'Service Unavailable', message: 'Server is temporarily down' },
}

router.use(delayFromQuery)

router.all('/*', (req, res) => {
  const raw = req.query.mockStatus
  const status = typeof raw === 'string' ? parseInt(raw, 10) : 200
  const safeStatus = Number.isFinite(status) && status >= 100 && status < 600 ? status : 200
  const body = safeStatus === 201
    ? { ...(MOCK_BODIES[201] as object), timestamp: new Date().toISOString() }
    : MOCK_BODIES[safeStatus] ?? { error: `Unknown status ${safeStatus}` }

  res.setHeader('x-mock-endpoint', req.path)
  if (safeStatus === 204 || body === null) {
    return res.status(safeStatus).end()
  }
  res.status(safeStatus).json(body)
})

export default router
