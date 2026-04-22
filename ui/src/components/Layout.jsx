import { useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { clearSession, readSession } from '../api'

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const session = useMemo(() => readSession(), [])
  const userName = session?.user?.tenNguoiDung || session?.user?.username || 'Admin'

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [navigate, session])

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-frame">
      <Topbar
        onToggleSidebar={() => setIsCollapsed((prev) => !prev)}
        onLogout={handleLogout}
        userName={userName}
      />
      <div className={`app-shell${isCollapsed ? ' app-shell--collapsed' : ''}`}>
        <Sidebar collapsed={isCollapsed} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
