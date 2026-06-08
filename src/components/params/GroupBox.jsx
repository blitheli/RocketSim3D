export default function GroupBox({ title, children, className = '' }) {
  const boxClass = ['group-box', className, title ? '' : 'group-box--no-title']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={boxClass}>
      {title ? <div className="group-box-title">{title}</div> : null}
      <div className="group-box-body">{children}</div>
    </section>
  )
}
