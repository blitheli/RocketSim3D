import { ROCKET_TYPES } from '../data/rockets'

export default function TopBar({
  rocketType,
  onRocketTypeChange,
  loading,
  onLoad,
  onSave,
  onCalculate,
  onOptimize,
  onOpenOptimConfig,
  onAbort,
}) {
  return (
    <header className="top-bar">
      <div className="top-bar-section">
        <label>火箭型号</label>
        <select value={rocketType} onChange={(e) => onRocketTypeChange(e.target.value)}>
          {Object.entries(ROCKET_TYPES).map(([type, info]) => (
            <option key={type} value={type}>
              {info.label}
            </option>
          ))}
        </select>
      </div>

      <div className="top-bar-actions">
        <button type="button" className="btn" onClick={onLoad}>加载</button>
        <button type="button" className="btn" onClick={onSave}>保存</button>
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
      </div>
    </header>
  )
}
