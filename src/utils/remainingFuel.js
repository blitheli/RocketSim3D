function hasThrottle(arr) {
  return Array.isArray(arr) && arr.length >= 2
}

/**
 * 节流系数在时刻 t 的取值（线性插值，超出端点沿用端值）。
 * @param {number[]|null|undefined} arr 扁平数组 [t0,c0,t1,c1,...]
 * @param {number} t 以点火时刻为零点的时间 (s)
 * @returns {number} 节流系数，无数据时为 1
 */
function coeffAt(arr, t) {
  if (!hasThrottle(arr)) return 1
  const n = Math.floor(arr.length / 2)
  const firstT = Number(arr[0]) || 0
  const lastT = Number(arr[(n - 1) * 2]) || 0
  if (t <= firstT) return Number(arr[1]) || 0
  if (t >= lastT) return Number(arr[(n - 1) * 2 + 1]) || 0
  for (let i = 0; i < n - 1; i += 1) {
    const t0 = Number(arr[i * 2]) || 0
    const c0 = Number(arr[i * 2 + 1]) || 0
    const t1 = Number(arr[(i + 1) * 2]) || 0
    const c1 = Number(arr[(i + 1) * 2 + 1]) || 0
    if (t >= t0 && t <= t1) {
      if (t1 === t0) return c1
      return c0 + (c1 - c0) * ((t - t0) / (t1 - t0))
    }
  }
  return Number(arr[(n - 1) * 2 + 1]) || 0
}

/** 额定（无节流）秒耗量 (kg/s)：Force × 台数 / Ips */
function engineMassFlow(engine) {
  if (!engine) return 0
  const force = Number(engine.Force) || 0
  const ips = Number(engine.Ips) || 0
  const count = Number(engine.NumberOfEngines) || 1
  if (ips <= 0) return 0
  return (force * count) / ips
}

/** 含节流的瞬时秒耗量 (kg/s)：台数 × (Force × F_th) / (Ips × Ips_th) */
function massFlowAt(engine, t) {
  const force = Number(engine.Force) || 0
  const ips = Number(engine.Ips) || 0
  const count = Number(engine.NumberOfEngines) || 1
  if (ips <= 0) return 0
  const effIps = ips * coeffAt(engine.IpsThrottling, t)
  if (effIps <= 0) return 0
  return (force * coeffAt(engine.ThrustThrottling, t) * count) / effIps
}

/** 收集落在 (0, duration) 内的节流时间断点 */
function innerBreakpoints(arr, duration) {
  const pts = []
  if (!Array.isArray(arr)) return pts
  for (let i = 0; i < arr.length; i += 2) {
    const t = Number(arr[i]) || 0
    if (t > 0 && t < duration) pts.push(t)
  }
  return pts
}

/**
 * 对瞬时秒耗量在 [0, duration] 积分（分段梯形，断点处精确）。
 * 节流系数线性插值导致推力/比冲之比非线性，故每段细分采样。
 */
function integrateMassFlow(engine, duration) {
  const nodes = new Set([0, duration])
  innerBreakpoints(engine.ThrustThrottling, duration).forEach((t) => nodes.add(t))
  innerBreakpoints(engine.IpsThrottling, duration).forEach((t) => nodes.add(t))
  const sorted = [...nodes].sort((a, b) => a - b)

  const SUB = 10
  let total = 0
  for (let s = 0; s < sorted.length - 1; s += 1) {
    const a = sorted[s]
    const b = sorted[s + 1]
    const h = (b - a) / SUB
    if (h <= 0) continue
    let segSum = 0
    for (let k = 0; k <= SUB; k += 1) {
      const w = k === 0 || k === SUB ? 0.5 : 1
      segSum += w * massFlowAt(engine, a + h * k)
    }
    total += segSum * h
  }
  return total
}

/** 单段燃烧消耗推进剂 (kg)。无节流时为 秒耗量 × 工作时间；有节流时按瞬时秒耗量积分 */
export function burnConsumption(input, engineKey, durationSec) {
  const engine = input[engineKey]
  const duration = Number(durationSec) || 0
  if (!engine || duration <= 0) return 0

  if (!hasThrottle(engine.ThrustThrottling) && !hasThrottle(engine.IpsThrottling)) {
    return engineMassFlow(engine) * duration
  }
  return integrateMassFlow(engine, duration)
}
