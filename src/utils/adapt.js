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

export function extractStageTable(apiResult, rocketInput) {
  const dic = apiResult?.DicShiXu ?? apiResult?.dicShiXu ?? {}
  const names = dic.Text ?? dic.text ?? []
  const times = dic.tt ?? []
  const fuel = dic.mass_y ?? []
  const totalMass = dic.mass ?? []
  const height = dic.h ?? []
  const velocity = dic.V ?? []

  if (Array.isArray(names) && names.length > 0) {
    const fallbackRows = buildFallbackStageTable(rocketInput)
    return names.map((name, i) => {
      const fallback = fallbackRows[i] ?? {}
      const nextTime = times[i + 1]
      const duration =
        nextTime != null && times[i] != null ? Number(nextTime) - Number(times[i]) : fallback.duration

      return {
        name: String(name),
        thrust: fallback.thrust,
        ips: fallback.ips,
        structMass: fallback.structMass,
        duration,
        sm: fallback.sm,
        sa: fallback.sa,
        yaw: fallback.yaw ?? '跟随',
        pitchRate: fallback.pitchRate,
        fuel: num(fuel[i]),
        totalMass: num(totalMass[i]),
        overload: height[i] && velocity[i] ? num(velocity[i]) / 1000 : fallback.overload,
      }
    })
  }

  return buildFallbackStageTable(rocketInput)
}

function buildFallbackStageTable(rocketInput) {
  if (!rocketInput) return []
  const rows = []

  const pushStage = (title, engine, mass, fuel, duration) => {
    const count = engine?.NumberOfEngines ?? 1
    rows.push({
      name: title,
      thrust: num(engine?.Force) * count,
      ips: num(engine?.Ips),
      structMass: num(mass) - num(fuel),
      duration: num(duration),
      sm: num(rocketInput.Sm),
      sa: num(engine?.Sa),
      yaw: '跟随',
      pitchRate: 0,
      fuel: num(fuel),
      totalMass: num(mass),
      overload: 0,
    })
  }

  pushStage(
    '一级',
    rocketInput.Stage1_Engine,
    rocketInput.Stage1_Mass,
    rocketInput.Stage1_FuelMass,
    rocketInput.Tk_1,
  )

  if (rocketInput.Stage2_Mass) {
    pushStage(
      '二级主',
      rocketInput.Stage2_MainEngine,
      rocketInput.Stage2_Mass,
      rocketInput.Stage2_FuelMass,
      rocketInput.Tk_2z,
    )
    if (rocketInput.Stage2_VernierEngine) {
      pushStage(
        '二级游',
        rocketInput.Stage2_VernierEngine,
        0,
        0,
        rocketInput.Tk_2u,
      )
    }
  }

  if (rocketInput.Stage3_Mass) {
    pushStage(
      '三级',
      rocketInput.Stage3_Engine,
      rocketInput.Stage3_Mass,
      rocketInput.Stage3_FuelMass,
      rocketInput.Tk_3,
    )
  }

  return rows
}

export function extractShiXuTable(apiResult) {
  const dic = apiResult?.DicShiXu ?? apiResult?.dicShiXu ?? {}
  const names = dic.Text ?? dic.text ?? []
  if (!Array.isArray(names) || names.length === 0) return []

  const tt     = dic.tt     ?? []
  const h      = dic.h      ?? []
  const V      = dic.V      ?? []
  const mass   = dic.mass   ?? []
  const mass_y = dic.mass_y ?? []

  return names.map((name, i) => ({
    name:    String(name),
    time:    num(tt[i]),
    height:  num(h[i]),
    velocity: num(V[i]),
    mass:    num(mass[i]),
    fuel:    num(mass_y[i]),
  }))
}

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

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function buildChartConfigs(series) {
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

  return {
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
}
