import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import tableRouter from './routes/table.js'
import uploadRouter from './routes/upload.js'
import paginationRouter from './routes/pagination.js'
import retryRouter from './routes/retry.js'
import mockApiRouter from './routes/mockApi.js'
import { rowsStore } from './data/rows.js'

const app = express()
const PORT = Number(process.env.API_PORT ?? 5174)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api', authRouter)
app.use('/api/rows', tableRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/records', paginationRouter)
app.use('/api/flaky', retryRouter)
app.use('/api/mock', mockApiRouter)

app.post('/api/_reset/rows', (_req, res) => {
  rowsStore.reset()
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`)
})
