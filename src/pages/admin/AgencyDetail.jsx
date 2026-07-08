import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { Card, Button, Badge, PillSelect, Input, ListSearch, EmptyState } from '../../components/ui/UI'
import { Switch, KV } from '../../components/ui/Admin'
import RenewalPanel from '../../components/ui/RenewalPanel'
import { Icon } from '../../components/ui/icons'
import { FEATURE_GROUPS, ALL_FEATURES, LIMIT_DEFS, countEnabled, FEATURE_COUNT } from '../../data/features'
import { genPassword, copyText } from '../../utils/password'
import { prettyDate } from '../../utils/billing'

const initials = (n) => n.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function AgencyDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const app = useApp()
  const { agencies, inr } = app
  const a = agencies.find((x) => x.id === id)

  const [tab, setTab] = useState('features')
  const [q, setQ] = useState('')
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FEATURE_GROUPS.map((g) => [g.key, true])))
  const [confirm, setConfirm] = useState(null) // null | 'delete' | 'downgrade'
  const [pwReset, setPwReset] = useState(null) // generated pw, revealed inline
  const [currentPw, setCurrentPw] = useState('')   // the agency's current owner password
  const [showPw, setShowPw] = useState(false)      // reveal it inline

  // fetch the (sensitive) current password from the backend for this agency
  useEffect(() => {
    let alive = true
    app.getAgency(id).then((d) => { if (alive) setCurrentPw(d.password || '') }).catch(() => {})
    return () => { alive = false }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const planDefaults = useMemo(() => (a ? app.planFeatures(a.plan) : {}), [a?.plan, app.plans])

  if (!a) return <EmptyState icon="" title="Agency not found" sub="It may have been deleted." />

  const enabled = countEnabled(a.features)
  const overrides = ALL_FEATURES.filter((f) => !!a.features[f.key] !== !!planDefaults[f.key]).length

  const s = q.trim().toLowerCase()
  const groups = FEATURE_GROUPS.map((g) => ({
    ...g,
    features: g.features.filter((f) => !s || f.label.toLowerCase().includes(s) || f.key.toLowerCase().includes(s) || f.desc.toLowerCase().includes(s)),
  })).filter((g) => g.features.length)

  const setGroupAll = (g, val) => app.setFeatures(a.id, Object.fromEntries(g.features.map((f) => [f.key, val])))
  const setAll = (val) => app.setFeatures(a.id, Object.fromEntries(ALL_FEATURES.map((f) => [f.key, val])))

  return (
    <>
      <Link to="/app/agencies" className="c-link t-body-sm-medium" style={{ display: 'inline-block', marginBottom: 14 }}>← All agencies</Link>

      {/* Hero */}
      <div className="det-hero">
        <span className="det-hero-logo">{initials(a.name)}</span>
        <div>
          <div className="row gap-sm wrap">
            <span className="det-hero-title">{a.name}</span>
            <Badge tone={a.status === 'active' ? 'active' : 'error'}>{a.status}</Badge>
            <Badge tone={a.plan === 'Pro' ? 'info' : 'neutral'}>{a.plan}</Badge>
          </div>
          <div className="det-hero-sub">{a.code} · {a.owner} · {a.city || '—'} · joined {prettyDate(a.createdAt)}</div>
        </div>
        <div className="det-hero-stats">
          <div><div className="det-hero-stat-num">{enabled}</div><div className="det-hero-stat-lbl">Features on</div></div>
          <div><div className="det-hero-stat-num">{a.usage?.clients ?? 0}</div><div className="det-hero-stat-lbl">Clients</div></div>
          <div><div className="det-hero-stat-num">{a.usage?.team ?? 1}</div><div className="det-hero-stat-lbl">Seats</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="row gap-sm wrap mt-md">
        <div className="row gap-xs">
          <span className="t-body-sm c-steel">Plan</span>
          <PillSelect value={a.plan} options={['Free', 'Pro']} onChange={(p) => {
            if (p === a.plan) return
            if (p === 'Pro') nav(`/app/agencies/${a.id}/activate`)
            else setConfirm('downgrade')
          }} />
        </div>
        <Button variant="secondary" onClick={() => nav(`/app/agencies/${a.id}/edit`)}><Icon name="edit" size={14} /> Edit details</Button>
        <Button variant="secondary" onClick={() => setShowPw((v) => !v)}>{showPw ? 'Hide' : 'Show'} password</Button>
        <Button variant="secondary" onClick={() => { setConfirm(null); setPwReset(genPassword(12)) }}><Icon name="refresh" size={14} /> Reset password</Button>
        {a.status === 'active'
          ? <Button variant="secondary" onClick={() => app.setAgencyStatus(a.id, 'suspended')}>Suspend</Button>
          : <Button onClick={() => app.setAgencyStatus(a.id, 'active')}>Reactivate</Button>}
        <div className="grow" />
        <Button variant="danger" onClick={() => { setPwReset(null); setConfirm('delete') }}><Icon name="trash" size={14} /> Delete</Button>
      </div>

      {/* Inline confirm / reveal strips (replaces modals) */}
      {confirm === 'downgrade' && (
        <div className="inline-panel warn">
          <Icon name="billing" size={18} />
          <span className="flex-1 t-body-sm">Move <strong>{a.name}</strong> to <strong>Free</strong>? This ends the Pro subscription now, resets features to Free and clears the renewal schedule. Past invoices are kept.</span>
          <Button size="sm" variant="danger" onClick={() => { app.downgradeToFree(a.id); setConfirm(null) }}>Move to Free</Button>
          <Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
        </div>
      )}
      {confirm === 'delete' && (
        <div className="inline-panel danger">
          <Icon name="trash" size={18} />
          <span className="flex-1 t-body-sm">Delete <strong>{a.name}</strong> ({a.code}) and all its access? This cannot be undone — consider <strong>suspending</strong> instead.</span>
          <Button size="sm" variant="danger" onClick={() => { app.removeAgency(a.id); nav('/app/agencies') }}>Delete permanently</Button>
          <Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
        </div>
      )}
      {showPw && (
        <div className="inline-panel">
          <div className="flex-1">
            <div className="t-body-sm-medium">Current login for {a.owner || a.name}</div>
            <div className="t-caption c-steel mb-xs">{a.email}</div>
            <div className="set-genpw mt-xs" style={{ maxWidth: 360 }}>
              <code>{currentPw || '••••••••'}</code>
              <button className="btn-icon" title="Copy" onClick={async () => { (await copyText(currentPw)) ? app.toast('Password copied') : app.toast('Copy failed') }}><Icon name="copy" size={16} /></button>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowPw(false)}>Hide</Button>
        </div>
      )}
      {pwReset && (
        <div className="inline-panel">
          <div className="flex-1">
            <div className="t-body-sm-medium">New password for {a.owner || a.name}</div>
            <div className="set-genpw mt-xs" style={{ maxWidth: 360 }}>
              <code>{pwReset}</code>
              <button className="btn-icon" title="Copy" onClick={async () => { (await copyText(pwReset)) ? app.toast('Copied to clipboard') : app.toast('Copy failed') }}><Icon name="copy" size={16} /></button>
              <button className="btn-icon" title="Regenerate" onClick={() => setPwReset(genPassword(12))}><Icon name="refresh" size={16} /></button>
            </div>
          </div>
          <Button size="sm" onClick={() => { app.resetAgencyPassword(a.id, pwReset); setCurrentPw(pwReset); setPwReset(null) }}>Set new password</Button>
          <Button size="sm" variant="secondary" onClick={() => setPwReset(null)}>Cancel</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="det-tabs">
        {[['features', 'Feature Access'], ['limits', 'Usage Limits'], ['billing', 'Billing & Renewals'], ['overview', 'Profile & Usage']].map(([k, label]) => (
          <button key={k} className={`det-tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {label}
            {k === 'features' && <span className="tab-chip">{enabled}</span>}
          </button>
        ))}
      </div>

      {/* ---- FEATURES ---- */}
      {tab === 'features' && (
        <>
          <div className="feat-toolbar">
            <span className="feat-toolbar-count">{enabled} <em>of {FEATURE_COUNT} enabled</em></span>
            {overrides > 0 && <span className="feat-override">{overrides} override{overrides === 1 ? '' : 's'} vs {a.plan} plan</span>}
            <div className="grow" style={{ minWidth: 200 }}>
              <ListSearch value={q} onChange={setQ} placeholder="Search 140+ features…" count={groups.reduce((n, g) => n + g.features.length, 0)} />
            </div>
            <Button size="sm" variant="secondary" onClick={() => setAll(true)}>Enable all</Button>
            <Button size="sm" variant="secondary" onClick={() => setAll(false)}>Disable all</Button>
            <Button size="sm" variant="tertiary" onClick={() => app.resetFeatures(a.id)}>Reset to plan</Button>
          </div>

          {groups.length === 0 && <EmptyState icon="" title="No features match" sub={`Nothing matches “${q}”.`} />}

          {groups.map((g) => {
            const on = g.features.filter((f) => a.features[f.key]).length
            const isOpen = openGroups[g.key]
            return (
              <div key={g.key} className="feat-group">
                <div className="feat-group-head" onClick={() => setOpenGroups((o) => ({ ...o, [g.key]: !o[g.key] }))}>
                  <span className="feat-group-ic"><Icon name={g.icon} size={17} /></span>
                  <div>
                    <div className="feat-group-name">{g.label}</div>
                    <div className="feat-group-count">{on} of {g.features.length} enabled</div>
                  </div>
                  <div className="feat-group-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="feat-mini-btn" onClick={() => setGroupAll(g, true)}>All on</button>
                    <button className="feat-mini-btn" onClick={() => setGroupAll(g, false)}>All off</button>
                    <span className={`feat-group-chev ${isOpen ? 'up' : ''}`} onClick={() => setOpenGroups((o) => ({ ...o, [g.key]: !o[g.key] }))}><Icon name="chevron" size={15} strokeWidth={2} /></span>
                  </div>
                </div>
                {isOpen && g.features.map((f) => {
                  const val = !!a.features[f.key]
                  const isOverride = val !== !!planDefaults[f.key]
                  return (
                    <div key={f.key} className="feat-row">
                      <div className="feat-row-main">
                        <div className="row gap-xs wrap">
                          <span className="feat-row-label">{f.label}</span>
                          <span className={`feat-plan-tag ${f.pro && !f.free ? 'pro' : 'free'}`}>{f.free ? 'Free' : 'Pro'}</span>
                          {isOverride && <span className="feat-override">override</span>}
                        </div>
                        <div className="feat-row-desc">{f.desc}</div>
                      </div>
                      <Switch on={val} onChange={(v) => app.setFeature(a.id, f.key, v)} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </>
      )}

      {/* ---- LIMITS ---- */}
      {tab === 'limits' && (
        <Card>
          <div className="dash-panel-title mb-sm">Usage limits</div>
          <p className="t-body-sm c-steel mb-base">Set the ceiling for each metered resource. Toggle “Unlimited” to remove the cap.</p>
          {LIMIT_DEFS.map((l) => {
            const v = a.limits?.[l.key] ?? 0
            const unlimited = v === -1
            return (
              <div key={l.key} className="limit-row">
                <div className="limit-main">
                  <div className="limit-name">{l.label}</div>
                  <div className="limit-unit">{l.unit}{a.usage?.[l.key] != null && ` · ${a.usage[l.key]} used`}</div>
                </div>
                {!unlimited && (
                  <Input
                    className="limit-input" type="number" min={0} value={v}
                    onChange={(e) => app.setLimit(a.id, l.key, Number(e.target.value))}
                  />
                )}
                {unlimited && <span className="limit-inf">Unlimited</span>}
                <div className="row gap-xs">
                  <span className="t-caption c-steel">Unlimited</span>
                  <Switch size="sm" on={unlimited} onChange={(u) => app.setLimit(a.id, l.key, u ? -1 : (l.free || 100))} />
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* ---- BILLING & RENEWALS ---- */}
      {tab === 'billing' && (
        <BillingTab a={a} app={app} inr={inr} nav={nav}
          onActivate={() => nav(`/app/agencies/${a.id}/activate`)}
          onDowngrade={() => { setTab('features'); setConfirm('downgrade') }} />
      )}

      {/* ---- OVERVIEW ---- */}
      {tab === 'overview' && (
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <Card className="stack-lg">
            <div className="dash-panel-title">Account</div>
            <div className="grid grid-2" style={{ gap: 16 }}>
              <KV label="Agency">{a.name}</KV>
              <KV label="Code">{a.code}</KV>
              <KV label="Owner">{a.owner || '—'}</KV>
              <KV label="City">{a.city || '—'}</KV>
              <KV label="Email">{a.email || '—'}</KV>
              <KV label="Phone">{a.phone || '—'}</KV>
              <KV label="Plan">{a.plan}</KV>
              <KV label="Joined">{prettyDate(a.createdAt)}</KV>
            </div>
          </Card>
          <Card className="stack-lg">
            <div className="dash-panel-title">Usage this cycle</div>
            {[['clients', 'Clients / leads'], ['packages', 'Packages'], ['team', 'Team seats'], ['storage', 'Storage (MB)']].map(([k, label]) => {
              const used = a.usage?.[k] ?? 0
              const cap = a.limits?.[k] ?? -1
              const pct = cap === -1 ? Math.min(100, used ? 30 : 0) : Math.min(100, (used / Math.max(1, cap)) * 100)
              return (
                <div key={k}>
                  <div className="row-between mb-sm">
                    <span className="t-body-sm-medium">{label}</span>
                    <span className="t-body-sm c-steel">{used} / {cap === -1 ? '∞' : cap}</span>
                  </div>
                  <div className="side-plan-bar"><span style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
          </Card>
        </div>
      )}

    </>
  )
}

/* ---------- Billing & renewals tab ---------- */
function BillingTab({ a, app, inr, nav, onActivate, onDowngrade }) {
  const txns = app.transactions.filter((t) => t.agencyId === a.id)
  const paidTotal = txns.reduce((s, t) => s + (t.amount || 0), 0)
  const openInvoice = (t) => nav(`/app/transactions/${t.id}`)

  if (a.plan !== 'Pro') {
    return (
      <Card className="stack-lg" style={{ maxWidth: 640 }}>
        <div>
          <div className="dash-panel-title">On the Free plan</div>
          <p className="t-body-sm c-steel mt-xs">This agency is on Free. To move them to Pro you must record a payment with proof — that keeps every subscription authentic and generates a secured invoice.</p>
        </div>
        <div className="renew-strip">
          <Icon name="billing" size={18} />
          <span className="flex-1 t-body-sm">Activate Pro at <strong>{inr(app.proPrice())}/mo</strong> (discounts allowed).</span>
          <Button onClick={onActivate}>Activate Pro plan</Button>
        </div>
        {txns.length > 0 && <TxnList txns={txns} inr={inr} onOpen={openInvoice} />}
      </Card>
    )
  }

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <div className="col gap-md">
        <Card className="stack-lg">
          <div className="row-between">
            <div className="dash-panel-title">Subscription</div>
            <Badge tone="info">Pro</Badge>
          </div>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <KV label="Plan">Wandra Pro</KV>
            <KV label="Price">{inr(app.proPrice())}/mo</KV>
            <KV label="Active since">{prettyDate(a.billing?.since)}</KV>
            <KV label="Collected to date">{inr(paidTotal)}</KV>
          </div>
          <div className="set-sep" />
          <Button variant="secondary" onClick={onDowngrade}>Cancel subscription (move to Free)</Button>
        </Card>

        <Card className="stack-lg">
          <div className="dash-panel-title">Renewal</div>
          <RenewalPanel a={a} />
        </Card>
      </div>

      <Card>
        <div className="row-between mb-base">
          <div className="dash-panel-title">Invoices</div>
          <span className="t-caption c-steel">{txns.length} record{txns.length === 1 ? '' : 's'}</span>
        </div>
        {txns.length === 0
          ? <EmptyState icon="" title="No invoices yet" sub="Activating Pro creates the first invoice." />
          : <TxnList txns={txns} inr={inr} onOpen={openInvoice} />}
      </Card>
    </div>
  )
}

function TxnList({ txns, inr, onOpen }) {
  return (
    <div>
      {txns.map((t) => (
        <div key={t.id} className="dash-list-row" style={{ cursor: 'pointer' }} onClick={() => onOpen(t)}>
          <span className="dash-avatar" style={{ background: 'var(--color-surface)', color: 'var(--color-ink)' }}><Icon name="file" size={15} /></span>
          <div className="dash-row-main">
            <div className="dash-row-name">{t.code} · {inr(t.amount)}</div>
            <div className="dash-row-sub">{t.type === 'renewal' ? 'Renewal' : 'Subscription'} · {t.method} · {prettyDate(t.createdAt)}</div>
          </div>
          <Badge tone={t.status === 'paid' ? 'paid' : 'warning'}>{t.status}</Badge>
        </div>
      ))}
    </div>
  )
}
