import { Router } from 'express'
import { rowsStore } from '../data/rows.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(rowsStore.list())
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' })
  const ok = rowsStore.remove(id)
  if (!ok) return res.status(404).json({ error: 'Row not found' })
  res.status(204).end()
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' })
  const { status } = req.body ?? {}
  if (status !== 'Active' && status !== 'Inactive') {
    return res.status(400).json({ error: 'status must be Active or Inactive' })
  }
  const updated = rowsStore.update(id, { status })
  if (!updated) return res.status(404).json({ error: 'Row not found' })
  res.json(updated)
})

export default router
