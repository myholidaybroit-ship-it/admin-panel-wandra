import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Badge } from './UI'
import { Icon } from './icons'
import { useApp } from '../../store/AdminContext'
import { prettyDate, daysUntil } from '../../utils/billing'

/* Renewal lifecycle for one Pro agency. Reused on the agency page and Subscriptions page. */
export default function RenewalPanel({ a, compact }) {
  const app = useApp()
  const nav = useNavigate()
  const [showPreview, setShowPreview] = useState(false)

  const status = a.renewal?.status || 'none'
  const renewalOn = a.billing?.renewalOn
  const left = daysUntil(renewalOn)
  const dueTone = left == null ? 'neutral' : left < 0 ? 'error' : left <= 7 ? 'warning' : 'success'
  const dueLabel = left == null ? '—' : left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? 'Due today' : `in ${left} days`

  const StickyPreview = () => (
    <div className="sticky-preview">
      <div className="sticky-preview-cap">What the agency sees on their dashboard</div>
      <div className="sticky-preview-bar">
        <span className="sp-msg">Your <strong>Wandra Pro</strong> plan renews on <strong>{prettyDate(renewalOn)}</strong>. Renew to keep all your features active.</span>
        <span className="sp-btn sp-yes">Renew now</span>
        <span className="sp-btn sp-no">Not now</span>
      </div>
    </div>
  )

  return (
    <div className="col gap-md">
      {!compact && (
        <div className="row-between wrap gap-sm">
          <div>
            <div className="t-caption c-steel">Next renewal</div>
            <div className="t-title-sm">{prettyDate(renewalOn)}</div>
          </div>
          <Badge tone={dueTone}>{dueLabel}</Badge>
        </div>
      )}

      {status === 'none' && (
        <div className="renew-strip">
          <Icon name="clock" size={18} />
          <span className="flex-1 t-body-sm">Subscription is active. Send a renewal reminder to the agency when it's time.</span>
          <Button size="sm" onClick={() => app.requestRenewal(a.id)}>Send renewal reminder</Button>
        </div>
      )}

      {status === 'requested' && (
        <>
          <div className="renew-strip requested">
            <Icon name="clock" size={18} />
            <span className="flex-1 t-body-sm">Reminder sent {a.renewal.requestedOn ? `on ${prettyDate(a.renewal.requestedOn)}` : ''} — waiting for the agency to respond on their dashboard.</span>
            <Button size="sm" variant="secondary" onClick={() => app.cancelRenewalRequest(a.id)}>Withdraw</Button>
          </div>
          <StickyPreview />
          <div className="row gap-xs wrap" style={{ alignItems: 'center' }}>
            <span className="t-caption c-steel">Simulate the agency's reply (in production this comes from their app):</span>
            <Button size="sm" onClick={() => app.respondRenewal(a.id, 'accepted')}>They said Yes</Button>
            <Button size="sm" variant="secondary" onClick={() => app.respondRenewal(a.id, 'declined')}>They said No</Button>
          </div>
        </>
      )}

      {status === 'accepted' && (
        <div className="renew-strip accepted">
          <Icon name="check" size={18} />
          <span className="flex-1 t-body-sm"><strong>Agency agreed to renew</strong>{a.renewal.respondedOn ? ` on ${prettyDate(a.renewal.respondedOn)}` : ''}. Collect the payment and record it to extend the cycle.</span>
          <Button size="sm" onClick={() => nav(`/app/agencies/${a.id}/renew`)}>Record renewal payment</Button>
        </div>
      )}

      {status === 'declined' && (
        <div className="renew-strip declined">
          <Icon name="x" size={18} />
          <span className="flex-1 t-body-sm"><strong>Agency declined</strong>{a.renewal.respondedOn ? ` on ${prettyDate(a.renewal.respondedOn)}` : ''}. Reach out, or send the reminder again.</span>
          <Button size="sm" variant="secondary" onClick={() => app.requestRenewal(a.id)}>Send reminder again</Button>
        </div>
      )}

      {!compact && status === 'none' && (
        <button className="feat-mini-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setShowPreview((s) => !s)}>
          {showPreview ? 'Hide' : 'Preview'} agency reminder
        </button>
      )}
      {!compact && status === 'none' && showPreview && <StickyPreview />}
    </div>
  )
}
