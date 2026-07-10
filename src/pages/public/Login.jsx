import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AdminContext'
import '../../components/layout/admin.css'

export default function Login() {
  const nav = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      <div className="lg-panel">
        <div className="lg-box">
          <img className="lg-logo" src="/brand/wandra-logo.png" alt="Wandra — Travel Software" />

          <div className="lg-card">
            <div className="lg-card-head">
              <div className="lg-badge">Super Admin</div>
              <h1 className="lg-title">Sign in</h1>
              <p className="lg-sub">Restricted access to the Wandra operations console.</p>
            </div>

            <form className="lg-form" onSubmit={submit}>
              <label className="lg-field">
                <span>Email</span>
                <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@wandra.travel" required />
              </label>
              <label className="lg-field">
                <span>Password</span>
                <span className="lg-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
                </span>
              </label>
              {err && <div className="lg-error" role="alert">{err}</div>}
              <button className="lg-submit" type="submit" disabled={busy}>{busy ? 'Checking session…' : 'Enter console'}</button>
            </form>

            <div className="lg-note">Secure session · All console access is audited</div>
          </div>
        </div>
      </div>
    </div>
  )
}
