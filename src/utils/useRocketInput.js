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

export function bindRocketInput(onChange) {
  return {
    updateInput: (key, value, type) => updateInput(onChange, key, value, type),
    updateEngine: (engineKey, field, value, type) =>
      updateEngine(onChange, engineKey, field, value, type),
  }
}
