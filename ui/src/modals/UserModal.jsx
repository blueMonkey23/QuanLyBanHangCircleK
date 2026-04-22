function UserModal({
  show,
  accountForm,
  setAccountForm,
  roles,
  onClose,
  onSubmit,
  busyAction,
}) {
  if (!show) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Người dùng</p>
            <h3>{accountForm.id ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            X
          </button>
        </div>

        <form className="editor-form" onSubmit={onSubmit}>
          <label>
            <span>Username</span>
            <input
              value={accountForm.username}
              onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))}
              required
            />
          </label>

          {!accountForm.id ? (
            <label>
              <span>Password</span>
              <input
                value={accountForm.password}
                onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
          ) : null}

          <label>
            <span>Họ tên</span>
            <input
              value={accountForm.fullName}
              onChange={(event) => setAccountForm((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>

          <div className="form-split">
            <label>
              <span>Vai trò</span>
              <select
                value={accountForm.roleId}
                onChange={(event) => setAccountForm((current) => ({ ...current, roleId: event.target.value }))}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Điện thoại</span>
              <input
                value={accountForm.phone}
                onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={busyAction === 'save-account'}>
            {busyAction === 'save-account' ? 'Đang lưu...' : 'Lưu tài khoản'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UserModal
