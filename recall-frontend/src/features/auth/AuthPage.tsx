import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const isRegistration = mode === 'register'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    try {
      await (isRegistration ? register : login)({ email, password })
      navigate('/inbox')
    } catch {
      setError('We could not sign you in. Check your details and try again.')
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-950">{isRegistration ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-sm text-slate-600">{isRegistration ? 'Start collecting the knowledge you want to keep.' : 'Sign in to your Recall workspace.'}</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-slate-700">Email<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="block text-sm font-medium text-slate-700">Password<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" minLength={12} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800" type="submit">{isRegistration ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="mt-5 text-sm text-slate-600">{isRegistration ? 'Already have an account?' : 'Need an account?'} <Link className="font-medium text-indigo-600" to={isRegistration ? '/login' : '/register'}>{isRegistration ? 'Sign in' : 'Register'}</Link></p>
    </section>
  )
}
