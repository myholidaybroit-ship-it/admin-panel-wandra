import { useEffect, useId, useState } from 'react'
import { Icon } from './icons'
import './ui.css'

/* ---------- Button ---------- */
export function Button({ variant = 'primary', size = 'md', as, to, children, className = '', ...rest }) {
  const cls = `btn btn-${variant} btn-${size} ${className}`
  if (as === 'a') return <a className={cls} {...rest}>{children}</a>
  return <button className={cls} {...rest}>{children}</button>
}

/* ---------- Card ---------- */
export function Card({ dark, pad = 24, className = '', style, children, ...rest }) {
  return (
    <div className={`card ${dark ? 'card-dark' : ''} ${className}`} style={{ padding: pad, ...style }} {...rest}>
      {children}
    </div>
  )
}

/* ---------- Badge ---------- */
const badgeMap = {
  success: 'badge-success', active: 'badge-success', confirmed: 'badge-success', booked: 'badge-success', paid: 'badge-success', published: 'badge-success', included: 'badge-success', sent: 'badge-info',
  warning: 'badge-warning', warm: 'badge-warning', partial: 'badge-warning', pending: 'badge-warning', quoted: 'badge-warning',
  error: 'badge-error', unpaid: 'badge-error', cancelled: 'badge-error', required: 'badge-error',
  info: 'badge-info', draft: 'badge-neutral', completed: 'badge-info', preview: 'badge-preview', neutral: 'badge-neutral',
  new: 'badge-new', live: 'badge-new', hot: 'badge-new', beta: 'badge-info',
  'new query': 'badge-info', 'in progress': 'badge-warning', converted: 'badge-success',
  'on trip': 'badge-preview', 'past trips': 'badge-neutral', canceled: 'badge-error', dropped: 'badge-neutral',
}
export function Badge({ children, tone }) {
  const key = (tone || String(children)).toLowerCase().trim()
  const cls = badgeMap[key] || 'badge-neutral'
  return <span className={`badge ${cls}`}>{children}</span>
}

/* ---------- PageHeader ---------- */
export function PageHeader({ title, subtitle, actions, counter }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="t-display-md c-ink">{title}</h1>
        {subtitle && <p className="t-body-sm c-body mt-xs">{subtitle}</p>}
      </div>
      <div className="row gap-sm">
        {counter && <span className="plan-counter mono">{counter}</span>}
        {actions}
      </div>
    </div>
  )
}

/* ---------- Filter bar ---------- */
export function FilterBar({ children }) {
  return <div className="filter-bar">{children}</div>
}

/* ---------- List-page search (premium pill w/ focus ring + clear) ---------- */
export function ListSearch({ value, onChange, placeholder = 'Search…', count }) {
  return (
    <label className="lsx list-search">
      <span className="lsx-ic"><Icon name="search" size={15} /></span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {value !== '' && count != null && <span className="lsx-count">{count} match{count === 1 ? '' : 'es'}</span>}
      {value !== '' && (
        <button className="lsx-clear" aria-label="Clear search"
          onClick={(e) => { e.preventDefault(); onChange('') }}>✕</button>
      )}
    </label>
  )
}

/* ---------- Form controls ---------- */
export function Field({ label, hint, required, children, full }) {
  return (
    <div className={`field ${full ? 'field-full' : ''}`}>
      {label && <span className="field-label">{label}{required && <em className="req"> *</em>}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
export const Input = ({ className = '', ...p }) => <input className={`control ${className}`} {...p} />
export const Textarea = (p) => <textarea className="control" rows={p.rows || 3} {...p} />
export function Select({ children, ...p }) { return <select className="control" {...p}>{children}</select> }

/* ---------- PillSelect (custom styled dropdown, no native menu) ---------- */
export function PillSelect({ value, options = [], onChange, format = (v) => v }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])
  return (
    <div className="pill-select-wrap">
      <button className={`pill-select ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span>{format(value)}</span>
        <span className={`pill-select-chev ${open ? 'up' : ''}`}><Icon name="chevron" size={14} strokeWidth={2} /></span>
      </button>
      {open && (
        <>
          <div className="pill-menu-scrim" onClick={() => setOpen(false)} />
          <div className="pill-menu">
            {options.map((o) => (
              <button key={o} className={`pill-menu-item ${o === value ? 'selected' : ''}`}
                onClick={() => { onChange(o); setOpen(false) }}>
                <span className="pill-menu-check">{o === value && <Icon name="check" size={14} strokeWidth={2.2} />}</span>
                {format(o)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- PillMultiSelect (multi-choice dropdown, optionally searchable) ---------- */
export function PillMultiSelect({ value = [], options = [], onChange, placeholder = 'Select…', searchable = false, searchPlaceholder = 'Search…', tabs }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  useEffect(() => {
    if (!open) { setQ(''); return }
    const h = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])
  const label = value.length === 0 ? placeholder : value.length <= 2 ? value.join(', ') : `${value[0]}, ${value[1]} +${value.length - 2} more`
  const shown = searchable && q.trim() ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase())) : options
  return (
    <div className="pill-select-wrap pms">
      <button className={`pill-select ${open ? 'open' : ''} ${value.length === 0 ? 'pms-empty' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="pms-label">{label}</span>
        <span className={`pill-select-chev ${open ? 'up' : ''}`}><Icon name="chevron" size={14} strokeWidth={2} /></span>
      </button>
      {open && (
        <>
          <div className="pill-menu-scrim" onClick={() => setOpen(false)} />
          <div className="pill-menu pms-menu">
            {tabs && (
              <div className="pms-tabs">
                {tabs.options.map((t) => (
                  <button key={t} className={`pms-tab ${tabs.value === t ? 'on' : ''}`} onClick={() => tabs.onChange(t)}>{t}</button>
                ))}
              </div>
            )}
            {searchable && (
              <div className="pms-search">
                <Icon name="search" size={13} />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} />
              </div>
            )}
            <div className="pms-list">
              {shown.length === 0 && <div className="pms-none">No matches for “{q}”</div>}
              {shown.map((o) => (
                <button key={o} className={`pill-menu-item ${value.includes(o) ? 'selected' : ''}`} onClick={() => toggle(o)}>
                  <span className={`pms-box ${value.includes(o) ? 'on' : ''}`}>{value.includes(o) && <Icon name="check" size={11} strokeWidth={2.6} />}</span>
                  {o}
                </button>
              ))}
            </div>
            <div className="pms-foot">
              <span className="t-micro c-muted">{value.length} selected</span>
              <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- DatePicker (custom styled calendar, no native widget) ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}
export function DatePicker({ value, onChange, placeholder = 'Pick a date' }) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const base = value ? new Date(value + 'T00:00:00') : today
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() })
  useEffect(() => {
    if (!open) return
    const b = value ? new Date(value + 'T00:00:00') : new Date()
    setView({ y: b.getFullYear(), m: b.getMonth() })
    const h = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open]) // eslint-disable-line
  const move = (d) => setView((v) => {
    const m = v.m + d
    return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }
  })
  const daysIn = new Date(view.y, view.m + 1, 0).getDate()
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7 // Monday-first
  const iso = (d) => `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const isToday = (d) => view.y === today.getFullYear() && view.m === today.getMonth() && d === today.getDate()
  return (
    <div className="pill-select-wrap dp">
      <button className={`pill-select dp-trigger ${open ? 'open' : ''} ${!value ? 'pms-empty' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="dp-ic"><Icon name="calendar" size={15} /></span>
        <span className="pms-label">{value ? formatDate(value) : placeholder}</span>
        <span className={`pill-select-chev ${open ? 'up' : ''}`}><Icon name="chevron" size={14} strokeWidth={2} /></span>
      </button>
      {open && (
        <>
          <div className="pill-menu-scrim" onClick={() => setOpen(false)} />
          <div className="pill-menu dp-menu">
            <div className="dp-head">
              <button className="dp-nav" onClick={() => move(-1)}><Icon name="chevron" size={14} strokeWidth={2} className="dp-chev-l" /></button>
              <span className="dp-title">{MONTHS[view.m]} {view.y}</span>
              <button className="dp-nav" onClick={() => move(1)}><Icon name="chevron" size={14} strokeWidth={2} className="dp-chev-r" /></button>
            </div>
            <div className="dp-week">{WEEKDAYS.map((w) => <span key={w} className="dp-wd">{w}</span>)}</div>
            <div className="dp-grid">
              {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
              {Array.from({ length: daysIn }).map((_, i) => {
                const d = i + 1
                return (
                  <button
                    key={d}
                    className={`dp-day ${value === iso(d) ? 'selected' : ''} ${isToday(d) ? 'today' : ''}`}
                    onClick={() => { onChange(iso(d)); setOpen(false) }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
            <div className="dp-foot">
              <button className="dp-today-btn" onClick={() => { const t = new Date(); onChange(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`); setOpen(false) }}>Today</button>
              {value && <button className="dp-clear-btn" onClick={() => { onChange(''); setOpen(false) }}>Clear</button>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- Data table ---------- */
export function DataTable({ columns, rows, empty = 'No records yet.', onRowClick }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} style={{ textAlign: c.align || 'left', width: c.width }}>{c.head}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length}><div className="table-empty t-body-sm c-muted">{empty}</div></td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.id || i} className={onRowClick ? 'row-click' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {columns.map((c) => <td key={c.key} style={{ textAlign: c.align || 'left' }}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Section banner (wizard) ---------- */
export function SectionBanner({ n, icon, title, sub, tag, tagTone = 'neutral', active, onClick, collapsed }) {
  return (
    <div className={`sec-banner ${active ? 'sec-active' : 'sec-idle'} ${collapsed ? 'sec-collapsed' : ''}`} onClick={onClick}>
      <div className="row gap-sm">
        <span className="sec-icon">{icon}</span>
        <div>
          <div className="sec-title">Section {n}: {title}</div>
          {sub && <div className="sec-sub">{sub}</div>}
        </div>
      </div>
      {tag && <Badge tone={tagTone}>{tag}</Badge>}
    </div>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = '', title, sub }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <div className="t-title-sm c-ink">{title}</div>
      {sub && <div className="t-body-sm c-muted mt-xs">{sub}</div>}
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, width = 480 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="t-title-md">{title}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ============================================================
   Charts — SVG, dependency-free
   ============================================================ */

/* Catmull-Rom → cubic bezier smooth path through points */
function smoothPath(pts) {
  if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`
  }
  return d
}

function niceMax(raw) {
  if (raw <= 0) return 1
  const step = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.ceil(raw / step) * step
}

/* Rounded-top column path */
function topRound(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}

/* ---------- Sparkline (smooth line + soft area fill) ---------- */
export function Sparkline({ data = [], color = 'var(--color-ink)', w = 120, h = 36 }) {
  const uid = useId().replace(/:/g, '')
  if (!data.length) return null
  const max = Math.max(...data, 1), min = Math.min(...data, 0)
  const span = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 6) + 3, h - ((v - min) / span) * (h - 10) - 5])
  const line = smoothPath(pts)
  return (
    <svg width={w} height={h} className="spark">
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${pts.at(-1)[0]},${h} L${pts[0][0]},${h} Z`} fill={`url(#sp-${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="3" fill={color} stroke="var(--color-canvas)" strokeWidth="1.5" />
    </svg>
  )
}

/* ---------- BarChart (rounded gradient columns + grid) ---------- */
export function BarChart({ data = [], color = 'var(--color-brand-blue)', h = 160, showValues = false }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="barchart" style={{ height: h }}>
      <div className="bar-grid"><span /><span /><span /></div>
      {data.map((d, i) => (
        <div className="bar-col" key={i}>
          {showValues && <span className="bar-val">{d.value}</span>}
          <div
            className="bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: `linear-gradient(180deg, ${d.color || color}, color-mix(in srgb, ${d.color || color} 72%, white))`,
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="bar-label t-caption c-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- DonutChart (segment gaps, rounded caps, center metric) ---------- */
export function DonutChart({ segments = [], size = 160, thickness = 22, centerValue, centerLabel }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 4 : 0
  let offset = 0
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface)" strokeWidth={thickness * 0.6} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const share = (s.value / total) * c
            const len = Math.max(share - gap, 0.01)
            const el = (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={s.color} strokeWidth={thickness} strokeLinecap="round"
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-(offset + gap / 2)}>
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            )
            offset += share
            return el
          })}
        </g>
      </svg>
      <div className="donut-center">
        <span className="donut-num">{centerValue ?? total}</span>
        {centerLabel && <span className="donut-label">{centerLabel}</span>}
      </div>
    </div>
  )
}

/* ---------- AreaChart (smooth dual-series, dashed grid, hover tooltip) ---------- */
export function AreaChart({ series = [], labels = [], h = 230, formatY = (v) => v, formatV = (v) => v }) {
  const uid = useId().replace(/:/g, '')
  const [hover, setHover] = useState(null)
  const W = 640, padL = 42, padR = 12, padT = 14, padB = 26
  const iw = W - padL - padR, ih = h - padT - padB
  const all = series.flatMap((s) => s.data)
  if (!all.length) return null
  const n = Math.max(...series.map((s) => s.data.length))
  const ymax = niceMax(Math.max(...all))
  const x = (i) => padL + (i / (n - 1)) * iw
  const y = (v) => padT + ih - (v / ymax) * ih
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - padL) / iw) * (n - 1))
    setHover(i >= 0 && i < n ? i : null)
  }
  return (
    <div className="chart-hover-wrap">
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: 'block' }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <clipPath id={`clip-${uid}`}><rect x={padL} y={padT} width={iw} height={ih} /></clipPath>
          {series.map((s, si) => (
            <linearGradient key={si} id={`ac-${uid}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(ymax * t)} y2={y(ymax * t)}
              stroke="var(--color-hairline-soft)" strokeWidth="1" strokeDasharray={t === 0 ? 'none' : '3 5'} />
            <text x={padL - 8} y={y(ymax * t) + 4} textAnchor="end" fontSize="10" fill="var(--color-stone)">{formatY(Math.round(ymax * t))}</text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--color-stone)">{l}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => [x(i), y(v)])
          const line = smoothPath(pts)
          return (
            <g key={si} clipPath={`url(#clip-${uid})`}>
              {s.fill !== false && (
                <path d={`${line} L${pts.at(-1)[0]},${y(0)} L${pts[0][0]},${y(0)} Z`} fill={`url(#ac-${uid}-${si})`} />
              )}
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}
        {series.map((s, si) => (
          <circle key={si} cx={x(s.data.length - 1)} cy={y(s.data.at(-1))} r="4" fill={s.color} stroke="var(--color-canvas)" strokeWidth="2" />
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="var(--color-stone)" strokeWidth="1" strokeDasharray="3 4" />
            {series.map((s, si) => s.data[hover] !== undefined && (
              <circle key={si} cx={x(hover)} cy={y(s.data[hover])} r="4.5" fill={s.color} stroke="var(--color-canvas)" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}>
          <div className="chart-tip-title">{labels[hover]}</div>
          {series.map((s, si) => s.data[hover] !== undefined && (
            <div className="chart-tip-row" key={si}>
              <span className="legend-dot" style={{ background: s.color }} />
              <span>{s.name || `Series ${si + 1}`}</span>
              <strong>{formatV(s.data[hover])}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- StackedColumns (stacked monthly series) ---------- */
export function StackedColumns({ labels = [], series = [], h = 210, formatY = (v) => v }) {
  const W = 640, padL = 42, padR = 12, padT = 14, padB = 26
  const iw = W - padL - padR, ih = h - padT - padB
  const n = labels.length
  const totals = labels.map((_, i) => series.reduce((s, sr) => s + (sr.data[i] || 0), 0))
  const ymax = niceMax(Math.max(...totals, 1))
  const bw = (iw / n) * 0.52
  const ticks = [0, 0.5, 1]
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: 'block' }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={padT + ih - t * ih} y2={padT + ih - t * ih}
            stroke="var(--color-hairline-soft)" strokeWidth="1" strokeDasharray={t === 0 ? 'none' : '3 5'} />
          <text x={padL - 8} y={padT + ih - t * ih + 4} textAnchor="end" fontSize="10" fill="var(--color-stone)">{formatY(Math.round(ymax * t))}</text>
        </g>
      ))}
      {labels.map((l, i) => {
        const cx = padL + (i / (n - 1)) * iw
        let acc = 0
        return (
          <g key={i} className="viz-col">
            {series.map((sr, si) => {
              const v = sr.data[i] || 0
              const hh = (v / ymax) * ih
              const yTop = padT + ih - acc / ymax * ih - hh
              acc += v
              const isTop = si === series.length - 1
              return (
                <g key={si}>
                  {isTop
                    ? <path d={topRound(cx - bw / 2, yTop, bw, hh, 4)} fill={sr.color}><title>{`${l} · ${sr.name}: ${v}`}</title></path>
                    : <rect x={cx - bw / 2} y={yTop} width={bw} height={hh} fill={sr.color}><title>{`${l} · ${sr.name}: ${v}`}</title></rect>}
                </g>
              )
            })}
            <text x={cx} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--color-stone)">{l}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- ComboChart (columns + overlay trend line, dual scale) ---------- */
export function ComboChart({ labels = [], bars = [], line = [], barColor = 'var(--color-success)', lineColor = 'var(--color-ink)', h = 210, formatY = (v) => v }) {
  const W = 640, padL = 42, padR = 12, padT = 14, padB = 26
  const iw = W - padL - padR, ih = h - padT - padB
  const n = labels.length
  const bmax = niceMax(Math.max(...bars, 1))
  const lmax = niceMax(Math.max(...line, 1))
  const bw = (iw / n) * 0.5
  const lp = line.map((v, i) => [padL + (i / (n - 1)) * iw, padT + ih - (v / lmax) * ih])
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{ display: 'block' }}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={padT + ih - t * ih} y2={padT + ih - t * ih}
            stroke="var(--color-hairline-soft)" strokeWidth="1" strokeDasharray={t === 0 ? 'none' : '3 5'} />
          <text x={padL - 8} y={padT + ih - t * ih + 4} textAnchor="end" fontSize="10" fill="var(--color-stone)">{formatY(Math.round(bmax * t))}</text>
        </g>
      ))}
      {labels.map((l, i) => {
        const cx = padL + (i / (n - 1)) * iw
        const hh = (bars[i] / bmax) * ih
        return (
          <g key={i} className="viz-col">
            <path d={topRound(cx - bw / 2, padT + ih - hh, bw, hh, 4)} fill={barColor} opacity="0.9">
              <title>{`${l}: ${bars[i]}`}</title>
            </path>
            <text x={cx} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--color-stone)">{l}</text>
          </g>
        )
      })}
      <path d={smoothPath(lp)} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {lp.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === lp.length - 1 ? 4 : 2.5} fill={lineColor} stroke="var(--color-canvas)" strokeWidth="1.5">
          <title>{`${labels[i]}: ${line[i]}%`}</title>
        </circle>
      ))}
    </svg>
  )
}

/* ---------- Heatmap (intensity grid) ---------- */
export function Heatmap({ rows = [], cols = [], values = [], rgb = '45, 85, 251' }) {
  const max = Math.max(...values.flat(), 1)
  return (
    <div className="heatmap" style={{ gridTemplateColumns: `44px repeat(${cols.length}, 1fr)` }}>
      <span />
      {cols.map((c) => <span key={c} className="heat-col-label">{c}</span>)}
      {rows.map((r, ri) => (
        <HeatRow key={r} label={r} row={values[ri] || []} max={max} rgb={rgb} />
      ))}
    </div>
  )
}
function HeatRow({ label, row, max, rgb }) {
  return (
    <>
      <span className="heat-row-label">{label}</span>
      {row.map((v, i) => (
        <span key={i} className="heat-cell" title={`${label}: ${v} inquiries`}
          style={{ background: `rgba(${rgb}, ${0.06 + 0.94 * (v / max)})` }} />
      ))}
    </>
  )
}

/* ---------- HBars (horizontal labeled bars) ---------- */
export function HBars({ data = [], color = 'var(--color-ink)', formatV = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <span className="hbar-label">{d.label}</span>
          <span className="hbar-track"><span className="hbar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color || color }} /></span>
          <span className="hbar-value">{formatV(d.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Funnel ---------- */
export function Funnel({ stages = [], color = 'var(--color-brand-blue)' }) {
  const max = Math.max(...stages.map((s) => s.value), 1)
  return (
    <div className="funnel">
      {stages.map((s, i) => {
        const conv = i === 0 ? null : Math.round((s.value / stages[i - 1].value) * 100)
        return (
          <div className="funnel-row" key={s.stage}>
            <div className="row-between">
              <span className="funnel-stage">{s.stage}</span>
              <span className="funnel-nums">{s.value}{conv !== null && <em className="funnel-conv">{conv}%</em>}</span>
            </div>
            <div className="funnel-track">
              <span className="funnel-fill" style={{ width: `${(s.value / max) * 100}%`, background: color, opacity: 1 - i * 0.14 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- ProgressRing ---------- */
export function ProgressRing({ pct = 0, size = 132, thickness = 12, color = 'var(--color-success)', label }) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-center">
        <span className="ring-pct">{Math.round(clamped)}%</span>
        {label && <span className="ring-label">{label}</span>}
      </div>
    </div>
  )
}

/* ---------- StackBar (single stacked bar + legend) ---------- */
export function StackBar({ segments = [] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  return (
    <div>
      <div className="stackbar">
        {segments.map((s) => (
          <span key={s.label} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <div className="chart-legend col gap-xs mt-base">
        {segments.map((s) => (
          <div className="legend-item" key={s.label}>
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">{s.value} · {Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
