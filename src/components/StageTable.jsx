export default function StageTable({ rows }) {
  return (
    <div className="stage-table-wrap">
      <table className="stage-table">
        <thead>
          <tr>
            <th>段名称</th>
            <th>推力(N)</th>
            <th>比冲(m/s)</th>
            <th>结构(kg)</th>
            <th>段时间(s)</th>
            <th>Sm(m²)</th>
            <th>Sa(m²)</th>
            <th>偏航角(°)</th>
            <th>俯仰角速率(deg/s)</th>
            <th className="result-col">推进剂(kg)</th>
            <th className="result-col">总质量(kg)</th>
            <th className="result-col">过载</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((row, index) => (
            <tr key={`${row.name}-${index}`}>
              <td>{row.name}</td>
              <td>{formatNum(row.thrust, 0)}</td>
              <td>{formatNum(row.ips, 1)}</td>
              <td>{formatNum(row.structMass, 1)}</td>
              <td>{formatNum(row.duration, 2)}</td>
              <td>{formatNum(row.sm, 3)}</td>
              <td>{formatNum(row.sa, 3)}</td>
              <td>{row.yaw ?? '跟随'}</td>
              <td>{formatNum(row.pitchRate, 5)}</td>
              <td className="result-col">{formatNum(row.fuel, 1)}</td>
              <td className="result-col">{formatNum(row.totalMass, 1)}</td>
              <td className="result-col">{formatNum(row.overload, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatNum(value, digits = 2) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}
