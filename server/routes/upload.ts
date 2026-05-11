import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.post('/', upload.array('files'), (req, res) => {
  const files = ((req.files as Express.Multer.File[] | undefined) ?? []).map((f) => ({
    id: randomUUID(),
    name: f.originalname,
    size: f.size,
    type: f.mimetype || 'application/octet-stream',
  }))
  res.json({ files })
})

router.use((err: unknown, _req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.message })
  }
  res.status(500).json({ error: 'Upload failed' })
})

export default router
