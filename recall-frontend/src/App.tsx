import { Link, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { EmptyState } from './components/ui/EmptyState'
import { AuthPage } from './features/auth/AuthPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { InboxPage } from './features/resources/InboxPage'
import { ResourceCreatePage } from './features/resources/ResourceCreatePage'
import { ResourceDetailPage } from './features/resources/ResourceDetailPage'
import { ResourceListPage } from './features/resources/ResourceListPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<AuthPage key="login" mode="login" />} path="/login" />
        <Route element={<AuthPage key="register" mode="register" />} path="/register" />
        <Route element={<ProtectedRoute />}>
          <Route element={<InboxPage />} path="/inbox" />
          <Route element={<ResourceListPage />} path="/resources" />
          <Route element={<ResourceDetailPage />} path="/resources/:resourceId" />
          <Route element={<ResourceCreatePage />} path="/resources/new" />
        </Route>
        <Route path="*" element={<EmptyState title="Page not found" description="Check the address or return to your workspace."><Link className="btn-primary" to="/">Back to home</Link></EmptyState>} />
      </Routes>
    </AppShell>
  )
}

export default App
