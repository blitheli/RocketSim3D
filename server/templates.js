import { Router } from 'express'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = resolve(__dirname, '../public/templates')

const router = Router()

router.get('/', (req, res) => {
  try {
    const index = JSON.parse(readFileSync(resolve(TEMPLATES_DIR, 'index.json'), 'utf-8'))
    res.json(index)
  } catch {
    res.status(500).json({ error: '无法读取模板列表' })
  }
})

router.get('/:filename', (req, res) => {
  const { filename } = req.params
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: '非法文件名' })
  }
  try {
    const data = JSON.parse(readFileSync(resolve(TEMPLATES_DIR, filename), 'utf-8'))
    res.json(data)
  } catch {
    res.status(404).json({ error: '模板不存在' })
  }
})

export default router
