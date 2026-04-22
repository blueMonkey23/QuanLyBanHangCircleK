import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page">
      <div className="card">
        <h2>Khong tim thay trang</h2>
        <p>Duong dan khong ton tai.</p>
        <Link className="ghost-button" to="/dashboard">Ve trang chu</Link>
      </div>
    </section>
  )
}
