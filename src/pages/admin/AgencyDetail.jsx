import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { Card, Button, Badge, PillSelect, Input, Field, ListSearch, EmptyState } from '../../components/ui/UI'
import { Switch, KV } from '../../components/ui/Admin'
import RenewalPanel from '../../components/ui/RenewalPanel'
import { Icon } from '../../components/ui/icons'
import { FEATURE_GROUPS, ALL_FEATURES, LIMIT_DEFS, ROLE_MODULES, countEnabled, FEATURE_COUNT } from '../../data/features'
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
            {a.trial?.onTrial && (
              <Badge tone={a.trial.expired ? 'error' : a.trial.daysLeft <= 2 ? 'warning' : 'neutral'}>
                {a.trial.expired ? 'Trial expired · deactivated' : `Trial · ${a.trial.daysLeft} day${a.trial.daysLeft === 1 ? '' : 's'} left`}
              </Badge>
            )}
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
        {[['features', 'Feature Access'], ['roles', 'Team & Roles'], ['limits', 'Usage Limits'], ['billing', 'Billing & Renewals'], ['overview', 'Profile & Usage']].map(([k, label]) => (
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

      {/* ---- TEAM (users + roles) ---- */}
      {tab === 'roles' && <TeamTab a={a} app={app} />}

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

/* ---------- Team tab (users + roles) ----------
   The CRM shows users AND roles read-only; agencies send a "Roles & team"
   request (Support Center inbox) and the Wandra ops team manages everything
   here — every user is a paid seat at ₹999/user/month (the owner counts). */
const BLANK_USER = { name: '', email: '', password: '', role: 'Sales', phone: '', department: '', designation: '' }
const userInitials = (n) => (n || '?').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function TeamTab({ a, app }) {
  const [users, setUsers] = useState(null)   // null = loading
  const [roles, setRoles] = useState(null)

  useEffect(() => {
    let alive = true
    app.listAgencyUsers(a.id).then((items) => { if (alive) setUsers(items) }).catch(() => { if (alive) setUsers([]) })
    app.listAgencyRoles(a.id).then((items) => { if (alive) setRoles(items) }).catch(() => { if (alive) setRoles([]) })
    return () => { alive = false }
  }, [a.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (users === null || roles === null) return <Card><p className="t-body-sm c-steel">Loading team…</p></Card>

  return (
    <>
      <div className="inline-panel">
        <Icon name="users" size={18} />
        <span className="flex-1 t-body-sm">
          Users and roles are <strong>read-only inside the CRM</strong> — {a.name} sees them but can't change anything.
          When they send a “Roles &amp; team” request (Support Center), do it for them here.
          Every user is a paid seat at <strong>₹999 per user / month</strong> — the owner account counts too.
        </span>
      </div>

      <UsersSection a={a} app={app} users={users} setUsers={setUsers} roles={roles} />
      <RolesSection a={a} app={app} roles={roles} setRoles={setRoles} users={users} />
    </>
  )
}

/* ----- users: add / edit / role / status / password / delete ----- */
function UsersSection({ a, app, users, setUsers, roles, }) {
  const [adding, setAdding] = useState(false)
  const [uform, setUform] = useState({ ...BLANK_USER, password: genPassword(10) })
  const [editing, setEditing] = useState(null)     // user id being edited
  const [eform, setEform] = useState(null)
  const [pwReset, setPwReset] = useState(null)     // { user, password }
  const [pendingDelete, setPendingDelete] = useState(null)

  const roleNames = roles.map((r) => r.name)
  const isOwner = (u) => u.designation === 'Owner'
  const seatCap = a.limits?.team ?? -1  // paid seats the agency has (₹999/user/month); -1 = unlimited
  const replaceUser = (rec) => setUsers((l) => l.map((u) => (u.id === rec.id ? rec : u)))

  const patch = async (user, p, okMsg) => {
    try {
      const rec = await app.updateAgencyUser(a.id, user.id, p)
      replaceUser(rec)
      if (okMsg) app.toast(okMsg)
      return true
    } catch (e) { app.toast(e.message || 'Could not update the user'); return false }
  }

  const create = async () => {
    if (!uform.name.trim() || !uform.email.trim()) return app.toast('Name & email are required')
    if (!uform.password) return app.toast('Set a password so they can log in')
    try {
      const rec = await app.createAgencyUser(a.id, { ...uform, name: uform.name.trim() })
      setUsers((l) => [rec, ...l])
      app.toast(`${rec.name} added — a new billable seat (₹999/mo)`)
      // surface the saved credentials so the admin can copy & share them (they log in with these)
      setPwReset({ user: rec, password: uform.password, saved: true })
      setUform({ ...BLANK_USER, password: genPassword(10) })
      setAdding(false)
    } catch (e) { app.toast(e.message || 'Could not add the user') }
  }

  const saveEdit = async () => {
    if (!eform.name.trim() || !eform.email.trim()) return app.toast('Name & email are required')
    const ok = await patch({ id: editing }, {
      name: eform.name.trim(), email: eform.email, phone: eform.phone,
      department: eform.department, designation: eform.designation,
    }, 'User updated — renames sync to their lead assignments')
    if (ok) { setEditing(null); setEform(null) }
  }

  const remove = async (user) => {
    try {
      await app.removeAgencyUser(a.id, user.id)
      setUsers((l) => l.filter((u) => u.id !== user.id))
      app.toast(`${user.name} removed — the seat is free`)
    } catch (e) { app.toast(e.message || 'Could not remove the user') }
    setPendingDelete(null)
  }

  return (
    <div className="mt-md">
      <div className="row gap-sm wrap">
        <div>
          <div className="dash-panel-title">Users</div>
          <div className="t-caption c-steel">{users.length} seat{users.length === 1 ? '' : 's'} in use{seatCap !== -1 ? ` of ${seatCap}` : ''} · ₹999 / user / month</div>
        </div>
        <div className="grow" />
        {!adding && <Button size="sm" onClick={() => setAdding(true)}>+ Add user</Button>}
      </div>

      {adding && (
        <Card className="mt-sm" pad={18}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Field label="Name" required><Input value={uform.name} onChange={(e) => setUform({ ...uform, name: e.target.value })} placeholder="e.g. Rika Sharma" /></Field>
            <Field label="Email" required><Input value={uform.email} onChange={(e) => setUform({ ...uform, email: e.target.value })} placeholder="name@agency.com" /></Field>
            <Field label="Password" hint="They log in with this — share it with the agency">
              <div className="row gap-xs">
                <Input value={uform.password} onChange={(e) => setUform({ ...uform, password: e.target.value })} />
                <button className="btn-icon" title="Generate" onClick={() => setUform({ ...uform, password: genPassword(10) })}><Icon name="refresh" size={15} /></button>
                <button className="btn-icon" title="Copy" onClick={async () => { (await copyText(uform.password)) && app.toast('Password copied') }}><Icon name="copy" size={15} /></button>
              </div>
            </Field>
            <Field label="Role"><PillSelect value={uform.role} options={roleNames} onChange={(v) => setUform({ ...uform, role: v })} /></Field>
            <Field label="Phone"><Input value={uform.phone} onChange={(e) => setUform({ ...uform, phone: e.target.value })} /></Field>
            <Field label="Department"><Input value={uform.department} onChange={(e) => setUform({ ...uform, department: e.target.value })} /></Field>
          </div>
          <div className="row gap-xs mt-sm">
            <Button size="sm" onClick={create}>Create user</Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {pwReset && (
        <div className={`inline-panel mt-sm ${pwReset.saved ? 'ok' : ''}`}>
          <div className="flex-1">
            <div className="t-body-sm-medium">
              {pwReset.saved
                ? `✓ Password saved for ${pwReset.user.name} — share it now, it won't be shown again`
                : `New password for ${pwReset.user.name} — click “Set password” to activate it (they can't log in until you do)`}
            </div>
            <div className="set-genpw mt-xs" style={{ maxWidth: 360 }}>
              <code>{pwReset.password}</code>
              <button className="btn-icon" title="Copy" onClick={async () => { (await copyText(pwReset.password)) && app.toast('Copied') }}><Icon name="copy" size={16} /></button>
              {!pwReset.saved && <button className="btn-icon" title="Regenerate" onClick={() => setPwReset({ ...pwReset, password: genPassword(10) })}><Icon name="refresh" size={16} /></button>}
            </div>
          </div>
          {pwReset.saved
            ? <Button size="sm" onClick={() => setPwReset(null)}>Done</Button>
            : <>
                <Button size="sm" onClick={async () => { (await patch(pwReset.user, { password: pwReset.password }, `Password set for ${pwReset.user.name} — they can log in now`)) && setPwReset({ ...pwReset, saved: true }) }}>Set password</Button>
                <Button size="sm" variant="secondary" onClick={() => setPwReset(null)}>Cancel</Button>
              </>}
        </div>
      )}

      {pendingDelete && (
        <div className="inline-panel danger mt-sm">
          <Icon name="trash" size={18} />
          <span className="flex-1 t-body-sm">Remove <strong>{pendingDelete.name}</strong> ({pendingDelete.email})? They can no longer log in and leave every assignment rotation. The seat stops billing.</span>
          <Button size="sm" variant="danger" onClick={() => remove(pendingDelete)}>Remove user</Button>
          <Button size="sm" variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
        </div>
      )}

      <Card className="mt-sm" pad={6}>
        {users.length === 0 && <p className="t-body-sm c-steel" style={{ padding: 16 }}>No users yet — add the first one above.</p>}
        {users.map((u) => (
          <div key={u.id}>
            <div className="dash-list-row">
              <span className="dash-avatar">{userInitials(u.name)}</span>
              <div className="dash-row-main">
                <div className="dash-row-name">{u.name}{isOwner(u) && <Badge tone="info">Owner</Badge>}</div>
                <div className="dash-row-sub">{u.email}{u.department ? ` · ${u.department}` : ''}</div>
              </div>
              <div className="row gap-sm wrap" style={{ justifyContent: 'flex-end' }}>
                {isOwner(u)
                  ? <Badge tone="neutral">Admin</Badge>
                  : <PillSelect value={u.role} options={roleNames} onChange={(v) => patch(u, { role: v }, `${u.name} → ${v}`)} />}
                <Switch size="sm" on={(u.status || 'Active') === 'Active'} disabled={isOwner(u)}
                  onChange={(on) => patch(u, { status: on ? 'Active' : 'Inactive' }, on ? `${u.name} is active` : `${u.name} deactivated`)} />
                <button className="feat-mini-btn" onClick={() => { setEditing(u.id); setEform({ name: u.name, email: u.email, phone: u.phone || '', department: u.department || '', designation: u.designation || '' }) }}>Edit</button>
                <button className="feat-mini-btn" onClick={() => { setPendingDelete(null); setPwReset({ user: u, password: genPassword(10) }) }}>Reset password</button>
                {!isOwner(u) && <button className="feat-mini-btn" onClick={() => { setPwReset(null); setPendingDelete(u) }}>Remove</button>}
              </div>
            </div>
            {editing === u.id && eform && (
              <div style={{ padding: '4px 12px 14px' }}>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <Field label="Name" required><Input value={eform.name} onChange={(e) => setEform({ ...eform, name: e.target.value })} /></Field>
                  <Field label="Email" required><Input value={eform.email} onChange={(e) => setEform({ ...eform, email: e.target.value })} /></Field>
                  <Field label="Phone"><Input value={eform.phone} onChange={(e) => setEform({ ...eform, phone: e.target.value })} /></Field>
                  <Field label="Department"><Input value={eform.department} onChange={(e) => setEform({ ...eform, department: e.target.value })} /></Field>
                  {!isOwner(u) && <Field label="Designation"><Input value={eform.designation} onChange={(e) => setEform({ ...eform, designation: e.target.value })} /></Field>}
                </div>
                <div className="row gap-xs mt-sm">
                  <Button size="sm" onClick={saveEdit}>Save changes</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setEditing(null); setEform(null) }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

/* ----- roles: create / per-module toggles / delete ----- */
function RolesSection({ a, app, roles, setRoles, users }) {
  const [name, setName] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const permOn = (r, m) => (m.pricing ? (r.system || r.perms?.viewPricing !== false) : (r.system || r.perms?.[m.key] === true))
  const members = (roleName) => users.filter((u) => u.role === roleName).length

  const create = async () => {
    const t = name.trim()
    if (!t) return app.toast('Give the role a name')
    if (roles.some((r) => r.name.toLowerCase() === t.toLowerCase())) return app.toast('That role already exists')
    try {
      const rec = await app.createAgencyRole(a.id, t)
      setRoles((l) => [...l, rec])
      setName('')
      app.toast(`Role “${t}” created — set its access below`)
    } catch (e) { app.toast(e.message || 'Could not create the role') }
  }

  const setPerm = async (role, key, value) => {
    setRoles((l) => l.map((r) => (r.id === role.id ? { ...r, perms: { ...r.perms, [key]: value } } : r)))
    try {
      const rec = await app.setAgencyRolePerm(a.id, role.id, key, value)
      setRoles((l) => l.map((r) => (r.id === rec.id ? rec : r)))
    } catch (e) {
      setRoles((l) => l.map((r) => (r.id === role.id ? role : r)))
      app.toast(e.message || 'Could not update the permission')
    }
  }

  const remove = async (role) => {
    try {
      await app.removeAgencyRole(a.id, role.id)
      setRoles((l) => l.filter((r) => r.id !== role.id))
      app.toast(`Role “${role.name}” deleted`)
    } catch (e) { app.toast(e.message || 'Could not delete the role') }
    setPendingDelete(null)
  }

  return (
    <div className="mt-lg">
      <div className="row gap-sm wrap">
        <div>
          <div className="dash-panel-title">Roles</div>
          <div className="t-caption c-steel">What each role can open in the CRM — agencies describe the role they need in their request.</div>
        </div>
        <div className="grow" />
        <div className="row gap-xs" style={{ maxWidth: 420 }}>
          <Input value={name} placeholder="New role — e.g. Vendor Coordinator" onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()} />
          <Button size="sm" onClick={create}>Add role</Button>
        </div>
      </div>

      {pendingDelete && (
        <div className="inline-panel danger mt-sm">
          <Icon name="trash" size={18} />
          <span className="flex-1 t-body-sm">Delete the <strong>{pendingDelete.name}</strong> role? Teammates must be moved off it first.</span>
          <Button size="sm" variant="danger" onClick={() => remove(pendingDelete)}>Delete role</Button>
          <Button size="sm" variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
        </div>
      )}

      {roles.map((r) => {
        const on = ROLE_MODULES.filter((m) => permOn(r, m)).length
        return (
          <div key={r.id} className="feat-group">
            <div className="feat-group-head" style={{ cursor: 'default' }}>
              <span className="feat-group-ic"><Icon name="users" size={17} /></span>
              <div>
                <div className="feat-group-name">
                  {r.name}
                  {r.system && <Badge tone="info">System — full access</Badge>}
                </div>
                <div className="feat-group-count">{members(r.name)} member{members(r.name) === 1 ? '' : 's'} · {on} of {ROLE_MODULES.length} modules</div>
              </div>
              {!r.system && (
                <div className="feat-group-actions">
                  <button className="feat-mini-btn" onClick={() => setPendingDelete(r)}>Delete</button>
                </div>
              )}
            </div>
            {ROLE_MODULES.map((m) => (
              <div key={m.key} className="feat-row">
                <div className="feat-row-main">
                  <div className="row gap-xs wrap">
                    <span className="feat-row-label">{m.label}</span>
                    {m.pricing && <span className="feat-plan-tag pro">opt-out</span>}
                  </div>
                  <div className="feat-row-desc">{m.desc}</div>
                </div>
                <Switch on={permOn(r, m)} disabled={r.system} onChange={(v) => setPerm(r, m.key, v)} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Billing & renewals tab ---------- */
/* Free-trial control — countdown + extend, or start one. Access auto-cuts off at expiry. */
function TrialCard({ a, app }) {
  const t = a.trial || {}
  const [customDays, setCustomDays] = useState('')
  const state = !t.onTrial ? 'none' : t.expired ? 'expired' : 'active'
  const doCustom = () => { const d = Number(customDays); if (d > 0) { app.extendTrial(a.id, d); setCustomDays('') } }
  return (
    <Card className="stack-lg">
      <div className="row-between">
        <div className="dash-panel-title">Free trial</div>
        <Badge tone={state === 'expired' ? 'error' : state === 'active' ? (t.daysLeft <= 2 ? 'warning' : 'active') : 'neutral'}>
          {state === 'expired' ? 'Expired — account deactivated' : state === 'active' ? `${t.daysLeft} day${t.daysLeft === 1 ? '' : 's'} left` : 'No trial set'}
        </Badge>
      </div>
      <p className="t-body-sm c-steel">
        {state === 'expired'
          ? `The trial ended on ${prettyDate(t.endsAt)} — the agency can no longer log in. Extend it below, or move them to Pro.`
          : state === 'active'
            ? `Trial runs until ${prettyDate(t.endsAt)}. When it ends the account is deactivated automatically until they upgrade to Pro.`
            : 'This agency has no trial window. Start one below to time-box their free access.'}
      </p>
      <div className="row gap-xs wrap">
        <Button size="sm" variant="secondary" onClick={() => app.extendTrial(a.id, 7)}>{state === 'none' ? 'Start 7-day trial' : '+7 days'}</Button>
        <Button size="sm" variant="secondary" onClick={() => app.extendTrial(a.id, 14)}>+14 days</Button>
        <Button size="sm" variant="secondary" onClick={() => app.extendTrial(a.id, 30)}>+30 days</Button>
        <div className="row gap-xs">
          <Input style={{ width: 88 }} type="number" min="1" placeholder="days" value={customDays} onChange={(e) => setCustomDays(e.target.value)} />
          <Button size="sm" onClick={doCustom} disabled={!(Number(customDays) > 0)}>Extend</Button>
        </div>
      </div>
    </Card>
  )
}

function BillingTab({ a, app, inr, nav, onActivate, onDowngrade }) {
  const txns = app.transactions.filter((t) => t.agencyId === a.id)
  const paidTotal = txns.reduce((s, t) => s + (t.amount || 0), 0)
  const openInvoice = (t) => nav(`/app/transactions/${t.id}`)

  if (a.plan !== 'Pro') {
    return (
      <div className="col gap-md" style={{ maxWidth: 640 }}>
        <TrialCard a={a} app={app} />
        <Card className="stack-lg">
          <div>
            <div className="dash-panel-title">On the Free plan</div>
            <p className="t-body-sm c-steel mt-xs">This agency is on Free. To move them to Pro you must record a payment with proof — that keeps every subscription authentic and generates a secured invoice.</p>
          </div>
          <div className="renew-strip">
            <Icon name="billing" size={18} />
            <span className="flex-1 t-body-sm">Activate Pro at <strong>{inr(app.proPrice())}/mo</strong>{app.proBilledYearly() ? `, billed yearly at ${inr(app.proAnnual())}` : ''} (discounts allowed).</span>
            <Button onClick={onActivate}>Activate Pro plan</Button>
          </div>
          {txns.length > 0 && <TxnList txns={txns} inr={inr} onOpen={openInvoice} />}
        </Card>
      </div>
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
            <KV label="Price">{inr(app.proPrice())}/mo{app.proBilledYearly() ? ` · ${inr(app.proAnnual())}/yr` : ''}</KV>
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
