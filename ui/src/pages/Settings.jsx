import { useEffect, useState } from 'react'
import { api } from '../api'
import { toObject } from '../utils/data'

const EMPTY_FORM = {
  tenCuaHang: '',
  diaChi: '',
  soDienThoai: '',
  email: '',
  vatPercent: '',
  noiDungHoaDon: '',
}

export default function Settings() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let alive = true
    async function loadSettings() {
      setLoading(true)
      setError('')
      try {
        const payload = await api.getSystemSettings()
        const data = toObject(payload)
        if (alive && data) {
          setForm((prev) => ({
            ...prev,
            tenCuaHang: data.tenCuaHang || data.TenCuaHang || '',
            diaChi: data.diaChi || data.DiaChi || '',
            soDienThoai: data.soDienThoai || data.SoDienThoai || '',
            email: data.email || data.Email || '',
            vatPercent: data.vatPercent || data.VatPercent || '',
            noiDungHoaDon: data.noiDungHoaDon || data.NoiDungHoaDon || '',
          }))
        }
      } catch (err) {
        if (alive) {
          setError(err?.message || 'Không thể tải cấu hình.')
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    loadSettings()
    return () => {
      alive = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.updateSystemSettings(form)
      setSuccess('Đã lưu cấu hình.')
    } catch (err) {
      setError(err?.message || 'Không thể lưu cấu hình.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Cài đặt</h2>
          <p>Cấu hình thông tin cửa hàng và hệ thống.</p>
        </div>
        <button className="primary-button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Thông tin cửa hàng</h3>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
          <label>
            <span>Tên cửa hàng</span>
            <input name="tenCuaHang" placeholder="Circle K" value={form.tenCuaHang} onChange={handleChange} />
          </label>
          <label>
            <span>Địa chỉ</span>
            <input name="diaChi" placeholder="Quận 1" value={form.diaChi} onChange={handleChange} />
          </label>
          <label>
            <span>Số điện thoại</span>
            <input name="soDienThoai" placeholder="0900 000 000" value={form.soDienThoai} onChange={handleChange} />
          </label>
          <label>
            <span>Email</span>
            <input name="email" placeholder="admin@circlek.vn" value={form.email} onChange={handleChange} />
          </label>
        </div>
        <div className="card">
          <h3>Hóa đơn</h3>
          <label>
            <span>VAT</span>
            <input name="vatPercent" placeholder="8%" value={form.vatPercent} onChange={handleChange} />
          </label>
          <label>
            <span>Nội dung hóa đơn</span>
            <input name="noiDungHoaDon" placeholder="Cảm ơn quý khách" value={form.noiDungHoaDon} onChange={handleChange} />
          </label>
          {loading ? <p className="muted-text">Đang tải dữ liệu...</p> : null}
        </div>
      </div>
    </section>
  )
}
