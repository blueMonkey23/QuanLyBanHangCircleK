import { EmptyState, MetricCard, StatusPill } from '../components/common'

function UsersScreen({
  setShowRoleModal,
  openAccountModal,
  accounts,
  roles,
  permissionNamesCatalog,
  userSearch,
  setUserSearch,
  filteredUsers,
}) {
  return (
    <>
      <section className="section-grid section-grid--hero">
        <div className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Nhân sự & phân quyền</p>
              <h3>Quản lý người dùng</h3>
            </div>
            <div className="toolbar-row">
              <button className="ghost-button" type="button" onClick={() => setShowRoleModal(true)}>
                Add Roles
              </button>
              <button className="primary-button" type="button" onClick={() => openAccountModal()}>
                Thêm tài khoản
              </button>
            </div>
          </div>

          <div className="metric-row">
            <MetricCard eyebrow="Tài khoản" value={accounts.length} label="Đang hiển thị" tone="blue" />
            <MetricCard eyebrow="Vai trò" value={roles.length} label="Role khả dụng" tone="red" />
            <MetricCard eyebrow="Quyền" value={permissionNamesCatalog.length} label="Permission catalog" tone="green" />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Danh sách tài khoản</p>
            <h3>Bảng người dùng</h3>
          </div>
          <label className="searchbox searchbox--compact">
            <span>🔍</span>
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Tìm user, tên hoặc vai trò"
            />
          </label>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="Không có người dùng phù hợp"
            message="Đổi từ khóa tìm kiếm hoặc thêm tài khoản mới."
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((account) => (
                  <tr key={account.id}>
                    <td>{account.username}</td>
                    <td>{account.fullName}</td>
                    <td>{account.roleLabel}</td>
                    <td>{account.phone || '--'}</td>
                    <td>
                      <StatusPill tone={account.status === 'Hoạt động' ? 'success' : 'warning'}>
                        {account.status}
                      </StatusPill>
                    </td>
                    <td>
                      <button className="tiny-button" type="button" onClick={() => openAccountModal(account)}>
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default UsersScreen
