import BasicParams from '../params/BasicParams'
import OrbitParams from '../params/OrbitParams'
import GroupBox from '../params/GroupBox'
import Field from '../params/Field'
import EngineTabs from '../params/EngineTabs'
import ShiXuTable from '../params/ShiXuTable'
import { bindRocketInput } from '../../utils/useRocketInput'
import { burnConsumption } from '../../utils/remainingFuel'

const ENGINE_TABS = [
  { label: '一级发动机', key: 'Stage1_Engine' },
  { label: '二级主机', key: 'Stage2_MainEngine' },
  { label: '二级游机', key: 'Stage2_VernierEngine' },
  { label: '三级发动机', key: 'Stage3_Engine' },
]

function fmtRemaining(kg) {
  return kg.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}

export default function CZ4BPanel({ payload, onChange, shiXuTable }) {
  const input = payload.RocketInput
  const { updateInput, updateEngine } = bindRocketInput(onChange)

  const remaining1 = Math.max(
    0,
    (Number(input.Stage1_FuelMass) || 0) - burnConsumption(input, 'Stage1_Engine', input.Tk_1),
  )
  const remaining2 = Math.max(
    0,
    (Number(input.Stage2_FuelMass) || 0)
      - burnConsumption(input, 'Stage2_MainEngine', input.Tk_2z)
      - burnConsumption(input, 'Stage2_VernierEngine', input.Tk_2u),
  )
  const remaining3 = Math.max(
    0,
    (Number(input.Stage3_FuelMass) || 0) - burnConsumption(input, 'Stage3_Engine', input.Tk_3),
  )

  return (
    <div className="left-area">
      <div className="left-top">
        <div className="param-panel">
          <div className="rocket-info">
            {input.Text && <div>{input.Text}</div>}
            {input.Text2 && <div>{input.Text2}</div>}
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
                  <th>燃料(kg)</th>
                  <th>剩余燃料(kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mass-table-stage">一级</td>
                  <td>
                    <input type="number" value={input.Stage1_Mass ?? 0} onChange={(e) => updateInput('Stage1_Mass', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={input.Stage1_FuelMass ?? 0} onChange={(e) => updateInput('Stage1_FuelMass', e.target.value)} />
                  </td>
                  <td className="mass-table-remaining">{fmtRemaining(remaining1)}</td>
                </tr>
                <tr>
                  <td className="mass-table-stage">二级</td>
                  <td>
                    <input type="number" value={input.Stage2_Mass ?? 0} onChange={(e) => updateInput('Stage2_Mass', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={input.Stage2_FuelMass ?? 0} onChange={(e) => updateInput('Stage2_FuelMass', e.target.value)} />
                  </td>
                  <td className="mass-table-remaining">{fmtRemaining(remaining2)}</td>
                </tr>
                <tr>
                  <td className="mass-table-stage">三级</td>
                  <td>
                    <input type="number" value={input.Stage3_Mass ?? 0} onChange={(e) => updateInput('Stage3_Mass', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={input.Stage3_FuelMass ?? 0} onChange={(e) => updateInput('Stage3_FuelMass', e.target.value)} />
                  </td>
                  <td className="mass-table-remaining">{fmtRemaining(remaining3)}</td>
                </tr>
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
            <Field label="三级工作时间" unit="s">
              <input type="number" step="0.0001" value={input.Tk_3 ?? 0} onChange={(e) => updateInput('Tk_3', e.target.value)} />
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
            <Field label="二级偏航角速率" unit="deg/s">
              <input type="number" step="0.0001" value={input.PsicxDot_2 ?? 0} onChange={(e) => updateInput('PsicxDot_2', e.target.value)} />
            </Field>
            <Field label="三级俯仰角速率" unit="deg/s">
              <input type="number" step="0.0001" value={input.PhicxDot_3 ?? 0} onChange={(e) => updateInput('PhicxDot_3', e.target.value)} />
            </Field>
            <Field label="三级偏航角速率" unit="deg/s">
              <input type="number" step="0.0001" value={input.PsicxDot_3 ?? 0} onChange={(e) => updateInput('PsicxDot_3', e.target.value)} />
            </Field>
          </GroupBox>
        </aside>
      </div>
      <ShiXuTable columns={shiXuTable.columns} rows={shiXuTable.rows} />
    </div>
  )
}
