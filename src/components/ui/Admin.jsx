import { Icon } from './icons'

/* Toggle switch — the workhorse of granular feature control */
export function Switch({ on, onChange, disabled, size = 'md' }) {
  return (
    <button
      type="button"
      className={`wa-switch ${on ? 'on' : ''} wa-switch-${size} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onChange(!on)}
      aria-pressed={on}
      disabled={disabled}
    >
      <span className="wa-switch-knob" />
    </button>
  )
}

/* KPI / stat card */
export function StatCard({ label, value, sub, tone, icon }) {
  return (
    <div className="wa-stat">
      <div className="wa-stat-top">
        <span className="wa-stat-label">{label}</span>
        {icon && <span className={`wa-stat-ic ${tone ? `tone-${tone}` : ''}`}><Icon name={icon} size={16} /></span>}
      </div>
      <div className="wa-stat-value">{value}</div>
      {sub && <div className={`wa-stat-sub ${tone ? `tone-${tone}` : ''}`}>{sub}</div>}
    </div>
  )
}

/* Small labelled key/value */
export function KV({ label, children }) {
  return (
    <div className="wa-kv">
      <span className="wa-kv-label">{label}</span>
      <span className="wa-kv-value">{children}</span>
    </div>
  )
}
