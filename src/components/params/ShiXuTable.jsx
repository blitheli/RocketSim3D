export default function ShiXuTable({ rows }) {
  const hasData = Array.isArray(rows) && rows.length > 0

  return (
    <div className="shixu-table-wrap">
      <div className="shixu-table-title">特征点参数</div>
      {hasData ? (
        <table className="shixu-table">
          <thead>
            <tr>
              <th>飞行段</th>
              <th>时刻 (s)</th>
              <th>高度 (km)</th>
              <th>速度 (m/s)</th>
              <th>总质量 (kg)</th>
              <th>推进剂 (kg)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="shixu-name">{row.name}</td>
                <td>{fmt(row.time, 1)}</td>
                <td>{fmt(row.height / 1000, 2)}</td>
                <td>{fmt(row.velocity, 1)}</td>
                <td>{fmt(row.mass, 1)}</td>
                <td>{fmt(row.fuel, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="shixu-empty">计算完成后显示</div>
      )}
    </div>
  )
}

function fmt(value, digits = 2) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}
