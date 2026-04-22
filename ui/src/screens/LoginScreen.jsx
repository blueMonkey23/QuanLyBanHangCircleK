import { NoticeBar, MetricCard } from '../components/common'
import { logoPc } from '../app-config'

function LoginScreen({
  notice,
  handleLiveLogin,
  busyAction,
  loginForm,
  setLoginForm,
}) {
  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="login-hero__brand">
          <img src={logoPc} alt="PC logo" />
          <p className="eyebrow">PC Admin UI</p>
        </div>
        <h1>Dựng lại UI từ hồ sơ cá nhân.fig theo layout sáng, task bar xanh dương.</h1>
        <p>
          Giao diện mới gom lại các artboard `đơn hàng`, `báo cáo`, `POS`, `Add Roles`
          và `cài đặt` vào cùng một shell React để bạn test nhanh.
        </p>
        <div className="metric-row">
          <MetricCard eyebrow="01" value="Orders" label="Bảng đơn hàng" tone="red" />
          <MetricCard eyebrow="02" value="POS" label="Giỏ hàng & thanh toán" tone="blue" />
          <MetricCard eyebrow="03" value="Roles" label="Popup phân quyền" tone="green" />
        </div>
      </section>

      <form className="login-card" onSubmit={handleLiveLogin}>
        {notice.tone !== 'info' ? <NoticeBar notice={notice} /> : null}
        <div>
          <p className="eyebrow">Đăng nhập</p>
          <h2>Vào giao diện quản trị</h2>
        </div>

        <label>
          <span>Tên đăng nhập</span>
          <input
            value={loginForm.username}
            onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
          />
        </label>

        <label>
          <span>Mật khẩu</span>
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>

        <div className="editor-actions">
          <button className="primary-button" type="submit" disabled={busyAction === 'login'}>
            {busyAction === 'login' ? 'Đang kết nối...' : 'Đăng nhập'}
          </button>
        </div>

        <p className="login-tip">
          Chỉ tài khoản và mật khẩu hợp lệ mới vào được hệ thống.
        </p>
      </form>
    </div>
  )
}

export default LoginScreen
