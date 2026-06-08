import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

function pairsFromFlat(arr) {
  if (!Array.isArray(arr)) return []
  const pairs = []
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push([Number(arr[i]) || 0, Number(arr[i + 1]) || 0])
  }
  return pairs
}

function flatFromPairs(pairs) {
  const flat = []
  for (const [t, c] of pairs) {
    flat.push(Number(t) || 0, Number(c) || 0)
  }
  return flat
}

function buildOption(title, pairs, rated, unit) {
  const data = [...pairs]
    .sort((a, b) => a[0] - b[0])
    .map(([t, c]) => [t, c * rated])

  return {
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 600 },
    },
    grid: { left: 60, right: 24, top: 40, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v) => `${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })} ${unit}`,
    },
    xAxis: {
      type: 'value',
      name: '时间 (s)',
      nameLocation: 'middle',
      nameGap: 24,
    },
    yAxis: {
      type: 'value',
      name: unit,
      scale: true,
    },
    series: [
      {
        type: 'line',
        data,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { width: 2 },
        smooth: false,
      },
    ],
  }
}

function ThrottleChart({ pairs, rated, unit, title }) {
  const elRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!elRef.current) return undefined
    const chart = echarts.init(elRef.current, 'dark')
    chartRef.current = chart
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(elRef.current)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    chart.setOption(buildOption(title, pairs, rated, unit), true)
  }, [pairs, rated, unit, title])

  return <div className="engine-throttle-chart" ref={elRef} />
}

function ThrottleSection({ label, field, pairs, rated, ratedUnit, valueUnit, onChange }) {
  const commit = (nextPairs) => {
    onChange(field, flatFromPairs(nextPairs), 'array')
  }

  const updateCell = (rowIndex, col, value) => {
    const next = pairs.map((pair) => [...pair])
    next[rowIndex][col] = value === '' ? 0 : Number(value)
    commit(next)
  }

  const addRow = () => {
    const lastTime = pairs.length ? pairs[pairs.length - 1][0] : 0
    commit([...pairs, [lastTime, 1]])
  }

  const removeRow = (rowIndex) => {
    commit(pairs.filter((_, i) => i !== rowIndex))
  }

  return (
    <section className="engine-throttle-section">
      <div className="engine-throttle-section-head">
        <h3>{label}</h3>
        <span className="engine-throttle-rated">
          额定 {rated.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} {ratedUnit}
        </span>
      </div>
      <div className="engine-throttle-grid">
        <div className="engine-throttle-table-wrap">
          <table className="optim-table engine-throttle-table">
            <thead>
              <tr>
                <th>时间 (s)</th>
                <th>节流系数</th>
                <th>真实值 ({valueUnit})</th>
                <th aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={pair[0]}
                      onChange={(e) => updateCell(i, 0, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={pair[1]}
                      onChange={(e) => updateCell(i, 1, e.target.value)}
                    />
                  </td>
                  <td className="engine-throttle-readonly">
                    {(pair[1] * rated).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="engine-throttle-row-del"
                      onClick={() => removeRow(i)}
                      aria-label="删除行"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {pairs.length === 0 && (
                <tr>
                  <td colSpan={4} className="engine-throttle-empty">暂无节流点</td>
                </tr>
              )}
            </tbody>
          </table>
          <button type="button" className="btn engine-throttle-add" onClick={addRow}>
            + 添加行
          </button>
        </div>
        <ThrottleChart pairs={pairs} rated={rated} unit={valueUnit} title={label} />
      </div>
    </section>
  )
}

export default function EngineThrottlingModal({ open, engine, engineLabel, onChange, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const force = Number(engine.Force) || 0
  const ips = Number(engine.Ips) || 0
  const thrustPairs = pairsFromFlat(engine.ThrustThrottling)
  const ipsPairs = pairsFromFlat(engine.IpsThrottling)
  const hasThrust = Array.isArray(engine.ThrustThrottling)
  const hasIps = Array.isArray(engine.IpsThrottling)

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog engine-throttle-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="engine-throttle-title"
      >
        <div className="modal-header">
          <h2 id="engine-throttle-title">
            节流曲线{engineLabel ? ` · ${engineLabel}` : ''}
          </h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body">
          {hasThrust && (
            <ThrottleSection
              label="推力节流"
              field="ThrustThrottling"
              pairs={thrustPairs}
              rated={force}
              ratedUnit="N"
              valueUnit="N"
              onChange={onChange}
            />
          )}
          {hasIps && (
            <ThrottleSection
              label="比冲节流"
              field="IpsThrottling"
              pairs={ipsPairs}
              rated={ips}
              ratedUnit="m/s"
              valueUnit="m/s"
              onChange={onChange}
            />
          )}
          {!hasThrust && !hasIps && (
            <p className="modal-empty">该发动机无节流配置</p>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
