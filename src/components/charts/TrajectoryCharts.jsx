import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { buildChartConfigs } from '../../utils/adapt'

const CHART_KEYS = ['q', 'hv', 'n']

function ChartCell({ title, option, hasData }) {
  const chartRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return undefined
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
  }, [])

  useEffect(() => {
    const chart = instanceRef.current
    if (!chart || !option) return
    chart.setOption(option, true)
  }, [option])

  return (
    <div className="chart-cell">
      <div className="chart-cell-title">{title}</div>
      <div className="chart-cell-body">
        <div className="chart-canvas" ref={chartRef} />
        {!hasData && <div className="chart-empty">暂无数据</div>}
      </div>
    </div>
  )
}

export default function TrajectoryCharts({ series }) {
  const configs = buildChartConfigs(series ?? {})
  const hasData = (series?.time?.length ?? 0) > 0

  return (
    <div className="charts-panel">
      {!hasData && (
        <div className="charts-hint">请先执行弹道计算以显示曲线</div>
      )}
      <div className="charts-grid">
        {CHART_KEYS.map((key) => (
          <ChartCell
            key={key}
            title={configs[key]?.title ?? key}
            option={configs[key]?.option}
            hasData={hasData}
          />
        ))}
      </div>
    </div>
  )
}
