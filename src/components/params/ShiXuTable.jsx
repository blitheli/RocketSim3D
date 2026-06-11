export default function ShiXuTable({ columns = [], rows = [] }) {
  const hasData = rows.length > 0

  return (
    <div className="shixu-table-wrap">
      <div className="shixu-table-title">特征点参数</div>
      {hasData ? (
        <table className="shixu-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.label}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={cells[0] ?? i}>
                {cells.map((cell, j) => (
                  <td key={j} className={columns[j]?.cellClass}>
                    {cell}
                  </td>
                ))}
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
