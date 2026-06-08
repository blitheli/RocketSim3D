import { useState } from 'react'
import GroupBox from './GroupBox'
import EngineCard from './EngineCard'

export default function EngineTabs({ engines, input, onEngineChange }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = Math.min(activeIndex, Math.max(engines.length - 1, 0))
  const active = engines[safeIndex]

  if (!engines.length) return null

  return (
    <GroupBox title="发动机参数" className="engine-tabs">
      <div className="engine-tabs-bar" role="tablist">
        {engines.map((engine, index) => (
          <button
            key={engine.key}
            type="button"
            role="tab"
            className={`engine-tab${index === safeIndex ? ' is-active' : ''}`}
            aria-selected={index === safeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {engine.label}
          </button>
        ))}
      </div>
      <div className="engine-tabs-panel" role="tabpanel">
        <EngineCard
          hideTitle
          engineLabel={active.label}
          engine={input[active.key] ?? {}}
          onChange={(field, value, type) => onEngineChange(active.key, field, value, type)}
        />
      </div>
    </GroupBox>
  )
}
