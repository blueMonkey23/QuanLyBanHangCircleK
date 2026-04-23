import { formatCurrency, formatPaymentMethod } from '../app-utils'

function CheckoutModal({
  show,
  subtotal,
  discountValue,
  checkoutVatPercent,
  vatValue,
  eventPromo,
  paymentMethod,
  grandTotal,
  onClose,
  onConfirm,
  busyAction,
}) {
  if (!show) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Thanh toán</p>
            <h3>Xác nhận thanh toán</h3>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="checkout-review">
          <div className="totals-card">
            <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div><span>Discount</span><strong>{formatCurrency(discountValue)}</strong></div>
            <div><span>VAT ({checkoutVatPercent}%)</span><strong>{formatCurrency(vatValue)}</strong></div>
            <div><span>Khuyến mãi</span><strong>{eventPromo || 'Không có'}</strong></div>
            <div><span>Thanh toán</span><strong>{formatPaymentMethod(paymentMethod)}</strong></div>
            <div className="totals-card__grand"><span>Thành tiền</span><strong>{formatCurrency(grandTotal)}</strong></div>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => void onConfirm()}
            disabled={busyAction === 'checkout'}
          >
            {busyAction === 'checkout' ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
