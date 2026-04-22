import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatCurrency, readField, toArray } from '../utils/data'

export default function Reports() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function loadReport() {
      setLoading(true)
      setError('')
      try {
        const payload = await api.getRevenueReport()
        const data = toArray(payload)
        if (alive) {
          setRows(data)
        }
      } catch (err) {
        if (alive) {
          setError(err?.message || 'Không thể tải báo cáo.')
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    loadReport()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Báo cáo</h2>
          <p>Theo dõi KPI và hiệu suất kinh doanh.</p>
        </div>
        <button className="primary-button" type="button">Tải báo cáo</button>
      </div>
      <div className="card">
        {error ? <p className="error-text">{error}</p> : null}
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kỳ</th>
                <th>Số hóa đơn</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const period = readField(row, ['period', 'kyBaoCao', 'ky'], `Kỳ ${index + 1}`)
                const count = readField(row, ['invoiceCount', 'soHoaDon', 'count'], 0)
                const revenue = readField(row, ['revenue', 'doanhThu', 'total'], 0)

                return (
                  <tr key={period}>
                    <td>{period}</td>
                    <td>{count}</td>
                    <td>{formatCurrency(revenue)}</td>
                  </tr>
                )
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={3}>Không có dữ liệu.</td>
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
