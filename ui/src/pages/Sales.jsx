export default function Sales() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Ban hang</h2>
          <p>Giao dien POS toi gian cho thu ngan.</p>
        </div>
        <button className="primary-button" type="button">Bat dau ca</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Danh sach san pham</h3>
          <p>Chon san pham de them vao gio hang.</p>
        </div>
        <div className="card">
          <h3>Gio hang</h3>
          <p>Chua co san pham nao.</p>
        </div>
      </div>
    </section>
  )
}
