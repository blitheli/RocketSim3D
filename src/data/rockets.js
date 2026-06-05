import cz2dSso from '../../DDJS/CZ-2D/CZ2D_SSO_260601.json'
import cz2dLeo from '../../DDJS/CZ-2D/CZ2D_LEO_260527.json'
import cz4b from '../../DDJS/CZ-4B/CZ4B_SSO_260519.json'
import cz4c from '../../DDJS/CZ-4C/CZ4C_SSO_260520.json'
import CZ2DPanel from '../components/rockets/CZ2DPanel'
import CZ4BPanel from '../components/rockets/CZ4BPanel'
import CZ4CPanel from '../components/rockets/CZ4CPanel'

export const ROCKET_TYPES = {
  'CZ-2D': {
    label: 'CZ-2D',
    stages: 2,
    description: '二级火箭',
    modelPath: '/models/CZ-2D.glb',
    targetHeight: 50,
  },
  'CZ-4B': {
    label: 'CZ-4B',
    stages: 3,
    description: '三级火箭',
    modelPath: '/models/CZ-4B.glb',
    targetHeight: 55,
  },
  'CZ-4C': {
    label: 'CZ-4C',
    stages: 3,
    description: '三级二次工作火箭',
    modelPath: '/models/CZ-4C.glb',
    targetHeight: 55,
  },
}

export const ROCKET_PRESETS = [
  {
    id: 'cz2d-sso',
    type: 'CZ-2D',
    name: 'CZ2D SSO 500km',
    payload: cz2dSso,
  },
  {
    id: 'cz2d-leo',
    type: 'CZ-2D',
    name: 'CZ2D LEO',
    payload: cz2dLeo,
  },
  {
    id: 'cz4b-sso',
    type: 'CZ-4B',
    name: 'CZ4B SSO 1000km',
    payload: cz4b,
  },
  {
    id: 'cz4c-sso',
    type: 'CZ-4C',
    name: 'CZ4C SSO 700km',
    payload: cz4c,
  },
]

export function getPresetById(id) {
  return ROCKET_PRESETS.find((p) => p.id === id) ?? ROCKET_PRESETS[0]
}

export function clonePayload(payload) {
  return structuredClone(payload)
}

export function getRocketType(payload) {
  return payload?.RocketInput?.$type ?? 'CZ-2D'
}

export const ROCKET_PANELS = {
  'CZ-2D': CZ2DPanel,
  'CZ-4B': CZ4BPanel,
  'CZ-4C': CZ4CPanel,
}

export function getRocketPanel(rocketType) {
  return ROCKET_PANELS[rocketType] ?? CZ2DPanel
}
