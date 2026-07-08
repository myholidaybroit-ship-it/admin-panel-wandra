import { useState } from 'react'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Field, Input, Button } from '../../components/ui/UI'
import { Switch } from '../../components/ui/Admin'

export default function Settings() {
  const { admin, updateAdmin, toast } = useApp()

  /* profile — only the display name is editable; the login email + password are
     managed in the server's .env file (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD). */
  const [name, setName] = useState(admin.name)
  const dirty = name !== admin.name

  return (
    <>
      <PageHeader title="Settings" subtitle="Your Super Admin account and console preferences" />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* ---- Profile ---- */}
        <Card className="stack-lg">
          <div className="dash-panel-title">Admin profile</div>
          <div className="row gap-sm" style={{ alignItems: 'center' }}>
            <span className="det-hero-logo" style={{ width: 52, height: 52, fontSize: 18, background: 'var(--color-ink)', color: '#fff' }}>{admin.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
            <div>
              <div className="t-title-sm">{admin.name}</div>
              <span className="admin-env-chip" style={{ background: 'var(--color-brand-blue-200)', color: 'var(--color-brand-blue-deep)' }}>SUPER ADMIN</span>
            </div>
          </div>
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Login email"><Input type="email" value={admin.email} readOnly disabled /></Field>
          <div className="wa-note">This console has a single role — <strong>Super Admin</strong> — with full control of the platform. There are no other admin roles.</div>
          <Button disabled={!dirty} onClick={() => { updateAdmin({ name }); toast('Profile saved') }}>Save profile</Button>
        </Card>
      </div>

      {/* ---- Notifications ---- */}
      <Card className="mt-lg" style={{ maxWidth: 620 }}>
        <div className="dash-panel-title mb-sm">Notifications</div>
        <div className="feat-row" style={{ padding: '12px 0', borderTop: 'none' }}>
          <div className="feat-row-main">
            <div className="feat-row-label">Notify on new agency created</div>
            <div className="feat-row-desc">Show a confirmation whenever a new tenant / agency is created on the platform.</div>
          </div>
          <Switch on={!!admin.notifyNewAgency} onChange={(v) => { updateAdmin({ notifyNewAgency: v }); toast(v ? 'Notifications on' : 'Notifications off') }} />
        </div>
      </Card>
    </>
  )
}
