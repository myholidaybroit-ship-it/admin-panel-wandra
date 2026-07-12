import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, isAuthed, setToken } from '../api'
import { defaultFeaturesForPlan, defaultLimitsForPlan } from '../data/features'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

/**
 * Admin store — now backed by the Wandra backend (/api/admin) instead of
 * localStorage. State is bootstrapped from the API on load and every mutation
 * persists through the API, updating local state from the server response.
 */
export function AppProvider({ children }) {
  const [agencies, setAgencies] = useState([])
  const [plans, setPlans] = useState([])
  const [demoRequests, setDemoRequests] = useState([])
  const [transactions, setTransactions] = useState([])
  const [supportSettings, setSupportSettings] = useState(null)
  const [supportInquiries, setSupportInquiries] = useState([])
  const [admin, setAdmin] = useState(null)
  const [toasts, setToasts] = useState([])
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(isAuthed())

  const toast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  /* ---------- bootstrap ---------- */
  const refreshAgencies = useCallback(async () => {
    const { items } = await api.get('/agencies')
    setAgencies(items)
  }, [])

  const bootstrap = useCallback(async () => {
    const [ag, pl, dm, tx, me, ss, si] = await Promise.all([
      api.get('/agencies'), api.get('/plans'), api.get('/demos'),
      api.get('/transactions'), api.get('/auth/me'), api.get('/support/settings'),
      api.get('/support/inquiries'),
    ])
    setAgencies(ag.items); setPlans(pl.items); setDemoRequests(dm.items)
    setTransactions(tx.items); setAdmin(me.admin); setSupportSettings(ss); setSupportInquiries(si.items)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!isAuthed()) { setReady(true); return }
      try { await bootstrap(); if (alive) setAuthed(true) }
      catch { setToken(''); if (alive) setAuthed(false) }
      finally { if (alive) setReady(true) }
    })()
    return () => { alive = false }
  }, [bootstrap])

  async function login(email, password) {
    const me = await api.login(email, password)
    setAdmin(me)
    await bootstrap()
    setAuthed(true)
    return me
  }
  function logout() {
    api.logout(); setAuthed(false); setAgencies([]); setTransactions([]); setDemoRequests([])
    setSupportSettings(null); setSupportInquiries([])
  }

  /* ---------- plan defaults (read from loaded plans) ---------- */
  const planFeatures = useCallback((planId) => {
    const p = plans.find((x) => x.id === planId || x.key === planId)
    return p?.features || defaultFeaturesForPlan(planId)
  }, [plans])
  const planLimits = useCallback((planId) => {
    const p = plans.find((x) => x.id === planId || x.key === planId)
    return p?.limits || defaultLimitsForPlan(planId)
  }, [plans])
  const proPlan = () => plans.find((p) => p.key === 'Pro' || p.id === 'Pro') || {}
  const proPrice = () => Number(proPlan().price) || 999                              // monthly rate
  const proAnnualDiscount = () => Number(proPlan().annualDiscountPercent) || 0       // % off the yearly total
  const proBilledYearly = () => (proPlan().billingCycle || 'yearly') === 'yearly'
  const proAnnualBase = () => proPrice() * 12                                        // 12 months, before discount
  const proAnnual = () => Math.round(proAnnualBase() * (1 - proAnnualDiscount() / 100)) // amount billed once a year

  const replaceAgency = (a) => setAgencies((l) => l.map((x) => (x.id === a.id ? a : x)))

  /* ---------- Agency CRUD ---------- */
  async function addAgency(data) {
    const rec = await api.post('/agencies', data)
    setAgencies((a) => [rec, ...a])
    if (admin?.notifyNewAgency) toast(`New agency created — ${rec.name} (${rec.code})`)
    return rec
  }
  /* fetch a single agency incl. its (sensitive) owner login password */
  async function getAgency(id) { return api.get(`/agencies/${id}`) }
  async function updateAgency(id, patch) { replaceAgency(await api.patch(`/agencies/${id}`, patch)) }
  async function removeAgency(id) { await api.del(`/agencies/${id}`); setAgencies((a) => a.filter((x) => x.id !== id)); toast('Agency deleted') }
  async function setAgencyStatus(id, status) {
    replaceAgency(await api.patch(`/agencies/${id}/status`, { status }))
    toast(status === 'suspended' ? 'Agency suspended' : status === 'active' ? 'Agency reactivated' : `Status: ${status}`)
  }
  async function setFeature(id, key, value) { replaceAgency(await api.patch(`/agencies/${id}/features`, { key, value })) }
  async function setFeatures(id, patch) { replaceAgency(await api.patch(`/agencies/${id}/features`, { patch })) }
  async function resetFeatures(id) { replaceAgency(await api.post(`/agencies/${id}/features/reset`)); toast('Reset to current plan defaults') }
  async function setLimit(id, key, value) { replaceAgency(await api.patch(`/agencies/${id}/limits`, { key, value })) }
  async function resetAgencyPassword(id, password) { await api.post(`/agencies/${id}/password`, { password }); toast('Agency password reset') }

  /* ---------- per-agency CRM roles (read-only in the CRM — provisioned here) ---------- */
  async function listAgencyRoles(id) { const r = await api.get(`/agencies/${id}/roles`); return r.items }
  async function createAgencyRole(id, name, perms) { return api.post(`/agencies/${id}/roles`, { name, perms }) }
  async function setAgencyRolePerm(id, roleId, key, value) { return api.patch(`/agencies/${id}/roles/${roleId}`, { key, value }) }
  async function removeAgencyRole(id, roleId) { await api.del(`/agencies/${id}/roles/${roleId}`) }

  /* ---------- per-agency CRM users (paid seats ₹999/user/mo — managed here) ---------- */
  async function listAgencyUsers(id) { const r = await api.get(`/agencies/${id}/users`); return r.items }
  async function createAgencyUser(id, data) { return api.post(`/agencies/${id}/users`, data) }
  async function updateAgencyUser(id, userId, patch) { return api.patch(`/agencies/${id}/users/${userId}`, patch) }
  async function removeAgencyUser(id, userId) { await api.del(`/agencies/${id}/users/${userId}`) }

  /* ---------- Plans ---------- */
  const replacePlan = (p) => setPlans((l) => l.map((x) => (x.id === p.id ? p : x)))
  async function updatePlan(planId, patch) { replacePlan(await api.patch(`/plans/${planId}`, patch)); toast('Plan updated') }
  async function setPlanFeature(planId, key, value) { replacePlan(await api.patch(`/plans/${planId}/features`, { key, value })) }
  async function setPlanFeatures(planId, patch) { replacePlan(await api.patch(`/plans/${planId}/features`, { patch })) }
  async function setPlanLimit(planId, key, value) { replacePlan(await api.patch(`/plans/${planId}/limits`, { key, value })) }
  async function resetPlanToCatalog(planId) { replacePlan(await api.post(`/plans/${planId}/reset`)); toast(`${planId} plan reset to catalog defaults`) }
  async function applyPlanToAgencies(planId) {
    const { count } = await api.post(`/plans/${planId}/apply`)
    await refreshAgencies()
    toast(`Applied ${planId} plan to ${count} agenc${count === 1 ? 'y' : 'ies'}`)
    return count
  }

  /* ---------- Billing / subscriptions / renewals ---------- */
  async function assignProPlan(agencyId, pay) {
    const { agency, transaction } = await api.post(`/agencies/${agencyId}/activate-pro`, pay)
    replaceAgency(agency); setTransactions((t) => [transaction, ...t])
    toast(`Pro plan activated — ${agency.name} · ${transaction.code}`)
    return transaction
  }
  async function downgradeToFree(agencyId) { const a = await api.post(`/agencies/${agencyId}/downgrade`); replaceAgency(a); toast(`${a.name} moved to Free`) }
  async function requestRenewal(agencyId) { replaceAgency(await api.post(`/agencies/${agencyId}/renewal/request`)); toast('Renewal request sent to agency') }
  async function cancelRenewalRequest(agencyId) { replaceAgency(await api.post(`/agencies/${agencyId}/renewal/cancel`)); toast('Renewal request withdrawn') }
  async function respondRenewal(agencyId, answer) { replaceAgency(await api.post(`/agencies/${agencyId}/renewal/respond`, { answer })); toast(answer === 'accepted' ? 'Agency agreed to renew' : 'Agency declined renewal') }
  async function recordRenewal(agencyId, pay) {
    const { agency, transaction } = await api.post(`/agencies/${agencyId}/renewal/record`, pay)
    replaceAgency(agency); setTransactions((t) => [transaction, ...t])
    toast(`Renewal recorded — ${agency.name} · ${transaction.code}`)
    return transaction
  }

  /* ---------- Demos ---------- */
  async function addDemo(data) { const rec = await api.post('/demos', data); setDemoRequests((d) => [rec, ...d]); toast('Demo logged'); return rec }
  async function updateDemo(id, patch) { const rec = await api.patch(`/demos/${id}`, patch); setDemoRequests((d) => d.map((x) => (x.id === id ? rec : x))) }
  async function removeDemo(id) { await api.del(`/demos/${id}`); setDemoRequests((d) => d.filter((x) => x.id !== id)); toast('Demo entry removed') }

  /* ---------- Vendor support ---------- */
  async function updateSupportSettings(patch) {
    const settings = await api.patch('/support/settings', patch)
    setSupportSettings(settings)
    toast('Support details saved')
    return settings
  }
  async function updateSupportInquiry(id, patch) {
    const inquiry = await api.patch(`/support/inquiries/${id}`, patch)
    setSupportInquiries((items) => items.map((item) => item.id === id ? inquiry : item))
    return inquiry
  }

  /* ---------- Admin account ---------- */
  async function updateAdmin(patch) { const { admin: a } = await api.patch('/auth/profile', patch); setAdmin(a) }
  async function updatePassword(current, next) {
    try { await api.post('/auth/password', { current, next }); toast('Password updated'); return true }
    catch { return false }
  }
  async function resetAdminPassword(next) { await api.post('/auth/reset-password', { next }); toast('Password reset') }

  const value = {
    ready, authed, login, logout,
    agencies, plans, demoRequests, admin, transactions, supportSettings, supportInquiries, toasts,
    inr, toast,
    planFeatures, planLimits,
    addAgency, getAgency, updateAgency, removeAgency, setAgencyStatus,
    setFeature, setFeatures, resetFeatures, setLimit, resetAgencyPassword,
    listAgencyRoles, createAgencyRole, setAgencyRolePerm, removeAgencyRole,
    listAgencyUsers, createAgencyUser, updateAgencyUser, removeAgencyUser,
    updatePlan, setPlanFeature, setPlanFeatures, setPlanLimit, resetPlanToCatalog, applyPlanToAgencies,
    assignProPlan, downgradeToFree,
    requestRenewal, cancelRenewalRequest, respondRenewal, recordRenewal, proPrice,
    proPlan, proAnnualDiscount, proBilledYearly, proAnnualBase, proAnnual,
    addDemo, updateDemo, removeDemo,
    updateSupportSettings, updateSupportInquiry,
    setAdmin, updateAdmin, updatePassword, resetAdminPassword,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
