import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export default function ChartZoomModal({ open, title, option, onClose }) {
  const chartRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !chartRef.current) return undefined
    const chart = echarts.init(chartRef.current, 'dark')
    instanceRef.current = chart

    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(chartRef.current)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      chart.dispose()
      instanceRef.current = null
    }
  }, [open])

  useEffect(() => {
    const chart = instanceRef.current
    if (!open || !chart || !option) return
    chart.setOption(option, true)
  }, [open, option])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog chart-zoom-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-zoom-title"
      >
        <div className="modal-header">
          <h2 id="chart-zoom-title">{title}</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body chart-zoom-body">
          <div className="chart-zoom-canvas" ref={chartRef} />
        </div>
      </div>
    </div>
  )
}
