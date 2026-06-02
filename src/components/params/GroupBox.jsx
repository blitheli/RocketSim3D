export default function GroupBox({ title, children }) {
  return (
    <section className="group-box">
      <div className="group-box-title">{title}</div>
      <div className="group-box-body">{children}</div>
    </section>
  )
}
