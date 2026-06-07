import { optimInputClass } from '../../utils/useRocketInput'

export default function OptimInput({ field, optimizedFields, className, ...props }) {
  const highlight = optimInputClass(field, optimizedFields)
  const cls = [highlight, className].filter(Boolean).join(' ') || undefined
  return <input className={cls} {...props} />
}
