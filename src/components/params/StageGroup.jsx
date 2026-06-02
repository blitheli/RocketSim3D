import GroupBox from './GroupBox'
import Field from './Field'
import EngineCard from './EngineCard'
import { STAGE_CONFIG } from '../../utils/rocketSchema'

export default function StageGroup({ rocketType, input, onChange, onEngineChange }) {
  const stages = STAGE_CONFIG[rocketType] ?? []

  return stages.map((stage) => (
    <GroupBox key={stage.title} title={`${stage.title}参数`}>
      <Field label="总质量" unit="kg">
        <input
          type="number"
          value={input[stage.massKey] ?? 0}
          onChange={(e) => onChange(stage.massKey, e.target.value)}
        />
      </Field>
      <Field label="推进剂" unit="kg">
        <input
          type="number"
          value={input[stage.fuelKey] ?? 0}
          onChange={(e) => onChange(stage.fuelKey, e.target.value)}
        />
      </Field>
      {stage.engines.map((engine) => (
        <EngineCard
          key={engine.key}
          title={engine.label}
          engine={input[engine.key] ?? {}}
          onChange={(field, value, type) => onEngineChange(engine.key, field, value, type)}
        />
      ))}
    </GroupBox>
  ))
}
