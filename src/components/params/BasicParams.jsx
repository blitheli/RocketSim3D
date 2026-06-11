import GroupBox from './GroupBox'
import Field from './Field'
import OptimInput from './OptimInput'

const LAUNCH_SITES = [
  { id: 'ty', label: '太原 (ty)' },
  { id: 'xc', label: '西昌 (xc)' },
  { id: 'jq', label: '酒泉 (jq)' },
  { id: 'wc', label: '文昌 (wc)' },
  { id: 'SLC40', label: '卡角SLC40' },
  { id: 'Vandenberg', label: '范登堡' },
  { id: 'Baikonur', label: '拜科努尔' },
  { id: 'Plesetsk', label: '普列谢茨克' },
  { id: 'Kourou', label: '库鲁' },
  { id: 'Zhongzidao', label: '种子岛' },
  { id: 'custom', label: '自定义坐标' },
]

export default function BasicParams({ input, onChange, optimizedFields }) {
  const useCustomSite = input.Name_FaSheDian === 'custom'
  const lla = input.FaSheDianLLA ?? [0, 0, 0]

  return (
    <GroupBox title="基本参数" className="basic-params">
      <Field label="发射点">
        <select
          value={input.Name_FaSheDian ?? 'ty'}
          onChange={(e) => onChange('Name_FaSheDian', e.target.value, 'string')}
        >
          {LAUNCH_SITES.map((site) => (
            <option key={site.id} value={site.id}>{site.label}</option>
          ))}
        </select>
      </Field>

      {useCustomSite && (
        <>
          <Field label="经度" unit="deg">
            <OptimInput
              field="FaSheDianLLA"
              optimizedFields={optimizedFields}
              type="number"
              value={lla[0]}
              onChange={(e) =>
                onChange('FaSheDianLLA', [Number(e.target.value), lla[1], lla[2]], 'array')
              }
            />
          </Field>
          <Field label="纬度" unit="deg">
            <OptimInput
              field="FaSheDianLLA"
              optimizedFields={optimizedFields}
              type="number"
              value={lla[1]}
              onChange={(e) =>
                onChange('FaSheDianLLA', [lla[0], Number(e.target.value), lla[2]], 'array')
              }
            />
          </Field>
          <Field label="高度" unit="m">
            <OptimInput
              field="FaSheDianLLA"
              optimizedFields={optimizedFields}
              type="number"
              value={lla[2]}
              onChange={(e) =>
                onChange('FaSheDianLLA', [lla[0], lla[1], Number(e.target.value)], 'array')
              }
            />
          </Field>
        </>
      )}

      <Field label="有效载荷" unit="kg">
        <OptimInput
          field="Gw"
          optimizedFields={optimizedFields}
          type="number"
          value={input.Gw ?? 0}
          onChange={(e) => onChange('Gw', e.target.value)}
        />
      </Field>
      <Field label="整流罩" unit="kg">
        <OptimInput
          field="FairingMass"
          optimizedFields={optimizedFields}
          type="number"
          value={input.FairingMass ?? 0}
          onChange={(e) => onChange('FairingMass', e.target.value)}
        />
      </Field>
      <Field label="气动面积 Sm" unit="m²">
        <OptimInput
          field="Sm"
          optimizedFields={optimizedFields}
          type="number"
          step="0.001"
          value={input.Sm ?? 0}
          onChange={(e) => onChange('Sm', e.target.value)}
        />
      </Field>
      <Field label="发射方位角" unit="deg">
        <OptimInput
          field="A0"
          optimizedFields={optimizedFields}
          type="number"
          step="0.0001"
          value={input.A0 ?? 0}
          onChange={(e) => onChange('A0', e.target.value)}
        />
      </Field>
      <Field label="一级转弯" unit="s">
        <OptimInput
          field="T1"
          optimizedFields={optimizedFields}
          type="number"
          value={input.T1 ?? 0}
          onChange={(e) => onChange('T1', e.target.value)}
        />
      </Field>
      <Field label="最大攻角" unit="deg">
        <OptimInput
          field="Alpham"
          optimizedFields={optimizedFields}
          type="number"
          step="0.00001"
          value={input.Alpham ?? 0}
          onChange={(e) => onChange('Alpham', e.target.value)}
        />
      </Field>
    </GroupBox>
  )
}
