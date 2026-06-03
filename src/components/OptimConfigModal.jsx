import { useEffect } from 'react'
import OptimProfile from './params/OptimProfile'
import GroupBox from './params/GroupBox'
import Field from './params/Field'

export default function OptimConfigModal({ open, payload, onChange, onClose }) {
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
            <OptimProfile profiles={payload.Profiles ?? []} onChange={updateProfiles} />
          ) : (
            <p className="modal-empty">当前方案无优化 Profiles 配置</p>
          )}
          <GroupBox title="运行选项">
            <Field label="运行优化" full>
              <label className="field-control">
                <input
                  type="checkbox"
                  checked={Boolean(payload.RunProfiles)}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, RunProfiles: e.target.checked }))
                  }
                />
                RunProfiles
              </label>
            </Field>
          </GroupBox>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
