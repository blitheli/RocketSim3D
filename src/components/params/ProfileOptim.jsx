import GroupBox from './GroupBox'
import Field from './Field'

const GOAL_OPTIONS = ['Maximize', 'Minimize', 'Equality']

function updateProfile(profiles, profileIndex, field, value) {
  const next = structuredClone(profiles)
  const profile = next[profileIndex]
  if (field === 'IsActive' || field === 'IsIterate') {
    profile[field] = Boolean(value)
  } else if (['DiffStep', 'EpsX', 'StepMax', 'MaxIts'].includes(field)) {
    profile[field] = value === '' ? 0 : Number(value)
  } else {
    profile[field] = value
  }
  return next
}

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
  } else if (['CurrentValue', 'DesiredValue', 'Scale', 'DltFG'].includes(field)) {
    result[field] = value === '' ? 0 : Number(value)
  } else {
    result[field] = value
  }
  return next
}

function formatNum(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  if (Math.abs(n) > 0 && Math.abs(n) < 0.001) return n.toExponential(4)
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 6 })
}

export default function ProfileOptim({ profiles, onChange }) {
  if (!profiles?.length) return null
  const profile = profiles[0]
  const profileIndex = 0

  return (
    <>
      <GroupBox title={`${profile.Name ?? 'Profile'}`} className="profile-optim">
        <div className="profile-optim-meta">
          <div className="profile-optim-type">{profile.$type ?? 'Optimizer'}</div>
          {profile.Text ? <div className="profile-optim-desc">{profile.Text}</div> : null}
        </div>

        <div className="profile-optim-params">
          <Field label="DiffStep">
            <input
              type="number"
              step="0.0001"
              value={profile.DiffStep ?? 0}
              onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'DiffStep', e.target.value))}
            />
          </Field>
          <Field label="EpsX">
            <input
              type="number"
              step="0.0001"
              value={profile.EpsX ?? 0}
              onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'EpsX', e.target.value))}
            />
          </Field>
          <Field label="StepMax">
            <input
              type="number"
              step="0.01"
              value={profile.StepMax ?? 0}
              onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'StepMax', e.target.value))}
            />
          </Field>
          <Field label="MaxIts">
            <input
              type="number"
              step="1"
              value={profile.MaxIts ?? 0}
              onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'MaxIts', e.target.value))}
            />
          </Field>
          <Field label="IsActive">
            <label className="field-control">
              <input
                type="checkbox"
                checked={Boolean(profile.IsActive)}
                onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'IsActive', e.target.checked))}
              />
            </label>
          </Field>
          <Field label="IsIterate">
            <label className="field-control">
              <input
                type="checkbox"
                checked={Boolean(profile.IsIterate)}
                onChange={(e) => onChange(updateProfile(profiles, profileIndex, 'IsIterate', e.target.checked))}
              />
            </label>
          </Field>
        </div>
      </GroupBox>

      <div className="optim-table-wrap">
        <div className="optim-table-caption">自变量 Controls</div>
        <table className="optim-table">
          <thead>
            <tr>
              <th>启用</th>
              <th>名称</th>
              <th>对象</th>
              <th className="optim-col-num">当前值</th>
              <th className="optim-col-num-sm">下界</th>
              <th className="optim-col-num-sm">上界</th>
              <th className="optim-col-num-sm">Scale</th>
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
                      onChange(updateControl(profiles, profileIndex, i, 'Use', e.target.checked))
                    }
                  />
                </td>
                <td>{control.Name}</td>
                <td>{control.Object}</td>
                <td className="optim-col-num">
                  <input
                    type="number"
                    step="0.0001"
                    value={control.CurrentValue ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, profileIndex, i, 'CurrentValue', e.target.value))
                    }
                  />
                </td>
                <td className="optim-col-num-sm">
                  <input
                    type="number"
                    step="0.0001"
                    value={control.LowerBound ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, profileIndex, i, 'LowerBound', e.target.value))
                    }
                  />
                </td>
                <td className="optim-col-num-sm">
                  <input
                    type="number"
                    step="0.0001"
                    value={control.UpperBound ?? 0}
                    onChange={(e) =>
                      onChange(updateControl(profiles, profileIndex, i, 'UpperBound', e.target.value))
                    }
                  />
                </td>
                <td className="optim-col-num-sm">
                  <input
                    type="number"
                    value={control.Scale ?? 1}
                    onChange={(e) =>
                      onChange(updateControl(profiles, profileIndex, i, 'Scale', e.target.value))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="optim-table-wrap profile-optim-results">
        <div className="optim-table-caption">目标/约束 Results</div>
        <table className="optim-table">
          <thead>
            <tr>
              <th>启用</th>
              <th>名称</th>
              <th>目标</th>
              <th>对象</th>
              <th className="optim-col-num">当前值</th>
              <th className="optim-col-num">期望值</th>
              <th className="optim-col-num-sm">Scale</th>
              <th>偏差 DltFG</th>
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
                      onChange(updateResult(profiles, profileIndex, i, 'Use', e.target.checked))
                    }
                  />
                </td>
                <td>{result.Name}</td>
                <td>
                  <select
                    value={result.Goal ?? 'Equality'}
                    onChange={(e) =>
                      onChange(updateResult(profiles, profileIndex, i, 'Goal', e.target.value))
                    }
                  >
                    {GOAL_OPTIONS.map((goal) => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                </td>
                <td>{result.Object}</td>
                <td className="optim-col-num">
                  <input
                    type="number"
                    step="0.0001"
                    value={result.CurrentValue ?? 0}
                    onChange={(e) =>
                      onChange(updateResult(profiles, profileIndex, i, 'CurrentValue', e.target.value))
                    }
                  />
                </td>
                <td className="optim-col-num">
                  <input
                    type="number"
                    step="0.0001"
                    value={result.DesiredValue ?? 0}
                    onChange={(e) =>
                      onChange(updateResult(profiles, profileIndex, i, 'DesiredValue', e.target.value))
                    }
                  />
                </td>
                <td className="optim-col-num-sm">
                  <input
                    type="number"
                    value={result.Scale ?? 1}
                    onChange={(e) =>
                      onChange(updateResult(profiles, profileIndex, i, 'Scale', e.target.value))
                    }
                  />
                </td>
                <td className="optim-readonly">{formatNum(result.DltFG)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(profile.OptimTerminationType != null || profile.IterationCount != null) && (
        <div className="profile-optim-status">
          {profile.OptimTerminationType != null && (
            <span>终止类型: {profile.OptimTerminationType}</span>
          )}
          {profile.IterationCount != null && (
            <span>迭代次数: {profile.IterationCount}</span>
          )}
          {profile.FvecCount != null && (
            <span>函数评估: {profile.FvecCount}</span>
          )}
        </div>
      )}
    </>
  )
}
