import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Field, Input, Button, Badge, PillSelect, DataTable, EmptyState } from '../../components/ui/UI'
import { Icon } from '../../components/ui/icons'
import './support.css'

const EMPTY_SETTINGS = { companyName: '', email: '', phone: '', whatsapp: '', hours: '', description: '' }
const STATUS_OPTIONS = ['new', 'in_progress', 'resolved']
const statusLabel = (value) => ({ new: 'New', in_progress: 'In progress', resolved: 'Resolved' }[value] || value)
const dateLabel = (value) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function SupportCenter() {
  const { supportSettings, supportInquiries, updateSupportSettings, updateSupportInquiry } = useApp()
  const [form, setForm] = useState(EMPTY_SETTINGS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (supportSettings) setForm({ ...EMPTY_SETTINGS, ...supportSettings })
  }, [supportSettings])

  const dirty = useMemo(() => Object.keys(EMPTY_SETTINGS).some((key) => form[key] !== (supportSettings?.[key] || '')), [form, supportSettings])
  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }))
  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await updateSupportSettings(form) } finally { setSaving(false) }
  }

  const newCount = supportInquiries.filter((item) => item.status === 'new').length
  const columns = [
    {
      key: 'agency', head: 'Agency', width: '18%',
      render: (item) => <div><div className="support-table-title">{item.agency?.name || 'Unknown agency'}</div><div className="t-caption c-muted">{item.agency?.code || '—'}</div></div>,
    },
    {
      key: 'subject', head: 'Inquiry', width: '31%',
      render: (item) => <div><div className="support-table-title">{item.subject}</div><div className="t-caption c-muted support-message-preview">{item.message}</div><span className="support-category">{item.category}</span></div>,
    },
    {
      key: 'contact', head: 'Contact', width: '20%',
      render: (item) => <div className="support-contact"><span>{item.contactEmail || '—'}</span><span>{item.contactPhone || '—'}</span></div>,
    },
    {
      key: 'status', head: 'Status', width: '16%',
      render: (item) => <PillSelect value={item.status} options={STATUS_OPTIONS} onChange={(status) => updateSupportInquiry(item.id, { status })} format={statusLabel} />,
    },
    { key: 'createdAt', head: 'Received', align: 'right', render: (item) => <span className="t-caption c-muted">{dateLabel(item.createdAt)}</span> },
  ]

  return (
    <>
      <PageHeader title="Support" subtitle="Manage the vendor contact details agencies see and the inquiries they send." />

      <div className="support-settings-grid">
        <Card className="support-settings-card">
          <div className="support-section-head">
            <div><div className="dash-panel-title">Vendor contact details</div><p className="t-body-sm c-muted mt-xs">These details belong to your platform, not to an individual agency.</p></div>
            <span className="support-section-icon"><Icon name="help" size={17} /></span>
          </div>
          <form className="support-form" onSubmit={save}>
            <div className="grid grid-2 gap-md">
              <Field label="Company name" required><Input value={form.companyName} onChange={set('companyName')} placeholder="Wandra" required /></Field>
              <Field label="Support email" required><Input type="email" value={form.email} onChange={set('email')} placeholder="support@yourcompany.com" required /></Field>
              <Field label="Support phone"><Input value={form.phone} onChange={set('phone')} placeholder="+91 90000 00000" /></Field>
              <Field label="WhatsApp number" hint="Include country code for the direct chat link."><Input value={form.whatsapp} onChange={set('whatsapp')} placeholder="919000000000" /></Field>
              <Field label="Support hours" full><Input value={form.hours} onChange={set('hours')} placeholder="Mon-Sat, 10am-7pm IST" /></Field>
              <Field label="Short description" full><textarea className="control" rows="3" value={form.description} onChange={set('description')} placeholder="We are one message away." /></Field>
            </div>
            <div className="row support-form-actions"><Button type="submit" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save support details'}</Button></div>
          </form>
        </Card>

        <Card className="support-contact-preview">
          <div className="dash-panel-title">Agency-facing preview</div>
          <p className="t-body-sm c-muted mt-xs">What CRM users will see on Help &amp; Support.</p>
          <div className="support-preview-brand"><span className="support-preview-mark"><Icon name="help" size={18} /></span><div><div className="t-title-sm">{form.companyName || 'Your company'}</div><div className="t-caption c-muted">Vendor support</div></div></div>
          <div className="support-preview-lines">
            <div><span>Email</span><strong>{form.email || 'Not configured'}</strong></div>
            <div><span>Phone</span><strong>{form.phone || 'Not configured'}</strong></div>
            <div><span>Hours</span><strong>{form.hours || 'Not configured'}</strong></div>
          </div>
        </Card>
      </div>

      <div className="support-inbox-head">
        <div><h2 className="t-title-lg">Agency inquiries</h2><p className="t-body-sm c-muted mt-xs">Messages submitted from the CRM support page.</p></div>
        <Badge tone={newCount ? 'warning' : 'neutral'}>{newCount} new</Badge>
      </div>
      <Card pad={0} className="support-inbox-card">
        {supportInquiries.length ? <DataTable columns={columns} rows={supportInquiries} empty="No support inquiries yet." /> : <EmptyState icon="" title="No support inquiries yet" sub="When an agency contacts your team, their message will appear here." />}
      </Card>
    </>
  )
}
