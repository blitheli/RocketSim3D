import { useCallback, useMemo, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import ParamPanel from './components/ParamPanel'
import Cesium3D from './components/Cesium3D'
import TrajectoryCharts from './components/charts/TrajectoryCharts'
import StageTable from './components/StageTable'
import {
  clonePayload,
  getPresetById,
  getRocketType,
} from './data/rockets'
import {
  abortTrajectoryRequest,
  calculateTrajectory,
  mergeOptimizedPayload,
  optimizeTrajectory,
} from './api/trajectory'
import {
  extractAllData,
  extractStageTable,
  extractSummary,
  extractTrajectoryPoints,
} from './utils/adapt'

const DEFAULT_PRESET_ID = 'cz2d-sso'

export default function App() {
  const fileInputRef = useRef(null)
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID)
  const [payload, setPayload] = useState(() => clonePayload(getPresetById(DEFAULT_PRESET_ID).payload))
  const [integrator, setIntegrator] = useState('scheme')
  const [startTime, setStartTime] = useState('2026-05-29 00:00:00.000 UTCG')
  const [endTime, setEndTime] = useState('2026-05-29 00:10:00.000 UTCG')
  const [stepSize, setStepSize] = useState(1)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '就绪' })
  const [apiResult, setApiResult] = useState(null)

  const rocketType = getRocketType(payload)
  const series = useMemo(() => extractAllData(apiResult), [apiResult])
  const stageRows = useMemo(
    () => extractStageTable(apiResult, payload.RocketInput),
    [apiResult, payload.RocketInput],
  )
  const trajectoryPoints = useMemo(
    () => extractTrajectoryPoints(apiResult),
    [apiResult],
  )
  const summary = useMemo(() => extractSummary(apiResult), [apiResult])

  const handlePresetChange = useCallback((nextPresetId) => {
    setPresetId(nextPresetId)
    setPayload(clonePayload(getPresetById(nextPresetId).payload))
    setApiResult(null)
    setStatus({ type: 'idle', message: '已切换火箭方案' })
  }, [])

  const handleLoad = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelected = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result))
        setPayload(json)
        setApiResult(null)
        setStatus({ type: 'success', message: `已加载 ${file.name}` })
      } catch {
        setStatus({ type: 'error', message: 'JSON 解析失败' })
      }
    }
    reader.readAsText(file, 'UTF-8')
    event.target.value = ''
  }, [])

  const handleSave = useCallback(() => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${payload.RocketInput?.Name ?? 'rocket'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus({ type: 'success', message: '参数已保存' })
  }, [payload])

  const runRequest = useCallback(async (mode) => {
    setLoading(true)
    setStatus({ type: 'loading', message: mode === 'optimize' ? '优化计算中...' : '弹道计算中...' })
    try {
      const result =
        mode === 'optimize'
          ? await optimizeTrajectory(payload)
          : await calculateTrajectory(payload)

      setApiResult(result)
      setPayload((prev) => mergeOptimizedPayload(prev, result))
      const info = extractSummary(result)
      setStatus({
        type: 'success',
        message:
          info.payloadCapacity != null
            ? `计算成功 | 运载能力 ${Number(info.payloadCapacity).toFixed(1)} kg`
            : result.Message || '计算成功',
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus({ type: 'idle', message: '已终止优化' })
      } else {
        setStatus({ type: 'error', message: error.message || '请求失败' })
      }
    } finally {
      setLoading(false)
    }
  }, [payload])

  const handleAbort = useCallback(() => {
    abortTrajectoryRequest()
    setLoading(false)
    setStatus({ type: 'idle', message: '正在终止...' })
  }, [])

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <TopBar
        presetId={presetId}
        onPresetChange={handlePresetChange}
        integrator={integrator}
        onIntegratorChange={setIntegrator}
        startTime={startTime}
        endTime={endTime}
        stepSize={stepSize}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onStepSizeChange={setStepSize}
        loading={loading}
        onLoad={handleLoad}
        onSave={handleSave}
        onCalculate={() => runRequest('calculate')}
        onOptimize={() => runRequest('optimize')}
        onAbort={handleAbort}
      />

      <div className="app-main">
        <ParamPanel payload={payload} onChange={setPayload} />
        <Cesium3D
          trajectoryPoints={trajectoryPoints}
          rocketType={rocketType}
          launchSite={payload.RocketInput?.Name_FaSheDian}
        />
      </div>

      <div className="bottom-panel">
        <TrajectoryCharts series={series} />
        <StageTable rows={stageRows} />
        <div className={`status-bar ${status.type}`}>
          <span>{status.message}</span>
          {summary.terminationType != null && (
            <span>收敛类型: {summary.terminationType}</span>
          )}
          {integrator === 'scheme' && <span>积分器: 方案弹道</span>}
          <span>步长: {stepSize}s</span>
        </div>
      </div>
    </div>
  )
}
