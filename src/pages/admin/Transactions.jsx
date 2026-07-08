import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Badge, ListSearch, PillSelect, EmptyState, DataTable } from '../../components/ui/UI'
import { StatCard } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'
import { prettyDate, monthLabel } from '../../utils/billing'

export default function Transactions() {
  const { transactions, inr } = useApp()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('All types')
  const [method, setMethod] = useState('All methods')

  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0)
  const thisMonth = monthLabel(new Date().toISOString().slice(0, 10))
  const monthTotal = transactions.filter((t) => t.period === thisMonth).reduce((s, t) => s + (t.amount || 0), 0)
  const discountsGiven = transactions.reduce((s, t) => s + (t.discount || 0), 0)

  const methods = ['All methods', ...Array.from(new Set(transactions.map((t) => t.method)))]

  const s = q.trim().toLowerCase()
  const rows = transactions.filter((t) => {
    if (type !== 'All types' && (type === 'Subscription' ? t.type !== 'subscription' : t.type !== 'renewal')) return false
    if (method !== 'All methods' && t.method !== method) return false
    if (s && ![t.code, t.agencyName, t.reference, t.method].some((f) => String(f || '').toLowerCase().includes(s))) return false
    return true
  })

  const columns = [
    { key: 'code', head: 'Invoice', render: (t) => <span className="feat-row-key" style={{ fontSize: 13 }}>{t.code}</span> },
    { key: 'agency', head: 'Agency', render: (t) => <span className="t-body-sm-medium">{t.agencyName}</span> },
    { key: 'type', head: 'Type', render: (t) => <Badge tone={t.type === 'renewal' ? 'info' : 'neutral'}>{t.type === 'renewal' ? 'Renewal' : 'Subscription'}</Badge> },
    { key: 'method', head: 'Method', render: (t) => <span className="t-body-sm c-body">{t.method}</span> },
    { key: 'period', head: 'Period', render: (t) => <span className="t-body-sm c-body">{t.period}</span> },
    { key: 'date', head: 'Date', render: (t) => <span className="t-body-sm c-body">{prettyDate(t.createdAt)}</span> },
    { key: 'amount', head: 'Amount', align: 'right', render: (t) => <span className="t-body-sm-medium">{inr(t.amount)}{t.discount ? <span className="t-caption c-success"> · {t.discountPercent}% off</span> : ''}</span> },
    { key: 'status', head: 'Status', align: 'right', render: (t) => <Badge tone={t.status === 'paid' ? 'paid' : 'warning'}>{t.status}</Badge> },
  ]

  return (
    <>
      <PageHeader title="Transactions" subtitle="Every payment and secured invoice across the platform" counter={`${transactions.length} invoices`} />

      <div className="grid grid-4 mb-lg">
        <StatCard label="Total collected" value={inr(total)} sub="all invoices" tone="success" icon="billing" />
        <StatCard label={`Collected · ${thisMonth}`} value={inr(monthTotal)} sub="this billing month" tone="blue" icon="calendar" />
        <StatCard label="Discounts given" value={inr(discountsGiven)} sub="across all invoices" icon="layers" />
        <StatCard label="Invoices" value={transactions.length} sub="paid records" icon="file" />
      </div>

      <div className="row gap-sm wrap mb-lg">
        <PillSelect value={type} options={['All types', 'Subscription', 'Renewal']} onChange={setType} />
        <PillSelect value={method} options={methods} onChange={setMethod} />
        <div className="grow" style={{ minWidth: 220 }}>
          <ListSearch value={q} onChange={setQ} placeholder="Search by invoice, agency, reference…" count={rows.length} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="" title="No transactions" sub="Payments appear here when you activate or renew a Pro plan." />
      ) : (
        <Card pad={0}>
          <DataTable columns={columns} rows={rows} onRowClick={(t) => nav(`/app/transactions/${t.id}`)} />
        </Card>
      )}

      <div className="wa-note mt-lg row gap-xs" style={{ alignItems: 'center' }}>
        <Icon name="check" size={14} />
        <span>Click any row to open its secured invoice with the payment proof. Every Pro activation and renewal is captured here — nothing goes live without a recorded payment.</span>
      </div>
    </>
  )
}
