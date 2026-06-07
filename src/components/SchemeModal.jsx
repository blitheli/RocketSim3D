import { useEffect, useMemo, useState } from 'react'
import {
  deleteUserScheme,
  fetchTemplate,
  fetchTemplates,
  fetchUserSchemes,
  loadUserScheme,
} from '../api/schemes'
import { clonePayload } from '../data/rockets'

export default function SchemeModal({ open, user, onClose, onSelect }) {
  const [templates, setTemplates] = useState([])
  const [userSchemes, setUserSchemes] = useState([])
  const [loading, setLoading] = useState(false)
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
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError('')

    const load = async () => {
      try {
        const tpl = await fetchTemplates()
        if (cancelled) return
        setTemplates(tpl)

        if (user) {
          const schemes = await fetchUserSchemes()
          if (!cancelled) setUserSchemes(schemes)
        } else {
          setUserSchemes([])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, user])

  const templatesByType = useMemo(() => {
    const map = {}
    for (const tpl of templates) {
      if (!map[tpl.type]) map[tpl.type] = []
      map[tpl.type].push(tpl)
    }
    return map
  }, [templates])

  if (!open) return null

  const handleTemplate = async (tpl) => {
    try {
      setLoading(true)
      const payload = await fetchTemplate(tpl.file)
      onSelect({
        name: `${tpl.type} ${tpl.name}`,
        payload: clonePayload(payload),
        source: 'template',
      })
      onClose()
    } catch (err) {
      setError(err.message || '加载模板失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUserScheme = async (scheme) => {
    try {
      setLoading(true)
      const data = await loadUserScheme(scheme.id)
      onSelect({
        name: data.name,
        payload: clonePayload(data.payload),
        source: 'user',
        id: data.id,
      })
      onClose()
    } catch (err) {
      setError(err.message || '加载方案失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, scheme) => {
    e.stopPropagation()
    if (!window.confirm(`确定删除方案「${scheme.name}」？`)) return
    try {
      setLoading(true)
      await deleteUserScheme(scheme.id)
      setUserSchemes((prev) => prev.filter((s) => s.id !== scheme.id))
    } catch (err) {
      setError(err.message || '删除失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog scheme-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheme-modal-title"
      >
        <div className="modal-header">
          <h2 id="scheme-modal-title">打开方案</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body">
          {error ? <p className="login-error">{error}</p> : null}
          {loading && templates.length === 0 ? (
            <p className="modal-empty">加载中…</p>
          ) : null}

          <section className="scheme-section">
            <h3 className="scheme-section-title">模板方案</h3>
            {Object.entries(templatesByType).map(([type, items]) => (
              <div key={type} className="scheme-group">
                <div className="scheme-group-label">{type}</div>
                <ul className="scheme-list">
                  {items.map((tpl) => (
                    <li key={tpl.file}>
                      <button
                        type="button"
                        className="scheme-item"
                        onClick={() => handleTemplate(tpl)}
                        disabled={loading}
                      >
                        <span className="scheme-item-name">{tpl.name}</span>
                        <span className="scheme-item-meta">模板</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {user ? (
            <section className="scheme-section">
              <h3 className="scheme-section-title">我的方案</h3>
              {userSchemes.length === 0 ? (
                <p className="modal-empty">暂无保存的方案</p>
              ) : (
                <ul className="scheme-list">
                  {userSchemes.map((scheme) => (
                    <li key={scheme.id}>
                      <button
                        type="button"
                        className="scheme-item"
                        onClick={() => handleUserScheme(scheme)}
                        disabled={loading}
                      >
                        <span className="scheme-item-name">{scheme.name}</span>
                        <span className="scheme-item-meta">{scheme.type}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger scheme-delete"
                        onClick={(e) => handleDelete(e, scheme)}
                        disabled={loading}
                        aria-label={`删除 ${scheme.name}`}
                      >
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <p className="modal-empty">登录后可查看和保存个人方案</p>
          )}
        </div>
      </div>
    </div>
  )
}
