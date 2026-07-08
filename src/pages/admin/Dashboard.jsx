import { Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Badge, Button, AreaChart, DonutChart } from '../../components/ui/UI'
import { StatCard } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'
import { prettyDate } from '../../utils/billing'

const MONO = ['#111113', '#55555e', '#8b8b94', '#c9c9cf']

export default function Dashboard() {
  const { agencies, demoRequests, plans, inr } = useApp()

  const active = agencies.filter((a) => a.status === 'active')
  const suspended = agencies.filter((a) => a.status === 'suspended')
  const proCount = agencies.filter((a) => a.plan === 'Pro').length
  const freeCount = agencies.length - proCount
  const proPrice = plans.find((p) => p.id === 'Pro')?.price || 0
  const mrr = proCount * proPrice
  const interestedDemos = demoRequests.filter((d) => d.status === 'interested').length
  const pendingDemos = demoRequests.filter((d) => d.status === 'pending').length

  const recent = [...agencies].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)

  const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="Everything happening across the Wandra SaaS"
        actions={<Button as="a" href="/app/agencies/new">+ New Agency</Button>}
      />

      <div className="grid grid-4">
        <StatCard label="Total agencies" value={agencies.length} sub={`${active.length} active · ${suspended.length} suspended`} icon="users" />
        <StatCard label="Monthly recurring" value={inr(mrr)} sub={`${proCount} on Pro`} tone="success" icon="billing" />
        <StatCard label="Pro / Free split" value={`${proCount} / ${freeCount}`} sub="paid vs free tenants" tone="blue" icon="layers" />
        <StatCard label="Interested demos" value={interestedDemos} sub={`${pendingDemos} awaiting demo`} tone={interestedDemos ? 'success' : undefined} icon="calendar" />
      </div>

      <div className="dash-grid-2 mt-lg">
        <Card>
          <div className="row-between mb-base">
            <span className="dash-panel-title">Signups — last 6 months</span>
            <Badge tone="info">MoM</Badge>
          </div>
          <AreaChart
            labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
            series={[{ name: 'New agencies', color: MONO[0], data: [2, 3, 5, 8, 11, agencies.length] }]}
          />
        </Card>
        <Card>
          <div className="dash-panel-title mb-base">Plan distribution</div>
          <div className="row center" style={{ padding: '10px 0' }}>
            <DonutChart
              size={170} thickness={24}
              centerValue={agencies.length} centerLabel="agencies"
              segments={[
                { label: 'Pro', value: proCount, color: MONO[0] },
                { label: 'Free', value: freeCount, color: MONO[2] },
              ]}
            />
          </div>
          <div className="col gap-xs mt-base">
            <div className="legend-item"><span className="legend-dot" style={{ background: MONO[0] }} /><span className="legend-label">Pro</span><span className="legend-value">{proCount} · {inr(proPrice)}/mo</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: MONO[2] }} /><span className="legend-label">Free</span><span className="legend-value">{freeCount}</span></div>
          </div>
        </Card>
      </div>

      <div className="dash-grid-2 mt-lg">
        <Card>
          <div className="row-between mb-base">
            <span className="dash-panel-title">Recent agencies</span>
            <Link to="/app/agencies" className="c-link t-body-sm-medium">View all →</Link>
          </div>
          {recent.map((a) => (
            <Link key={a.id} to={`/app/agencies/${a.id}`} className="dash-list-row">
              <span className="dash-avatar">{initials(a.name)}</span>
              <div className="dash-row-main">
                <div className="dash-row-name">{a.name}</div>
                <div className="dash-row-sub">{a.code} · {a.city} · joined {prettyDate(a.createdAt)}</div>
              </div>
              <Badge tone={a.plan === 'Pro' ? 'info' : 'neutral'}>{a.plan}</Badge>
              <Badge tone={a.status === 'active' ? 'active' : 'error'}>{a.status}</Badge>
            </Link>
          ))}
        </Card>

        <Card>
          <div className="row-between mb-base">
            <span className="dash-panel-title">Recent demos</span>
            <Link to="/app/demo-requests" className="c-link t-body-sm-medium">Open log →</Link>
          </div>
          {demoRequests.slice(0, 5).map((d) => {
            const tone = d.status === 'interested' ? 'success' : d.status === 'not' ? 'error' : d.status === 'converted' ? 'info' : 'warning'
            const label = d.status === 'not' ? 'Not interested' : d.status === 'pending' ? 'Awaiting' : d.status[0].toUpperCase() + d.status.slice(1)
            return (
              <div key={d.id} className="dash-list-row">
                <span className="dash-avatar" style={{ background: 'var(--color-brand-blue)' }}>{initials(d.name)}</span>
                <div className="dash-row-main">
                  <div className="dash-row-name">{d.name}</div>
                  <div className="dash-row-sub">{d.agencyName || '—'}{d.slot ? ` · ${d.slot}` : ''}</div>
                </div>
                <Badge tone={tone}>{label}</Badge>
              </div>
            )
          })}
          <Button as="a" href="/app/demo-requests" variant="secondary" size="sm" className="w-full mt-base">
            <Icon name="plus" size={14} /> Log a demo
          </Button>
        </Card>
      </div>
    </>
  )
}
