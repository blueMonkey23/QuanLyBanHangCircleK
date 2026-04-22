import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/orders', label: 'Đơn hàng' },
  { to: '/products', label: 'Sản phẩm' },
  { to: '/sales', label: 'Bán hàng' },
  { to: '/reports', label: 'Báo cáo' },
  { to: '/users', label: 'Người dùng' },
  { to: '/settings', label: 'Cài đặt' },
]

export default function Sidebar({ collapsed }) {
  return (
    <aside className={`app-sidebar${collapsed ? ' app-sidebar--collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">CK</div>
        <div>
          <strong>Circle K</strong>
          <span>Quản trị cửa hàng</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-dot" />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Phiên làm việc</p>
        <strong>Admin</strong>
      </div>
    </aside>
  )
}
