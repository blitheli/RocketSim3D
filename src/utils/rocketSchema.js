export const LAUNCH_SITES = [
  { id: 'ty', label: '太原 (ty)' },
  { id: 'xc', label: '西昌 (xc)' },
  { id: 'jqs', label: '酒泉 (jqs)' },
  { id: 'custom', label: '自定义坐标' },
]

export const TIMELINE_FIELDS = {
  'CZ-2D': [
    { key: 'Tk_1', label: '一级工作时间', unit: 's' },
    { key: 'Dt_k12f', label: '一二级分离间隔', unit: 's' },
    { key: 'Tk_F', label: '整流罩分离时刻', unit: 's' },
    { key: 'Tk_2z', label: '二级主机关机', unit: 's' },
    { key: 'Tk_2u', label: '二级游机关机', unit: 's' },
    { key: 'Dt_xjfl', label: '星箭分离间隔', unit: 's' },
    { key: 'PhicxDot_2z', label: '二级主俯仰角速率', unit: 'deg/s' },
    { key: 'PhicxDot_2u', label: '二级游俯仰角速率', unit: 'deg/s' },
    { key: 'PsicxDot_2', label: '二级偏航角速率', unit: 'deg/s' },
  ],
  'CZ-4B': [
    { key: 'Tk_1', label: '一级工作时间', unit: 's' },
    { key: 'Dt_k12f', label: '一二级分离间隔', unit: 's' },
    { key: 'Tk_F', label: '整流罩分离时刻', unit: 's' },
    { key: 'Tk_2z', label: '二级主机关机', unit: 's' },
    { key: 'Tk_2u', label: '二级游机关机', unit: 's' },
    { key: 'Dt_k23f', label: '二三级分离间隔', unit: 's' },
    { key: 'Tk_3', label: '三级工作时间', unit: 's' },
    { key: 'Dt_msxz', label: '末速修正间隔', unit: 's' },
    { key: 'Dt_xjfl', label: '星箭分离间隔', unit: 's' },
    { key: 'PhicxDot_2z', label: '二级主俯仰角速率', unit: 'deg/s' },
    { key: 'PsicxDot_2', label: '二级偏航角速率', unit: 'deg/s' },
    { key: 'PhicxDot_3', label: '三级俯仰角速率', unit: 'deg/s' },
    { key: 'PsicxDot_3', label: '三级偏航角速率', unit: 'deg/s' },
  ],
  'CZ-4C': [
    { key: 'Tk_1', label: '一级工作时间', unit: 's' },
    { key: 'Dt_k12f', label: '一二级分离间隔', unit: 's' },
    { key: 'Tk_F', label: '整流罩分离时刻', unit: 's' },
    { key: 'Tk_2z', label: '二级主机关机', unit: 's' },
    { key: 'Tk_2u', label: '二级游机关机', unit: 's' },
    { key: 'Dt_k23f', label: '二三级分离间隔', unit: 's' },
    { key: 'Tk_3', label: '三级一次工作时间', unit: 's' },
    { key: 'Dt_hx', label: '滑行时间', unit: 's' },
    { key: 'Tk_3b', label: '三级二次工作时间', unit: 's' },
    { key: 'Dt_msxz', label: '末速修正间隔', unit: 's' },
    { key: 'Dt_xjfl', label: '星箭分离间隔', unit: 's' },
    { key: 'PhicxDot_2z', label: '二级主俯仰角速率', unit: 'deg/s' },
    { key: 'PsicxDot_2z', label: '二级主偏航角速率', unit: 'deg/s' },
    { key: 'PhicxDot_3', label: '三级俯仰角速率', unit: 'deg/s' },
    { key: 'PsicxDot_3', label: '三级偏航角速率', unit: 'deg/s' },
    { key: 'Phicx_DotHx', label: '滑行段俯仰角速率', unit: 'deg/s' },
  ],
}

export const STAGE_CONFIG = {
  'CZ-2D': [
    {
      title: '一级',
      massKey: 'Stage1_Mass',
      fuelKey: 'Stage1_FuelMass',
      engines: [{ key: 'Stage1_Engine', label: '一级发动机' }],
    },
    {
      title: '二级',
      massKey: 'Stage2_Mass',
      fuelKey: 'Stage2_FuelMass',
      engines: [
        { key: 'Stage2_MainEngine', label: '二级主机' },
        { key: 'Stage2_VernierEngine', label: '二级游机' },
      ],
    },
  ],
  'CZ-4B': [
    {
      title: '一级',
      massKey: 'Stage1_Mass',
      fuelKey: 'Stage1_FuelMass',
      engines: [{ key: 'Stage1_Engine', label: '一级发动机' }],
    },
    {
      title: '二级',
      massKey: 'Stage2_Mass',
      fuelKey: 'Stage2_FuelMass',
      engines: [
        { key: 'Stage2_MainEngine', label: '二级主机' },
        { key: 'Stage2_VernierEngine', label: '二级游机' },
      ],
    },
    {
      title: '三级',
      massKey: 'Stage3_Mass',
      fuelKey: 'Stage3_FuelMass',
      engines: [{ key: 'Stage3_Engine', label: '三级发动机' }],
    },
  ],
  'CZ-4C': [
    {
      title: '一级',
      massKey: 'Stage1_Mass',
      fuelKey: 'Stage1_FuelMass',
      engines: [{ key: 'Stage1_Engine', label: '一级发动机' }],
    },
    {
      title: '二级',
      massKey: 'Stage2_Mass',
      fuelKey: 'Stage2_FuelMass',
      engines: [
        { key: 'Stage2_MainEngine', label: '二级主机' },
        { key: 'Stage2_VernierEngine', label: '二级游机' },
      ],
    },
    {
      title: '三级',
      massKey: 'Stage3_Mass',
      fuelKey: 'Stage3_FuelMass',
      engines: [{ key: 'Stage3_Engine', label: '三级发动机' }],
    },
  ],
}

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
