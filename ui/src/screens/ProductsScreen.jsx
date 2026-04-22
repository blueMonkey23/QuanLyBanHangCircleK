import { StatusPill } from '../components/common'
import { formatCurrency } from '../app-utils'

function ProductsScreen({
  resetProductForm,
  productSearch,
  setProductSearch,
  productCategoryFilter,
  setProductCategoryFilter,
  categories,
  filteredProductRows,
  handleSelectProductForEditor,
  productForm,
  setProductForm,
  suppliers,
  handleSaveProduct,
  busyAction,
  handleDeleteProduct,
}) {
  return (
    <section className="section-grid section-grid--products">
      <article className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Danh mục sản phẩm</p>
            <h3>Quản lý sản phẩm</h3>
          </div>
          <button className="primary-button" type="button" onClick={resetProductForm}>
            Tạo mới
          </button>
        </div>

        <div className="toolbar-row">
          <label className="searchbox">
            <span>🔍</span>
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Tìm theo mã, tên hoặc danh mục"
            />
          </label>
          <select
            value={productCategoryFilter}
            onChange={(event) => setProductCategoryFilter(event.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="product-grid">
          {filteredProductRows.map((product) => (
            <button
              key={product.id}
              className="product-card"
              type="button"
              onClick={() => handleSelectProductForEditor(product)}
            >
              <div className="product-card__media">{product.glyph}</div>
              <div className="product-card__copy">
                <StatusPill tone={product.stock > 0 ? 'success' : 'danger'}>
                  {product.status}
                </StatusPill>
                <strong>{product.name}</strong>
                <span>{product.categoryEmoji} {product.categoryLabel}</span>
                <p>
                  <b>{formatCurrency(product.price)}</b>
                  <small>{formatCurrency(product.comparePrice)}</small>
                </p>
              </div>
            </button>
          ))}
        </div>
      </article>

      <aside className="panel panel--editor">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Form cập nhật</p>
            <h3>Tạo mới / chỉnh sửa</h3>
          </div>
        </div>

        <form className="editor-form" onSubmit={handleSaveProduct}>
          <label>
            <span>Mã sản phẩm</span>
            <input
              value={productForm.code}
              onChange={(event) => setProductForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="SP001"
            />
          </label>

          <label>
            <span>Tên sản phẩm</span>
            <input
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Tên sản phẩm"
              required
            />
          </label>

          <div className="form-split">
            <label>
              <span>Đơn giá</span>
              <input
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
              />
            </label>
            <label>
              <span>Giá so sánh</span>
              <input
                type="number"
                value={productForm.comparePrice}
                onChange={(event) => setProductForm((current) => ({ ...current, comparePrice: event.target.value }))}
              />
            </label>
          </div>

          <div className="form-split">
            <label>
              <span>Số lượng</span>
              <input
                type="number"
                value={productForm.stock}
                onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
              />
            </label>
            <label>
              <span>Danh mục</span>
              <select
                value={productForm.categoryId}
                onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Nhà cung cấp</span>
            <select
              value={productForm.supplierId}
              onChange={(event) => setProductForm((current) => ({ ...current, supplierId: event.target.value }))}
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.label}
                </option>
              ))}
            </select>
          </label>

          <div className="editor-actions">
            <button className="primary-button" type="submit" disabled={busyAction === 'save-product'}>
              {busyAction === 'save-product' ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
            <button className="ghost-button" type="button" onClick={resetProductForm}>
              Reset
            </button>
          </div>

          {productForm.id ? (
            <button
              className="ghost-button ghost-button--danger"
              type="button"
              onClick={() => void handleDeleteProduct(productForm.id)}
              disabled={busyAction === `delete-product-${productForm.id}`}
            >
              Xóa mềm
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  )
}

export default ProductsScreen
