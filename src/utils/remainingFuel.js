function engineMassFlow(engine) {
  if (!engine) return 0
  const force = Number(engine.Force) || 0
  const ips = Number(engine.Ips) || 0
  const count = Number(engine.NumberOfEngines) || 1
  if (ips <= 0) return 0
  return (force * count) / ips
}

/** 单段燃烧消耗推进剂 (kg)：秒耗量 × 工作时间 */
export function burnConsumption(input, engineKey, durationSec) {
  const mdot = engineMassFlow(input[engineKey])
  const duration = Number(durationSec) || 0
  if (duration <= 0) return 0
  return mdot * duration
}
