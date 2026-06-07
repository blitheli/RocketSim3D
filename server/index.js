import express from 'express'
import authRouter from './auth.js'
import templatesRouter from './templates.js'
import schemesRouter from './schemes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '5mb' }))

app.use('/auth', authRouter)
app.use('/templates', templatesRouter)
app.use('/schemes', schemesRouter)

app.listen(PORT, () => {
  console.log(`RocketSim3D server running on http://localhost:${PORT}`)
})
