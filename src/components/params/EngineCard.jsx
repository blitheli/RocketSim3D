import { useState } from 'react'
import Field from './Field'
import EngineThrottlingModal from './EngineThrottlingModal'

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0
}

export default function EngineCard({ title, engine, engineLabel, onChange, hideTitle = false }) {
  const [throttleOpen, setThrottleOpen] = useState(false)
  const hasThrottle =
    isNonEmptyArray(engine.ThrustThrottling) || isNonEmptyArray(engine.IpsThrottling)

  return (
    <div className="engine-card">
      <div className={`engine-card-header${hideTitle ? ' engine-card-header-compact' : ''}`}>
        {!hideTitle && <div className="engine-card-title">{title}</div>}
        <div className="engine-card-header-actions">
          {hasThrottle && (
            <button
              type="button"
              className="btn engine-card-throttle-btn"
              onClick={() => setThrottleOpen(true)}
            >
              节流曲线
            </button>
          )}
          <label className="engine-card-vacuum">
            <span className="engine-card-vacuum-label">真空发动机</span>
            <input
              type="checkbox"
              checked={Boolean(engine.IsVacuum)}
              onChange={(e) => onChange('IsVacuum', e.target.checked, 'boolean')}
            />
          </label>
        </div>
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
      <EngineThrottlingModal
        open={throttleOpen}
        engine={engine}
        engineLabel={engineLabel ?? title}
        onChange={onChange}
        onClose={() => setThrottleOpen(false)}
      />
    </div>
  )
}
