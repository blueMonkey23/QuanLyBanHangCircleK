export default function Dashboard() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Tổng quan</h2>
          <p>Thống kê nhanh về hoạt động cửa hàng.</p>
        </div>
        <button className="primary-button" type="button">Tạo báo cáo</button>
      </div>
      <div className="grid-3">
        <div className="card">
          <span className="card-label">Đơn hàng hôm nay</span>
          <strong className="card-value">128</strong>
        </div>
        <div className="card">
          <span className="card-label">Doanh thu</span>
          <strong className="card-value">245,000,000</strong>
        </div>
        <div className="card">
          <span className="card-label">Khách hàng</span>
          <strong className="card-value">36</strong>
        </div>
      </div>
    </section>
  )
}
