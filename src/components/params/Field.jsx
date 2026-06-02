export default function Field({ label, unit, children, full = false }) {
  return (
    <div className={`field ${full ? 'field-full' : ''}`}>
      {label && <span className="field-label">{label}</span>}
      <div className="field-control">
        {children}
        {unit && <span className="field-unit">{unit}</span>}
      </div>
    </div>
  )
}
