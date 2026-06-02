import GroupBox from './GroupBox'

function updateControl(profiles, profileIndex, controlIndex, field, value) {
  const next = structuredClone(profiles)
  const control = next[profileIndex].Controls[controlIndex]
  if (field === 'Use') {
    control.Use = Boolean(value)
  } else if (['CurrentValue', 'LowerBound', 'UpperBound', 'Scale'].includes(field)) {
    control[field] = value === '' ? 0 : Number(value)
  } else {
    control[field] = value
  }
  return next
}

function updateResult(profiles, profileIndex, resultIndex, field, value) {
  const next = structuredClone(profiles)
  const result = next[profileIndex].Results[resultIndex]
  if (field === 'Use') {
    result.Use = Boolean(value)
  } else if (['Scale', 'DesiredValue'].includes(field)) {
    result[field] = value === '' ? 0 : Number(value)
  } else {
    result[field] = value
  }
  return next
}

export default function OptimProfile({ profiles, onChange }) {
  if (!profiles?.length) return null
  const profile = profiles[0]

  return (
    <GroupBox title={`优化配置 - ${profile.Name ?? 'Profile'}`}>
      <div className="optim-table-wrap">
        <div style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 12 }}>自变量 Controls</div>
        <table className="optim-table">
          <thead>
            <tr>
              <th>启用</th>
              <th>名称</th>
              <th>对象</th>
              <th>当前值</th>
              <th>下界</th>
              <th>上界</th>
              <th>Scale</th>
            </tr>
          </thead>
          <tbody>
            {(profile.Controls ?? []).map((control, i) => (
              <tr key={`${control.Name}-${i}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={Boolean(control.Use)}
                    onChange={(e) =>
                      onChange(updateControl(profiles, 0, i, 'Use', e.target.checked))
                    }
                  />
                </td>
                <td>{control.Name}</td>
                <td>{control.Object}</td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={control.CurrentValue ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, 0, i, 'CurrentValue', e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={control.LowerBound ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, 0, i, 'LowerBound', e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={control.UpperBound ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, 0, i, 'UpperBound', e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={control.Scale ?? 1}
                    onChange={(e) =>
                      onChange(updateControl(profiles, 0, i, 'Scale', e.target.value))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="optim-table-wrap" style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 12 }}>目标/约束 Results</div>
        <table className="optim-table">
          <thead>
            <tr>
              <th>启用</th>
              <th>名称</th>
              <th>目标</th>
              <th>对象</th>
              <th>Scale</th>
            </tr>
          </thead>
          <tbody>
            {(profile.Results ?? []).map((result, i) => (
              <tr key={`${result.Name}-${i}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={Boolean(result.Use)}
                    onChange={(e) =>
                      onChange(updateResult(profiles, 0, i, 'Use', e.target.checked))
                    }
                  />
                </td>
                <td>{result.Name}</td>
                <td>{result.Goal}</td>
                <td>{result.Object}</td>
                <td>{result.Scale ?? 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GroupBox>
  )
}
