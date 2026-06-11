import { useEffect, useMemo } from 'react'
import { buildOptimProfileSummaries } from '../utils/adapt'

export default function OptimResultModal({ open, profiles, onClose }) {
  const summaries = useMemo(() => buildOptimProfileSummaries(profiles), [profiles])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-dialog optim-result-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="optim-result-title"
      >
        <div className="modal-header">
          <h2 id="optim-result-title">优化结果</h2>
          <button type="button" className="btn modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body">
          {summaries.length === 0 ? (
            <p className="modal-empty">未返回优化 Profile 结果</p>
          ) : (
            summaries.map((profile) => (
              <section key={profile.name} className="optim-result-profile">
                <h3 className="optim-result-name">{profile.name}</h3>
                {profile.text ? (
                  <p className="optim-result-desc">{profile.text}</p>
                ) : null}
                {(profile.terminationType != null
                  || profile.iterationCount != null
                  || profile.fvecCount != null) && (
                  <div className="optim-result-meta">
                    {profile.terminationType != null && (
                      <span>终止类型: {profile.terminationType}</span>
                    )}
                    {profile.iterationCount != null && (
                      <span>迭代次数: {profile.iterationCount}</span>
                    )}
                    {profile.fvecCount != null && (
                      <span>函数评估: {profile.fvecCount}</span>
                    )}
                  </div>
                )}
                {profile.controls.length > 0 ? (
                  <>
                    <div className="optim-result-caption">自变量</div>
                    <table className="optim-result-table">
                      <thead>
                        <tr>
                          <th>参数</th>
                          <th>对象</th>
                          <th>优化值</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.controls.map((control) => (
                          <tr key={control.name}>
                            <td>{control.name}</td>
                            <td>{control.object || '—'}</td>
                            <td className="optim-result-value">{control.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="modal-empty">无启用的优化参数</p>
                )}
                {profile.results.length > 0 ? (
                  <>
                    <div className="optim-result-caption">目标/约束</div>
                    <table className="optim-result-table">
                      <thead>
                        <tr>
                          <th>名称</th>
                          <th>对象</th>
                          <th>目标</th>
                          <th>偏差 DltFG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.results.map((result) => (
                          <tr key={result.name}>
                            <td>{result.name}</td>
                            <td>{result.object || '—'}</td>
                            <td>{result.goal || '—'}</td>
                            <td className="optim-result-value">{result.dltFG}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : null}
              </section>
            ))
          )}
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
