import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { useAuth } from './useAuth'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isRegistration = mode === 'register'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(undefined)
    setPending(true)
    try {
      await (isRegistration ? register : login)({ email, password })
      navigate('/inbox')
    } catch {
      setError(isRegistration ? 'Could not create your account. Check your details or sign in if you already have an account.' : 'Could not sign you in. Check your details and try again.')
    } finally { setPending(false) }
  }

  return (
    <div className="mx-auto max-w-md">
      <section className="glass p-5 sm:p-6">
        <Logo />
        <p className="eyebrow mb-2 mt-5">Personal knowledge workspace</p>
        <h1 className="page-title">{isRegistration ? 'Create your account' : 'Sign in to Recall'}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{isRegistration ? 'Set up your workspace for links, notes, and code.' : 'Access your resources and continue your work.'}</p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="field-label">Email address<input className="field" autoComplete="email" placeholder="you@example.com" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" className="field pr-12" aria-describedby={isRegistration ? 'password-hint' : undefined} autoComplete={isRegistration ? 'new-password' : 'current-password'} minLength={isRegistration ? 12 : undefined} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} placeholder="Enter your password" />
              <button className="icon-button absolute right-1 top-1" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {isRegistration && <p id="password-hint" className="mt-2 text-[11px] text-muted">Use at least 12 characters.</p>}
          </div>
          {error && <p className="error-panel" role="alert">{error}</p>}
          <button className="btn-primary w-full" disabled={pending} type="submit">{pending ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />Please wait…</> : <>{isRegistration ? 'Create account' : 'Sign in'}<ArrowRight size={16} aria-hidden="true" /></>}</button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">{isRegistration ? 'Already have an account?' : 'New to Recall?'} <Link className="font-medium text-accent hover:underline" to={isRegistration ? '/login' : '/register'}>{isRegistration ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
      <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted"><LockKeyhole size={13} aria-hidden="true" />Your personal workspace</p>
    </div>
  )
}
