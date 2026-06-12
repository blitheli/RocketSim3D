import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { buildChartConfigs, CHART_TAB_DEFS } from '../../utils/adapt'
import ChartZoomModal from './ChartZoomModal'

function ChartCell({ title, option, hasData, onZoom }) {
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
    <div className={`chart-cell${onZoom ? ' chart-cell--zoomable' : ''}`}>
      <div className="chart-cell-title">
        <span>{title}</span>
        {onZoom ? (
          <button
            type="button"
            className="chart-zoom-btn"
            onClick={onZoom}
            aria-label={`放大 ${title}`}
            title="放大查看"
          >
            ⤢
          </button>
        ) : null}
      </div>
      <div className="chart-cell-body">
        <div className="chart-canvas" ref={chartRef} />
        {!hasData && <div className="chart-empty">暂无数据</div>}
      </div>
    </div>
  )
}

export default function TrajectoryCharts({ series, markEvents = [] }) {
  const [activeTab, setActiveTab] = useState('q')
  const [zoomTarget, setZoomTarget] = useState(null)

  const configs = useMemo(
    () => buildChartConfigs(series ?? {}, { zoom: false, markEvents }),
    [series, markEvents],
  )
  const zoomConfigs = useMemo(
    () => buildChartConfigs(series ?? {}, { zoom: true, markEvents }),
    [series, markEvents],
  )

  const hasData = (series?.time?.length ?? 0) > 0
  const activeTabDef = CHART_TAB_DEFS.find((tab) => tab.id === activeTab) ?? CHART_TAB_DEFS[0]
  const chartKeys = activeTabDef.keys
  const isAllTab = activeTab === 'all'

  const openZoom = (key) => {
    const config = zoomConfigs[key]
    if (!config) return
    setZoomTarget({ key, title: config.title, option: config.option })
  }

  return (
    <div className="charts-panel">
      <div className="charts-tabs" role="tablist" aria-label="参数曲线">
        {CHART_TAB_DEFS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`charts-tab${activeTab === tab.id ? ' charts-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!hasData && (
        <div className="charts-hint">请先执行弹道计算以显示曲线</div>
      )}

      <div
        className={`charts-grid${isAllTab ? ' charts-grid--all' : ''}${
          chartKeys.length === 1 ? ' charts-grid--single' : ''
        }`}
      >
        {chartKeys.map((key) => (
          <ChartCell
            key={key}
            title={configs[key]?.title ?? key}
            option={configs[key]?.option}
            hasData={hasData}
            onZoom={hasData ? () => openZoom(key) : undefined}
          />
        ))}
      </div>

      <ChartZoomModal
        open={Boolean(zoomTarget)}
        title={zoomTarget?.title ?? ''}
        option={zoomTarget?.option}
        onClose={() => setZoomTarget(null)}
      />
    </div>
  )
}
