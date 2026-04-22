import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveSession } from '../api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const payload = await api.login({
        username: form.username,
        password: form.password,
      })
      const session = payload?.data || payload

      if (!session?.token) {
        throw new Error('Đăng nhập không thành công. Vui lòng thử lại.')
      }

      saveSession(session)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Không thể đăng nhập.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        <p>Sử dụng tài khoản quản trị để truy cập hệ thống.</p>
        <label>
          <span>Tài khoản</span>
          <input
            name="username"
            placeholder="Nhập tài khoản"
            value={form.username}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Mật khẩu</span>
          <input
            name="password"
            placeholder="Nhập mật khẩu"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button" type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  )
}
