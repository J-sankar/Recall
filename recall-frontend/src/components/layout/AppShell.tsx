import { ArrowUpRight, ChevronRight, Home, Inbox, Layers3, LogOut, Menu, Moon, Plus, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { Logo } from '../Logo'
import { useTheme } from '../themeContext'

const navigation = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Inbox', to: '/inbox', icon: Inbox },
  { label: 'All resources', to: '/resources', icon: Layers3 },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isAuthenticated, logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState(false)

  async function signOut() {
    setSigningOut(true)
    setError(false)
    try { await logout(); onNavigate?.() } catch { setError(true) } finally { setSigningOut(false) }
  }

  return (
    <div className="flex min-h-full flex-col p-4">
      <div className="flex items-center justify-between px-2 pt-2">
        <Link aria-label="Recall home" to="/" onClick={onNavigate}><Logo /></Link>
        {onNavigate && <button aria-label="Close navigation" className="icon-button" onClick={onNavigate}><X size={18} /></button>}
      </div>
      <div className="mb-4 mt-5 border-y border-line px-2 py-3">
        <p className="text-xs font-medium">Personal workspace</p>
        <p className="mt-1 text-[11px] text-muted">Links, notes & code</p>
      </div>
      <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.2em] text-muted">Workspace</p>
      <nav aria-label="Primary navigation" className="space-y-1">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={to === '/'} key={to} to={to} onClick={onNavigate}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.7} />{label}
          </NavLink>
        ))}
      </nav>
      <Link className="btn-primary mt-4 w-full" to={isAuthenticated ? '/resources/new' : '/register'} onClick={onNavigate}>
        <Plus size={17} aria-hidden="true" />{isAuthenticated ? 'New resource' : 'Create account'}
      </Link>
      <div className="mt-auto pt-10">
        <div className="mb-3 border-b border-line pb-3">
          <button className="nav-item w-full" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            <span className="ml-auto rounded-md border border-line px-1.5 py-0.5 text-[9px] uppercase">{theme}</span>
          </button>
        </div>
        {isAuthenticated ? (
          <div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-sm text-ink" aria-hidden="true">{user?.email[0]?.toUpperCase() ?? 'R'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">Your workspace</p>
                <p className="mt-1 truncate text-[10px] text-muted" title={user?.email}>{user?.email ?? 'Loading account…'}</p>
              </div>
              <button className="icon-button shrink-0" aria-label="Sign out" title="Sign out" disabled={signingOut} onClick={() => void signOut()}><LogOut size={16} /></button>
            </div>
            {error && <p className="mt-3 text-xs text-muted" role="alert">Could not sign out. Please try again.</p>}
          </div>
        ) : (
          <Link className="nav-item justify-between" onClick={onNavigate} to="/login">Sign in to Recall <ArrowUpRight size={16} aria-hidden="true" /></Link>
        )}
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const drawer = useRef<HTMLDialogElement>(null)
  const title = pathname === '/' ? 'Overview' : pathname === '/inbox' ? 'Inbox' : pathname === '/resources/new' ? 'New resource' : pathname.startsWith('/resources/') ? 'Resource details' : pathname === '/resources' ? 'All resources' : 'Your account'

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => { if (media.matches) drawer.current?.close() }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    document.title = `${title} · Recall`
    window.scrollTo(0, 0)
  }, [pathname, title])

  return (
    <div className="relative isolate min-h-screen text-ink">
      <a className="btn-primary fixed left-4 top-4 z-50 -translate-y-24 focus:translate-y-0" href="#main-content">Skip to content</a>
      <div className="ambient" aria-hidden="true" />
      <aside className="sidebar-surface fixed inset-y-0 left-0 z-20 hidden w-60 overflow-y-auto border-r border-line lg:block"><Sidebar /></aside>
      <dialog ref={drawer} className="mobile-drawer sidebar-surface" aria-label="Navigation" onClick={(event) => { if (event.target === event.currentTarget) drawer.current?.close() }}>
        <Sidebar onNavigate={() => drawer.current?.close()} />
      </dialog>
      <div className="lg:pl-60">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-line px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="icon-button lg:hidden" aria-label="Open navigation" aria-haspopup="dialog" onClick={() => drawer.current?.showModal()}><Menu size={20} /></button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-xs">
              <Link className="hidden text-muted hover:text-ink sm:inline" to="/">Workspace</Link>
              <ChevronRight className="hidden text-muted sm:block" size={12} aria-hidden="true" />
              {pathname.startsWith('/resources/') && <><Link className="hidden text-muted hover:text-ink sm:inline" to="/resources">Resources</Link><ChevronRight className="hidden text-muted sm:block" size={12} aria-hidden="true" /></>}
              <span aria-current="page">{title}</span>
            </nav>
          </div>
          <span className="hidden font-mono text-[9px] uppercase tracking-[.14em] text-muted sm:block">Personal knowledge workspace</span>
        </header>
        <main id="main-content" tabIndex={-1} className={`mx-auto outline-none ${pathname === '/' ? 'max-w-7xl px-6 py-8 sm:px-10 sm:py-10' : 'max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6'}`}>
          <div className="enter" key={pathname}>{children}</div>
        </main>
      </div>
    </div>
  )
}
