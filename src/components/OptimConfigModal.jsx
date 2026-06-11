import { useEffect } from 'react'
import ProfileOptim from './params/ProfileOptim'

export default function OptimConfigModal({ open, payload, onChange, onClose, onOptimize, loading }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const updateProfiles = (profiles) => {
    onChange((prev) => ({ ...prev, Profiles: profiles }))
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog optim-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="optim-modal-title"
      >
        <div className="modal-header">
          <h2 id="optim-modal-title">优化参数配置</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body">
          {(payload.Profiles ?? []).length > 0 ? (
            <ProfileOptim profiles={payload.Profiles ?? []} onChange={updateProfiles} />
          ) : (
            <p className="modal-empty">当前方案无优化 Profiles 配置</p>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOptimize}
            disabled={loading}
          >
            优化
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
