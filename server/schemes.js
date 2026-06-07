import { Router } from 'express'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { authRequired } from './middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMES_DIR = resolve(__dirname, 'data/schemes')

function getUserDir(userId) {
  const dir = resolve(SCHEMES_DIR, userId)
  mkdirSync(dir, { recursive: true })
  return dir
}

const router = Router()

router.get('/', authRequired, (req, res) => {
  const dir = getUserDir(req.user.id)
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
    const schemes = files.map((f) => {
      const data = JSON.parse(readFileSync(resolve(dir, f), 'utf-8'))
      return { id: data.id, name: data.name, type: data.type, updatedAt: data.updatedAt }
    })
    schemes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    res.json(schemes)
  } catch {
    res.json([])
  }
})

router.post('/', authRequired, (req, res) => {
  const { name, payload } = req.body
  if (!name || !payload) {
    return res.status(400).json({ error: '方案名和数据不能为空' })
  }

  const dir = getUserDir(req.user.id)
  const id = randomUUID()
  const type = payload.RocketInput?.$type || 'Unknown'
  const scheme = { id, name, type, updatedAt: new Date().toISOString(), payload }
  writeFileSync(resolve(dir, `${id}.json`), JSON.stringify(scheme, null, 2), 'utf-8')
  res.json({ id, name, type, updatedAt: scheme.updatedAt })
})

router.get('/:id', authRequired, (req, res) => {
  const dir = getUserDir(req.user.id)
  const filePath = resolve(dir, `${req.params.id}.json`)
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    res.json(data)
  } catch {
    res.status(404).json({ error: '方案不存在' })
  }
})

router.delete('/:id', authRequired, (req, res) => {
  const dir = getUserDir(req.user.id)
  const filePath = resolve(dir, `${req.params.id}.json`)
  try {
    unlinkSync(filePath)
    res.json({ success: true })
  } catch {
    res.status(404).json({ error: '方案不存在' })
  }
})

export default router
