const API_BASE = import.meta.env.DEV ? '/api' : 'http://astrox.cn:8764'

let activeController = null

export function abortTrajectoryRequest() {
  if (activeController) {
    activeController.abort()
    activeController = null
  }
}

export async function runTrajectory(payload, options = {}) {
  const {
    runProfiles = payload.RunProfiles ?? false,
    getAllData = true,
    getKeyData = true,
  } = options

  abortTrajectoryRequest()
  activeController = new AbortController()

  const body = {
    RocketInput: payload.RocketInput,
    Profiles: payload.Profiles ?? [],
    RunProfiles: runProfiles,
    GetAllData: getAllData,
    GetKeyData: getKeyData,
  }

  const response = await fetch(`${API_BASE}/Rocket/TrajectoryOptim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: activeController.signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  activeController = null

  if (!data.IsSuccess) {
    throw new Error(data.Message || '弹道计算失败')
  }

  return data
}

export async function calculateTrajectory(payload) {
  return runTrajectory(payload, {
    runProfiles: false,
    getAllData: true,
    getKeyData: true,
  })
}

export async function optimizeTrajectory(payload) {
  return runTrajectory(payload, {
    runProfiles: true,
    getAllData: true,
    getKeyData: true,
  })
}

export function mergeOptimizedPayload(originalPayload, apiResult) {
  return {
    ...originalPayload,
    Profiles: apiResult.Profiles ?? originalPayload.Profiles,
    RocketInput: {
      ...originalPayload.RocketInput,
      ...(apiResult.RocketInput ?? {}),
    },
  }
}
