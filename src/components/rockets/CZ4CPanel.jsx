import BasicParams from '../params/BasicParams'
import OrbitParams from '../params/OrbitParams'
import GroupBox from '../params/GroupBox'
import Field from '../params/Field'
import EngineTabs from '../params/EngineTabs'
import ShiXuTable from '../params/ShiXuTable'
import { bindRocketInput } from '../../utils/useRocketInput'

const MASS_STAGES = [
  { label: '一级', massKey: 'Stage1_Mass', fuelKey: 'Stage1_FuelMass' },
  { label: '二级', massKey: 'Stage2_Mass', fuelKey: 'Stage2_FuelMass' },
  { label: '三级', massKey: 'Stage3_Mass', fuelKey: 'Stage3_FuelMass' },
]

const ENGINE_TABS = [
  { label: '一级发动机', key: 'Stage1_Engine' },
  { label: '二级主机', key: 'Stage2_MainEngine' },
  { label: '二级游机', key: 'Stage2_VernierEngine' },
  { label: '三级发动机', key: 'Stage3_Engine' },
]

export default function CZ4CPanel({ payload, onChange, shiXuTable }) {
  const input = payload.RocketInput
  const { updateInput, updateEngine } = bindRocketInput(onChange)

  return (
    <div className="left-area">
      <div className="left-top">
        <div className="param-panel">
          <div className="rocket-info">
            <div><strong>{input.$type}</strong></div>
            {input.Text && <div>{input.Text}</div>}
            {input.Text2 && <div>{input.Text2}</div>}
            {input.Text3 && <div>{input.Text3}</div>}
          </div>

          <BasicParams input={input} onChange={updateInput} />
          <OrbitParams input={input} onChange={updateInput} />

          <EngineTabs engines={ENGINE_TABS} input={input} onEngineChange={updateEngine} />
        </div>

        <aside className="timeline-panel">
        <GroupBox title="质量表" className="mass-table">
          <table className="mass-table-grid">
            <thead>
              <tr>
                <th>级</th>
                <th>总质量 (kg)</th>
                <th>推进剂 (kg)</th>
              </tr>
            </thead>
            <tbody>
              {MASS_STAGES.map(({ label, massKey, fuelKey }) => (
                <tr key={label}>
                  <td className="mass-table-stage">{label}</td>
                  <td>
                    <input type="number" value={input[massKey] ?? 0} onChange={(e) => updateInput(massKey, e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={input[fuelKey] ?? 0} onChange={(e) => updateInput(fuelKey, e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GroupBox>
        <GroupBox title="飞行时序">
          <Field label="一级工作时间" unit="s">
            <input type="number" step="0.0001" value={input.Tk_1 ?? 0} onChange={(e) => updateInput('Tk_1', e.target.value)} />
          </Field>
          <Field label="一二级分离间隔" unit="s">
            <input type="number" step="0.0001" value={input.Dt_k12f ?? 0} onChange={(e) => updateInput('Dt_k12f', e.target.value)} />
          </Field>
          <Field label="整流罩分离时刻" unit="s">
            <input type="number" step="0.0001" value={input.Tk_F ?? 0} onChange={(e) => updateInput('Tk_F', e.target.value)} />
          </Field>
          <Field label="二级主机关机" unit="s">
            <input type="number" step="0.0001" value={input.Tk_2z ?? 0} onChange={(e) => updateInput('Tk_2z', e.target.value)} />
          </Field>
          <Field label="二级游机关机" unit="s">
            <input type="number" step="0.0001" value={input.Tk_2u ?? 0} onChange={(e) => updateInput('Tk_2u', e.target.value)} />
          </Field>
          <Field label="二三级分离间隔" unit="s">
            <input type="number" step="0.0001" value={input.Dt_k23f ?? 0} onChange={(e) => updateInput('Dt_k23f', e.target.value)} />
          </Field>
          <Field label="三级一次工作时间" unit="s">
            <input type="number" step="0.0001" value={input.Tk_3 ?? 0} onChange={(e) => updateInput('Tk_3', e.target.value)} />
          </Field>
          <Field label="滑行时间" unit="s">
            <input type="number" step="0.0001" value={input.Dt_hx ?? 0} onChange={(e) => updateInput('Dt_hx', e.target.value)} />
          </Field>
          <Field label="三级二次工作时间" unit="s">
            <input type="number" step="0.0001" value={input.Tk_3b ?? 0} onChange={(e) => updateInput('Tk_3b', e.target.value)} />
          </Field>
          <Field label="末速修正间隔" unit="s">
            <input type="number" step="0.0001" value={input.Dt_msxz ?? 0} onChange={(e) => updateInput('Dt_msxz', e.target.value)} />
          </Field>
          <Field label="星箭分离间隔" unit="s">
            <input type="number" step="0.0001" value={input.Dt_xjfl ?? 0} onChange={(e) => updateInput('Dt_xjfl', e.target.value)} />
          </Field>
          <Field label="二级主俯仰角速率" unit="deg/s">
            <input type="number" step="0.0001" value={input.PhicxDot_2z ?? 0} onChange={(e) => updateInput('PhicxDot_2z', e.target.value)} />
          </Field>
          <Field label="二级主偏航角速率" unit="deg/s">
            <input type="number" step="0.0001" value={input.PsicxDot_2z ?? 0} onChange={(e) => updateInput('PsicxDot_2z', e.target.value)} />
          </Field>
          <Field label="三级俯仰角速率" unit="deg/s">
            <input type="number" step="0.0001" value={input.PhicxDot_3 ?? 0} onChange={(e) => updateInput('PhicxDot_3', e.target.value)} />
          </Field>
          <Field label="三级偏航角速率" unit="deg/s">
            <input type="number" step="0.0001" value={input.PsicxDot_3 ?? 0} onChange={(e) => updateInput('PsicxDot_3', e.target.value)} />
          </Field>
          <Field label="滑行段俯仰角速率" unit="deg/s">
            <input type="number" step="0.0001" value={input.Phicx_DotHx ?? 0} onChange={(e) => updateInput('Phicx_DotHx', e.target.value)} />
          </Field>
        </GroupBox>
        </aside>
      </div>
      <ShiXuTable columns={shiXuTable.columns} rows={shiXuTable.rows} />
    </div>
  )
}
