import { EmptyState, StatusPill } from '../components/common'
import { formatCurrency } from '../app-utils'

function SalesScreen({
  salesSearch,
  setSalesSearch,
  salesCategoryFilter,
  setSalesCategoryFilter,
  categories,
  filteredSalesProducts,
  selectedProductId,
  setSelectedProductId,
  setSaleQuantity,
  selectedProduct,
  saleQuantity,
  cartNote,
  setCartNote,
  handleAddToCart,
  cartLines,
  changeCartQuantity,
  discountAmount,
  setDiscountAmount,
  eventPromo,
  setEventPromo,
  paymentMethod,
  setPaymentMethod,
  subtotal,
  discountValue,
  vatValue,
  grandTotal,
  setShowCheckoutModal,
  clearCart,
}) {
  return (
    <>
      <section className="section-grid section-grid--sales">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">POS</p>
              <h3>Hóa đơn bán hàng</h3>
            </div>
            <label className="searchbox searchbox--compact">
              <span>🔍</span>
              <input
                value={salesSearch}
                onChange={(event) => setSalesSearch(event.target.value)}
                placeholder="Tìm sản phẩm"
              />
            </label>
          </div>

          <div className="category-pills">
            <button
              className={`category-pill ${salesCategoryFilter === 'all' ? 'category-pill--active' : ''}`}
              type="button"
              onClick={() => setSalesCategoryFilter('all')}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-pill ${String(salesCategoryFilter) === String(category.id) ? 'category-pill--active' : ''}`}
                type="button"
                onClick={() => setSalesCategoryFilter(category.id)}
              >
                {category.emoji} {category.label}
              </button>
            ))}
          </div>

          <div className="product-grid product-grid--sales">
            {filteredSalesProducts.map((product) => (
              <button
                key={product.id}
                className={`product-card ${String(selectedProductId) === String(product.id) ? 'product-card--selected' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedProductId(String(product.id))
                  setSaleQuantity(1)
                }}
              >
                <div className="product-card__media">{product.glyph}</div>
                <div className="product-card__copy">
                  <strong>{product.name}</strong>
                  <span>{product.categoryEmoji} {product.categoryLabel}</span>
                  <p>
                    <b>{formatCurrency(product.price)}</b>
                    <small>{formatCurrency(product.comparePrice)}</small>
                  </p>
                  <StatusPill tone={product.stock > 0 ? 'success' : 'danger'}>
                    {product.status}
                  </StatusPill>
                </div>
              </button>
            ))}
          </div>
        </article>

        <aside className="panel panel--editor">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Chi tiết sản phẩm</p>
              <h3>Tạo mới vào giỏ</h3>
            </div>
          </div>

          {selectedProduct ? (
            <>
              <div className="detail-card">
                <div className="detail-card__hero">{selectedProduct.glyph}</div>
                <div>
                  <strong>{selectedProduct.name}</strong>
                  <p>{selectedProduct.code} · {selectedProduct.categoryLabel}</p>
                  <span>{formatCurrency(selectedProduct.price)}</span>
                </div>
              </div>

              <div className="qty-row">
                <button type="button" onClick={() => setSaleQuantity((current) => Math.max(1, current - 1))}>
                  -
                </button>
                <strong>{saleQuantity}</strong>
                <button type="button" onClick={() => setSaleQuantity((current) => current + 1)}>
                  +
                </button>
              </div>

              <label className="editor-form">
                <span>Ghi chú</span>
                <textarea
                  value={cartNote}
                  onChange={(event) => setCartNote(event.target.value)}
                  rows={4}
                  placeholder="Ghi chú cho hóa đơn hoặc sản phẩm"
                />
              </label>

              <button className="primary-button" type="button" onClick={handleAddToCart}>
                🛒 Thêm vào giỏ
              </button>
            </>
          ) : (
            <EmptyState
              title="Chưa chọn sản phẩm"
              message="Chọn một sản phẩm ở lưới bên trái để bắt đầu tạo hóa đơn."
            />
          )}
        </aside>
      </section>

      <section className="section-grid section-grid--checkout">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Giỏ hàng & thanh toán</p>
              <h3>Hàng trong giỏ</h3>
            </div>
          </div>

          {cartLines.length === 0 ? (
            <EmptyState
              title="Giỏ hàng đang trống"
              message="Thêm sản phẩm từ khối bên trên để kiểm tra flow thanh toán."
            />
          ) : (
            <div className="cart-list">
              {cartLines.map((line) => (
                <div key={line.id} className="cart-item">
                  <div>
                    <strong>{line.name}</strong>
                    <p>{formatCurrency(line.price)} x {line.quantity}</p>
                  </div>
                  <div className="cart-item__actions">
                    <button type="button" onClick={() => changeCartQuantity(line.id, -1)}>-</button>
                    <span>{line.quantity}</span>
                    <button type="button" onClick={() => changeCartQuantity(line.id, 1)}>+</button>
                  </div>
                  <b>{formatCurrency(line.lineTotal)}</b>
                </div>
              ))}
            </div>
          )}
        </article>

        <aside className="panel panel--accent">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Thanh toán</p>
              <h3>Xác nhận đơn</h3>
            </div>
          </div>

          <label className="editor-form">
            <span>Discount</span>
            <input
              type="number"
              value={discountAmount}
              onChange={(event) => setDiscountAmount(event.target.value)}
            />
          </label>

          <label className="editor-form">
            <span>Khuyến mãi event</span>
            <input
              value={eventPromo}
              onChange={(event) => setEventPromo(event.target.value)}
              placeholder="Tên event hoặc mã ưu đãi"
            />
          </label>

          <label className="editor-form">
            <span>Phương thức thanh toán</span>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="TIEN_MAT">Tiền mặt</option>
              <option value="THE">Thẻ</option>
              <option value="MOMO">Momo</option>
            </select>
          </label>

          <div className="totals-card">
            <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div><span>Giảm giá</span><strong>{formatCurrency(discountValue)}</strong></div>
            <div><span>VAT</span><strong>{formatCurrency(vatValue)}</strong></div>
            <div className="totals-card__grand"><span>Thành tiền</span><strong>{formatCurrency(grandTotal)}</strong></div>
          </div>

          <div className="editor-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              disabled={cartLines.length === 0}
            >
              🛒 Thanh toán
            </button>
            <button className="ghost-button" type="button" onClick={clearCart}>
              Xóa giỏ
            </button>
          </div>
        </aside>
      </section>
    </>
  )
}

export default SalesScreen
