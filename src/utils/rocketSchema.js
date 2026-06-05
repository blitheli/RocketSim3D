export const LAUNCH_SITES = [
  { id: 'ty', label: '太原 (ty)' },
  { id: 'xc', label: '西昌 (xc)' },
  { id: 'jqs', label: '酒泉 (jqs)' },
  { id: 'custom', label: '自定义坐标' },
]

export function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  const last = keys.pop()
  let current = obj
  for (const key of keys) {
    if (!(key in current)) current[key] = {}
    current = current[key]
  }
  current[last] = value
}

export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function updateRocketInput(payload, path, rawValue, type = 'number') {
  const next = structuredClone(payload)
  let value = rawValue
  if (type === 'number') {
    value = rawValue === '' ? 0 : Number(rawValue)
  } else if (type === 'boolean') {
    value = Boolean(rawValue)
  }
  setNestedValue(next, path, value)
  return next
}
