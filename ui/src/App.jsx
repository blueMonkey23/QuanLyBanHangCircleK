import { useDeferredValue, useEffect, useState } from 'react'
import { api } from './api'
import './App.css'

const VAT_RATE = 0.08

const NAV_ITEMS = [
  {
    id: 'sales',
    badge: '01',
    label: 'Ban Hang',
    title: 'Ban Hang',
    description: 'Muc ban hang tai quay theo bo cuc trong file web.fig.',
  },
  {
    id: 'products',
    badge: '02',
    label: 'Quan Ly San Pham',
    title: 'Quan Ly San Pham',
    description: 'Danh sach san pham, tim kiem, loc va bo sung mat hang moi.',
  },
  {
    id: 'customers',
    badge: '03',
    label: 'Quan Ly Khach Hang',
    title: 'Quan Ly Khach Hang',
    description: 'Form them khach hang moi va danh sach khach hang gan day.',
  },
  {
    id: 'reports',
    badge: '04',
    label: 'Bao Cao & Thong Ke',
    title: 'Bao Cao Ban Hang',
    description: 'Tong hop doanh thu, top san pham va du lieu bao cao.',
  },
  {
    id: 'users',
    badge: '05',
    label: 'Quan Ly Nguoi Dung',
    title: 'Quan Ly Nguoi Dung',
    description: 'Danh sach tai khoan, vai tro va trang thai van hanh.',
  },
  {
    id: 'settings',
    badge: '06',
    label: 'Cai Dat He Thong',
    title: 'Cai Dat He Thong',
    description: 'Thong tin cua hang, VAT, noi dung hoa don va cau hinh hien thi.',
  },
]

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    code: 'SP001',
    name: 'Coca Cola',
    category: 'Nuoc giai khat',
    price: 12000,
    stock: 50,
    supplier: 'Coca Cola Vietnam',
    glyph: 'CC',
  },
  {
    id: 2,
    code: 'SP002',
    name: 'Pepsi',
    category: 'Nuoc giai khat',
    price: 12000,
    stock: 45,
    supplier: 'PepsiCo',
    glyph: 'PE',
  },
  {
    id: 3,
    code: 'SP003',
    name: 'Banh mi',
    category: 'Do an nhanh',
    price: 15000,
    stock: 30,
    supplier: 'Lo nuong trung tam',
    glyph: 'BM',
  },
  {
    id: 4,
    code: 'SP004',
    name: 'Mi tom Hao Hao',
    category: 'Do kho',
    price: 8000,
    stock: 60,
    supplier: 'Acecook',
    glyph: 'HH',
  },
  {
    id: 5,
    code: 'SP005',
    name: 'Sua tuoi Vinamilk',
    category: 'Sua',
    price: 10000,
    stock: 40,
    supplier: 'Vinamilk',
    glyph: 'VM',
  },
  {
    id: 6,
    code: 'SP006',
    name: 'Keo mut Chupa Chups',
    category: 'Banh keo',
    price: 5000,
    stock: 100,
    supplier: 'Perfetti',
    glyph: 'CC',
  },
  {
    id: 7,
    code: 'SP007',
    name: 'But bi Thien Long',
    category: 'Van phong pham',
    price: 7000,
    stock: 80,
    supplier: 'Thien Long',
    glyph: 'TL',
  },
  {
    id: 8,
    code: 'SP008',
    name: 'Nuoc suoi Aquafina',
    category: 'Nuoc giai khat',
    price: 6000,
    stock: 70,
    supplier: 'Aquafina',
    glyph: 'AQ',
  },
]

const SAMPLE_CUSTOMERS = [
  {
    id: 'KH001',
    name: 'Nguyen Thi Lan',
    phone: '0909123456',
    address: 'Quan 1, TP.HCM',
    points: 120,
  },
  {
    id: 'KH002',
    name: 'Tran Minh Khoa',
    phone: '0933111222',
    address: 'Thu Duc, TP.HCM',
    points: 55,
  },
  {
    id: 'KH003',
    name: 'Le Hoang Anh',
    phone: '0914008999',
    address: 'Go Vap, TP.HCM',
    points: 240,
  },
]

const SAMPLE_REPORT_ROWS = [
  {
    period: '01/06/2023',
    invoiceCount: 15,
    revenue: 2500000,
    profit: 750000,
  },
  {
    period: '02/06/2023',
    invoiceCount: 12,
    revenue: 2200000,
    profit: 640000,
  },
  {
    period: '03/06/2023',
    invoiceCount: 18,
    revenue: 2950000,
    profit: 910000,
  },
]

const SAMPLE_USER_ROWS = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Nguyen Van Admin',
    role: 'Quan tri',
    status: 'Hoat dong',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
]

const DEFAULT_SETTINGS = {
  storeName: 'Cua Hang Tien Loi ABC',
  address: '123 Duong XYZ, Quan 1, TP.HCM',
  phone: '0912345678',
  email: 'contact@cuahangtienloi.com',
  invoiceMessage: 'Cam on quy khach da mua hang!',
  vatPercent: '8',
  logo: 'circle-k-wordmark.png',
}

const initialProductForm = {
  tenSanPham: '',
  gia: '',
  soLuong: '',
  maDanhMuc: '',
  maNCC: '',
}

const initialAccountForm = {
  username: '',
  password: '',
  maVaiTro: '',
  hoTen: '',
  dienThoai: '',
}

const initialCustomerForm = {
  maKhachHang: '',
  tenKhachHang: '',
  soDienThoai: '',
  diaChi: '',
  diemTichLuy: '0',
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

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value) {
  if (!value) {
    return '--/--/----'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDateLong(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function extractErrorMessage(error) {
  if (error?.payload?.message) {
    return error.payload.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Da xay ra loi khong xac dinh.'
}

function isGatewayFailure(message) {
  return /status 502/i.test(String(message || ''))
}

function summarizeFailures(messages) {
  const normalized = messages.filter(Boolean)

  if (normalized.length === 0) {
    return null
  }

  const uniqueMessages = [...new Set(normalized)]

  if (normalized.every(isGatewayFailure)) {
    return {
      tone: 'info',
      message: 'Chua ket noi duoc backend qua gateway. Giao dien dang hien du lieu mau de ban test UI.',
    }
  }

  return {
    tone: 'warning',
    message: `Co ${normalized.length} request chua tai duoc. Loi chinh: ${uniqueMessages.join(' | ')}`,
  }
}

function buildLookup(records, idKeys, labelKeys) {
  const dictionary = {}

  records.forEach((record) => {
    const id = readField(record, ...idKeys)
    const label = readField(record, ...labelKeys)

    if (id !== null && id !== undefined) {
      dictionary[id] = label
    }
  })

  return dictionary
}

function buildCode(prefix, value, index) {
  const raw = value ?? index + 1

  if (typeof raw === 'string' && raw.startsWith(prefix)) {
    return raw
  }

  const digits = String(raw).replace(/\D/g, '')
  const normalized = digits || String(index + 1)
  return `${prefix}${normalized.padStart(3, '0')}`
}

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

function SidebarItem({ item, active, onSelect }) {
  return (
    <button
      className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <span className="sidebar__item-badge">{item.badge}</span>
      <span className="sidebar__item-text">{item.label}</span>
    </button>
  )
}

function StatusBadge({ tone = 'positive', children }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>
}

function App() {
  const [activeScreen, setActiveScreen] = useState('sales')
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

  const [salesSearch, setSalesSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT')
  const [customerQuery, setCustomerQuery] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [productForm, setProductForm] = useState(initialProductForm)
  const [accountForm, setAccountForm] = useState(initialAccountForm)
  const [customerForm, setCustomerForm] = useState(initialCustomerForm)
  const [customers, setCustomers] = useState(SAMPLE_CUSTOMERS)
  const [reportFilters, setReportFilters] = useState(initialReportFilters)
  const [settingsForm, setSettingsForm] = useState(DEFAULT_SETTINGS)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [booting, setBooting] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState({
    tone: 'info',
    message: 'Dang tai UI theo bo cuc web.fig.',
  })

  const deferredSalesSearch = useDeferredValue(salesSearch)
  const deferredProductSearch = useDeferredValue(productSearch)
  const deferredUserSearch = useDeferredValue(userSearch)

  async function loadBootstrap({ silent = false } = {}) {
    if (silent) {
      setSyncing(true)
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
      revenueResult,
      topProductsResult,
    ] = results

    if (accountsResult.status === 'fulfilled') setAccounts(accountsResult.value)
    if (rolesResult.status === 'fulfilled') setRoles(rolesResult.value)
    if (permissionsResult.status === 'fulfilled') setPermissions(permissionsResult.value)
    if (productsResult.status === 'fulfilled') setProducts(productsResult.value)
    if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value)
    if (suppliersResult.status === 'fulfilled') setSuppliers(suppliersResult.value)
    if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value)
    if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value)
    if (revenueResult.status === 'fulfilled') setRevenueRows(revenueResult.value)
    if (topProductsResult.status === 'fulfilled') setTopProductRows(topProductsResult.value)

    const rejected = results
      .filter((result) => result.status === 'rejected')
      .map((result) => extractErrorMessage(result.reason))

    if (rejected.length > 0) {
      const failureNotice = summarizeFailures(rejected)
      setNotice(failureNotice)
    } else {
      setNotice({
        tone: 'success',
        message: 'UI da dong bo thanh cong voi gateway va cac service hien tai.',
      })
    }

    setBooting(false)
    setSyncing(false)
  }

  async function loadReports() {
    setReportLoading(true)

    try {
      const [invoiceSummary, revenue, topProducts] = await Promise.all([
        api.getInvoiceSummary({
          fromDate: reportFilters.fromDate,
          toDate: reportFilters.toDate,
        }),
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
      ])

      setSummary(invoiceSummary)
      setRevenueRows(revenue)
      setTopProductRows(topProducts)
      setNotice({
        tone: 'success',
        message: 'Khoi bao cao da duoc lam moi theo bo loc hien tai.',
      })
    } catch (error) {
      const failureNotice = summarizeFailures([extractErrorMessage(error)])
      setNotice({
        tone: failureNotice?.tone || 'warning',
        message: failureNotice?.message || extractErrorMessage(error),
      })
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    void loadBootstrap()
  }, [])

  const roleLookup = buildLookup(roles, ['MaVaiTro', 'maVaiTro'], ['TenVaiTro', 'tenVaiTro'])
  const categoryLookup = buildLookup(categories, ['MaDanhMuc', 'maDanhMuc'], ['TenDanhMuc', 'tenDanhMuc'])
  const supplierLookup = buildLookup(suppliers, ['MaNCC', 'maNCC'], ['TenCongTy', 'tenCongTy'])

  const liveProducts = products
    .filter((product) => !toBooleanLike(readField(product, 'IsDeleted', 'isDeleted')))
    .map((product, index) => {
      const id = Number(readField(product, 'MaSanPham', 'maSanPham') ?? index + 1)
      const name = readField(product, 'TenSanPham', 'tenSanPham') || `San pham ${index + 1}`
      const categoryId = readField(product, 'MaDanhMuc', 'maDanhMuc')
      const supplierId = readField(product, 'MaNCC', 'maNCC')
      const stock = Number(readField(product, 'SoLuong', 'soLuong') ?? 0)

      return {
        id,
        code: buildCode('SP', readField(product, 'MaSanPham', 'maSanPham'), index),
        name,
        category: categoryLookup[categoryId] || `Danh muc #${categoryId ?? '--'}`,
        price: Number(readField(product, 'Gia', 'gia') ?? 0),
        stock,
        supplier: supplierLookup[supplierId] || `NCC #${supplierId ?? '--'}`,
        glyph: normalizeText(name).slice(0, 2).toUpperCase() || 'SP',
      }
    })

  const displayProducts = liveProducts.length > 0 ? liveProducts : SAMPLE_PRODUCTS

  const displayCategories = categories.length > 0
    ? categories.map((category, index) => ({
        id: String(readField(category, 'MaDanhMuc', 'maDanhMuc') ?? index + 1),
        name: readField(category, 'TenDanhMuc', 'tenDanhMuc') || `Danh muc ${index + 1}`,
      }))
    : Array.from(
        new Map(
          SAMPLE_PRODUCTS.map((product) => [product.category, { id: product.category, name: product.category }]),
        ).values(),
      )

  const displaySuppliers = suppliers.length > 0
    ? suppliers.map((supplier, index) => ({
        id: String(readField(supplier, 'MaNCC', 'maNCC') ?? index + 1),
        name: readField(supplier, 'TenCongTy', 'tenCongTy') || `NCC ${index + 1}`,
      }))
    : Array.from(
        new Map(
          SAMPLE_PRODUCTS.map((product) => [product.supplier, { id: product.supplier, name: product.supplier }]),
        ).values(),
      )

  const salesProducts = displayProducts.filter((product) => {
    const keyword = normalizeText(deferredSalesSearch)

    if (!keyword) {
      return true
    }

    return [product.code, product.name, product.category, product.supplier]
      .some((value) => normalizeText(value).includes(keyword))
  })

  const productRows = displayProducts.filter((product) => {
    const keyword = normalizeText(deferredProductSearch)
    const matchesKeyword = !keyword || [product.code, product.name, product.category]
      .some((value) => normalizeText(value).includes(keyword))
    const matchesCategory = categoryFilter === 'all' || normalizeText(product.category) === normalizeText(categoryFilter)

    return matchesKeyword && matchesCategory
  })

  const userRows = accounts.length > 0
    ? accounts.map((account, index) => {
        const roleId = Number(readField(account, 'MaVaiTro', 'maVaiTro'))
        const deleted = toBooleanLike(readField(account, 'IsDeleted', 'isDeleted'))

        return {
          id: Number(readField(account, 'MaTaiKhoan', 'maTaiKhoan') ?? index + 1),
          username: readField(account, 'Username', 'username') || `user${index + 1}`,
          fullName: readField(account, 'HoTen', 'hoTen') || `Nhan vien ${index + 1}`,
          role: roleLookup[roleId] || `Vai tro #${roleId || '--'}`,
          status: deleted ? 'Tam khoa' : 'Hoat dong',
          createdAt: readField(account, 'NgayTao', 'ngayTao'),
        }
      })
    : SAMPLE_USER_ROWS

  const filteredUsers = userRows.filter((user) => {
    const keyword = normalizeText(deferredUserSearch)

    if (!keyword) {
      return true
    }

    return [user.username, user.fullName, user.role].some((value) =>
      normalizeText(value).includes(keyword),
    )
  })

  const reportRows = revenueRows.length > 0
    ? revenueRows.map((row) => ({
        period: readField(row, 'period', 'Period') || readField(row, 'ngay', 'Ngay') || '--',
        invoiceCount: readField(row, 'soHoaDon', 'SoHoaDon') ?? '--',
        revenue: Number(readField(row, 'tongDoanhThu', 'TongDoanhThu') ?? 0),
        profit: readField(row, 'loiNhuan', 'LoiNhuan'),
      }))
    : SAMPLE_REPORT_ROWS

  const displayTopProducts = topProductRows.length > 0
    ? topProductRows.map((row, index) => ({
        id: readField(row, 'maSanPham', 'MaSanPham') ?? index + 1,
        name: readField(row, 'tenSanPham', 'TenSanPham') || `San pham ${index + 1}`,
        quantity: Number(readField(row, 'tongSoLuongBan', 'TongSoLuongBan') ?? 0),
      }))
    : displayProducts.slice(0, 5).map((product) => ({
        id: product.code,
        name: product.name,
        quantity: product.stock,
      }))

  const cartDetails = cartItems
    .map((item) => {
      const product = displayProducts.find((candidate) => String(candidate.id) === String(item.productId))

      if (!product) {
        return null
      }

      const quantity = Number(item.quantity || 0)

      return {
        ...product,
        quantity,
        lineTotal: quantity * product.price,
      }
    })
    .filter(Boolean)

  const subtotal = cartDetails.reduce((total, item) => total + item.lineTotal, 0)
  const discount = 0
  const vat = Math.round((subtotal - discount) * VAT_RATE)
  const grandTotal = subtotal - discount + vat

  const activeUser = userRows.find((user) => user.status === 'Hoat dong') || userRows[0]
  const cashierSource = accounts.find((account) => !toBooleanLike(readField(account, 'IsDeleted', 'isDeleted'))) || accounts[0]
  const cashierId = Number(
    readField(cashierSource, 'MaNhanVien', 'maNhanVien', 'MaTaiKhoan', 'maTaiKhoan') ?? 0,
  )
  const profileInitials = activeUser
    ? normalizeText(activeUser.fullName)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'AD'

  const headerMeta = NAV_ITEMS.find((item) => item.id === activeScreen) || NAV_ITEMS[0]

  function updateCart(productId, delta) {
    setCartItems((current) => {
      const existing = current.find((item) => String(item.productId) === String(productId))

      if (!existing) {
        return [...current, { productId, quantity: Math.max(1, delta) }]
      }

      return current
        .map((item) =>
          String(item.productId) === String(productId)
            ? {
                ...item,
                quantity: Math.max(0, Number(item.quantity) + delta),
              }
            : item,
        )
        .filter((item) => Number(item.quantity) > 0)
    })
  }

  function setCartQuantity(productId, quantity) {
    setCartItems((current) =>
      current
        .map((item) =>
          String(item.productId) === String(productId)
            ? {
                ...item,
                quantity: Math.max(0, Number(quantity || 0)),
              }
            : item,
        )
        .filter((item) => Number(item.quantity) > 0),
    )
  }

  function clearCart() {
    setCartItems([])
    setCustomerQuery('')
    setPaymentMethod('TIEN_MAT')
  }

  async function handleCheckout() {
    if (cartDetails.length === 0) {
      setNotice({
        tone: 'warning',
        message: 'Hay them it nhat mot san pham vao gio truoc khi thanh toan.',
      })
      return
    }

    if (!cashierId) {
      setNotice({
        tone: 'warning',
        message: 'Khong tim thay ma nhan vien hoac tai khoan hop le de tao hoa don.',
      })
      return
    }

    setBusyAction('checkout')

    try {
      await api.createOrder({
        maNhanVien: cashierId,
        phuongThucThanhToan: paymentMethod,
        items: cartDetails.map((item) => ({
          maSanPham: Number(item.id),
          soLuong: Number(item.quantity),
        })),
      })

      clearCart()
      await loadBootstrap({ silent: true })
      setNotice({
        tone: 'success',
        message: 'Hoa don da duoc tao thanh cong tu man hinh ban hang.',
      })
    } catch (error) {
      const failureNotice = summarizeFailures([extractErrorMessage(error)])
      setNotice({
        tone: failureNotice?.tone || 'warning',
        message: failureNotice?.message || extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault()

    setBusyAction('create-product')

    try {
      await api.createProduct({
        tenSanPham: productForm.tenSanPham.trim(),
        gia: Number(productForm.gia),
        soLuong: Number(productForm.soLuong),
        maDanhMuc: Number(productForm.maDanhMuc),
        maNCC: Number(productForm.maNCC),
      })

      setProductForm(initialProductForm)
      setShowProductForm(false)
      await loadBootstrap({ silent: true })
      setNotice({
        tone: 'success',
        message: 'San pham moi da duoc tao va dua vao bang quan ly.',
      })
    } catch (error) {
      const failureNotice = summarizeFailures([extractErrorMessage(error)])
      setNotice({
        tone: failureNotice?.tone || 'warning',
        message: failureNotice?.message || extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  async function handleAccountSubmit(event) {
    event.preventDefault()

    setBusyAction('create-account')

    try {
      await api.createAccount({
        username: accountForm.username.trim(),
        password: accountForm.password,
        maVaiTro: Number(accountForm.maVaiTro),
        hoTen: accountForm.hoTen.trim(),
        dienThoai: accountForm.dienThoai.trim(),
      })

      setAccountForm(initialAccountForm)
      setShowUserForm(false)
      await loadBootstrap({ silent: true })
      setNotice({
        tone: 'success',
        message: 'Nguoi dung moi da duoc tao tu module quan ly nguoi dung.',
      })
    } catch (error) {
      const failureNotice = summarizeFailures([extractErrorMessage(error)])
      setNotice({
        tone: failureNotice?.tone || 'warning',
        message: failureNotice?.message || extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  function handleCustomerSubmit(event) {
    event.preventDefault()

    const nextCode = customerForm.maKhachHang.trim()
      || `KH${String(customers.length + 1).padStart(3, '0')}`

    setCustomers((current) => [
      {
        id: nextCode,
        name: customerForm.tenKhachHang.trim(),
        phone: customerForm.soDienThoai.trim(),
        address: customerForm.diaChi.trim(),
        points: Number(customerForm.diemTichLuy || 0),
      },
      ...current,
    ])

    setCustomerForm(initialCustomerForm)
    setNotice({
      tone: 'info',
      message: 'Da luu khach hang moi trong UI. Phan nay chua co customer-service de dong bo.',
    })
  }

  function handleSettingsSubmit(event) {
    event.preventDefault()
    setNotice({
      tone: 'success',
      message: 'Cau hinh he thong da duoc cap nhat trong giao dien hien tai.',
    })
  }

  function exportReport() {
    const rows = reportRows.map((row) => ({
      period: row.period,
      invoiceCount: row.invoiceCount,
      revenue: row.revenue,
      profit: row.profit ?? '',
    }))

    const csvLines = [
      ['Ngay', 'So Hoa Don', 'Doanh Thu', 'Loi Nhuan'].join(','),
      ...rows.map((row) => [row.period, row.invoiceCount, row.revenue, row.profit].join(',')),
    ]

    const blob = new Blob([`\ufeff${csvLines.join('\n')}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = 'bao-cao-ban-hang.csv'
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)

    setNotice({
      tone: 'success',
      message: 'Da xuat file CSV tu giao dien bao cao.',
    })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">CK</div>
          <div>
            <p className="sidebar__eyebrow">Circle K Dashboard</p>
            <h1 className="sidebar__title">Cua Hang Tien Loi</h1>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              active={activeScreen === item.id}
              onSelect={setActiveScreen}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footnote">Backend dang duoc goi qua gateway hien tai.</p>
          <button
            className="ghost-button ghost-button--sidebar"
            type="button"
            onClick={() => void loadBootstrap({ silent: true })}
            disabled={syncing || booting}
          >
            {syncing ? 'Dang dong bo...' : 'Dong Bo Du Lieu'}
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar__copy">
            <p className="topbar__eyebrow">web.fig / page format</p>
            <h2>{headerMeta.title}</h2>
            <p>{headerMeta.description}</p>
          </div>

          <div className="topbar__meta">
            <div className="profile-chip">
              <span className="profile-chip__avatar">{profileInitials || 'AD'}</span>
              <div>
                <strong>{activeUser?.role || 'Quan Tri Vien'}</strong>
                <span>{formatDateLong()}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="metric-strip">
          <article className="metric-card">
            <span>San pham dang ban</span>
            <strong>{displayProducts.length}</strong>
          </article>
          <article className="metric-card">
            <span>Nguoi dung hoat dong</span>
            <strong>{userRows.filter((user) => user.status === 'Hoat dong').length}</strong>
          </article>
          <article className="metric-card">
            <span>So hoa don</span>
            <strong>{readField(summary, 'soHoaDon', 'SoHoaDon') ?? orders.length ?? 0}</strong>
          </article>
          <article className="metric-card">
            <span>Doanh thu</span>
            <strong>{formatCurrency(readField(summary, 'tongDoanhThu', 'TongDoanhThu'))}</strong>
          </article>
        </section>

        <section className={`notice notice--${notice.tone}`} aria-live="polite">
          {booting ? 'Dang nap du lieu tu backend...' : notice.message}
        </section>

        <main className="page-surface">
          {activeScreen === 'sales' ? (
            <div className="sales-layout">
              <section className="panel-card">
                <div className="panel-card__header panel-card__header--space">
                  <div>
                    <h3>Danh Sach San Pham</h3>
                    <p>Tim mat hang nhanh theo bo cuc POS trong file thiet ke.</p>
                  </div>
                  <label className="search-field">
                    <span>Tim Kiem San Pham</span>
                    <input
                      value={salesSearch}
                      onChange={(event) => setSalesSearch(event.target.value)}
                      placeholder="Tim kiem san pham..."
                    />
                  </label>
                </div>

                {salesProducts.length === 0 ? (
                  <EmptyState
                    title="Khong co san pham phu hop"
                    message="Thu doi tu khoa tim kiem hoac dong bo lai du lieu tu backend."
                  />
                ) : (
                  <div className="product-grid">
                    {salesProducts.map((product) => (
                      <article className="product-card" key={product.code}>
                        <div className="product-card__icon">{product.glyph}</div>
                        <div className="product-card__body">
                          <p className="product-card__code">{product.code}</p>
                          <h4>{product.name}</h4>
                          <p className="product-card__price">{formatCurrency(product.price)}</p>
                          <p className="product-card__stock">Con {product.stock} cai</p>
                        </div>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => updateCart(product.id, 1)}
                        >
                          Them vao gio
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <aside className="invoice-card">
                <div className="panel-card__header">
                  <h3>Hoa Don Ban Hang</h3>
                  <p>Don hang duoc tao tu order-service neu backend san sang.</p>
                </div>

                <label className="stack-field">
                  <span>Khach Hang</span>
                  <input
                    value={customerQuery}
                    onChange={(event) => setCustomerQuery(event.target.value)}
                    placeholder="Nhap ten hoac so dien thoai"
                  />
                </label>

                <label className="stack-field">
                  <span>Phuong Thuc Thanh Toan</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="TIEN_MAT">Tien mat</option>
                    <option value="THE">The</option>
                    <option value="CHUYEN_KHOAN">Chuyen khoan</option>
                  </select>
                </label>

                <div className="invoice-list">
                  {cartDetails.length === 0 ? (
                    <EmptyState
                      title="Gio hang dang trong"
                      message="Chon san pham o danh sach ben trai de bat dau tao hoa don."
                    />
                  ) : (
                    cartDetails.map((item) => (
                      <div className="invoice-item" key={item.code}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>{formatCurrency(item.price)}</p>
                        </div>

                        <div className="invoice-item__actions">
                          <button type="button" onClick={() => updateCart(item.id, -1)}>
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => setCartQuantity(item.id, event.target.value)}
                          />
                          <button type="button" onClick={() => updateCart(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="invoice-summary">
                  <div>
                    <span>Tam tinh:</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div>
                    <span>Giam gia:</span>
                    <strong>{formatCurrency(discount)}</strong>
                  </div>
                  <div>
                    <span>VAT (8%):</span>
                    <strong>{formatCurrency(vat)}</strong>
                  </div>
                  <div className="invoice-summary__total">
                    <span>Tong cong:</span>
                    <strong>{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>

                <div className="invoice-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => void handleCheckout()}
                    disabled={busyAction === 'checkout'}
                  >
                    {busyAction === 'checkout' ? 'Dang xu ly...' : 'Thanh Toan'}
                  </button>
                  <button className="ghost-button" type="button" onClick={clearCart}>
                    Huy Don
                  </button>
                </div>
              </aside>
            </div>
          ) : null}

          {activeScreen === 'products' ? (
            <div className="module-stack">
              <section className="panel-card">
                <div className="panel-card__header panel-card__header--space">
                  <div>
                    <h3>Danh Sach San Pham</h3>
                    <p>Bang quan ly san pham duoc doi lai theo format tu Figma.</p>
                  </div>

                  <div className="toolbar-cluster">
                    <label className="search-field search-field--compact">
                      <span>Tim kiem</span>
                      <input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="Tim kiem san pham..."
                      />
                    </label>

                    <label className="search-field search-field--compact">
                      <span>Danh muc</span>
                      <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                      >
                        <option value="all">Tat ca danh muc</option>
                        {displayCategories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setShowProductForm((current) => !current)}
                    >
                      Them San Pham
                    </button>
                  </div>
                </div>

                {showProductForm ? (
                  <form className="inline-form" onSubmit={handleProductSubmit}>
                    <label className="stack-field">
                      <span>Ten San Pham</span>
                      <input
                        value={productForm.tenSanPham}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            tenSanPham: event.target.value,
                          }))
                        }
                        placeholder="Nuoc suoi 500ml"
                        required
                      />
                    </label>

                    <label className="stack-field">
                      <span>Gia Ban</span>
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

                    <label className="stack-field">
                      <span>Ton Kho</span>
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
                        placeholder="50"
                        required
                      />
                    </label>

                    <label className="stack-field">
                      <span>Danh Muc</span>
                      <select
                        value={productForm.maDanhMuc}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            maDanhMuc: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Chon danh muc</option>
                        {displayCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="stack-field">
                      <span>Nha Cung Cap</span>
                      <select
                        value={productForm.maNCC}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            maNCC: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Chon nha cung cap</option>
                        {displaySuppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="inline-form__actions">
                      <button
                        className="primary-button"
                        type="submit"
                        disabled={busyAction === 'create-product'}
                      >
                        {busyAction === 'create-product' ? 'Dang luu...' : 'Luu San Pham'}
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => setShowProductForm(false)}
                      >
                        Huy
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ma SP</th>
                        <th>Ten San Pham</th>
                        <th>Danh Muc</th>
                        <th>Gia Ban</th>
                        <th>Ton Kho</th>
                        <th>Trang Thai</th>
                        <th>Hanh Dong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productRows.map((product) => (
                        <tr key={product.code}>
                          <td>{product.code}</td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{product.stock}</td>
                          <td>
                            <StatusBadge tone={product.stock > 0 ? 'positive' : 'warning'}>
                              {product.stock > 0 ? 'Con hang' : 'Het hang'}
                            </StatusBadge>
                          </td>
                          <td>
                            <button
                              className="table-link"
                              type="button"
                              onClick={() => setActiveScreen('sales')}
                            >
                              Ban ngay
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {activeScreen === 'customers' ? (
            <div className="split-layout">
              <section className="panel-card">
                <div className="panel-card__header">
                  <h3>Them Khach Hang Moi</h3>
                  <p>Phan backend khach hang chua co service rieng, nen man nay dang dung state cuc bo.</p>
                </div>

                <form className="settings-grid" onSubmit={handleCustomerSubmit}>
                  <label className="stack-field">
                    <span>Ma Khach Hang</span>
                    <input
                      value={customerForm.maKhachHang}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          maKhachHang: event.target.value,
                        }))
                      }
                      placeholder="KH001"
                    />
                  </label>

                  <label className="stack-field">
                    <span>Ten Khach Hang</span>
                    <input
                      value={customerForm.tenKhachHang}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          tenKhachHang: event.target.value,
                        }))
                      }
                      placeholder="Nguyen Van A"
                      required
                    />
                  </label>

                  <label className="stack-field">
                    <span>So Dien Thoai</span>
                    <input
                      value={customerForm.soDienThoai}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          soDienThoai: event.target.value,
                        }))
                      }
                      placeholder="0909123456"
                      required
                    />
                  </label>

                  <label className="stack-field">
                    <span>Diem Tich Luy</span>
                    <input
                      type="number"
                      min="0"
                      value={customerForm.diemTichLuy}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          diemTichLuy: event.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </label>

                  <label className="stack-field stack-field--full">
                    <span>Dia Chi</span>
                    <input
                      value={customerForm.diaChi}
                      onChange={(event) =>
                        setCustomerForm((current) => ({
                          ...current,
                          diaChi: event.target.value,
                        }))
                      }
                      placeholder="123 Nguyen Hue, Quan 1"
                    />
                  </label>

                  <div className="form-actions">
                    <button className="primary-button" type="submit">
                      Luu Khach Hang
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setCustomerForm(initialCustomerForm)}
                    >
                      Huy
                    </button>
                  </div>
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-card__header">
                  <h3>Danh Sach Khach Hang</h3>
                  <p>Day la du lieu mau de UI co the hoat dong ngay khi chua co customer-service.</p>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ma KH</th>
                        <th>Ten Khach Hang</th>
                        <th>So Dien Thoai</th>
                        <th>Dia Chi</th>
                        <th>Diem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.id}</td>
                          <td>{customer.name}</td>
                          <td>{customer.phone}</td>
                          <td>{customer.address}</td>
                          <td>{customer.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {activeScreen === 'reports' ? (
            <div className="module-stack">
              <section className="panel-card">
                <div className="panel-card__header panel-card__header--space">
                  <div>
                    <h3>Bao Cao Ban Hang</h3>
                    <p>Bo loc va bang duoc sap lai de giong bo cuc trong file web.fig.</p>
                  </div>

                  <div className="toolbar-cluster">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void loadReports()}
                      disabled={reportLoading}
                    >
                      {reportLoading ? 'Dang loc...' : 'Loc'}
                    </button>
                    <button className="primary-button" type="button" onClick={exportReport}>
                      Xuat Excel
                    </button>
                  </div>
                </div>

                <form
                  className="filter-row"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void loadReports()
                  }}
                >
                  <label className="stack-field">
                    <span>Tu Ngay</span>
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

                  <label className="stack-field">
                    <span>Den Ngay</span>
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

                  <label className="stack-field">
                    <span>Group By</span>
                    <select
                      value={reportFilters.groupBy}
                      onChange={(event) =>
                        setReportFilters((current) => ({
                          ...current,
                          groupBy: event.target.value,
                        }))
                      }
                    >
                      <option value="day">Hom nay</option>
                      <option value="month">Thang</option>
                      <option value="year">Nam</option>
                    </select>
                  </label>

                  <label className="stack-field">
                    <span>Top San Pham</span>
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
                </form>

                <div className="report-kpi-grid">
                  <article className="report-kpi-card">
                    <span>Tong doanh thu</span>
                    <strong>{formatCurrency(readField(summary, 'tongDoanhThu', 'TongDoanhThu'))}</strong>
                  </article>
                  <article className="report-kpi-card">
                    <span>So hoa don</span>
                    <strong>{readField(summary, 'soHoaDon', 'SoHoaDon') ?? 0}</strong>
                  </article>
                  <article className="report-kpi-card">
                    <span>Top san pham dang xem</span>
                    <strong>{displayTopProducts.length}</strong>
                  </article>
                </div>

                <div className="split-layout split-layout--tight">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ngay</th>
                          <th>So Hoa Don</th>
                          <th>Doanh Thu</th>
                          <th>Loi Nhuan</th>
                          <th>Chi Tiet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRows.map((row, index) => (
                          <tr key={`${row.period}-${index}`}>
                            <td>{row.period}</td>
                            <td>{row.invoiceCount}</td>
                            <td>{formatCurrency(row.revenue)}</td>
                            <td>{row.profit ? formatCurrency(row.profit) : 'Dang cap nhat'}</td>
                            <td>
                              <button className="table-link" type="button">
                                Xem
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ma SP</th>
                          <th>Ten San Pham</th>
                          <th>Tong Ban</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayTopProducts.map((item) => (
                          <tr key={`${item.id}-${item.name}`}>
                            <td>{buildCode('SP', item.id, 0)}</td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {activeScreen === 'users' ? (
            <div className="module-stack">
              <section className="panel-card">
                <div className="panel-card__header panel-card__header--space">
                  <div>
                    <h3>Danh Sach Nguoi Dung</h3>
                    <p>
                      Tai khoan va vai tro dang duoc nap tu user-service.
                      Co {permissions.length} quyen duoc dong bo.
                    </p>
                  </div>

                  <div className="toolbar-cluster">
                    <label className="search-field search-field--compact">
                      <span>Tim kiem</span>
                      <input
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Tim kiem nguoi dung..."
                      />
                    </label>

                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setShowUserForm((current) => !current)}
                    >
                      Them Nguoi Dung
                    </button>
                  </div>
                </div>

                {showUserForm ? (
                  <form className="inline-form inline-form--users" onSubmit={handleAccountSubmit}>
                    <label className="stack-field">
                      <span>Ten Dang Nhap</span>
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

                    <label className="stack-field">
                      <span>Mat Khau</span>
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

                    <label className="stack-field">
                      <span>Ho Ten</span>
                      <input
                        value={accountForm.hoTen}
                        onChange={(event) =>
                          setAccountForm((current) => ({
                            ...current,
                            hoTen: event.target.value,
                          }))
                        }
                        placeholder="Tran Van A"
                        required
                      />
                    </label>

                    <label className="stack-field">
                      <span>Dien Thoai</span>
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

                    <label className="stack-field">
                      <span>Vai Tro</span>
                      <select
                        value={accountForm.maVaiTro}
                        onChange={(event) =>
                          setAccountForm((current) => ({
                            ...current,
                            maVaiTro: event.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Chon vai tro</option>
                        {roles.map((role, index) => {
                          const id = String(readField(role, 'MaVaiTro', 'maVaiTro') ?? index + 1)
                          const label = readField(role, 'TenVaiTro', 'tenVaiTro') || `Vai tro ${index + 1}`

                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          )
                        })}
                      </select>
                    </label>

                    <div className="inline-form__actions">
                      <button
                        className="primary-button"
                        type="submit"
                        disabled={busyAction === 'create-account'}
                      >
                        {busyAction === 'create-account' ? 'Dang tao...' : 'Luu Nguoi Dung'}
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => setShowUserForm(false)}
                      >
                        Huy
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ten Dang Nhap</th>
                        <th>Ho Ten</th>
                        <th>Vai Tro</th>
                        <th>Trang Thai</th>
                        <th>Ngay Tao</th>
                        <th>Hanh Dong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.fullName}</td>
                          <td>{user.role}</td>
                          <td>
                            <StatusBadge tone={user.status === 'Hoat dong' ? 'positive' : 'warning'}>
                              {user.status}
                            </StatusBadge>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <button className="table-link" type="button">
                              Chi tiet
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}

          {activeScreen === 'settings' ? (
            <div className="module-stack">
              <section className="panel-card">
                <div className="panel-card__header">
                  <h3>Cai Dat He Thong</h3>
                  <p>
                    Form nay di theo dung bo cuc Figma va hien dang luu trong state giao dien.
                  </p>
                </div>

                <form className="settings-grid" onSubmit={handleSettingsSubmit}>
                  <label className="stack-field">
                    <span>Ten Cua Hang</span>
                    <input
                      value={settingsForm.storeName}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          storeName: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="stack-field">
                    <span>So Dien Thoai</span>
                    <input
                      value={settingsForm.phone}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="stack-field stack-field--full">
                    <span>Dia Chi</span>
                    <input
                      value={settingsForm.address}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="stack-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="stack-field">
                    <span>VAT (%)</span>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.vatPercent}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          vatPercent: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="stack-field stack-field--full">
                    <span>Noi Dung Hoa Don</span>
                    <textarea
                      value={settingsForm.invoiceMessage}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          invoiceMessage: event.target.value,
                        }))
                      }
                      rows="5"
                    />
                  </label>

                  <label className="stack-field stack-field--full">
                    <span>Logo Cua Hang</span>
                    <input
                      value={settingsForm.logo}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          logo: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="form-actions">
                    <button className="primary-button" type="submit">
                      Luu Cai Dat
                    </button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default App
