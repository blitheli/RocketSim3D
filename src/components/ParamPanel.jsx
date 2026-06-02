import GroupBox from './params/GroupBox'
import Field from './params/Field'
import BasicParams from './params/BasicParams'
import OrbitParams from './params/OrbitParams'
import Timeline from './params/Timeline'
import StageGroup from './params/StageGroup'
import OptimProfile from './params/OptimProfile'
import { getRocketType } from '../data/rockets'

export default function ParamPanel({ payload, onChange }) {
  const rocketType = getRocketType(payload)
  const input = payload.RocketInput

  const updateInput = (key, value, type = 'number') => {
    onChange((prev) => {
      const next = structuredClone(prev)
      if (type === 'number') {
        next.RocketInput[key] = value === '' ? 0 : Number(value)
      } else if (type === 'array') {
        next.RocketInput[key] = value
      } else {
        next.RocketInput[key] = value
      }
      return next
    })
  }

  const updateEngine = (engineKey, field, value, type = 'number') => {
    onChange((prev) => {
      const next = structuredClone(prev)
      if (!next.RocketInput[engineKey]) next.RocketInput[engineKey] = {}
      if (type === 'number') {
        next.RocketInput[engineKey][field] = value === '' ? 0 : Number(value)
      } else if (type === 'boolean') {
        next.RocketInput[engineKey][field] = Boolean(value)
      } else {
        next.RocketInput[engineKey][field] = value
      }
      return next
    })
  }

  const updateProfiles = (profiles) => {
    onChange((prev) => ({ ...prev, Profiles: profiles }))
  }

  return (
    <div className="param-panel">
      <div className="rocket-info">
        <div><strong>{input.Name}</strong> ({rocketType})</div>
        {input.Text && <div>{input.Text}</div>}
        {input.Text2 && <div>{input.Text2}</div>}
        {input.Text3 && <div>{input.Text3}</div>}
      </div>

      <BasicParams input={input} onChange={updateInput} />
      <OrbitParams input={input} onChange={updateInput} />
      <Timeline rocketType={rocketType} input={input} onChange={updateInput} />

      <StageGroup
        rocketType={rocketType}
        input={input}
        onChange={updateInput}
        onEngineChange={updateEngine}
      />

      <OptimProfile
        profiles={payload.Profiles ?? []}
        onChange={updateProfiles}
      />

      <GroupBox title="运行选项">
        <Field label="运行优化" full>
          <label className="field-control">
            <input
              type="checkbox"
              checked={Boolean(payload.RunProfiles)}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, RunProfiles: e.target.checked }))
              }
            />
            RunProfiles
          </label>
        </Field>
      </GroupBox>
    </div>
  )
}
