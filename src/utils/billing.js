/* ============================================================
   Billing helpers — money, dates, invoice math
   ============================================================ */
export const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'Card', 'Razorpay', 'PayPal', 'Cash', 'Cheque', 'Other']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addMonths(iso, n) {
  const d = new Date((iso || todayISO()) + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

/* whole days from today to the date (negative = past) */
export function daysUntil(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  const t = new Date(); t.setHours(0, 0, 0, 0)
  return Math.round((d - t) / 86400000)
}

export function monthLabel(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function prettyDate(iso) {
  if (!iso) return '—'
  // accept both 'YYYY-MM-DD' and full ISO timestamps
  const s = String(iso).slice(0, 10)
  const d = new Date(s + 'T00:00:00')
  if (isNaN(d)) return String(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/* original price + discount% → { discount, amount } */
export function computeAmount(original, discountPct) {
  const o = Math.max(0, Number(original) || 0)
  const p = Math.min(100, Math.max(0, Number(discountPct) || 0))
  const discount = Math.round((o * p) / 100)
  return { discount, amount: o - discount }
}
