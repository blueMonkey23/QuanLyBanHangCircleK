import { formatCompactNumber, formatCurrency, formatDateTime } from '../app-utils'

function OrderDetailModal({ selectedInvoice, onPrint, onClose }) {
  if (!selectedInvoice) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card modal-card--wide">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Hóa đơn</p>
            <h3>Chi tiết đơn hàng #{selectedInvoice.orderId}</h3>
          </div>

          <div className="editor-actions">
            <button className="primary-button" type="button" onClick={onPrint}>
              In hóa đơn
            </button>
            <button className="ghost-button" type="button" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        <div className="invoice-sheet">
          <section className="invoice-sheet__hero">
            <div className="invoice-sheet__brand">
              <div>
                <p className="eyebrow">{selectedInvoice.storeName}</p>
                <h3>Hóa đơn bán hàng</h3>
                <p>{selectedInvoice.address}</p>
                <p>{selectedInvoice.phone} • {selectedInvoice.email}</p>
              </div>

              <div className="invoice-sheet__code">
                <span>Mã đơn</span>
                <strong>#{selectedInvoice.orderId}</strong>
                <p>{formatDateTime(selectedInvoice.createdAt)}</p>
              </div>
            </div>

            <div className="invoice-sheet__meta">
              <div className="invoice-sheet__meta-item">
                <span>Khách hàng</span>
                <strong>{selectedInvoice.customerName}</strong>
              </div>
              <div className="invoice-sheet__meta-item">
                <span>Nhân viên</span>
                <strong>{selectedInvoice.assigneeName}</strong>
              </div>
              <div className="invoice-sheet__meta-item">
                <span>Thanh toán</span>
                <strong>{selectedInvoice.paymentMethod}</strong>
              </div>
            </div>
          </section>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Giảm giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{formatCompactNumber(item.quantity)}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.discount)}</td>
                    <td>{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-sheet__footer">
            <article className="invoice-sheet__note">
              <p className="eyebrow">Nội dung hóa đơn</p>
              <p>{selectedInvoice.note}</p>
            </article>

            <div className="totals-card">
              <div><span>Tạm tính</span><strong>{formatCurrency(selectedInvoice.subtotal)}</strong></div>
              <div><span>Giảm giá</span><strong>{formatCurrency(selectedInvoice.discountTotal)}</strong></div>
              <div><span>Trước VAT</span><strong>{formatCurrency(selectedInvoice.netAmount)}</strong></div>
              <div>
                <span>VAT ({selectedInvoice.vatPercent}%)</span>
                <strong>{formatCurrency(selectedInvoice.vatAmount)}</strong>
              </div>
              <div className="totals-card__grand">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(selectedInvoice.grandTotal)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
