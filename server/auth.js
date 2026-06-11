import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JWT_SECRET } from './middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_FILE = resolve(__dirname, 'data/users.json')

function loadUsers() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

const router = Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }
  if (username.length < 2 || password.length < 4) {
    return res.status(400).json({ error: '用户名至少2位，密码至少4位' })
  }

  const users = loadUsers()
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ error: '用户名已存在' })
  }

  const id = randomUUID()
  const passwordHash = await bcrypt.hash(password, 10)
  users.push({ id, username, passwordHash })
  saveUsers(users)

  const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id, username } })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  const users = loadUsers()
  const user = users.find((u) => u.username === username)
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, username: user.username } })
})

export default router
