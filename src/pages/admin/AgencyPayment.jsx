import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, EmptyState } from '../../components/ui/UI'
import { KV } from '../../components/ui/Admin'
import PaymentForm from '../../components/ui/PaymentForm'
import { Icon } from '../../components/ui/icons'
import { prettyDate } from '../../utils/billing'

const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/* mode: 'activate' (Free → Pro) | 'renew' (record renewal) */
export default function AgencyPayment({ mode = 'activate' }) {
  const { id } = useParams()
  const nav = useNavigate()
  const app = useApp()
  const a = app.agencies.find((x) => x.id === id)

  if (!a) return <EmptyState icon="" title="Agency not found" sub="It may have been deleted." />

  const isRenew = mode === 'renew'
  const back = `/app/agencies/${a.id}`

  // Guards: don't allow activating an already-Pro agency, or renewing a Free one.
  if (!isRenew && a.plan === 'Pro') {
    return <EmptyState icon="" title={`${a.name} is already on Pro`}
      sub="Manage the subscription or record a renewal from the agency's Billing tab." />
  }
  if (isRenew && a.plan !== 'Pro') {
    return <EmptyState icon="" title={`${a.name} isn't on Pro yet`}
      sub="Activate the Pro plan first, then renewals can be recorded." />
  }

  const onConfirm = async (pay) => {
    try {
      if (isRenew) await app.recordRenewal(a.id, pay)
      else await app.assignProPlan(a.id, pay)
      nav(back)
    } catch (ex) { alert(ex.message) }
  }

  return (
    <>
      <Link to={back} className="c-link t-body-sm-medium" style={{ display: 'inline-block', marginBottom: 14 }}>← Back to {a.name}</Link>
      <PageHeader
        title={isRenew ? 'Record renewal payment' : 'Activate Pro plan'}
        subtitle={isRenew
          ? `Capture the renewal payment for ${a.name} to extend the subscription`
          : `Capture a verified payment to move ${a.name} onto Pro`}
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <PaymentForm
          defaultPrice={app.proBilledYearly() ? app.proAnnualBase() : app.proPrice()}
          defaultDiscount={app.proBilledYearly() ? app.proAnnualDiscount() : 0}
          billedNote={app.proBilledYearly() ? `Pro is billed yearly — ₹${app.proPrice().toLocaleString('en-IN')}/mo × 12 = ₹${app.proAnnualBase().toLocaleString('en-IN')} pre-filled${app.proAnnualDiscount() ? `, ${app.proAnnualDiscount()}% annual discount applied` : ''}.` : ''}
          cta={isRenew ? 'Record renewal payment' : 'Confirm payment & activate Pro'} onConfirm={onConfirm} onCancel={() => nav(back)} />

        <Card className="stack-lg">
          <div className="pay-agency">
            <span className="ag-logo" style={{ width: 44, height: 44, fontSize: 15 }}>{initials(a.name)}</span>
            <div>
              <div className="t-body-md-bold">{a.name}</div>
              <div className="t-caption c-steel">{a.code} · {a.owner || '—'}</div>
            </div>
          </div>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <KV label="Current plan">{a.plan}</KV>
            <KV label="Pro price">₹{app.proPrice().toLocaleString('en-IN')}/mo{app.proBilledYearly() ? ` · billed yearly ₹${app.proAnnual().toLocaleString('en-IN')}` : ''}</KV>
            {a.billing?.since && <KV label="Active since">{prettyDate(a.billing.since)}</KV>}
            {a.billing?.renewalOn && <KV label="Renews on">{prettyDate(a.billing.renewalOn)}</KV>}
          </div>
          <div className="wa-note row gap-xs" style={{ alignItems: 'flex-start' }}>
            <Icon name="check" size={14} />
            <span>{isRenew
              ? `Recording the payment extends the cycle by ${app.proBilledYearly() ? 'one year' : 'one month'} and files a new secured invoice.`
              : 'Pro only activates once a valid payment with a screenshot proof is recorded. This creates a secured invoice you can review anytime.'}</span>
          </div>
        </Card>
      </div>
    </>
  )
}
