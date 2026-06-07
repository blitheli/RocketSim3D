import { useCallback, useEffect, useMemo, useState } from 'react'
import TopBar from './components/TopBar'
import OptimConfigModal from './components/OptimConfigModal'
import LoginModal from './components/LoginModal'
import SchemeModal from './components/SchemeModal'
import SaveSchemeModal from './components/SaveSchemeModal'
import Cesium3D from './components/Cesium3D'
import TrajectoryCharts from './components/charts/TrajectoryCharts'
import {
  clonePayload,
  getRocketPanel,
  getRocketType,
} from './data/rockets'
import {
  abortTrajectoryRequest,
  calculateTrajectory,
  mergeOptimizedPayload,
  optimizeTrajectory,
} from './api/trajectory'
import { clearSession, getStoredUser } from './api/auth'
import { fetchTemplate, fetchTemplates, saveUserScheme } from './api/schemes'
import {
  extractAllData,
  extractShiXuTable,
  extractTrajectoryPoints,
} from './utils/adapt'

export default function App() {
  const [payload, setPayload] = useState(null)
  const [schemeName, setSchemeName] = useState('')
  const [loading, setLoading] = useState(false)
  const [optimModalOpen, setOptimModalOpen] = useState(false)
  const [schemeModalOpen, setSchemeModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [apiResult, setApiResult] = useState(null)
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const templates = await fetchTemplates()
        const first = templates[0]
        if (!first || cancelled) return
        const data = await fetchTemplate(first.file)
        if (cancelled) return
        setPayload(clonePayload(data))
        setSchemeName(`${first.type} ${first.name}`)
      } catch (err) {
        console.error(err.message || '加载默认模板失败')
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const rocketType = payload ? getRocketType(payload) : 'CZ-2D'
  const RocketPanel = getRocketPanel(rocketType)
  const series = useMemo(() => extractAllData(apiResult), [apiResult])
  const trajectoryPoints = useMemo(
    () => extractTrajectoryPoints(apiResult),
    [apiResult],
  )
  const shiXuTable = useMemo(() => extractShiXuTable(apiResult), [apiResult])

  const handleSchemeSelect = useCallback(({ name, payload: nextPayload }) => {
    setPayload(nextPayload)
    setSchemeName(name)
    setApiResult(null)
  }, [])

  const handleSave = useCallback(() => {
    if (user) {
      setSaveModalOpen(true)
      return
    }
    if (!payload) return
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${payload.RocketInput?.Name ?? 'rocket'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [user, payload])

  const handleSaveToServer = useCallback(async (name) => {
    await saveUserScheme(name, payload)
    setSchemeName(name)
  }, [payload])

  const handleLogout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const runRequest = useCallback(async (mode) => {
    if (!payload) return
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

  if (!payload) {
    return (
      <div className="app app-loading">
        <p>加载方案模板…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <TopBar
        rocketType={rocketType}
        schemeName={schemeName}
        user={user}
        loading={loading}
        onOpenScheme={() => setSchemeModalOpen(true)}
        onSave={handleSave}
        onCalculate={() => runRequest('calculate')}
        onOptimize={() => runRequest('optimize')}
        onOpenOptimConfig={() => setOptimModalOpen(true)}
        onAbort={handleAbort}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={setUser}
      />

      <SchemeModal
        open={schemeModalOpen}
        user={user}
        onClose={() => setSchemeModalOpen(false)}
        onSelect={handleSchemeSelect}
      />

      <SaveSchemeModal
        open={saveModalOpen}
        defaultName={schemeName}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveToServer}
      />

      <OptimConfigModal
        open={optimModalOpen}
        payload={payload}
        onChange={setPayload}
        onClose={() => setOptimModalOpen(false)}
      />

      <div className="app-main">
        <RocketPanel payload={payload} onChange={setPayload} shiXuTable={shiXuTable} />
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
