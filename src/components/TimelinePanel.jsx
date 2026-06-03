import Timeline from './params/Timeline'
import { getRocketType } from '../data/rockets'

export default function TimelinePanel({ payload, onChange }) {
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

  return (
    <aside className="timeline-panel">
      <Timeline rocketType={rocketType} input={input} onChange={updateInput} />
    </aside>
  )
}
