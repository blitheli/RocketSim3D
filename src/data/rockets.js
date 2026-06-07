import CZ2DPanel from '../components/rockets/CZ2DPanel'
import CZ4BPanel from '../components/rockets/CZ4BPanel'
import CZ4CPanel from '../components/rockets/CZ4CPanel'
import Falcon9Panel from '../components/rockets/Falcon9Panel'
import defaultPayload from '../../public/templates/CZ2D_SSO_260601.json'

export const DEFAULT_SCHEME = {
  payload: defaultPayload,
}

export function getSchemeName(payload) {
  return payload?.RocketInput?.Name ?? ''
}

export const ROCKET_TYPES = {
  'CZ-2D': { label: 'CZ-2D' },
  'CZ-4B': { label: 'CZ-4B' },
  'CZ-4C': { label: 'CZ-4C' },
  'Falcon9': { label: 'Falcon9' },
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
  'Falcon9': Falcon9Panel,
}

export function getRocketPanel(rocketType) {
  return ROCKET_PANELS[rocketType] ?? CZ2DPanel
}
