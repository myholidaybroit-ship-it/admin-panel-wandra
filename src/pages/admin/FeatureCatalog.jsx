import { useState } from 'react'
import { useApp } from '../../store/AdminContext'
import { PageHeader, Card, ListSearch } from '../../components/ui/UI'
import { StatCard } from '../../components/ui/Admin'
import { Icon } from '../../components/ui/icons'
import { FEATURE_GROUPS, ALL_FEATURES, FEATURE_COUNT } from '../../data/features'

export default function FeatureCatalog() {
  const { agencies, planFeatures } = useApp()
  const [q, setQ] = useState('')

  const freeMap = planFeatures('Free')
  const proMap = planFeatures('Pro')
  const freeInc = ALL_FEATURES.filter((f) => freeMap[f.key]).length
  const proOnly = ALL_FEATURES.filter((f) => proMap[f.key] && !freeMap[f.key]).length

  const s = q.trim().toLowerCase()
  const groups = FEATURE_GROUPS.map((g) => ({
    ...g,
    features: g.features.filter((f) => !s || f.label.toLowerCase().includes(s) || f.key.toLowerCase().includes(s) || f.desc.toLowerCase().includes(s)),
  })).filter((g) => g.features.length)

  const adoption = (key) => agencies.filter((a) => a.features?.[key]).length

  return (
    <>
      <PageHeader title="Feature Catalog" subtitle="The master registry of every capability you can grant per agency" />

      <div className="grid grid-4 mb-lg">
        <StatCard label="Total features" value={FEATURE_COUNT} sub={`${FEATURE_GROUPS.length} modules`} icon="layers" />
        <StatCard label="In Free plan" value={freeInc} sub="enabled by default" icon="check" />
        <StatCard label="Pro-only" value={proOnly} sub="upsell levers" tone="blue" icon="billing" />
        <StatCard label="Live tenants" value={agencies.length} sub="adoption tracked below" icon="users" />
      </div>

      <div className="mb-lg" style={{ maxWidth: 420 }}>
        <ListSearch value={q} onChange={setQ} placeholder="Search all features…" count={groups.reduce((n, g) => n + g.features.length, 0)} />
      </div>

      {groups.map((g) => (
        <Card key={g.key} className="mb-base">
          <div className="row gap-sm mb-base">
            <span className="feat-group-ic"><Icon name={g.icon} size={17} /></span>
            <div>
              <div className="feat-group-name">{g.label}</div>
              <div className="feat-group-count">{g.features.length} features</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th style={{ width: 200 }}>Key</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Free</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Pro</th>
                  <th style={{ textAlign: 'right', width: 130 }}>Adoption</th>
                </tr>
              </thead>
              <tbody>
                {g.features.map((f) => (
                  <tr key={f.key}>
                    <td>
                      <div className="feat-row-label">{f.label}</div>
                      <div className="feat-row-desc">{f.desc}</div>
                    </td>
                    <td><span className="feat-row-key">{f.key}</span></td>
                    <td style={{ textAlign: 'center' }}>{freeMap[f.key] ? <Icon name="check" size={15} /> : <span className="c-muted">—</span>}</td>
                    <td style={{ textAlign: 'center' }}>{proMap[f.key] ? <Icon name="check" size={15} /> : <span className="c-muted">—</span>}</td>
                    <td style={{ textAlign: 'right' }}><span className="t-body-sm c-steel">{adoption(f.key)} / {agencies.length}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </>
  )
}
