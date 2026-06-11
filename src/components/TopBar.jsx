import { ROCKET_TYPES } from '../data/rockets'

export default function TopBar({
  rocketType,
  schemeName,
  user,
  loading,
  onOpenScheme,
  onSave,
  onCalculate,
  onOptimize,
  onOpenOptimConfig,
  onAbort,
  onLogin,
  onLogout,
}) {
  const typeInfo = ROCKET_TYPES[rocketType]

  return (
    <header className="top-bar">
      <div className="top-bar-info">
        <span className="top-bar-type">{typeInfo?.label ?? rocketType}</span>
        <span className="top-bar-scheme">{schemeName || '未命名方案'}</span>
        <button type="button" className="btn btn-sm" onClick={onOpenScheme}>
          打开方案
        </button>
        <button type="button" className="btn btn-sm" onClick={onSave}>
          保存
        </button>
      </div>

      <h1 className="top-bar-title">运载火箭方案弹道设计</h1>

      <div className="top-bar-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onCalculate}
          disabled={loading}
        >
          计算
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOptimize}
          disabled={loading}
        >
          优化
        </button>
        <button
          type="button"
          className="btn"
          onClick={onOpenOptimConfig}
          disabled={loading}
        >
          优化参数配置
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onAbort}
          disabled={!loading}
        >
          终止优化
        </button>
        {user ? (
          <button type="button" className="btn top-bar-user" onClick={onLogout}>
            {user.username}
          </button>
        ) : (
          <button type="button" className="btn" onClick={onLogin}>
            登录
          </button>
        )}
      </div>
    </header>
  )
}
