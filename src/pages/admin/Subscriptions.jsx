import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Badge, Button, EmptyState } from '../../components/ui/UI'
import { StatCard } from '../../components/ui/Admin'
import RenewalPanel from '../../components/ui/RenewalPanel'
import { Icon } from '../../components/ui/icons'
import { prettyDate, daysUntil } from '../../utils/billing'

const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const RENEWAL_META = {
  none: { label: 'Active', tone: 'success' },
  requested: { label: 'Reminder sent', tone: 'warning' },
  accepted: { label: 'Agreed to renew', tone: 'success' },
  declined: { label: 'Declined', tone: 'error' },
}

export default function Subscriptions() {
  const { agencies, inr, proPrice } = useApp()
  const nav = useNavigate()
  const [filter, setFilter] = useState('All')
  const [manage, setManage] = useState(null) // agency id being managed

  const pro = agencies.filter((a) => a.plan === 'Pro')
  const dueSoon = pro.filter((a) => { const d = daysUntil(a.billing?.renewalOn); return d != null && d <= 7 })
  const awaiting = pro.filter((a) => a.renewal?.status === 'requested')
  const mrr = pro.length * proPrice()

  const rows = pro.filter((a) => {
    if (filter === 'Due soon') return daysUntil(a.billing?.renewalOn) != null && daysUntil(a.billing?.renewalOn) <= 7
    if (filter === 'Awaiting reply') return a.renewal?.status === 'requested'
    if (filter === 'Agreed') return a.renewal?.status === 'accepted'
    return true
  }).sort((a, b) => (a.billing?.renewalOn || '').localeCompare(b.billing?.renewalOn || ''))


  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Active Pro subscriptions and the renewal pipeline" />

      <div className="grid grid-4 mb-lg">
        <StatCard label="Active Pro subs" value={pro.length} sub="paying agencies" tone="success" icon="billing" />
        <StatCard label="Monthly recurring" value={inr(mrr)} sub="from Pro plans" tone="blue" icon="reports" />
        <StatCard label="Renewing ≤ 7 days" value={dueSoon.length} sub="need attention" tone={dueSoon.length ? 'warning' : undefined} icon="clock" />
        <StatCard label="Awaiting reply" value={awaiting.length} sub="reminder sent" tone={awaiting.length ? 'warning' : undefined} icon="refresh" />
      </div>

      <div className="wa-note mb-lg row gap-xs" style={{ alignItems: 'center' }}>
        <Icon name="refresh" size={15} />
        <span>Send a <strong>renewal reminder</strong> and it appears as a sticky message on the agency's dashboard until they respond Yes or No. Their reply shows up here — then record the payment to extend the cycle.</span>
      </div>

      <div className="seg mb-lg">
        {['All', 'Due soon', 'Awaiting reply', 'Agreed'].map((t) => (
          <button key={t} className={`seg-btn ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="" title="No subscriptions here" sub="Activate Pro on an agency to start a subscription." />
      ) : (
        <div className="col gap-sm">
          {rows.map((a) => {
            const d = daysUntil(a.billing?.renewalOn)
            const dueTone = d == null ? 'neutral' : d < 0 ? 'error' : d <= 7 ? 'warning' : 'success'
            const dueLabel = d == null ? '—' : d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `in ${d} days`
            const rm = RENEWAL_META[a.renewal?.status || 'none']
            const open = manage === a.id
            const btnLabel = a.renewal?.status === 'accepted' ? 'Record payment' : a.renewal?.status === 'requested' ? 'View reply' : 'Manage renewal'
            return (
              <Card key={a.id} pad={0}>
                <div className="sub-row" style={{ padding: 20 }}>
                  <div className="row gap-sm" style={{ alignItems: 'center', flex: 1, minWidth: 240 }}>
                    <span className="ag-logo" style={{ width: 40, height: 40, fontSize: 14 }}>{initials(a.name)}</span>
                    <div className="flex-1" style={{ cursor: 'pointer' }} onClick={() => nav(`/app/agencies/${a.id}`)}>
                      <div className="ag-card-name">{a.name}</div>
                      <div className="ag-card-sub">{a.code} · since {prettyDate(a.billing?.since)}</div>
                    </div>
                  </div>
                  <div className="row gap-lg wrap" style={{ alignItems: 'center' }}>
                    <div><div className="t-caption c-steel">Renews</div><div className="t-body-sm-medium">{prettyDate(a.billing?.renewalOn)}</div></div>
                    <Badge tone={dueTone}>{dueLabel}</Badge>
                    <Badge tone={rm.tone}>{rm.label}</Badge>
                    <Button size="sm" variant={open ? 'secondary' : a.renewal?.status === 'accepted' ? 'primary' : 'secondary'} onClick={() => setManage(open ? null : a.id)}>
                      {open ? 'Close' : btnLabel}
                    </Button>
                  </div>
                </div>
                {open && (
                  <div style={{ padding: '4px 20px 20px', borderTop: '1px solid var(--color-hairline-soft)' }}>
                    <RenewalPanel a={a} />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
