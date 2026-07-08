import { useMemo, useState } from 'react'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, Button, Input, ListSearch } from '../../components/ui/UI'
import { Switch } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'
import { FEATURE_GROUPS, ALL_FEATURES, LIMIT_DEFS, FEATURE_COUNT } from '../../data/features'

export default function Plans() {
  const app = useApp()
  const { plans, agencies, updatePlan, inr } = app
  const [edit, setEdit] = useState(null)
  const [q, setQ] = useState('')
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FEATURE_GROUPS.map((g) => [g.key, true])))
  const [applyFor, setApplyFor] = useState(null) // plan id pending "apply to agencies" confirm

  const countBy = (id) => agencies.filter((a) => a.plan === id).length
  const onCount = (planId) => ALL_FEATURES.reduce((n, f) => n + (app.planFeatures(planId)[f.key] ? 1 : 0), 0)

  const s = q.trim().toLowerCase()
  const groups = useMemo(() => FEATURE_GROUPS.map((g) => ({
    ...g,
    features: g.features.filter((f) => !s || f.label.toLowerCase().includes(s) || f.key.toLowerCase().includes(s) || f.desc.toLowerCase().includes(s)),
  })).filter((g) => g.features.length), [s])

  const setGroup = (planId, g, val) => app.setPlanFeatures(planId, Object.fromEntries(g.features.map((f) => [f.key, val])))

  return (
    <>
      <PageHeader title="Plans & Feature Control" subtitle="Two plans power the platform. Toggle any feature on or off for Free or Pro — changes flow to new agencies, and you can push them to existing ones." />

      {/* Plan summary cards */}
      <div className="plan-grid mb-lg">
        {plans.map((p) => (
          <div key={p.id} className={`plan-card ${p.featured ? 'featured' : ''}`}>
            <div className="row-between">
              <span className="plan-name">{p.name}</span>
              {p.featured && <span className="plan-most-popular">MOST POPULAR</span>}
            </div>
            <div className="plan-price">
              {p.oldPrice ? <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: 15, marginRight: 8 }}>{inr(p.oldPrice)}</span> : null}
              {p.price === 0 ? 'Free' : inr(p.price)}<span> / {p.period}</span>
            </div>
            {p.priceYear ? <div className="t-caption c-steel" style={{ marginTop: -4, marginBottom: 4 }}>or {inr(p.priceYear)}/mo billed yearly</div> : null}
            <div className="plan-card-tagline">{p.tagline}</div>
            <div className="plan-stat-row">
              <div><div className="plan-stat-num">{onCount(p.id)}<span style={{ fontSize: 14, fontWeight: 500 }}> / {FEATURE_COUNT}</span></div><div className="plan-stat-lbl">Features on</div></div>
              <div><div className="plan-stat-num">{countBy(p.id)}</div><div className="plan-stat-lbl">Agencies</div></div>
              <div><div className="plan-stat-num">{inr(countBy(p.id) * p.price)}</div><div className="plan-stat-lbl">MRR</div></div>
            </div>
            <div className="row gap-xs wrap">
              <Button variant={p.featured ? 'primary' : 'secondary'} size="sm" onClick={() => { setApplyFor(null); setEdit(edit?.id === p.id ? null : { id: p.id, price: p.price, priceYear: p.priceYear ?? '', oldPrice: p.oldPrice ?? '', tagline: p.tagline }) }}><Icon name="edit" size={14} /> Price & details</Button>
              <Button variant={p.featured ? 'primary' : 'secondary'} size="sm" onClick={() => { setEdit(null); setApplyFor(applyFor === p.id ? null : p.id) }}>Apply to {countBy(p.id)} agencies</Button>
              <Button variant="tertiary" size="sm" onClick={() => app.resetPlanToCatalog(p.id)}>Reset</Button>
            </div>

            {edit?.id === p.id && (
              <div className="plan-edit col gap-sm">
                <label className="col gap-xxs">
                  <span className="t-caption-bold" style={{ opacity: 0.8 }}>Monthly price (₹) — 0 for free</span>
                  <Input type="number" min={0} value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
                </label>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <label className="col gap-xxs">
                    <span className="t-caption-bold" style={{ opacity: 0.8 }}>Yearly price / mo (₹)</span>
                    <Input type="number" min={0} value={edit.priceYear} placeholder="e.g. 2999" onChange={(e) => setEdit({ ...edit, priceYear: e.target.value })} />
                  </label>
                  <label className="col gap-xxs">
                    <span className="t-caption-bold" style={{ opacity: 0.8 }}>Strike-through price (₹)</span>
                    <Input type="number" min={0} value={edit.oldPrice} placeholder="e.g. 9999" onChange={(e) => setEdit({ ...edit, oldPrice: e.target.value })} />
                  </label>
                </div>
                <label className="col gap-xxs">
                  <span className="t-caption-bold" style={{ opacity: 0.8 }}>Tagline</span>
                  <Input value={edit.tagline} onChange={(e) => setEdit({ ...edit, tagline: e.target.value })} />
                </label>
                <div className="row gap-xs">
                  <Button size="sm" onClick={() => { updatePlan(p.id, { price: Number(edit.price), priceYear: edit.priceYear, oldPrice: edit.oldPrice, tagline: edit.tagline }); setEdit(null) }}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
                </div>
              </div>
            )}

            {applyFor === p.id && (
              <div className="plan-edit col gap-sm">
                <span className="t-body-sm">Overwrite feature access & limits of all <strong>{countBy(p.id)}</strong> {p.id} agencies with this plan's current settings? Individual overrides will be replaced.</span>
                <div className="row gap-xs">
                  <Button size="sm" onClick={() => { app.applyPlanToAgencies(p.id); setApplyFor(null) }}>Apply to {countBy(p.id)} agencies</Button>
                  <Button size="sm" variant="secondary" onClick={() => setApplyFor(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Feature matrix ===== */}
      <Card>
        <div className="row-between wrap gap-sm mb-base">
          <div>
            <div className="dash-panel-title">Feature access matrix</div>
            <p className="t-body-sm c-steel mt-xs">Flip a switch to include or remove a feature from a plan. This is the plan default; individual agencies can still be fine-tuned on their own page.</p>
          </div>
          <div style={{ minWidth: 240 }}>
            <ListSearch value={q} onChange={setQ} placeholder="Search 140+ features…" count={groups.reduce((n, g) => n + g.features.length, 0)} />
          </div>
        </div>

        {/* Column header */}
        <div className="pm-head">
          <span className="pm-head-feature">Feature</span>
          {plans.map((p) => <span key={p.id} className="pm-head-plan">{p.name}</span>)}
        </div>

        {groups.map((g) => {
          const isOpen = openGroups[g.key]
          return (
            <div key={g.key} className="pm-group">
              <div className="pm-group-head" onClick={() => setOpenGroups((o) => ({ ...o, [g.key]: !o[g.key] }))}>
                <span className="feat-group-ic"><Icon name={g.icon} size={16} /></span>
                <div className="flex-1">
                  <div className="feat-group-name">{g.label}</div>
                  <div className="feat-group-count">{g.features.length} features</div>
                </div>
                <div className="pm-group-toggles" onClick={(e) => e.stopPropagation()}>
                  {plans.map((p) => {
                    const on = g.features.filter((f) => app.planFeatures(p.id)[f.key]).length
                    const allOn = on === g.features.length
                    return (
                      <button key={p.id} className="pm-group-all" title={`${p.name}: turn all ${allOn ? 'off' : 'on'}`} onClick={() => setGroup(p.id, g, !allOn)}>
                        {on}/{g.features.length}
                      </button>
                    )
                  })}
                </div>
                <span className={`feat-group-chev ${isOpen ? 'up' : ''}`}><Icon name="chevron" size={15} strokeWidth={2} /></span>
              </div>
              {isOpen && g.features.map((f) => (
                <div key={f.key} className="pm-row">
                  <div className="pm-row-feature">
                    <div className="feat-row-label">{f.label}</div>
                    <div className="feat-row-desc">{f.desc}</div>
                  </div>
                  {plans.map((p) => (
                    <div key={p.id} className="pm-row-cell">
                      <Switch on={!!app.planFeatures(p.id)[f.key]} onChange={(v) => app.setPlanFeature(p.id, f.key, v)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })}
      </Card>

      {/* ===== Limits matrix ===== */}
      <Card className="mt-lg">
        <div className="dash-panel-title mb-sm">Usage limits by plan</div>
        <p className="t-body-sm c-steel mb-base">Set each plan's ceilings. Use −1 (or the Unlimited switch) to remove a cap.</p>
        <div className="pm-head">
          <span className="pm-head-feature">Limit</span>
          {plans.map((p) => <span key={p.id} className="pm-head-plan">{p.name}</span>)}
        </div>
        {LIMIT_DEFS.map((l) => (
          <div key={l.key} className="pm-row">
            <div className="pm-row-feature">
              <div className="feat-row-label">{l.label}</div>
              <div className="feat-row-desc">{l.unit}</div>
            </div>
            {plans.map((p) => {
              const v = app.planLimits(p.id)[l.key] ?? 0
              const unlimited = v === -1
              return (
                <div key={p.id} className="pm-row-cell pm-limit-cell">
                  {unlimited
                    ? <span className="limit-inf">Unlimited</span>
                    : <Input className="limit-input" type="number" min={0} value={v} onChange={(e) => app.setPlanLimit(p.id, l.key, Number(e.target.value))} />}
                  <button className="pm-inf-toggle" onClick={() => app.setPlanLimit(p.id, l.key, unlimited ? (l.free || 100) : -1)} title="Toggle unlimited">
                    {unlimited ? 'Set limit' : '∞'}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </Card>
    </>
  )
}
