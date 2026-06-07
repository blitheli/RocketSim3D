/**
 * 更新 payload.RocketInput 顶层字段（如 Gw、Tk_1、Name）。
 * @param {Function} onChange - App 传入的 setPayload
 * @param {string} key - RocketInput 字段名
 * @param {*} value - 表单值；number 类型时空字符串转为 0
 * @param {'number'|'array'|'string'} [type='number']
 */
export function updateInput(onChange, key, value, type = 'number') {
  onChange((prev) => {
    const next = structuredClone(prev)
    if (type === 'number') {
      next.RocketInput[key] = value === '' ? 0 : Number(value)
    } else if (type === 'array') {
      next.RocketInput[key] = value
    } else {
      next.RocketInput[key] = value
    }
    return next
  })
}

/**
 * 更新 RocketInput 内嵌发动机对象字段（如 Stage1_Engine.Thrust）。
 * engineKey 对应对象不存在时会自动创建空对象。
 * @param {Function} onChange
 * @param {string} engineKey - 发动机对象键名
 * @param {string} field - 发动机内字段名
 * @param {*} value
 * @param {'number'|'boolean'|'string'} [type='number']
 */
export function updateEngine(onChange, engineKey, field, value, type = 'number') {
  onChange((prev) => {
    const next = structuredClone(prev)
    if (!next.RocketInput[engineKey]) next.RocketInput[engineKey] = {}
    if (type === 'number') {
      next.RocketInput[engineKey][field] = value === '' ? 0 : Number(value)
    } else if (type === 'boolean') {
      next.RocketInput[engineKey][field] = Boolean(value)
    } else {
      next.RocketInput[engineKey][field] = value
    }
    return next
  })
}

/**
 * 绑定 setPayload，供 Panel 解构为 { updateInput, updateEngine } 传给子组件。
 * @param {Function} onChange - setPayload
 * @returns {{ updateInput: Function, updateEngine: Function }}
 */
export function bindRocketInput(onChange) {
  return {
    updateInput: (key, value, type) => updateInput(onChange, key, value, type),
    updateEngine: (engineKey, field, value, type) =>
      updateEngine(onChange, engineKey, field, value, type),
  }
}
