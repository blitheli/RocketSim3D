import BasicParams from '../params/BasicParams'
import OrbitParams from '../params/OrbitParams'
import GroupBox from '../params/GroupBox'
import Field from '../params/Field'
import EngineTabs from '../params/EngineTabs'
import ShiXuTable from '../params/ShiXuTable'
import OptimInput from '../params/OptimInput'
import { bindRocketInput } from '../../utils/useRocketInput'
import { burnConsumption } from '../../utils/remainingFuel'

const ENGINE_TABS = [
  { label: '一级发动机', key: 'Stage1_Engine' },
  { label: '二级主机', key: 'Stage2_MainEngine' },
  { label: '二级游机', key: 'Stage2_VernierEngine' },
  { label: '三级发动机', key: 'Stage3_Engine' },
]

function fmtRemaining(kg) {
  return kg.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function CZ4CPanel({
  payload,
  onChange,
  shiXuTable,
  optimizedFields,
  onClearOptimizedField,
}) {
  const input = payload.RocketInput
  const { updateInput, updateEngine } = bindRocketInput(onChange, {
    onFieldEdit: onClearOptimizedField,
  })

  // 一级剩余推进剂 = 一级推进剂 - 一级发动机燃烧消耗推进剂 
  const remaining1 = (Number(input.Stage1_FuelMass) || 0) - burnConsumption(input, 'Stage1_Engine', input.Tk_1)
  // 二级剩余推进剂 = 二级推进剂 - 二级主机燃烧消耗推进剂 - 二级游机燃烧消耗推进剂
  const remaining2 = (Number(input.Stage2_FuelMass) || 0)
      - burnConsumption(input, 'Stage2_MainEngine', (Number(input.Tk_2z) || 0))
      - burnConsumption(input, 'Stage2_VernierEngine', (Number(input.Tk_2u) || 0) + (Number(input.Tk_2z) || 0))
  // 三级剩余推进剂 = 三级推进剂 - 三级发动机燃烧消耗推进剂 - 三级发动机燃烧消耗推进剂
  const remaining3 = (Number(input.Stage3_FuelMass) || 0) - burnConsumption(input, 'Stage3_Engine', input.Tk_3) - burnConsumption(input, 'Stage3_Engine', input.Tk_3b)

  return (
    <div className="left-area">
      <div className="left-top">
        <div className="param-panel">
          <div className="rocket-info">
            {input.Text && <div>{input.Text}</div>}
            {input.Text2 && <div>{input.Text2}</div>}
          </div>

          <BasicParams input={input} onChange={updateInput} optimizedFields={optimizedFields} />
          <OrbitParams input={input} onChange={updateInput} optimizedFields={optimizedFields} />

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
              <OptimInput field="Tk_1" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_1 ?? 0} onChange={(e) => updateInput('Tk_1', e.target.value)} />
            </Field>
            <Field label="一二级分离间隔" unit="s">
              <OptimInput field="Dt_k12f" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Dt_k12f ?? 0} onChange={(e) => updateInput('Dt_k12f', e.target.value)} />
            </Field>
            <Field label="整流罩分离时刻" unit="s">
              <OptimInput field="Tk_F" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_F ?? 0} onChange={(e) => updateInput('Tk_F', e.target.value)} />
            </Field>
            <Field label="二级主机关机" unit="s">
              <OptimInput field="Tk_2z" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_2z ?? 0} onChange={(e) => updateInput('Tk_2z', e.target.value)} />
            </Field>
            <Field label="二级游机关机" unit="s">
              <OptimInput field="Tk_2u" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_2u ?? 0} onChange={(e) => updateInput('Tk_2u', e.target.value)} />
            </Field>
            <Field label="二三级分离间隔" unit="s">
              <OptimInput field="Dt_k23f" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Dt_k23f ?? 0} onChange={(e) => updateInput('Dt_k23f', e.target.value)} />
            </Field>
            <Field label="三级一次工作时间" unit="s">
              <OptimInput field="Tk_3" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_3 ?? 0} onChange={(e) => updateInput('Tk_3', e.target.value)} />
            </Field>
            <Field label="滑行时间" unit="s">
              <OptimInput field="Dt_hx" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Dt_hx ?? 0} onChange={(e) => updateInput('Dt_hx', e.target.value)} />
            </Field>
            <Field label="三级二次工作时间" unit="s">
              <OptimInput field="Tk_3b" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Tk_3b ?? 0} onChange={(e) => updateInput('Tk_3b', e.target.value)} />
            </Field>
            <Field label="末速修正间隔" unit="s">
              <OptimInput field="Dt_msxz" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Dt_msxz ?? 0} onChange={(e) => updateInput('Dt_msxz', e.target.value)} />
            </Field>
            <Field label="星箭分离间隔" unit="s">
              <OptimInput field="Dt_xjfl" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Dt_xjfl ?? 0} onChange={(e) => updateInput('Dt_xjfl', e.target.value)} />
            </Field>
            <Field label="二级主俯仰角速率" unit="deg/s">
              <OptimInput field="PhicxDot_2z" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.PhicxDot_2z ?? 0} onChange={(e) => updateInput('PhicxDot_2z', e.target.value)} />
            </Field>
            <Field label="二级主偏航角速率" unit="deg/s">
              <OptimInput field="PsicxDot_2z" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.PsicxDot_2z ?? 0} onChange={(e) => updateInput('PsicxDot_2z', e.target.value)} />
            </Field>
            <Field label="三级俯仰角速率" unit="deg/s">
              <OptimInput field="PhicxDot_3" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.PhicxDot_3 ?? 0} onChange={(e) => updateInput('PhicxDot_3', e.target.value)} />
            </Field>
            <Field label="三级偏航角速率" unit="deg/s">
              <OptimInput field="PsicxDot_3" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.PsicxDot_3 ?? 0} onChange={(e) => updateInput('PsicxDot_3', e.target.value)} />
            </Field>
            <Field label="滑行段俯仰角速率" unit="deg/s">
              <OptimInput field="Phicx_DotHx" optimizedFields={optimizedFields} type="number" step="0.0001" value={input.Phicx_DotHx ?? 0} onChange={(e) => updateInput('Phicx_DotHx', e.target.value)} />
            </Field>
          </GroupBox>
        </aside>
      </div>
      <ShiXuTable columns={shiXuTable.columns} rows={shiXuTable.rows} />
    </div>
  )
}
