import { useEffect, useState } from 'react'

export default function SaveSchemeModal({ open, defaultName, onClose, onSave }) {
  const [name, setName] = useState(defaultName || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setName(defaultName || '')
      setError('')
    }
  }, [open, defaultName])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('请输入方案名称')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSave(trimmed)
      onClose()
    } catch (err) {
      setError(err.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-scheme-title"
      >
        <div className="modal-header">
          <h2 id="save-scheme-title">保存方案</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <form className="modal-body login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>方案名称</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如 CZ-2D SSO 550km"
              required
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <div className="modal-footer login-footer">
            <button type="button" className="btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
