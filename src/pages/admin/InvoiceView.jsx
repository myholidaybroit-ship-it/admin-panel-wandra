import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { Card, Badge, Button, EmptyState } from '../../components/ui/UI'
import { KV } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'
import { prettyDate } from '../../utils/billing'

/* Full invoice detail page (replaces the old invoice modal). */
export default function InvoiceView() {
  const { id } = useParams()
  const nav = useNavigate()
  const { transactions, agencies, inr } = useApp()
  const tx = transactions.find((t) => t.id === id || t.code === id)

  if (!tx) return <EmptyState icon="" title="Invoice not found" sub="It may have been removed." />
  const agency = agencies.find((a) => a.id === tx.agencyId)

  return (
    <>
      <Link to="/app/transactions" className="c-link t-body-sm-medium" style={{ display: 'inline-block', marginBottom: 14 }}>← All transactions</Link>

      <div className="row-between wrap gap-sm mb-lg">
        <div>
          <h1 className="t-display-md c-ink">Invoice {tx.code}</h1>
          <p className="t-body-sm c-body mt-xs">{tx.type === 'renewal' ? 'Renewal' : 'New subscription'} · {tx.agencyName}</p>
        </div>
        <div className="row gap-sm">
          <Badge tone={tx.status === 'paid' ? 'paid' : 'warning'}>{tx.status}</Badge>
          {agency && <Button variant="secondary" onClick={() => nav(`/app/agencies/${agency.id}`)}>Open agency →</Button>}
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card className="inv-doc">
          <div className="inv-head">
            <div>
              <img className="inv-logo" src="/brand/wandra-logo.png" alt="Wandra" />
              <div className="t-caption c-steel mt-sm">Wandra Travel Software</div>
              <div className="t-caption c-steel">billing@wandra.travel</div>
            </div>
            <div className="text-right">
              <div className="inv-code">{tx.code}</div>
              <div className="t-caption c-steel mt-xs">{prettyDate(tx.createdAt)}</div>
            </div>
          </div>

          <div className="inv-grid">
            <div className="col gap-sm">
              <div className="t-caption-bold c-steel">BILLED TO</div>
              <div className="t-body-md-bold">{tx.agencyName}</div>
              {agency && <div className="t-caption c-steel">{agency.code} · {agency.owner}</div>}
              {agency?.email && <div className="t-caption c-steel">{agency.email}</div>}
              {agency?.phone && <div className="t-caption c-steel">{agency.phone}</div>}
            </div>
            <div className="col gap-sm">
              <KV label="Billing period">{tx.period}</KV>
              <KV label="Type">{tx.type === 'renewal' ? 'Renewal' : 'New subscription'}</KV>
              <KV label="Method">{tx.method}</KV>
              <KV label="Reference">{tx.reference || '—'}</KV>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr><th>Description</th><th className="num">Original</th><th className="num">Discount</th><th className="num">Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Wandra {tx.plan} plan — {tx.type === 'renewal' ? 'renewal' : 'subscription'} ({tx.period})</td>
                <td className="num">{inr(tx.originalPrice)}</td>
                <td className="num">{tx.discount ? `− ${inr(tx.discount)} (${tx.discountPercent}%)` : '—'}</td>
                <td className="num">{inr(tx.amount)}</td>
              </tr>
              <tr className="inv-totrow">
                <td colSpan={3}>Total received</td>
                <td className="num">{inr(tx.amount)}</td>
              </tr>
            </tbody>
          </table>

          {tx.note && <div className="wa-note"><strong>Note:</strong> {tx.note}</div>}
        </Card>

        <Card className="stack-lg">
          <div className="dash-panel-title">Payment proof</div>
          {tx.proof ? (
            tx.proofKind === 'image'
              ? <img className="inv-proof-img" src={tx.proof} alt="payment proof" />
              : <a className="feat-mini-btn" href={tx.proof} target="_blank" rel="noreferrer">Open attached file ({tx.proofName})</a>
          ) : (
            <div className="t-body-sm c-muted">No screenshot attached (seed record).</div>
          )}
          <div className="wa-note row gap-xs" style={{ alignItems: 'flex-start' }}>
            <Icon name="check" size={14} />
            <span>Every invoice keeps its payment proof so any subscription can be verified as authentic.</span>
          </div>
        </Card>
      </div>
    </>
  )
}
