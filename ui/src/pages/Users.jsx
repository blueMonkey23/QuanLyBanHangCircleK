import { useEffect, useState } from 'react'
import { api } from '../api'
import { readField, toArray } from '../utils/data'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function loadUsers() {
      setLoading(true)
      setError('')
      try {
        const payload = await api.getAccounts()
        const rows = toArray(payload)
        if (alive) {
          setUsers(rows)
        }
      } catch (err) {
        if (alive) {
          setError(err?.message || 'Không thể tải người dùng.')
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    loadUsers()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Người dùng</h2>
          <p>Quản lý tài khoản và phân quyền.</p>
        </div>
        <button className="primary-button" type="button">Thêm người dùng</button>
      </div>
      <div className="card">
        {error ? <p className="error-text">{error}</p> : null}
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const name = readField(user, ['tenNguoiDung', 'TenNguoiDung', 'fullName'], `User ${index + 1}`)
                const role = readField(user, ['vaiTro', 'VaiTro', 'roleName'], '--')
                const status = readField(user, ['trangThai', 'TrangThai', 'status'], 'Hoạt động')

                return (
                  <tr key={`${name}-${index}`}>
                    <td>{name}</td>
                    <td>{role}</td>
                    <td><span className="status-pill">{status}</span></td>
                    <td><button className="tiny-button" type="button">Sửa</button></td>
                  </tr>
                )
              })}
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4}>Không có dữ liệu.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {loading ? <p className="muted-text">Đang tải dữ liệu...</p> : null}
      </div>
    </section>
  )
}
