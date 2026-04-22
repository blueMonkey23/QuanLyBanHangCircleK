import { StatusPill } from '../components/common'

function SettingsScreen({
  profileInitials,
  currentUser,
  settingsForm,
  setSettingsForm,
  permissionNames,
  handleSaveSettings,
  busyAction,
}) {
  return (
    <section className="section-grid section-grid--settings">
      <article className="panel panel--accent">
        <div className="profile-card">
          <div className="profile-card__avatar">{profileInitials}</div>
          <div>
            <p className="eyebrow">Hồ sơ quản trị</p>
            <h3>{currentUser?.hoTen || 'Admin Circle K'}</h3>
            <span>{currentUser?.username || 'admin.circlek'}</span>
          </div>
        </div>

        <div className="stack-list">
          <div className="stack-list__item">
            <div>
              <strong>Điện thoại</strong>
              <p>{currentUser?.dienThoai || settingsForm.soDienThoai}</p>
            </div>
            <StatusPill tone="neutral">Live</StatusPill>
          </div>
          <div className="stack-list__item">
            <div>
              <strong>Quyền hiện có</strong>
              <p>{permissionNames.length} quyền</p>
            </div>
            <StatusPill tone="info">Admin</StatusPill>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Cấu hình cửa hàng</p>
            <h3>Cài đặt hệ thống</h3>
          </div>
        </div>

        <form className="editor-form" onSubmit={handleSaveSettings}>
          <label>
            <span>Tên cửa hàng</span>
            <input
              value={settingsForm.tenCuaHang}
              onChange={(event) => setSettingsForm((current) => ({ ...current, tenCuaHang: event.target.value }))}
            />
          </label>

          <label>
            <span>Địa chỉ</span>
            <input
              value={settingsForm.diaChi}
              onChange={(event) => setSettingsForm((current) => ({ ...current, diaChi: event.target.value }))}
            />
          </label>

          <div className="form-split">
            <label>
              <span>Điện thoại</span>
              <input
                value={settingsForm.soDienThoai}
                onChange={(event) => setSettingsForm((current) => ({ ...current, soDienThoai: event.target.value }))}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={settingsForm.email}
                onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
          </div>

          <div className="form-split">
            <label>
              <span>VAT (%)</span>
              <input
                type="number"
                value={settingsForm.vatPercent}
                onChange={(event) => setSettingsForm((current) => ({ ...current, vatPercent: event.target.value }))}
              />
            </label>
            <label>
              <span>Logo</span>
              <input
                value={settingsForm.logo}
                onChange={(event) => setSettingsForm((current) => ({ ...current, logo: event.target.value }))}
              />
            </label>
          </div>

          <label>
            <span>Nội dung hóa đơn</span>
            <textarea
              rows={4}
              value={settingsForm.noiDungHoaDon}
              onChange={(event) => setSettingsForm((current) => ({ ...current, noiDungHoaDon: event.target.value }))}
            />
          </label>

          <button className="primary-button" type="submit" disabled={busyAction === 'save-settings'}>
            {busyAction === 'save-settings' ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </form>
      </article>
    </section>
  )
}

export default SettingsScreen
