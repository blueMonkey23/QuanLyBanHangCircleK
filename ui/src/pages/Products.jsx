import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatCurrency, readField, toArray } from '../utils/data'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function loadProducts() {
      setLoading(true)
      setError('')
      try {
        const payload = await api.getProducts()
        const rows = toArray(payload)
        if (alive) {
          setProducts(rows)
        }
      } catch (err) {
        if (alive) {
          setError(err?.message || 'Không thể tải sản phẩm.')
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Sản phẩm</h2>
          <p>Quản lý danh mục và tồn kho.</p>
        </div>
        <button className="primary-button" type="button">Thêm sản phẩm</button>
      </div>
      <div className="card">
        {error ? <p className="error-text">{error}</p> : null}
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const id = readField(product, ['maSanPham', 'MaSanPham', 'id'], index + 1)
                const code = readField(product, ['maSanPham', 'MaSanPham', 'code'], `SP-${id}`)
                const name = readField(product, ['tenSanPham', 'TenSanPham', 'name'], '--')
                const price = readField(product, ['donGia', 'DonGia', 'price'], 0)
                const stock = readField(product, ['soLuong', 'SoLuong', 'stock'], 0)
                const status = Number(stock) > 0 ? 'Còn hàng' : 'Hết hàng'

                return (
                  <tr key={id}>
                    <td>{code}</td>
                    <td>{name}</td>
                    <td>{formatCurrency(price)}</td>
                    <td>{stock}</td>
                    <td><span className="status-pill">{status}</span></td>
                  </tr>
                )
              })}
              {!loading && products.length === 0 ? (
                <tr>
                  <td colSpan={5}>Không có dữ liệu.</td>
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
