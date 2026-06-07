import { useCallback, useMemo, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import OptimConfigModal from './components/OptimConfigModal'
import Cesium3D from './components/Cesium3D'
import TrajectoryCharts from './components/charts/TrajectoryCharts'
import {
  ROCKET_PRESETS,
  clonePayload,
  getPresetById,
  getRocketPanel,
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
  extractShiXuTable,
  extractTrajectoryPoints,
} from './utils/adapt'

const DEFAULT_PRESET_ID = 'cz2d-sso'

export default function App() {
  const fileInputRef = useRef(null)
  const [payload, setPayload] = useState(() => clonePayload(getPresetById(DEFAULT_PRESET_ID).payload))
  const [loading, setLoading] = useState(false)
  const [optimModalOpen, setOptimModalOpen] = useState(false)
  const [apiResult, setApiResult] = useState(null)

  const rocketType = getRocketType(payload)
  const RocketPanel = getRocketPanel(rocketType)
  const series = useMemo(() => extractAllData(apiResult), [apiResult])
  const trajectoryPoints = useMemo(
    () => extractTrajectoryPoints(apiResult),
    [apiResult],
  )
  const shiXuRows = useMemo(() => extractShiXuTable(apiResult), [apiResult])
  const handleRocketTypeChange = useCallback((type) => {
    const preset = ROCKET_PRESETS.find((p) => p.type === type)
    if (!preset) return
    setPayload(clonePayload(preset.payload))
    setApiResult(null)
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
      } catch {
        console.error('JSON 解析失败')
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
  }, [payload])

  const runRequest = useCallback(async (mode) => {
    setLoading(true)
    try {
      const result =
        mode === 'optimize'
          ? await optimizeTrajectory(payload)
          : await calculateTrajectory(payload)

      setApiResult(result)
      setPayload((prev) => mergeOptimizedPayload(prev, result))
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error.message || '请求失败')
      }
    } finally {
      setLoading(false)
    }
  }, [payload])

  const handleAbort = useCallback(() => {
    abortTrajectoryRequest()
    setLoading(false)
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
        rocketType={rocketType}
        onRocketTypeChange={handleRocketTypeChange}
        loading={loading}
        onLoad={handleLoad}
        onSave={handleSave}
        onCalculate={() => runRequest('calculate')}
        onOptimize={() => runRequest('optimize')}
        onOpenOptimConfig={() => setOptimModalOpen(true)}
        onAbort={handleAbort}
      />

      <OptimConfigModal
        open={optimModalOpen}
        payload={payload}
        onChange={setPayload}
        onClose={() => setOptimModalOpen(false)}
      />

      <div className="app-main">
        <RocketPanel payload={payload} onChange={setPayload} shiXuRows={shiXuRows} />
        <div className="center-column">
          <Cesium3D
            trajectoryPoints={trajectoryPoints}
            rocketType={rocketType}
            launchSite={payload.RocketInput?.Name_FaSheDian}
          />
          <div className="bottom-panel">
            <TrajectoryCharts series={series} />
          </div>
        </div>
      </div>
    </div>
  )
}
