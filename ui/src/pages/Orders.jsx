import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { formatCurrency, formatDate, readField, toArray } from '../utils/data'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    let alive = true
    async function loadOrders() {
      setLoading(true)
      setError('')
      try {
        const payload = await api.getOrders()
        const rows = toArray(payload)
        if (alive) {
          setOrders(rows)
        }
      } catch (err) {
        if (alive) {
          setError(err?.message || 'Không thể tải đơn hàng.')
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    loadOrders()
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!keyword) {
      return orders
    }

    const normalized = keyword.toLowerCase().trim()
    return orders.filter((order) => {
      const code = String(readField(order, ['maHoaDon', 'MaHoaDon', 'id'], '')).toLowerCase()
      return code.includes(normalized)
    })
  }, [keyword, orders])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Đơn hàng</h2>
          <p>Quản lý danh sách hóa đơn và trạng thái xử lý.</p>
        </div>
        <button className="primary-button" type="button">Tạo đơn hàng</button>
      </div>
      <div className="card">
        <div className="toolbar">
          <input
            placeholder="Tìm kiếm theo mã hóa đơn"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="ghost-button" type="button">Lọc</button>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const code = readField(order, ['maHoaDon', 'MaHoaDon', 'id'], '--')
                const customer = readField(order, ['tenKhachHang', 'TenKhachHang', 'customerName'], '--')
                const total = readField(order, ['tongTien', 'TongTien', 'total'], 0)
                const status = readField(order, ['trangThai', 'TrangThai', 'status'], '--')
                const createdAt = readField(order, ['ngayTao', 'NgayTao', 'createdAt'], '')

                return (
                  <tr key={code}>
                    <td>{code}</td>
                    <td>{customer}</td>
                    <td>{formatCurrency(total)}</td>
                    <td><span className="status-pill">{status}</span></td>
                    <td>{formatDate(createdAt)}</td>
                    <td>
                      <button className="tiny-button" type="button">Xem</button>
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>Không có dữ liệu.</td>
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
