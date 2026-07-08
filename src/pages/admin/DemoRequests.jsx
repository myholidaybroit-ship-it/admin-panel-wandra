import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Button, Badge, PillSelect, EmptyState } from '../../components/ui/UI'
import { StatCard } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'

const initials = (n) => (n || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/* status → label + badge tone */
const STATUS_META = {
  pending: { label: 'Awaiting demo', tone: 'warning' },
  interested: { label: 'Interested', tone: 'success' },
  not: { label: 'Not interested', tone: 'error' },
  converted: { label: 'Converted', tone: 'info' },
}
const STATUS_OPTS = ['pending', 'interested', 'not']
const statusLabel = (s) => STATUS_META[s]?.label || s

export default function DemoRequests() {
  const { demoRequests, updateDemo, removeDemo } = useApp()
  const nav = useNavigate()
  const [filter, setFilter] = useState('All')

  const rows = demoRequests.filter((d) => {
    if (filter === 'All') return true
    if (filter === 'Interested') return d.status === 'interested'
    if (filter === 'Not interested') return d.status === 'not'
    if (filter === 'Awaiting') return d.status === 'pending'
    return true
  })
  const countBy = (s) => demoRequests.filter((d) => d.status === s).length

  return (
    <>
      <PageHeader
        title="Demos"
        subtitle="A simple log of who you gave a demo to — and whether they were interested"
        actions={<Button onClick={() => nav('/app/demo-requests/new')}><Icon name="plus" size={15} /> Add demo</Button>}
      />

      <div className="grid grid-4 mb-lg">
        <StatCard label="Interested" value={countBy('interested')} sub="ready to onboard" tone="success" icon="check" />
        <StatCard label="Not interested" value={countBy('not')} sub="passed for now" tone="error" icon="x" />
        <StatCard label="Awaiting demo" value={countBy('pending')} sub="not done yet" tone="blue" icon="clock" />
        <StatCard label="Total demos" value={demoRequests.length} sub="all-time entries" icon="users" />
      </div>

      <div className="wa-note mb-lg row gap-xs" style={{ alignItems: 'center' }}>
        <Icon name="calendar" size={15} />
        <span>Prospects book a slot via the Calendly link on your landing page. There's no automatic sync — after each demo, just <strong>add an entry here</strong> and mark them <strong>Interested</strong> or <strong>Not interested</strong>. This is only a log — agencies are created from the <strong>Agencies &amp; Users</strong> page.</span>
      </div>

      <div className="seg mb-lg">
        {['All', 'Interested', 'Not interested', 'Awaiting'].map((t) => (
          <button key={t} className={`seg-btn ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="" title="No demos logged yet" sub="Click “Add demo” after your next demo call." />
      ) : (
        <div className="ag-grid">
          {rows.map((d) => {
            const meta = STATUS_META[d.status] || {}
            return (
              <div key={d.id} className="demo-card">
                <div className="demo-card-head">
                  <span className="ag-logo" style={{ background: d.status === 'interested' ? 'var(--color-success)' : d.status === 'not' ? 'var(--color-error)' : 'var(--color-ink)' }}>{initials(d.name)}</span>
                  <div className="flex-1">
                    <div className="ag-card-name">{d.name}</div>
                    <div className="ag-card-sub">{d.agencyName || '—'}{d.phone ? ` · ${d.phone}` : ''}</div>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                {d.slot && <span className="demo-slot"><Icon name="calendar" size={13} /> {d.slot}</span>}
                {d.note && <div className="demo-note">{d.note}</div>}

                <div className="row gap-xs wrap" style={{ alignItems: 'center' }}>
                  <span className="t-caption c-steel">Mark</span>
                  <PillSelect value={STATUS_OPTS.includes(d.status) ? d.status : 'interested'} options={STATUS_OPTS} onChange={(s) => updateDemo(d.id, { status: s })} format={statusLabel} />
                  <div className="grow" />
                  <button className="btn-icon" title="Remove" onClick={() => removeDemo(d.id)}><Icon name="trash" size={15} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
