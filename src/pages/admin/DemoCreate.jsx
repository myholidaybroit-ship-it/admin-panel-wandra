import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Field, Input, Textarea, Button, PillSelect, DatePicker } from '../../components/ui/UI'

const STATUS_OPTS = ['pending', 'interested', 'not']
const statusLabel = (s) => (s === 'not' ? 'Not interested' : s === 'pending' ? 'Awaiting demo' : 'Interested')

export default function DemoCreate() {
  const { addDemo } = useApp()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', agencyName: '', phone: '', date: '', time: '', status: 'pending', note: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }))

  const save = async () => {
    if (!f.name.trim()) return
    const slot = [f.date, f.time].filter(Boolean).join(' ')
    await addDemo({ name: f.name, agencyName: f.agencyName, phone: f.phone, slot, status: f.status, note: f.note })
    nav('/app/demo-requests')
  }

  return (
    <>
      <Link to="/app/demo-requests" className="c-link t-body-sm-medium" style={{ display: 'inline-block', marginBottom: 14 }}>← Back to Demos</Link>
      <PageHeader title="Log a demo" subtitle="After a demo call, note who it was with and whether they're interested" />

      <Card className="col gap-md" style={{ maxWidth: 640 }}>
        <Field label="Name" required>
          <Input value={f.name} onChange={set('name')} placeholder="e.g. Aarav Mehta" autoFocus />
        </Field>
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field label="Agency / business" hint="optional"><Input value={f.agencyName} onChange={set('agencyName')} placeholder="e.g. Mehta Travels" /></Field>
          <Field label="Phone" hint="optional"><Input value={f.phone} onChange={set('phone')} placeholder="+91 …" /></Field>
        </div>
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Field label="Demo date"><DatePicker value={f.date} onChange={set('date')} placeholder="Pick a date" /></Field>
          <Field label="Time" hint="optional"><Input value={f.time} onChange={set('time')} placeholder="e.g. 15:00" /></Field>
        </div>
        <Field label="Interested?">
          <PillSelect value={f.status} options={STATUS_OPTS} onChange={set('status')} format={statusLabel} />
        </Field>
        <Field label="Notes" hint="optional"><Textarea value={f.note} onChange={set('note')} placeholder="What did they say? What do they need?" /></Field>
        <div className="row gap-sm mt-sm">
          <Button onClick={save} disabled={!f.name.trim()}>Save demo</Button>
          <Button variant="secondary" onClick={() => nav('/app/demo-requests')}>Cancel</Button>
        </div>
      </Card>
    </>
  )
}
