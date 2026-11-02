import { Search } from 'lucide-react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { AuthPage } from './features/auth/AuthPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { useAuth } from './features/auth/useAuth'
import { HomePage } from './pages/HomePage'

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Inbox', to: '/inbox' },
  { label: 'All resources', to: '/resources' },
]

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 text-slate-600">This area will be introduced in a later milestone.</p>
    </section>
  )
}

function App() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <NavLink className="text-xl font-bold tracking-tight" to="/">Recall</NavLink>
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button aria-label="Search resources" className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600" type="button">
              <Search aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-slate-200 px-1 text-xs sm:inline">⌘K</kbd>
            </button>
            {isAuthenticated ? (
              <button className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline" onClick={() => void logout()} type="button">
                Sign out{user ? ` (${user.email})` : ''}
              </button>
            ) : (
              <NavLink className="text-sm font-medium text-indigo-600" to="/login">Sign in</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<AuthPage mode="login" />} path="/login" />
          <Route element={<AuthPage mode="register" />} path="/register" />
          <Route element={<ProtectedRoute />}>
            <Route element={<PlaceholderPage title="Inbox" />} path="/inbox" />
            <Route element={<PlaceholderPage title="All resources" />} path="/resources" />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
