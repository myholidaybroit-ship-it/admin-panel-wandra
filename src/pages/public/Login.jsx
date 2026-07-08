import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import { Button, Field, Input } from '../../components/ui/UI'
import '../../components/layout/admin.css'

export default function Login() {
  const nav = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await login(email, pw); nav('/app') }
    catch (ex) { setErr(ex.message || 'Sign-in failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="lg-shell">
      <div className="lg-visual">
        <img className="lg-visual-logo" src="/brand/wandra-logo.png" alt="Wandra" />
        <div className="lg-visual-quote">The control room for the entire Wandra travel platform.</div>
        <div className="lg-visual-foot">Admin Console · manage agencies, plans & feature access</div>
      </div>
      <div className="lg-panel">
        <form className="lg-form" onSubmit={submit}>
          <div className="lg-badge">● Super Admin</div>
          <h1 className="lg-title">Sign in</h1>
          <p className="lg-sub">Restricted access — platform operators only.</p>
          <div className="col gap-md">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@wandra.travel" required />
            </Field>
            <Field label="Password">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required />
            </Field>
            {err && <div style={{ color: '#dc2626', fontSize: 13 }}>{err}</div>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Enter console'}</Button>
          </div>
          <div className="lg-hint">Protected by Wandra · all sessions are audited</div>
        </form>
      </div>
    </div>
  )
}
