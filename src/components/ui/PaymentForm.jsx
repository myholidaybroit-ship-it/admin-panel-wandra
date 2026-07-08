import { useEffect, useRef, useState } from 'react'
import { Button, Field, Input, Textarea, PillSelect, Card } from './UI'
import { Icon } from './icons'
import { useApp } from '../../store/AdminContext'
import { PAYMENT_METHODS, computeAmount } from '../../utils/billing'
import { fileToDataUrl } from '../../utils/image'
import { api } from '../../api'

/* Inline secure payment capture (no modal). Calls onConfirm(pay).
   `defaultPrice` (the plan's managed price) pre-fills the Original price field. */
export default function PaymentForm({ onConfirm, onCancel, cta = 'Confirm payment', defaultPrice }) {
  const { proPrice, toast } = useApp()
  const basePrice = defaultPrice != null ? defaultPrice : proPrice()
  const fileRef = useRef(null)
  const priceTouched = useRef(false)
  const [f, setF] = useState({
    method: 'UPI',
    originalPrice: basePrice || 0,
    discountPercent: 0,
    reference: '',
    note: '',
    proof: null,
    proofKind: null,
    proofName: '',
  })
  const [err, setErr] = useState('')

  // Once the managed plan price is known (or changes), pre-fill it — unless the
  // operator has already typed a custom price. Guards against the field reading 0
  // if plans hadn't finished loading at first render.
  useEffect(() => {
    if (!priceTouched.current && basePrice > 0 && Number(f.originalPrice) !== Number(basePrice)) {
      setF((x) => ({ ...x, originalPrice: basePrice }))
    }
  }, [basePrice]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => {
    if (k === 'originalPrice') priceTouched.current = true
    setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }))
  }
  const { discount, amount } = computeAmount(f.originalPrice, f.discountPercent)
  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url, kind } = await fileToDataUrl(file, 1400, 0.8)
      const stored = await api.upload(url, 'proofs') // → S3 URL (falls back to data-URL)
      setF((x) => ({ ...x, proof: stored, proofKind: kind, proofName: file.name }))
    } catch { toast('Could not read that file') }
  }

  const confirm = () => {
    setErr('')
    if (!f.method) return setErr('Select a payment method.')
    if (amount <= 0) return setErr('Amount must be greater than zero.')
    if (!f.reference.trim()) return setErr('Add a payment reference / transaction ID.')
    if (!f.proof) return setErr('Attach a payment screenshot / proof — required to keep billing authentic.')
    onConfirm({
      method: f.method,
      originalPrice: Number(f.originalPrice) || 0,
      discountPercent: Number(f.discountPercent) || 0,
      discount,
      amount,
      reference: f.reference.trim(),
      note: f.note.trim(),
      proof: f.proof,
      proofKind: f.proofKind,
      proofName: f.proofName,
      status: 'paid',
    })
  }

  return (
    <Card className="col gap-md">
      <div className="grid grid-2" style={{ gap: 14 }}>
        <Field label="Payment method" required>
          <PillSelect value={f.method} options={PAYMENT_METHODS} onChange={set('method')} />
        </Field>
        <Field label="Reference / txn ID" required>
          <Input value={f.reference} onChange={set('reference')} placeholder="e.g. UPI/NEFT/rzp id" />
        </Field>
      </div>

      <div className="grid grid-2" style={{ gap: 14 }}>
        <Field label="Original price (₹)" required>
          <Input type="number" min={0} value={f.originalPrice} onChange={set('originalPrice')} />
        </Field>
        <Field label="Discount (%)" hint="0 if none">
          <Input type="number" min={0} max={100} value={f.discountPercent} onChange={set('discountPercent')} />
        </Field>
      </div>

      <div className="pay-breakdown">
        <div className="pay-line"><span>Original price</span><span>{inr(f.originalPrice)}</span></div>
        <div className="pay-line"><span>Discount {f.discountPercent > 0 ? `(${f.discountPercent}%)` : ''}</span><span className={discount ? 'c-success' : ''}>− {inr(discount)}</span></div>
        <div className="pay-line pay-total"><span>Amount received</span><span>{inr(amount)}</span></div>
      </div>

      <Field label="Payment screenshot / proof" required hint="Stored with the invoice for verification">
        <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
        {!f.proof ? (
          <button type="button" className="pay-upload" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={18} />
            <span>Upload screenshot or PDF</span>
          </button>
        ) : (
          <div className="pay-proof">
            {f.proofKind === 'image'
              ? <img src={f.proof} alt="proof" />
              : <div className="pay-proof-file"><Icon name="file" size={20} /> {f.proofName}</div>}
            <div className="pay-proof-actions">
              <span className="t-caption c-steel">{f.proofName}</span>
              <button type="button" className="feat-mini-btn" onClick={() => fileRef.current?.click()}>Replace</button>
              <button type="button" className="feat-mini-btn" onClick={() => setF((x) => ({ ...x, proof: null, proofKind: null, proofName: '' }))}>Remove</button>
            </div>
          </div>
        )}
      </Field>

      <Field label="Internal note" hint="optional">
        <Textarea value={f.note} onChange={set('note')} placeholder="Anything to remember about this payment…" />
      </Field>

      {err && <div className="set-err"><Icon name="x" size={13} /> {err}</div>}

      <div className="row gap-sm">
        <Button onClick={confirm}>{cta}</Button>
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </Card>
  )
}
