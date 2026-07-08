import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Field, Input, Button, EmptyState } from '../../components/ui/UI'

export default function AgencyEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const app = useApp()
  const a = app.agencies.find((x) => x.id === id)
  const [f, setF] = useState(a || {})

  if (!a) return <EmptyState icon="" title="Agency not found" sub="It may have been deleted." />
  const back = `/app/agencies/${a.id}`
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const save = () => {
    app.updateAgency(a.id, { name: f.name, owner: f.owner, email: f.email, phone: f.phone, city: f.city })
    app.toast('Details updated')
    nav(back)
  }

  return (
    <>
      <Link to={back} className="c-link t-body-sm-medium" style={{ display: 'inline-block', marginBottom: 14 }}>← Back to {a.name}</Link>
      <PageHeader title="Edit agency details" subtitle={`${a.code} · ${a.owner || '—'}`} />

      <Card className="col gap-md" style={{ maxWidth: 640 }}>
        <Field label="Agency name" required><Input value={f.name || ''} onChange={set('name')} autoFocus /></Field>
        <Field label="Owner"><Input value={f.owner || ''} onChange={set('owner')} /></Field>
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field label="Email"><Input type="email" value={f.email || ''} onChange={set('email')} /></Field>
          <Field label="Phone"><Input value={f.phone || ''} onChange={set('phone')} /></Field>
        </div>
        <Field label="City"><Input value={f.city || ''} onChange={set('city')} /></Field>
        <div className="row gap-sm mt-sm">
          <Button onClick={save} disabled={!f.name?.trim()}>Save changes</Button>
          <Button variant="secondary" onClick={() => nav(back)}>Cancel</Button>
        </div>
      </Card>
    </>
  )
}
