import BasicParams from '../params/BasicParams'
import OrbitParams from '../params/OrbitParams'
import GroupBox from '../params/GroupBox'
import Field from '../params/Field'
import EngineCard from '../params/EngineCard'
import { bindRocketInput } from '../../utils/useRocketInput'

export default function CZ4BPanel({ payload, onChange }) {
  const input = payload.RocketInput
  const { updateInput, updateEngine } = bindRocketInput(onChange)

  return (
    <>
      <div className="param-panel">
        <div className="rocket-info">
          <div><strong>{input.Name}</strong> (CZ-4B)</div>
          {input.Text && <div>{input.Text}</div>}
          {input.Text2 && <div>{input.Text2}</div>}
          {input.Text3 && <div>{input.Text3}</div>}
        </div>

        <BasicParams input={input} onChange={updateInput} />
        <OrbitParams input={input} onChange={updateInput} />

        <GroupBox title="一级参数" className="stage-group">
          <div className="stage-field-row">
            <Field label="总质量" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage1_Mass ?? 0}
                onChange={(e) => updateInput('Stage1_Mass', e.target.value)}
              />
            </Field>
            <Field label="推进剂" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage1_FuelMass ?? 0}
                onChange={(e) => updateInput('Stage1_FuelMass', e.target.value)}
              />
            </Field>
          </div>
          <EngineCard
            title="一级发动机"
            engine={input.Stage1_Engine ?? {}}
            onChange={(field, value, type) => updateEngine('Stage1_Engine', field, value, type)}
          />
        </GroupBox>

        <GroupBox title="二级参数" className="stage-group">
          <div className="stage-field-row">
            <Field label="总质量" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage2_Mass ?? 0}
                onChange={(e) => updateInput('Stage2_Mass', e.target.value)}
              />
            </Field>
            <Field label="推进剂" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage2_FuelMass ?? 0}
                onChange={(e) => updateInput('Stage2_FuelMass', e.target.value)}
              />
            </Field>
          </div>
          <EngineCard
            title="二级主机"
            engine={input.Stage2_MainEngine ?? {}}
            onChange={(field, value, type) => updateEngine('Stage2_MainEngine', field, value, type)}
          />
          <EngineCard
            title="二级游机"
            engine={input.Stage2_VernierEngine ?? {}}
            onChange={(field, value, type) => updateEngine('Stage2_VernierEngine', field, value, type)}
          />
        </GroupBox>

        <GroupBox title="三级参数" className="stage-group">
          <div className="stage-field-row">
            <Field label="总质量" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage3_Mass ?? 0}
                onChange={(e) => updateInput('Stage3_Mass', e.target.value)}
              />
            </Field>
            <Field label="推进剂" unit="kg" className="field-input-compact">
              <input
                type="number"
                value={input.Stage3_FuelMass ?? 0}
                onChange={(e) => updateInput('Stage3_FuelMass', e.target.value)}
              />
            </Field>
          </div>
          <EngineCard
            title="三级发动机"
            engine={input.Stage3_Engine ?? {}}
            onChange={(field, value, type) => updateEngine('Stage3_Engine', field, value, type)}
          />
        </GroupBox>
      </div>

      <aside className="timeline-panel">
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
    </>
  )
}
