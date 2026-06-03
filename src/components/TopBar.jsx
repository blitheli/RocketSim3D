import { ROCKET_PRESETS } from '../data/rockets'

export default function TopBar({
  presetId,
  onPresetChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
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
        <select value={presetId} onChange={(e) => onPresetChange(e.target.value)}>
          {ROCKET_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      <div className="top-bar-section">
        <label>开始</label>
        <input type="text" value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} />
      </div>

      <div className="top-bar-section">
        <label>结束</label>
        <input type="text" value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} />
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
