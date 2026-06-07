import { useEffect, useState } from 'react'
import { login, register } from '../api/auth'

export default function LoginModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setError('')
      setUsername('')
      setPassword('')
      setMode('login')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user =
        mode === 'login'
          ? await login(username, password)
          : await register(username, password)
      onSuccess(user)
      onClose()
    } catch (err) {
      setError(err.message || '操作失败')
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
        aria-labelledby="login-modal-title"
      >
        <div className="modal-header">
          <h2 id="login-modal-title">{mode === 'login' ? '登录' : '注册'}</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <form className="modal-body login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>用户名</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="login-field">
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <div className="modal-footer login-footer">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? '注册账号' : '已有账号，登录'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
