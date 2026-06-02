import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { buildChartConfigs } from '../../utils/adapt'

const TAB_KEYS = ['q', 'hv', 'n', 'mass', 'thrust']

export default function TrajectoryCharts({ series }) {
  const [activeTab, setActiveTab] = useState('q')
  const chartRef = useRef(null)
  const instanceRef = useRef(null)
  const configs = buildChartConfigs(series ?? {})

  useEffect(() => {
    if (!chartRef.current) return undefined
    const chart = echarts.init(chartRef.current, 'dark')
    instanceRef.current = chart

    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = instanceRef.current
    if (!chart) return
    const config = configs[activeTab]
    if (config?.option) {
      chart.setOption(config.option, true)
    }
  }, [activeTab, configs])

  const hasData = (series?.time?.length ?? 0) > 0

  return (
    <div className="charts-panel">
      <div className="chart-tabs">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`chart-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {configs[key]?.title ?? key}
          </button>
        ))}
      </div>
      <div className="chart-container">
        <div className="chart-canvas" ref={chartRef} />
        {!hasData && (
          <div className="chart-empty">请先执行弹道计算以显示曲线</div>
        )}
      </div>
    </div>
  )
}
