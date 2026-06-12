function pickSeries(data, candidates) {
  if (!data || typeof data !== 'object') return []
  for (const key of candidates) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}

function toNumberArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((v) => Number(v))
}
//=================================================================================
export function extractAllData(apiResult) {
  const dic = apiResult?.DicAllData ?? apiResult?.dicAllData ?? {}
  const time = toNumberArray(pickSeries(dic, ['tt', 't', 'T', 'time', 'Time']))
  const q = toNumberArray(pickSeries(dic, ['q', 'Q', 'dynPress']))
  const height = toNumberArray(pickSeries(dic, ['h', 'H', 'alt', 'height']))
  const velocity = toNumberArray(pickSeries(dic, ['V', 'v', 'vel', 'velocity']))
  const overload = toNumberArray(pickSeries(dic, ['nx', 'n', 'N', 'axialN', 'overload']))
  const mass = toNumberArray(pickSeries(dic, ['mass', 'M', 'Mass']))
  const thrust = toNumberArray(pickSeries(dic, ['Fx', 'F', 'f', 'thrust', 'Thrust']))
  const lon = toNumberArray(pickSeries(dic, ['Lambda', 'lon', 'Lon', 'longitude']))
  const lat = toNumberArray(pickSeries(dic, ['d_B', 'lat', 'Lat', 'latitude']))
  const alt = toNumberArray(pickSeries(dic, ['h', 'H', 'alt', 'Alt']))

  return { time, q, height, velocity, overload, mass, thrust, lon, lat, alt }
}

//=================================================================================
/** 计算完成后特征点参数的飞行时序表格列定义（field 对应 DicKeyData 字段名） */
const SHIXU_FIELD_DEFS = [
  { label: '飞行段', field: 'Text', cellClass: 'shixu-name', text: true },
  { label: '时刻 (s)', field: 'tt', digits: 2 },
  { label: '总质量 (kg)', field: 'mass', digits: 2 },
  { label: '推进剂 (kg)', field: 'mass_y', digits: 2 },
  { label: '高度 (km)', field: 'h', digits: 3, scale: 1 / 1000 },
  { label: '速度 (m/s)', field: 'V', digits: 2 },
  { label: '推力 (KN)', field: 'Fx', digits: 2, scale: 1 / 1000 },
  { label: '过载nx', field: 'nx', digits: 3 },
  { label: '俯仰程序角 (°)', field: 'phicx', digits: 3 },
  { label: '当地俯仰角 (°)', field: 'phi_d', digits: 2 },
]

function formatShiXuCell(value, col) {
  if (col.text) return String(value ?? '')
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  const scaled = col.scale != null ? n * col.scale : n
  return scaled.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: col.digits ?? 2,
  })
}

function emptyShiXuTable() {
  return {
    columns: SHIXU_FIELD_DEFS.map(({ label, cellClass }) => ({ label, cellClass })),
    rows: [],
  }
}

/** 从 DicKeyData 提取特征点表格（取偶数索引行 0,2,4…） */
export function extractShiXuTable(apiResult) {
  const dic = apiResult?.DicKeyData ?? apiResult?.dicKeyData ?? {}
  const names = dic.Text ?? dic.text ?? []
  if (!Array.isArray(names) || names.length === 0) return emptyShiXuTable()

  const rows = []
  for (let i = 0; i < names.length; i += 2) {
    rows.push(
      SHIXU_FIELD_DEFS.map((col) => {
        const series = dic[col.field] ?? []
        const value = Array.isArray(series) ? series[i] : series
        return formatShiXuCell(value, col)
      }),
    )
  }

  return {
    columns: SHIXU_FIELD_DEFS.map(({ label, cellClass }) => ({ label, cellClass })),
    rows,
  }
}

//=================================================================================
export function extractTrajectoryPoints(apiResult) {
  const all = extractAllData(apiResult)
  if (all.lon.length && all.lat.length) {
    return all.lon.map((lon, i) => ({
      lon,
      lat: all.lat[i] ?? 0,
      alt: all.alt[i] ?? all.height[i] ?? 0,
      time: all.time[i] ?? i,
    }))
  }

  const keyData = apiResult?.DicKeyData ?? apiResult?.dicKeyData ?? {}
  const lonArr = keyData.Lambda ?? keyData.lon ?? []
  const latArr = keyData.d_B ?? keyData.lat ?? []
  const altArr = keyData.h ?? keyData.alt ?? []
  const timeArr = keyData.tt ?? keyData.t ?? []

  if (lonArr.length && latArr.length) {
    return lonArr.map((lon, i) => ({
      lon: Number(lon),
      lat: Number(latArr[i] ?? 0),
      alt: Number(altArr[i] ?? 0),
      time: Number(timeArr[i] ?? i),
    }))
  }

  return []
}

export function extractSummary(apiResult) {
  const profile = apiResult?.Profiles?.[0]
  const gwControl = profile?.Controls?.find((c) => c.Name === 'Gw')
  const gwResult = profile?.Results?.find((r) => r.Name === 'Gw')

  return {
    message: apiResult?.Message ?? '',
    payloadCapacity:
      gwControl?.CurrentValue ??
      gwResult?.CurrentValue ??
      profile?.OptimX?.[0] ??
      null,
    terminationType: profile?.OptimTerminationType ?? null,
  }
}

function formatOptimNum(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  if (Math.abs(n) > 0 && Math.abs(n) < 0.001) return n.toExponential(4)
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 6 })
}

/** 优化完成后各 Profile 的结果简介（仅含启用的 Controls 及其优化值） */
export function buildOptimProfileSummaries(profiles) {
  if (!Array.isArray(profiles)) return []

  return profiles.map((profile) => ({
    name: profile.Name ?? 'Profile',
    text: profile.Text ?? '',
    terminationType: profile.OptimTerminationType ?? null,
    iterationCount: profile.IterationCount ?? null,
    fvecCount: profile.FvecCount ?? null,
    controls: (profile.Controls ?? [])
      .filter((c) => c.Use)
      .map((c) => ({
        name: c.Name,
        object: c.Object ?? '',
        value: formatOptimNum(c.CurrentValue),
      })),
    results: (profile.Results ?? [])
      .filter((r) => r.Use)
      .map((r) => ({
        name: r.Name,
        object: r.Object ?? '',
        goal: r.Goal ?? '',
        dltFG: formatOptimNum(r.DltFG),
      })),
  }))
}

/** 从 DicKeyData 提取特征点时刻，供曲线 markLine 标注 */
export function extractShiXuMarkEvents(apiResult) {
  const dic = apiResult?.DicKeyData ?? apiResult?.dicKeyData ?? {}
  const names = dic.Text ?? dic.text ?? []
  const times = dic.tt ?? dic.t ?? []
  if (!Array.isArray(names) || names.length === 0) return []

  const events = []
  for (let i = 0; i < names.length; i += 2) {
    const label = String(names[i] ?? '').trim()
    const time = Number(times[i])
    if (!label || !Number.isFinite(time)) continue
    events.push({ time, label })
  }
  return events
}

function buildMarkLine(markEvents) {
  if (!markEvents?.length) return undefined
  return {
    symbol: 'none',
    label: {
      formatter: '{b}',
      position: 'insideEndTop',
      color: '#c8d0dc',
      fontSize: 11,
    },
    lineStyle: { color: '#6b7a90', type: 'dashed' },
    data: markEvents.map(({ time, label }) => ({ name: label, xAxis: time })),
  }
}

function buildMaxQMarkPoint(time, q) {
  if (!time?.length || !q?.length) return undefined
  let maxIdx = 0
  let maxVal = -Infinity
  q.forEach((value, index) => {
    if (Number.isFinite(value) && value > maxVal) {
      maxVal = value
      maxIdx = index
    }
  })
  if (!Number.isFinite(maxVal)) return undefined
  return {
    symbol: 'circle',
    symbolSize: 8,
    label: {
      formatter: '最大动压\n{c}',
      color: '#ff8c42',
      fontSize: 11,
    },
    itemStyle: { color: '#ff8c42' },
    data: [{ name: '最大动压', coord: [time[maxIdx], maxVal], value: maxVal }],
  }
}

function applyZoomEnhancements(option, { chartKey, markEvents, series }) {
  const next = {
    ...option,
    grid: { ...option.grid, bottom: 72 },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, height: 18, bottom: 16 },
    ],
    toolbox: {
      right: 12,
      top: 8,
      feature: {
        saveAsImage: { title: '保存图片', pixelRatio: 2 },
        restore: { title: '还原' },
      },
      iconStyle: { borderColor: '#9aa8bc' },
    },
    series: option.series.map((item, index) => {
      const enhanced = { ...item }
      if (index === 0 && markEvents?.length) {
        enhanced.markLine = buildMarkLine(markEvents)
      }
      if (chartKey === 'q' && index === 0) {
        enhanced.markPoint = buildMaxQMarkPoint(series.time, series.q)
      }
      return enhanced
    }),
  }
  return next
}

export function buildChartConfigs(series, { zoom = false, markEvents = [] } = {}) {
  const { time, q, height, velocity, overload, mass, thrust } = series
  const axisNameStyle = { color: '#c8d0dc', fontSize: 13 }
  const axisLabelStyle = { color: '#9aa8bc', fontSize: 12 }

  const pair = (ys) => time.map((t, i) => [t, ys[i]])

  const tMax = time.length ? time[time.length - 1] : 0

  const makeX = ({ min, max, interval } = {}) => ({
    type: 'value',
    name: '时间(s)',
    nameLocation: 'middle',
    nameGap: 30,
    nameTextStyle: axisNameStyle,
    axisLabel: {
      ...axisLabelStyle,
      margin: 10,
      formatter: (v) => `${Math.round(v)}`,
    },
    axisLine: { lineStyle: { color: '#6b7a90' } },
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(interval !== undefined ? { interval } : {}),
  })

  // 默认 X 轴：从 0 开始，整十秒刻度，间隔根据总时长动态选取，避免过密
  const pickInterval = (span) => {
    const candidates = [10, 20, 30, 60, 120, 180, 300, 600]
    const targetTicks = 8
    for (const step of candidates) {
      if (span / step <= targetTicks) return step
    }
    return Math.ceil(span / targetTicks / 60) * 60
  }
  const defaultInterval = pickInterval(Math.max(tMax, 10))
  const defaultXMax = Math.max(defaultInterval, Math.ceil(tMax / defaultInterval) * defaultInterval)
  const baseX = makeX({ min: 0, max: defaultXMax, interval: defaultInterval })

  const yBase = (name) => ({
    type: 'value',
    name,
    nameGap: 16,
    nameTextStyle: axisNameStyle,
    axisLabel: { ...axisLabelStyle, margin: 8 },
    axisLine: { lineStyle: { color: '#6b7a90' } },
  })

  const baseGrid = { left: 14, right: 18, top: 48, bottom: 52, containLabel: true }
  const titleStyle = { color: '#e8edf5', fontSize: 14 }

  const configs = {
    q: {
      title: '时间-动压/过载',
      option: {
        backgroundColor: 'transparent',
        title: { text: '时间-动压/过载', left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        legend: { data: ['动压', '过载'], textStyle: { color: '#c8d0dc', fontSize: 12 }, top: 26, itemWidth: 14 },
        grid: { ...baseGrid, right: 24, top: 56 },
        xAxis: baseX,
        yAxis: [yBase('动压(Pa)'), yBase('过载(g)')],
        series: [
          { name: '动压', type: 'line', data: pair(q), smooth: true, showSymbol: false, lineStyle: { color: '#ff8c42' } },
          { name: '过载', type: 'line', yAxisIndex: 1, data: pair(overload), smooth: true, showSymbol: false, lineStyle: { color: '#ef5350' } },
        ],
      },
    },
    hv: {
      title: '时间-高度/速度',
      option: {
        backgroundColor: 'transparent',
        title: { text: '时间-高度/速度', left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        legend: { data: ['高度', '速度'], textStyle: { color: '#c8d0dc', fontSize: 12 }, top: 26, itemWidth: 14 },
        grid: { ...baseGrid, right: 24, top: 56 },
        xAxis: baseX,
        yAxis: [yBase('高度(km)'), yBase('速度(m/s)')],
        series: [
          { name: '高度', type: 'line', data: pair(height.map((h) => h / 1000)), smooth: true, showSymbol: false, lineStyle: { color: '#4fc3f7' } },
          { name: '速度', type: 'line', yAxisIndex: 1, data: pair(velocity), smooth: true, showSymbol: false, lineStyle: { color: '#81c784' } },
        ],
      },
    },
    n: {
      title: '时间-轴向过载',
      option: {
        backgroundColor: 'transparent',
        title: { text: '时间-轴向过载', left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        grid: baseGrid,
        xAxis: baseX,
        yAxis: yBase('过载(g)'),
        series: [{ name: '轴向过载', type: 'line', data: pair(overload), smooth: true, showSymbol: false, lineStyle: { color: '#ef5350' } }],
      },
    },
    mass: {
      title: '时间-质量',
      option: {
        backgroundColor: 'transparent',
        title: { text: '时间-质量', left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        grid: baseGrid,
        xAxis: baseX,
        yAxis: yBase('质量(kg)'),
        series: [{ name: '质量', type: 'line', data: pair(mass), smooth: true, showSymbol: false, lineStyle: { color: '#ba68c8' } }],
      },
    },
    thrust: {
      title: '时间-推力',
      option: {
        backgroundColor: 'transparent',
        title: { text: '时间-推力', left: 'center', textStyle: titleStyle },
        tooltip: { trigger: 'axis' },
        grid: baseGrid,
        xAxis: baseX,
        yAxis: yBase('推力(N)'),
        series: [{ name: '轴向推力', type: 'line', data: pair(thrust), smooth: true, showSymbol: false, lineStyle: { color: '#ffd54f' } }],
      },
    },
  }

  if (!zoom) return configs

  return Object.fromEntries(
    Object.entries(configs).map(([key, config]) => [
      key,
      {
        ...config,
        option: applyZoomEnhancements(config.option, { chartKey: key, markEvents, series }),
      },
    ]),
  )
}

export const CHART_TAB_DEFS = [
  { id: 'q', label: '动压/过载', keys: ['q'] },
  { id: 'hv', label: '高度/速度', keys: ['hv'] },
  { id: 'n', label: '过载', keys: ['n'] },
  { id: 'mass', label: '质量', keys: ['mass'] },
  { id: 'thrust', label: '推力', keys: ['thrust'] },
  { id: 'all', label: '全部', keys: ['q', 'hv', 'n', 'mass', 'thrust'] },
]
