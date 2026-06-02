import Field from './Field'

export default function EngineCard({ title, engine, onChange }) {
  return (
    <div className="engine-card">
      <div className="engine-card-title">{title}</div>
      <div className="group-box-body" style={{ padding: 0 }}>
        <Field label="名称">
          <input
            type="text"
            value={engine.Name ?? ''}
            onChange={(e) => onChange('Name', e.target.value, 'string')}
          />
        </Field>
        <Field label="台数">
          <input
            type="number"
            value={engine.NumberOfEngines ?? 1}
            onChange={(e) => onChange('NumberOfEngines', e.target.value)}
          />
        </Field>
        <Field label="推力" unit="N">
          <input
            type="number"
            value={engine.Force ?? 0}
            onChange={(e) => onChange('Force', e.target.value)}
          />
        </Field>
        <Field label="比冲" unit="m/s">
          <input
            type="number"
            value={engine.Ips ?? 0}
            onChange={(e) => onChange('Ips', e.target.value)}
          />
        </Field>
        <Field label="喷口面积" unit="m²">
          <input
            type="number"
            step="0.001"
            value={engine.Sa ?? 0}
            onChange={(e) => onChange('Sa', e.target.value)}
          />
        </Field>
        <Field label="安装偏角" unit="deg">
          <input
            type="number"
            step="0.1"
            value={engine.CantAngle ?? 0}
            onChange={(e) => onChange('CantAngle', e.target.value)}
          />
        </Field>
        <Field label="真空发动机">
          <input
            type="checkbox"
            checked={Boolean(engine.IsVacuum)}
            onChange={(e) => onChange('IsVacuum', e.target.checked, 'boolean')}
          />
        </Field>
      </div>
    </div>
  )
}
