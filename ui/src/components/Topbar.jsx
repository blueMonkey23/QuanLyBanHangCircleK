export default function Topbar({ onToggleSidebar, onLogout, userName }) {
  return (
    <header className="app-topbar">
      <button className="icon-button" type="button" onClick={onToggleSidebar}>
        ☰
      </button>
      <div>
        <h1>Hệ thống quản lý</h1>
        <p>Tối giản - đỏ trắng - tập trung vào vận hành</p>
      </div>
      <div className="topbar-user">
        <div className="user-chip">{userName}</div>
        <button className="ghost-button" type="button" onClick={onLogout}>Đăng xuất</button>
      </div>
    </header>
  )
}
