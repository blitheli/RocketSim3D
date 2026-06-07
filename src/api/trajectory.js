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

/** 收集 Profiles 中启用的自变量 Control 名称 */
export function getOptimizedControlNames(profiles) {
  const names = new Set()
  if (!Array.isArray(profiles)) return names

  for (const profile of profiles) {
    for (const control of profile.Controls ?? []) {
      if (control?.Use && control.Name) {
        names.add(control.Name)
      }
    }
  }
  return names
}

/** 将 Profiles 中启用的 Controls.CurrentValue 写回 RocketInput 对应字段 */
function applyProfileControlsToRocketInput(rocketInput, profiles) {
  const next = { ...rocketInput }
  if (!Array.isArray(profiles)) return next

  for (const profile of profiles) {
    for (const control of profile.Controls ?? []) {
      if (!control?.Use || control.Name == null) continue
      if (control.CurrentValue !== undefined && control.CurrentValue !== null) {
        next[control.Name] = control.CurrentValue
      }
    }
  }
  return next
}

export function mergeOptimizedPayload(originalPayload, apiResult, options = {}) {
  const { applyControls = false } = options
  const profiles = apiResult.Profiles ?? originalPayload.Profiles
  let rocketInput = {
    ...originalPayload.RocketInput,
    ...(apiResult.RocketInput ?? {}),
  }

  if (applyControls && profiles?.length) {
    rocketInput = applyProfileControlsToRocketInput(rocketInput, profiles)
  }

  return {
    ...originalPayload,
    Profiles: profiles,
    RocketInput: rocketInput,
  }
}
