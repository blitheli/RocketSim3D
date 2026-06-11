import GroupBox from './GroupBox'
import Field from './Field'
import OptimInput from './OptimInput'

export default function OrbitParams({ input, onChange, optimizedFields }) {
  const smaKm = (input.sma0 ?? 0) / 1000

  return (
    <GroupBox title="入轨参数" className="orbit-params">
      <Field label="长半轴" unit="km">
        <OptimInput
          field="sma0"
          optimizedFields={optimizedFields}
          type="number"
          step="0.01"
          value={smaKm}
          onChange={(e) => onChange('sma0', Number(e.target.value) * 1000)}
        />
      </Field>
      <Field label="偏心率">
        <OptimInput
          field="ecc0"
          optimizedFields={optimizedFields}
          type="number"
          step="0.000001"
          value={input.ecc0 ?? 0}
          onChange={(e) => onChange('ecc0', e.target.value)}
        />
      </Field>
      <Field label="轨道倾角" unit="deg">
        <OptimInput
          field="inc0"
          optimizedFields={optimizedFields}
          type="number"
          step="0.0001"
          value={input.inc0 ?? 0}
          onChange={(e) => onChange('inc0', e.target.value)}
        />
      </Field>
      <Field label="近地点幅角" unit="deg">
        <OptimInput
          field="omg0"
          optimizedFields={optimizedFields}
          type="number"
          step="0.0001"
          value={input.omg0 ?? 0}
          onChange={(e) => onChange('omg0', e.target.value)}
        />
      </Field>
    </GroupBox>
  )
}
