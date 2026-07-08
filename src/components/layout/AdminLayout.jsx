import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { Button } from '../ui/UI'
import { Icon } from '../ui/icons'
import './layout.css'
import './admin.css'

const NAV_TOP = [
  { to: '/app', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/app/agencies', label: 'Agencies & Users', icon: 'users' },
  { to: '/app/demo-requests', label: 'Demos', icon: 'calendar' },
]
const NAV_BILLING = [
  { to: '/app/transactions', label: 'Transactions', icon: 'invoices' },
  { to: '/app/subscriptions', label: 'Subscriptions', icon: 'refresh' },
]
const NAV_CONFIG = [
  { to: '/app/plans', label: 'Plans & Pricing', icon: 'billing' },
  { to: '/app/features', label: 'Feature Catalog', icon: 'layers' },
]
const NAV_BOTTOM = [
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
]

function Logo({ collapsed }) {
  return (
    <Link to="/app" className="brand" title="Wandra Admin Console">
      {collapsed
        ? <img className="logo-mark-side" src="/brand/wandra-mark.png" alt="Wandra" />
        : <img className="logo-lockup logo-side" src="/brand/wandra-logo.png" alt="Wandra — Admin Console" />}
    </Link>
  )
}

/* ⌘K — search agencies (anchored dropdown, not a modal) */
function SearchDropdown({ open, onClose }) {
  const nav = useNavigate()
  const { agencies } = useApp()
  const [q, setQ] = useState('')
  useEffect(() => { if (!open) setQ('') }, [open])
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  const s = q.trim().toLowerCase()
  const items = s
    ? agencies.filter((a) => [a.name, a.code, a.owner, a.email, a.city].some((f) => String(f || '').toLowerCase().includes(s))).slice(0, 8)
    : []
  const go = (to) => { nav(to); onClose() }
  return (
    <>
      <div className="pill-menu-scrim" onClick={onClose} />
      <div className="search-dd" onClick={(e) => e.stopPropagation()}>
        <div className="search-dd-input">
          <span className="search-modal-glyph"><Icon name="search" size={16} /></span>
          <input autoFocus placeholder="Search agencies by name, code, owner…" value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && items[0]) go(`/app/agencies/${items[0].id}`) }} />
          <button className="kbd-hint" onClick={onClose}>ESC</button>
        </div>
        {s ? (
          <div className="search-results">
            {items.length === 0 && <div className="search-empty t-body-sm c-muted">No agencies match “{q}”</div>}
            {items.map((a) => (
              <button key={a.id} className="search-row" onClick={() => go(`/app/agencies/${a.id}`)}>
                <span className="search-row-ic"><Icon name="users" size={14} /></span>
                <span className="search-row-title">{a.name}</span>
                <span className="search-row-sub">{a.code}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="search-hint t-caption c-muted">Jump to any agency. Press Enter to open the top result.</div>
        )}
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { admin, agencies, ready, authed, logout } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('wa-sidebar') === 'collapsed')

  const toggleSidebar = () => setCollapsed((c) => { localStorage.setItem('wa-sidebar', c ? 'expanded' : 'collapsed'); return !c })

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') setAcctOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // auth guard — bounce to login once bootstrap resolves without a session
  useEffect(() => { if (ready && !authed) nav('/', { replace: true }) }, [ready, authed, nav])
  if (!ready || !authed || !admin) {
    return <div className="admin-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="t-body c-muted">Loading console…</div>
    </div>
  }

  const doLogout = () => { logout(); nav('/', { replace: true }) }
  const activeCount = agencies.filter((a) => a.status === 'active').length

  const renderNav = (items) => items.map((n) => (
    <NavLink key={n.to} to={n.to} end={n.end} className="side-link" title={collapsed ? n.label : undefined} onClick={() => setOpen(false)}>
      <span className="side-ic"><Icon name={n.icon} /></span>
      <span className="side-txt">{n.label}</span>
    </NavLink>
  ))

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-top"><Logo collapsed={collapsed} /></div>
        <nav className="sidebar-nav">
          {renderNav(NAV_TOP)}
          {!collapsed && <div className="side-section-label">Billing</div>}
          {renderNav(NAV_BILLING)}
          {!collapsed && <div className="side-section-label">Configuration</div>}
          {renderNav(NAV_CONFIG)}
          {!collapsed && <div className="side-section-label">Account</div>}
          {renderNav(NAV_BOTTOM)}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-plan-card">
            <div className="row-between">
              <span className="side-plan-name">Platform</span>
              <span className="side-plan-usage">{activeCount}/{agencies.length} active</span>
            </div>
            <div className="side-plan-bar"><span style={{ width: `${(activeCount / Math.max(1, agencies.length)) * 100}%` }} /></div>
            <Button as="a" href="/app/agencies/new" size="sm" className="w-full mt-sm">+ New Agency</Button>
          </div>
        </div>
      </aside>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}

      <div className="main-col">
        <div className="promo-banner admin-promo">
          <span className="promo-copy"><strong>Super Admin</strong> — you are managing the entire Wandra platform. All actions affect live tenants.</span>
        </div>
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen((o) => !o)}>☰</button>
          <button className="collapse-btn" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <Icon name="panel" size={17} />
          </button>
          <div className="search-anchor">
            <button className="search-pill topbar-search search-btn" onClick={() => setSearchOpen((o) => !o)}>
              <Icon name="search" size={15} />
              <span className="search-btn-label">Search agencies…</span>
              <span className="kbd-hint">⌘K</span>
            </button>
            <button className="btn-icon search-btn-sm" onClick={() => setSearchOpen((o) => !o)} title="Search"><Icon name="search" size={16} /></button>
            <SearchDropdown open={searchOpen} onClose={() => setSearchOpen(false)} />
          </div>
          <div className="topbar-right">
            <span className="admin-env-chip">PRODUCTION</span>
            <div className="acct-wrap">
              <button className="acct" onClick={() => setAcctOpen((o) => !o)}>
                <span className="acct-avatar"><img src="/brand/wandra-mark.png" alt="" /></span>
                <div className="acct-meta">
                  <span className="acct-name">{admin.name}</span>
                  <span className="acct-role">{admin.role}</span>
                </div>
                <span className={`acct-chev ${acctOpen ? 'up' : ''}`}><Icon name="chevron" size={14} strokeWidth={2} /></span>
              </button>
              {acctOpen && (
                <>
                  <div className="acct-scrim" onClick={() => setAcctOpen(false)} />
                  <div className="acct-menu">
                    <div className="acct-menu-head">
                      <span className="acct-avatar"><img src="/brand/wandra-mark.png" alt="" /></span>
                      <div>
                        <div className="acct-name">{admin.name}</div>
                        <div className="acct-menu-email">{admin.email} · {admin.role}</div>
                      </div>
                    </div>
                    <div className="acct-menu-sep" />
                    <NavLink to="/app/settings" className="acct-menu-item" onClick={() => setAcctOpen(false)}>
                      <span className="side-ic"><Icon name="settings" size={16} /></span>Settings
                    </NavLink>
                    <div className="acct-menu-sep" />
                    <button type="button" className="acct-menu-item acct-menu-logout" onClick={() => { setAcctOpen(false); doLogout() }}>
                      <span className="side-ic"><Icon name="logout" size={16} /></span>Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}
