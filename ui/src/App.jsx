import { useEffect, useState } from 'react'
import { api } from './api'
import './App.css'

const initialAccountForm = {
  username: '',
  password: '',
  maVaiTro: '',
  hoTen: '',
  dienThoai: '',
}

const initialProductForm = {
  tenSanPham: '',
  gia: '',
  soLuong: '',
  maDanhMuc: '',
  maNCC: '',
}

const initialOrderForm = {
  maNhanVien: '',
  phuongThucThanhToan: 'TIEN_MAT',
  items: [{ maSanPham: '', soLuong: '1' }],
}

const initialReportFilters = {
  fromDate: '',
  toDate: '',
  groupBy: 'day',
  limit: '5',
}

function readField(record, ...keys) {
  for (const key of keys) {
    if (record && record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }

  return null
}

function toBooleanLike(value) {
  if (
    value === true ||
    value === 1 ||
    value === '1' ||
    value === 'true'
  ) {
    return true
  }

  if (
    value === false ||
    value === 0 ||
    value === '0' ||
    value === 'false' ||
    value === null
  ) {
    return false
  }

  if (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.data) &&
    value.type === 'Buffer'
  ) {
    return value.data[0] === 1
  }

  return Boolean(value)
}

function formatMoney(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateTime(value) {
  if (!value) {
    return 'Chưa có dữ liệu'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function extractErrorMessage(error) {
  if (error?.payload?.message) {
    return error.payload.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Đã xảy ra lỗi không xác định.'
}

function ReferenceField({
  label,
  value,
  onChange,
  options,
  idKeys,
  labelKeys,
  placeholder,
}) {
  const hasOptions = options.length > 0

  return (
    <label className="field">
      <span>{label}</span>
      {hasOptions ? (
        <select value={value} onChange={onChange} required>
          <option value="">{placeholder}</option>
          {options.map((option) => {
            const id = readField(option, ...idKeys)
            const text = readField(option, ...labelKeys)

            return (
              <option key={id} value={id}>
                {id} - {text}
              </option>
            )
          })}
        </select>
      ) : (
        <input
          type="number"
          min="1"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
      )}
    </label>
  )
}

function StatCard({ label, value, tone, hint }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p className="stat-card__label">{label}</p>
      <strong className="stat-card__value">{value}</strong>
      <p className="stat-card__hint">{hint}</p>
    </article>
  )
}

function SectionHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-heading__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-heading__description">{description}</p>
      </div>
      {actions ? <div className="section-heading__actions">{actions}</div> : null}
    </div>
  )
}

function EmptyState({ message }) {
  return <div className="empty-state">{message}</div>
}

function App() {
  const [accounts, setAccounts] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState({ soHoaDon: 0, tongDoanhThu: 0 })
  const [revenueRows, setRevenueRows] = useState([])
  const [topProductRows, setTopProductRows] = useState([])
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)

  const [accountForm, setAccountForm] = useState(initialAccountForm)
  const [productForm, setProductForm] = useState(initialProductForm)
  const [orderForm, setOrderForm] = useState(initialOrderForm)
  const [reportFilters, setReportFilters] = useState(initialReportFilters)

  const [booting, setBooting] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState({
    tone: 'info',
    message: 'Kết nối dashboard với gateway và nạp dữ liệu khởi động.',
  })

  async function loadDashboard({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true)
    } else {
      setBooting(true)
    }

    const results = await Promise.allSettled([
      api.getAccounts(),
      api.getRoles(),
      api.getPermissions(),
      api.getProducts(),
      api.getCategories(),
      api.getSuppliers(),
      api.getOrders(),
      api.getInvoiceSummary({
        fromDate: reportFilters.fromDate,
        toDate: reportFilters.toDate,
      }),
    ])

    const [
      accountsResult,
      rolesResult,
      permissionsResult,
      productsResult,
      categoriesResult,
      suppliersResult,
      ordersResult,
      summaryResult,
    ] = results

    if (accountsResult.status === 'fulfilled') setAccounts(accountsResult.value)
    if (rolesResult.status === 'fulfilled') setRoles(rolesResult.value)
    if (permissionsResult.status === 'fulfilled') setPermissions(permissionsResult.value)
    if (productsResult.status === 'fulfilled') setProducts(productsResult.value)
    if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
    if (suppliersResult.status === 'fulfilled') setSuppliers(suppliersResult.value)
    if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value)
    if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value)

    const rejected = results
      .filter((result) => result.status === 'rejected')
      .map((result) => extractErrorMessage(result.reason))

    if (rejected.length > 0) {
      setNotice({
        tone: 'error',
        message: `Có ${rejected.length} request chưa tải được: ${rejected.join(' | ')}`,
      })
    } else {
      setNotice({
        tone: 'success',
        message: 'Dashboard đã đồng bộ dữ liệu từ gateway.',
      })
    }

    setBooting(false)
    setRefreshing(false)
  }

  async function loadReports() {
    setReportLoading(true)

    try {
      const [revenue, topProducts, invoiceSummary] = await Promise.all([
        api.getRevenueReport({
          fromDate: reportFilters.fromDate,
          toDate: reportFilters.toDate,
          groupBy: reportFilters.groupBy,
        }),
        api.getTopProductsReport({
          fromDate: reportFilters.fromDate,
          toDate: reportFilters.toDate,
          limit: reportFilters.limit,
        }),
        api.getInvoiceSummary({
          fromDate: reportFilters.fromDate,
          toDate: reportFilters.toDate,
        }),
      ])

      setRevenueRows(revenue)
      setTopProductRows(topProducts)
      setSummary(invoiceSummary)
      setNotice({
        tone: 'success',
        message: 'Khối báo cáo đã được làm mới theo bộ lọc hiện tại.',
      })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: extractErrorMessage(error),
      })
    } finally {
      setReportLoading(false)
    }
  }

  async function loadOrderDetail(maHoaDon) {
    setDetailLoading(true)

    try {
      const detail = await api.getOrderDetail(maHoaDon)
      setSelectedOrderDetail(detail)
    } catch (error) {
      setNotice({
        tone: 'error',
        message: extractErrorMessage(error),
      })
    } finally {
      setDetailLoading(false)
    }
  }

  async function runAction(actionKey, action, onSuccess) {
    setBusyAction(actionKey)

    try {
      await action()
      await loadDashboard({ silent: true })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setNotice({
        tone: 'error',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  useEffect(() => {
    void loadDashboard()
    void loadReports()
  }, [])

  const roleDictionary = roles.reduce((accumulator, role) => {
    const roleId = Number(readField(role, 'MaVaiTro', 'maVaiTro'))
    accumulator[roleId] = readField(role, 'TenVaiTro', 'tenVaiTro')
    return accumulator
  }, {})

  const activeProducts = products.filter(
    (product) => !toBooleanLike(readField(product, 'IsDeleted', 'isDeleted')),
  )

  const deletedProducts = products.length - activeProducts.length
  const activeAccounts = accounts.filter(
    (account) => !toBooleanLike(readField(account, 'IsDeleted', 'isDeleted')),
  )

  function handleAccountSubmit(event) {
    event.preventDefault()

    const payload = {
      username: accountForm.username.trim(),
      password: accountForm.password,
      maVaiTro: Number(accountForm.maVaiTro),
      hoTen: accountForm.hoTen.trim(),
      dienThoai: accountForm.dienThoai.trim(),
    }

    void runAction('account-create', async () => {
      await api.createAccount(payload)
      setNotice({
        tone: 'success',
        message: `Đã tạo tài khoản ${payload.username}.`,
      })
    }, () => {
      setAccountForm(initialAccountForm)
    })
  }

  function handleProductSubmit(event) {
    event.preventDefault()

    const payload = {
      tenSanPham: productForm.tenSanPham.trim(),
      gia: Number(productForm.gia),
      soLuong: Number(productForm.soLuong),
      maDanhMuc: Number(productForm.maDanhMuc),
      maNCC: Number(productForm.maNCC),
    }

    void runAction('product-create', async () => {
      await api.createProduct(payload)
      setNotice({
        tone: 'success',
        message: `Đã thêm sản phẩm ${payload.tenSanPham}.`,
      })
    }, () => {
      setProductForm(initialProductForm)
    })
  }

  function handleOrderSubmit(event) {
    event.preventDefault()

    const payload = {
      maNhanVien: Number(orderForm.maNhanVien),
      phuongThucThanhToan: orderForm.phuongThucThanhToan,
      items: orderForm.items.map((item) => ({
        maSanPham: Number(item.maSanPham),
        soLuong: Number(item.soLuong),
      })),
    }

    void runAction('order-create', async () => {
      await api.createOrder(payload)
      setNotice({
        tone: 'success',
        message: 'Hóa đơn mới đã được tạo và tồn kho đã được cập nhật.',
      })
      setSelectedOrderDetail(null)
    }, () => {
      setOrderForm(initialOrderForm)
      void loadReports()
    })
  }

  function addOrderItem() {
    setOrderForm((current) => ({
      ...current,
      items: [...current.items, { maSanPham: '', soLuong: '1' }],
    }))
  }

  function removeOrderItem(index) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function updateOrderItem(index, key, value) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }))
  }

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__content">
          <p className="masthead__eyebrow">Circle K Control Room</p>
          <h1>Bảng điều phối cho gateway và 4 service nghiệp vụ</h1>
          <p className="masthead__lead">
            Một màn hình duy nhất để kiểm tra tài khoản, sản phẩm, hóa đơn và báo
            cáo doanh thu theo đúng sườn microservice đang có.
          </p>
        </div>

        <div className="masthead__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => void loadDashboard({ silent: true })}
            disabled={refreshing || booting}
          >
            {refreshing ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}
          </button>
          <a className="button button--ghost" href="#reports">
            Xem báo cáo
          </a>
        </div>
      </header>

      <section className="summary-grid">
        <StatCard
          label="Tài khoản đang hoạt động"
          value={activeAccounts.length}
          tone="red"
          hint={`${accounts.length} bản ghi người dùng trong service`}
        />
        <StatCard
          label="Sản phẩm đang bán"
          value={activeProducts.length}
          tone="teal"
          hint={`${deletedProducts} sản phẩm đang ở trạng thái xóa mềm`}
        />
        <StatCard
          label="Số hóa đơn"
          value={readField(summary, 'soHoaDon', 'SoHoaDon') ?? 0}
          tone="gold"
          hint={`${orders.length} hóa đơn đã nạp ở danh sách gần đây`}
        />
        <StatCard
          label="Doanh thu"
          value={formatMoney(readField(summary, 'tongDoanhThu', 'TongDoanhThu'))}
          tone="ink"
          hint="Tổng hợp từ report-service theo bộ lọc hiện tại"
        />
      </section>

      <section
        className={`notice notice--${notice.tone}`}
        aria-live="polite"
      >
        {notice.message}
      </section>

      <main className="dashboard">
        <section id="accounts" className="dashboard-section">
          <SectionHeading
            eyebrow="FR4"
            title="Quản lý người dùng"
            description="Tạo tài khoản mới, kiểm tra vai trò và rà lại danh sách nhân viên đã liên kết."
            actions={
              <span className="pill">
                {roles.length > 0 ? `${roles.length} vai trò đã nạp` : 'Chưa có vai trò seed'}
              </span>
            }
          />

          <div className="section-grid section-grid--wide">
            <form className="panel form-panel" onSubmit={handleAccountSubmit}>
              <div className="panel__header">
                <h3>Tạo tài khoản + nhân viên</h3>
                <p>Dữ liệu sẽ gọi `POST /api/v1/users/accounts` qua gateway.</p>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Username</span>
                  <input
                    value={accountForm.username}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    placeholder="nv.quay01"
                    required
                  />
                </label>

                <label className="field">
                  <span>Mật khẩu</span>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="plain_password"
                    required
                  />
                </label>

                <ReferenceField
                  label="Vai trò"
                  value={accountForm.maVaiTro}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      maVaiTro: event.target.value,
                    }))
                  }
                  options={roles}
                  idKeys={['MaVaiTro', 'maVaiTro']}
                  labelKeys={['TenVaiTro', 'tenVaiTro']}
                  placeholder="Chọn vai trò"
                />

                <label className="field">
                  <span>Họ tên</span>
                  <input
                    value={accountForm.hoTen}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        hoTen: event.target.value,
                      }))
                    }
                    placeholder="Trần Văn A"
                    required
                  />
                </label>

                <label className="field field--full">
                  <span>Điện thoại</span>
                  <input
                    value={accountForm.dienThoai}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        dienThoai: event.target.value,
                      }))
                    }
                    placeholder="0988123123"
                    required
                  />
                </label>
              </div>

              <div className="panel__actions">
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={busyAction === 'account-create'}
                >
                  {busyAction === 'account-create' ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>

            <div className="panel">
              <div className="panel__header">
                <h3>Danh sách tài khoản</h3>
                <p>Ẩn trường password, tập trung vào trạng thái hoạt động và role.</p>
              </div>

              <div className="table-wrap">
                {accounts.length === 0 ? (
                  <EmptyState message="Chưa có tài khoản nào được trả về từ user-service." />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Nhân viên</th>
                        <th>Điện thoại</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => {
                        const maVaiTro = Number(readField(account, 'MaVaiTro', 'maVaiTro'))
                        const deleted = toBooleanLike(readField(account, 'IsDeleted', 'isDeleted'))

                        return (
                          <tr key={readField(account, 'MaTaiKhoan', 'maTaiKhoan')}>
                            <td>{readField(account, 'Username', 'username')}</td>
                            <td>{readField(account, 'HoTen', 'hoTen')}</td>
                            <td>{readField(account, 'DienThoai', 'dienThoai')}</td>
                            <td>{roleDictionary[maVaiTro] ?? `Vai trò #${maVaiTro}`}</td>
                            <td>
                              <span className={`status-chip ${deleted ? 'status-chip--muted' : 'status-chip--active'}`}>
                                {deleted ? 'Đã xóa mềm' : 'Đang hoạt động'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="chip-row">
                {permissions.length === 0 ? (
                  <span className="pill pill--warning">Chưa có permission seed</span>
                ) : (
                  permissions.map((permission) => (
                    <span className="pill" key={readField(permission, 'MaQuyen', 'maQuyen')}>
                      {readField(permission, 'TenQuyen', 'tenQuyen')}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="dashboard-section">
          <SectionHeading
            eyebrow="FR2"
            title="Quản lý sản phẩm"
            description="Thêm sản phẩm mới, theo dõi danh mục và nhà cung cấp đang được dùng ở product-service."
          />

          <div className="section-grid section-grid--wide">
            <form className="panel form-panel" onSubmit={handleProductSubmit}>
              <div className="panel__header">
                <h3>Thêm sản phẩm</h3>
                <p>Sử dụng danh mục và nhà cung cấp đã seed trong database hiện tại.</p>
              </div>

              <div className="form-grid">
                <label className="field field--full">
                  <span>Tên sản phẩm</span>
                  <input
                    value={productForm.tenSanPham}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        tenSanPham: event.target.value,
                      }))
                    }
                    placeholder="Nước suối 500ml"
                    required
                  />
                </label>

                <label className="field">
                  <span>Giá bán</span>
                  <input
                    type="number"
                    min="0"
                    value={productForm.gia}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        gia: event.target.value,
                      }))
                    }
                    placeholder="10000"
                    required
                  />
                </label>

                <label className="field">
                  <span>Số lượng</span>
                  <input
                    type="number"
                    min="1"
                    value={productForm.soLuong}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        soLuong: event.target.value,
                      }))
                    }
                    placeholder="120"
                    required
                  />
                </label>

                <ReferenceField
                  label="Danh mục"
                  value={productForm.maDanhMuc}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      maDanhMuc: event.target.value,
                    }))
                  }
                  options={categories}
                  idKeys={['MaDanhMuc', 'maDanhMuc']}
                  labelKeys={['TenDanhMuc', 'tenDanhMuc']}
                  placeholder="Chọn danh mục"
                />

                <ReferenceField
                  label="Nhà cung cấp"
                  value={productForm.maNCC}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      maNCC: event.target.value,
                    }))
                  }
                  options={suppliers}
                  idKeys={['MaNCC', 'maNCC']}
                  labelKeys={['TenCongTy', 'tenCongTy']}
                  placeholder="Chọn nhà cung cấp"
                />
              </div>

              <div className="panel__actions">
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={busyAction === 'product-create'}
                >
                  {busyAction === 'product-create' ? 'Đang tạo...' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>

            <div className="panel">
              <div className="panel__header">
                <h3>Danh mục sản phẩm</h3>
                <p>Danh sách trả về từ `GET /api/v1/products`, có hiển thị cờ xóa mềm.</p>
              </div>

              <div className="table-wrap">
                {products.length === 0 ? (
                  <EmptyState message="Chưa nạp được sản phẩm nào từ product-service." />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Danh mục</th>
                        <th>Nhà cung cấp</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const deleted = toBooleanLike(readField(product, 'IsDeleted', 'isDeleted'))

                        return (
                          <tr key={readField(product, 'MaSanPham', 'maSanPham')}>
                            <td>{readField(product, 'TenSanPham', 'tenSanPham')}</td>
                            <td>{formatMoney(readField(product, 'Gia', 'gia'))}</td>
                            <td>{readField(product, 'SoLuong', 'soLuong')}</td>
                            <td>#{readField(product, 'MaDanhMuc', 'maDanhMuc')}</td>
                            <td>#{readField(product, 'MaNCC', 'maNCC')}</td>
                            <td>
                              <span className={`status-chip ${deleted ? 'status-chip--muted' : 'status-chip--active'}`}>
                                {deleted ? 'Ẩn' : 'Đang bán'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="orders" className="dashboard-section">
          <SectionHeading
            eyebrow="FR1"
            title="Quản lý bán hàng"
            description="Tạo hóa đơn mới từ order-service và xem nhanh chi tiết từng hóa đơn gần đây."
          />

          <div className="section-grid section-grid--wide">
            <form className="panel form-panel" onSubmit={handleOrderSubmit}>
              <div className="panel__header">
                <h3>Tạo hóa đơn</h3>
                <p>Controller đã chặn trùng mã sản phẩm trong cùng một đơn.</p>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Mã nhân viên</span>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.maNhanVien}
                    onChange={(event) =>
                      setOrderForm((current) => ({
                        ...current,
                        maNhanVien: event.target.value,
                      }))
                    }
                    placeholder="10"
                    required
                  />
                </label>

                <label className="field">
                  <span>Phương thức thanh toán</span>
                  <select
                    value={orderForm.phuongThucThanhToan}
                    onChange={(event) =>
                      setOrderForm((current) => ({
                        ...current,
                        phuongThucThanhToan: event.target.value,
                      }))
                    }
                  >
                    <option value="TIEN_MAT">TIEN_MAT</option>
                    <option value="THE">THE</option>
                    <option value="CHUYEN_KHOAN">CHUYEN_KHOAN</option>
                  </select>
                </label>
              </div>

              <div className="order-items">
                {orderForm.items.map((item, index) => (
                  <div className="order-item-row" key={`order-item-${index}`}>
                    <ReferenceField
                      label={`Sản phẩm ${index + 1}`}
                      value={item.maSanPham}
                      onChange={(event) => updateOrderItem(index, 'maSanPham', event.target.value)}
                      options={activeProducts}
                      idKeys={['MaSanPham', 'maSanPham']}
                      labelKeys={['TenSanPham', 'tenSanPham']}
                      placeholder="Chọn sản phẩm"
                    />

                    <label className="field">
                      <span>Số lượng</span>
                      <input
                        type="number"
                        min="1"
                        value={item.soLuong}
                        onChange={(event) => updateOrderItem(index, 'soLuong', event.target.value)}
                        required
                      />
                    </label>

                    <button
                      className="button button--ghost"
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      disabled={orderForm.items.length === 1}
                    >
                      Bỏ dòng
                    </button>
                  </div>
                ))}
              </div>

              <div className="panel__actions">
                <button className="button button--ghost" type="button" onClick={addOrderItem}>
                  Thêm sản phẩm
                </button>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={busyAction === 'order-create'}
                >
                  {busyAction === 'order-create' ? 'Đang tạo...' : 'Tạo hóa đơn'}
                </button>
              </div>
            </form>

            <div className="stack">
              <div className="panel">
                <div className="panel__header">
                  <h3>Hóa đơn gần đây</h3>
                  <p>Bấm vào một dòng để gọi `GET /api/v1/orders/:maHoaDon`.</p>
                </div>

                <div className="table-wrap">
                  {orders.length === 0 ? (
                    <EmptyState message="Chưa có hóa đơn nào trong order-service." />
                  ) : (
                    <table className="data-table data-table--clickable">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Nhân viên</th>
                          <th>Ngày tạo</th>
                          <th>Thanh toán</th>
                          <th>Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={readField(order, 'MaHoaDon', 'maHoaDon')}
                            onClick={() =>
                              void loadOrderDetail(readField(order, 'MaHoaDon', 'maHoaDon'))
                            }
                          >
                            <td>#{readField(order, 'MaHoaDon', 'maHoaDon')}</td>
                            <td>{readField(order, 'MaNhanVien', 'maNhanVien')}</td>
                            <td>{formatDateTime(readField(order, 'NgayTao', 'ngayTao'))}</td>
                            <td>{readField(order, 'PhuongThucThanhToan', 'phuongThucThanhToan')}</td>
                            <td>{formatMoney(readField(order, 'TongTien', 'tongTien'))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel__header">
                  <h3>Chi tiết hóa đơn</h3>
                  <p>{detailLoading ? 'Đang nạp chi tiết...' : 'Giữ lại snapshot sản phẩm theo đúng flow hiện tại.'}</p>
                </div>

                {!selectedOrderDetail?.hoaDon ? (
                  <EmptyState message="Chọn một hóa đơn ở bảng bên trên để xem chi tiết." />
                ) : (
                  <div className="detail-card">
                    <div className="detail-card__meta">
                      <div>
                        <span>Mã hóa đơn</span>
                        <strong>#{readField(selectedOrderDetail.hoaDon, 'MaHoaDon', 'maHoaDon')}</strong>
                      </div>
                      <div>
                        <span>Nhân viên</span>
                        <strong>{readField(selectedOrderDetail.hoaDon, 'MaNhanVien', 'maNhanVien')}</strong>
                      </div>
                      <div>
                        <span>Tổng tiền</span>
                        <strong>{formatMoney(readField(selectedOrderDetail.hoaDon, 'TongTien', 'tongTien'))}</strong>
                      </div>
                    </div>

                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Giảm giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrderDetail.chiTiet.map((item) => (
                            <tr key={readField(item, 'MaChiTiet', 'maChiTiet')}>
                              <td>{readField(item, 'TenSanPham', 'tenSanPham')}</td>
                              <td>{readField(item, 'SoLuong', 'soLuong')}</td>
                              <td>{formatMoney(readField(item, 'DonGia', 'donGia'))}</td>
                              <td>{formatMoney(readField(item, 'GiamGia', 'giamGia'))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="reports" className="dashboard-section">
          <SectionHeading
            eyebrow="FR3"
            title="Báo cáo"
            description="Kéo dữ liệu tổng hợp từ report-service với bộ lọc ngày và chế độ nhóm."
            actions={
              <button
                className="button button--primary"
                type="button"
                onClick={() => void loadReports()}
                disabled={reportLoading}
              >
                {reportLoading ? 'Đang tải...' : 'Chạy báo cáo'}
              </button>
            }
          />

          <div className="panel form-panel">
            <div className="form-grid form-grid--reports">
              <label className="field">
                <span>Từ ngày</span>
                <input
                  type="date"
                  value={reportFilters.fromDate}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      fromDate: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Đến ngày</span>
                <input
                  type="date"
                  value={reportFilters.toDate}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      toDate: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Nhóm theo</span>
                <select
                  value={reportFilters.groupBy}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      groupBy: event.target.value,
                    }))
                  }
                >
                  <option value="day">day</option>
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
              </label>

              <label className="field">
                <span>Top N</span>
                <input
                  type="number"
                  min="1"
                  value={reportFilters.limit}
                  onChange={(event) =>
                    setReportFilters((current) => ({
                      ...current,
                      limit: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div className="section-grid">
            <div className="panel">
              <div className="panel__header">
                <h3>Doanh thu theo chu kỳ</h3>
              </div>

              <div className="table-wrap">
                {revenueRows.length === 0 ? (
                  <EmptyState message="Chưa có dòng doanh thu nào theo bộ lọc đang chọn." />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Chu kỳ</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueRows.map((row, index) => (
                        <tr key={`${row.period}-${index}`}>
                          <td>{row.period}</td>
                          <td>{formatMoney(row.tongDoanhThu)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel__header">
                <h3>Top sản phẩm</h3>
              </div>

              <div className="table-wrap">
                {topProductRows.length === 0 ? (
                  <EmptyState message="Chưa có dòng top sản phẩm nào theo bộ lọc đang chọn." />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mã SP</th>
                        <th>Tên sản phẩm</th>
                        <th>Tổng bán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductRows.map((row) => (
                        <tr key={`${row.maSanPham}-${row.tenSanPham}`}>
                          <td>#{row.maSanPham}</td>
                          <td>{row.tenSanPham}</td>
                          <td>{row.tongSoLuongBan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>UI đang gọi qua Vite proxy đến API Gateway trên cổng 8000.</p>
        <p>{booting ? 'Đang nạp dữ liệu ban đầu...' : 'Sẵn sàng thao tác với backend hiện tại.'}</p>
      </footer>
    </div>
  )
}

export default App
