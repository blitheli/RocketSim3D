import express from 'express'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { createProxyMiddleware } from 'http-proxy-middleware'
import authRouter from './auth.js'
import templatesRouter from './templates.js'
import schemesRouter from './schemes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const ASTROX_TARGET = process.env.ASTROX_TARGET || 'http://astrox.cn:8764'
const DIST_DIR = resolve(__dirname, '../dist')

// 弹道 API 反向代理：须在 express.json 之前挂载，避免请求体被提前消费
app.use(
  '/api',
  createProxyMiddleware({
    target: ASTROX_TARGET,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  }),
)

app.use(express.json({ limit: '5mb' }))

app.use('/auth', authRouter)
app.use('/templates', templatesRouter)
app.use('/schemes', schemesRouter)

// 生产环境：托管 Vite 构建产物 dist/
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  // SPA 回退：非 API 的 GET 请求一律返回 index.html
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    if (/^\/(api|auth|templates|schemes)\b/.test(req.path)) return next()
    res.sendFile(join(DIST_DIR, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`RocketSim3D server running on http://localhost:${PORT}`)
  console.log(`  弹道 API 代理 → ${ASTROX_TARGET}`)
  console.log(existsSync(DIST_DIR) ? '  已托管前端 dist/' : '  未发现 dist/（开发模式，仅提供后端 API）')
})
