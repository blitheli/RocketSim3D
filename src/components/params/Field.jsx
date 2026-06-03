export default function Field({ label, unit, children, full = false, className = '' }) {
  return (
    <div className={`field ${full ? 'field-full' : ''} ${className}`.trim()}>
      {label && <span className="field-label">{label}</span>}
      <div className="field-control">
        {children}
        {unit && <span className="field-unit">{unit}</span>}
      </div>
    </div>
  )
}
