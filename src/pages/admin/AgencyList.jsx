import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Button, Badge, ListSearch, EmptyState, PillSelect } from '../../components/ui/UI'
import { countEnabled, FEATURE_COUNT } from '../../data/features'

const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function AgencyList() {
  const { agencies } = useApp()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [plan, setPlan] = useState('All plans')

  const s = q.trim().toLowerCase()
  const rows = agencies.filter((a) => {
    if (status !== 'All' && a.status !== status.toLowerCase()) return false
    if (plan !== 'All plans' && a.plan !== plan) return false
    if (s && ![a.name, a.code, a.owner, a.email, a.city].some((f) => String(f || '').toLowerCase().includes(s))) return false
    return true
  })

  return (
    <>
      <PageHeader
        title="Agencies & Users"
        subtitle="Every tenant on the platform — an agency and its owner are one account"
        counter={`${agencies.length} total`}
        actions={<Button onClick={() => nav('/app/agencies/new')}>+ New Agency</Button>}
      />

      <div className="row gap-sm wrap mb-lg">
        <div className="seg">
          {['All', 'Active', 'Suspended'].map((t) => (
            <button key={t} className={`seg-btn ${status === t ? 'on' : ''}`} onClick={() => setStatus(t)}>{t}</button>
          ))}
        </div>
        <PillSelect value={plan} options={['All plans', 'Free', 'Pro']} onChange={setPlan} />
        <div className="grow" style={{ minWidth: 220 }}>
          <ListSearch value={q} onChange={setQ} placeholder="Search agencies…" count={rows.length} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="" title="No agencies found" sub="Adjust filters or create a new agency." />
      ) : (
        <div className="ag-grid">
          {rows.map((a) => {
            const enabled = countEnabled(a.features)
            return (
              <div key={a.id} className={`ag-card ${a.status === 'suspended' ? 'suspended' : ''}`} onClick={() => nav(`/app/agencies/${a.id}`)}>
                <div className="ag-card-head">
                  <span className="ag-logo">{initials(a.name)}</span>
                  <div className="flex-1">
                    <div className="ag-card-name">{a.name}</div>
                    <div className="ag-card-sub">{a.code} · {a.owner}</div>
                  </div>
                  <Badge tone={a.status === 'active' ? 'active' : 'error'}>{a.status}</Badge>
                </div>
                <div className="ag-card-meta">
                  <div className="wa-kv"><span className="wa-kv-label">Plan</span><span className="wa-kv-value">{a.plan}</span></div>
                  <div className="wa-kv"><span className="wa-kv-label">Clients</span><span className="wa-kv-value">{a.usage?.clients ?? 0}</span></div>
                  <div className="wa-kv"><span className="wa-kv-label">Team</span><span className="wa-kv-value">{a.usage?.team ?? 1}</span></div>
                </div>
                <div className="ag-card-foot">
                  <span className="ag-feat-count"><strong>{enabled}</strong> / {FEATURE_COUNT} features on</span>
                  <span className="c-link t-body-sm-medium">Manage →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
