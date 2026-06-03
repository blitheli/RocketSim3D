export default function GroupBox({ title, children, className = '' }) {
  return (
    <section className={className ? `group-box ${className}` : 'group-box'}>
      <div className="group-box-title">{title}</div>
      <div className="group-box-body">{children}</div>
    </section>
  )
}
