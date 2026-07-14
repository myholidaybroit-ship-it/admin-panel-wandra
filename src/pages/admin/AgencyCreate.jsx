import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Field, Input, Button } from '../../components/ui/UI'
import { Icon } from '../../components/ui/icons'
import { LIMIT_DEFS } from '../../data/features'
import { genPassword } from '../../utils/password'

export default function AgencyCreate() {
  const { addAgency, planFeatures, planLimits, inr, proPrice } = useApp()
  const nav = useNavigate()
  const [sp] = useSearchParams()

  const [f, setF] = useState({
    name: sp.get('name') || '',
    owner: sp.get('owner') || '',
    email: sp.get('email') || '',
    phone: sp.get('phone') || '',
    city: sp.get('city') || '',
    password: '',
  })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.name.trim() || !f.email.trim()) return
    // New agencies always start on Free; Pro is activated later via a recorded payment.
    // A blank password auto-generates one (shown on the agency page).
    try {
      const payload = { ...f, plan: 'Free' }
      if (!payload.password.trim()) delete payload.password
      const rec = await addAgency(payload)
      nav(`/app/agencies/${rec.id}`)
    } catch (ex) { alert(ex.message) }
  }

  const onCount = Object.values(planFeatures('Free')).filter(Boolean).length

  return (
    <>
      <PageHeader title="Create Agency" subtitle="Manually provision a new tenant (e.g. after a demo call)" />
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <form className="col gap-md" onSubmit={submit}>
            <Field label="Agency name" required>
              <Input value={f.name} onChange={set('name')} placeholder="e.g. Kashmir Escapes" autoFocus />
            </Field>
            <Field label="Owner name" hint="The agency and its owner are one account">
              <Input value={f.owner} onChange={set('owner')} placeholder="e.g. Imtiyaz Wani" />
            </Field>
            <div className="grid grid-2" style={{ gap: 16 }}>
              <Field label="Owner login email" required hint="Used to sign in to the CRM"><Input type="email" value={f.email} onChange={set('email')} placeholder="hello@agency.in" /></Field>
              <Field label="Phone"><Input value={f.phone} onChange={set('phone')} placeholder="+91 …" /></Field>
            </div>
            <Field label="City"><Input value={f.city} onChange={set('city')} placeholder="e.g. Srinagar" /></Field>
            <Field label="Login password" hint="Leave blank to auto-generate — shown on the agency page after creating">
              <div className="row gap-xs">
                <Input value={f.password} onChange={set('password')} placeholder="Auto-generated if blank" style={{ flex: 1 }} />
                <Button type="button" variant="secondary" onClick={() => set('password')(genPassword(12))}><Icon name="refresh" size={14} /> Generate</Button>
              </div>
            </Field>
            <div className="row gap-sm mt-sm">
              <Button type="submit">Create agency</Button>
              <Button type="button" variant="secondary" onClick={() => nav('/app/agencies')}>Cancel</Button>
            </div>
          </form>
        </Card>

        <Card className="stack-lg">
          <div>
            <div className="dash-panel-title mb-base">What they'll get</div>
            <div className="wa-note">
              New agencies start on the <strong>Free</strong> plan with <strong>{onCount}</strong> features enabled and a
              <strong> 7-day free trial</strong>. When the trial ends the account is deactivated automatically — you can
              extend it or move them to Pro anytime from the agency's <strong>Billing &amp; Renewals</strong> tab.
            </div>
          </div>
          <div className="renew-strip">
            <Icon name="billing" size={18} />
            <span className="flex-1 t-body-sm">Need Pro ({inr(proPrice())}/mo)? Create the agency first, then <strong>activate Pro with a recorded payment</strong> from its page.</span>
          </div>
          <div>
            <div className="t-caption-bold c-steel mb-sm">Starting limits (Free)</div>
            {LIMIT_DEFS.map((l) => {
              const v = planLimits('Free')[l.key] ?? 0
              return (
                <div key={l.key} className="limit-row">
                  <div className="limit-main">
                    <div className="limit-name">{l.label}</div>
                    <div className="limit-unit">{l.unit}</div>
                  </div>
                  <span className="wa-kv-value">{v === -1 ? 'Unlimited' : v.toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </>
  )
}
