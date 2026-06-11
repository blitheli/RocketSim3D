export default function OptimWaitingOverlay({ open }) {
  if (!open) return null

  return (
    <div className="optim-waiting-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="optim-waiting-spinner" aria-hidden="true" />
      <p className="optim-waiting-text">正在进行优化，请稍等...</p>
    </div>
  )
}
