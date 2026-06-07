import Field from './Field'

export default function EngineCard({ title, engine, onChange, hideTitle = false }) {
  return (
    <div className="engine-card">
      <div className={`engine-card-header${hideTitle ? ' engine-card-header-compact' : ''}`}>
        {!hideTitle && <div className="engine-card-title">{title}</div>}
        <label className="engine-card-vacuum">
          <span className="engine-card-vacuum-label">真空发动机</span>
          <input
            type="checkbox"
            checked={Boolean(engine.IsVacuum)}
            onChange={(e) => onChange('IsVacuum', e.target.checked, 'boolean')}
          />
        </label>
      </div>
      <div className="engine-card-body">
        <div className="engine-field-row">
          <Field label="名称" className="field-engine-name">
            <input
              type="text"
              value={engine.Name ?? ''}
              onChange={(e) => onChange('Name', e.target.value, 'string')}
            />
          </Field>
          <Field label="台数" className="field-input-narrow">
            <input
              type="number"
              value={engine.NumberOfEngines ?? 1}
              onChange={(e) => onChange('NumberOfEngines', e.target.value)}
            />
          </Field>
        </div>
        <div className="engine-field-row">
          <Field label="推力" unit="N" className="field-input-wide">
            <input
              type="number"
              value={engine.Force ?? 0}
              onChange={(e) => onChange('Force', e.target.value)}
            />
          </Field>
          <Field label="喷口面积" unit="m²" className="field-input-narrow">
            <input
              type="number"
              step="0.001"
              value={engine.Sa ?? 0}
              onChange={(e) => onChange('Sa', e.target.value)}
            />
          </Field>
        </div>
        <div className="engine-field-row">
          <Field label="比冲" unit="m/s" className="field-input-medium">
            <input
              type="number"
              value={engine.Ips ?? 0}
              onChange={(e) => onChange('Ips', e.target.value)}
            />
          </Field>
          <Field label="安装偏角" unit="deg" className="field-input-narrow">
            <input
              type="number"
              step="0.1"
              value={engine.CantAngle ?? 0}
              onChange={(e) => onChange('CantAngle', e.target.value)}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
