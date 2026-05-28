import { useMemo, useState } from 'react'
import './App.css'

const DEFAULT_FORM = {
  speed: '120',
  angle: '45',
  initialHeight: '0',
  gravity: '9.81',
}

const SAMPLE_COUNT = 40

function roundToTwoDecimals(value) {
  return Number(value.toFixed(2))
}

function App() {
  const [form, setForm] = useState(DEFAULT_FORM)

  const trajectory = useMemo(() => {
    const speed = Number(form.speed)
    const angleDeg = Number(form.angle)
    const initialHeight = Number(form.initialHeight)
    const gravity = Number(form.gravity)

    if ([speed, angleDeg, initialHeight, gravity].some((value) => Number.isNaN(value))) {
      return { error: '请输入有效数字。' }
    }

    if (speed <= 0) {
      return { error: '初速度必须大于 0。' }
    }

    if (angleDeg <= 0 || angleDeg >= 90) {
      return { error: '发射角度需要在 0 到 90 度之间。' }
    }

    if (gravity <= 0) {
      return { error: '重力加速度必须大于 0。' }
    }

    if (initialHeight < 0) {
      return { error: '初始高度不能为负数。' }
    }

    const angleRad = (angleDeg * Math.PI) / 180
    const velocityX = speed * Math.cos(angleRad)
    const velocityY = speed * Math.sin(angleRad)
    const discriminant = velocityY ** 2 + 2 * gravity * initialHeight
    const flightTime = (velocityY + Math.sqrt(discriminant)) / gravity
    const maxHeight = initialHeight + (velocityY ** 2) / (2 * gravity)
    const range = velocityX * flightTime

    const points = Array.from({ length: SAMPLE_COUNT + 1 }, (_, index) => {
      const time = (flightTime * index) / SAMPLE_COUNT
      const x = velocityX * time
      const y = initialHeight + velocityY * time - 0.5 * gravity * time ** 2
      return {
        x: roundToTwoDecimals(x),
        y: roundToTwoDecimals(Math.max(y, 0)),
      }
    })

    return {
      flightTime: roundToTwoDecimals(flightTime),
      maxHeight: roundToTwoDecimals(maxHeight),
      range: roundToTwoDecimals(range),
      points,
    }
  }, [form])

  const pathData = useMemo(() => {
    if (!trajectory.points) {
      return ''
    }

    const maxX = trajectory.points.at(-1).x || 1
    const maxY = Math.max(...trajectory.points.map((point) => point.y), 1)

    return trajectory.points
      .map((point, index) => {
        const x = (point.x / maxX) * 100
        const y = 100 - (point.y / maxY) * 100
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [trajectory])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <main className="app">
      <h1>火箭弹道计算器</h1>
      <p className="subtitle">基于理想抛体模型，快速计算飞行时间、射程和最高点。</p>

      <section className="panel">
        <div className="form-grid">
          <label>
            初速度 (m/s)
            <input name="speed" type="number" min="0" step="0.1" value={form.speed} onChange={updateField} />
          </label>
          <label>
            发射角度 (°)
            <input name="angle" type="number" min="0" max="90" step="0.1" value={form.angle} onChange={updateField} />
          </label>
          <label>
            初始高度 (m)
            <input
              name="initialHeight"
              type="number"
              min="0"
              step="0.1"
              value={form.initialHeight}
              onChange={updateField}
            />
          </label>
          <label>
            重力加速度 (m/s²)
            <input name="gravity" type="number" min="0.1" step="0.01" value={form.gravity} onChange={updateField} />
          </label>
        </div>
      </section>

      {trajectory.error ? (
        <p className="error">{trajectory.error}</p>
      ) : (
        <>
          <section className="panel stats" aria-label="计算结果">
            <article>
              <h2>飞行时间</h2>
              <strong>{trajectory.flightTime} s</strong>
            </article>
            <article>
              <h2>水平射程</h2>
              <strong>{trajectory.range} m</strong>
            </article>
            <article>
              <h2>最高高度</h2>
              <strong>{trajectory.maxHeight} m</strong>
            </article>
          </section>

          <section className="panel" aria-label="轨迹图">
            <svg viewBox="0 0 100 100" role="img" aria-label="火箭飞行轨迹图">
              <line x1="0" y1="100" x2="100" y2="100" />
              <line x1="0" y1="0" x2="0" y2="100" />
              <path d={pathData} />
            </svg>
          </section>
        </>
      )}
    </main>
  )
}

export default App
