import GroupBox from './GroupBox'
import Field from './Field'
import { TIMELINE_FIELDS } from '../../utils/rocketSchema'

export default function Timeline({ rocketType, input, onChange }) {
  const fields = TIMELINE_FIELDS[rocketType] ?? []

  return (
    <GroupBox title="飞行时序">
      {fields.map(({ key, label, unit }) => (
        <Field key={key} label={label} unit={unit}>
          <input
            type="number"
            step="0.0001"
            value={input[key] ?? 0}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </Field>
      ))}
    </GroupBox>
  )
}
