import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import {
  api,
  clearSession,
  readSession,
  saveSession,
} from './api'
import './App.css'

const VAT_RATE = 0.08

const PERMISSIONS = {
  SALES: 'TAO_HOA_DON',
  PRODUCTS: 'QUAN_LY_SAN_PHAM',
  REPORTS: 'XEM_BAO_CAO',
  USERS: 'QUAN_LY_NGUOI_DUNG',
  SETTINGS: 'CAI_DAT_HE_THONG',
}

const NAV_ITEMS = [
  {
    id: 'orders',
    badge: '01',
    icon: '🛍️',
    label: 'Quản lý bán hàng',
    description: 'Danh sách đơn hàng, bộ lọc trạng thái và bảng chi tiết.',
    permission: PERMISSIONS.SALES,
  },
  {
    id: 'products',
    badge: '02',
    icon: '📦',
    label: 'Quản lý sản phẩm',
    description: 'Lưới sản phẩm, form cập nhật và tồn kho theo file thiết kế.',
    permission: PERMISSIONS.PRODUCTS,
  },
  {
    id: 'reports',
    badge: '03',
    icon: '📈',
    label: 'Báo cáo & thống kê',
    description: 'KPI doanh thu, biểu đồ cột và top sản phẩm bán ra.',
    permission: PERMISSIONS.REPORTS,
  },
  {
    id: 'sales',
    badge: '04',
    icon: '🛒',
    label: 'Thêm vào giỏ hàng',
    description: 'POS sáng màu với category pills, giỏ hàng và thanh toán.',
    permission: PERMISSIONS.SALES,
  },
  {
    id: 'users',
    badge: '05',
    icon: '👥',
    label: 'Quản lý người dùng',
    description: 'Danh sách tài khoản, vai trò và popup Add Roles.',
    permission: PERMISSIONS.USERS,
  },
  {
    id: 'settings',
    badge: '06',
    icon: '⚙️',
    label: 'Cài đặt',
    description: 'Hồ sơ quản trị, thông tin cửa hàng và cấu hình hóa đơn.',
    permission: PERMISSIONS.SETTINGS,
  },
]

const BRANCH_OPTIONS = [
  'Tất cả chi nhánh',
  'Circle K Quận 1',
  'Circle K Mê Linh',
  'Circle K Tuyên Quang',
]

const FALLBACK_CATEGORIES = [
  { id: '1', label: 'Đồ ăn', emoji: '🌭' },
  { id: '2', label: 'Cà phê', emoji: '☕' },
  { id: '3', label: 'Đồ uống khác', emoji: '🥤' },
  { id: '4', label: 'Combo có sẵn', emoji: '🎁' },
]

const FALLBACK_SUPPLIERS = [
  { id: '1', label: 'Circle K Central Kitchen' },
  { id: '2', label: 'Highlands Distributor' },
  { id: '3', label: 'PhaTea Vendor' },
]

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    code: 'SP001',
    name: 'MATCHA PhaTea',
    categoryId: '3',
    categoryLabel: 'Đồ uống khác',
    categoryEmoji: '🥤',
    supplierId: '3',
    supplierLabel: 'PhaTea Vendor',
    price: 12000,
    comparePrice: 54000,
    stock: 24,
    status: 'Còn hàng',
    glyph: 'MP',
  },
  {
    id: 2,
    code: 'SP002',
    name: 'CAFE NGƯỜI TUYÊN QUANG TÔI',
    categoryId: '2',
    categoryLabel: 'Cà phê',
    categoryEmoji: '☕',
    supplierId: '2',
    supplierLabel: 'Highlands Distributor',
    price: 20000,
    comparePrice: 22000,
    stock: 18,
    status: 'Còn hàng',
    glyph: 'CT',
  },
  {
    id: 3,
    code: 'SP003',
    name: 'HIGHLAND COFFEE',
    categoryId: '2',
    categoryLabel: 'Cà phê',
    categoryEmoji: '☕',
    supplierId: '2',
    supplierLabel: 'Highlands Distributor',
    price: 12000,
    comparePrice: 54000,
    stock: 16,
    status: 'Còn hàng',
    glyph: 'HC',
  },
  {
    id: 4,
    code: 'SP004',
    name: 'Cafe NGƯỜI MÊ LINH TÔI',
    categoryId: '2',
    categoryLabel: 'Cà phê',
    categoryEmoji: '☕',
    supplierId: '2',
    supplierLabel: 'Highlands Distributor',
    price: 18000,
    comparePrice: 54000,
    stock: 12,
    status: 'Còn hàng',
    glyph: 'ML',
  },
  {
    id: 5,
    code: 'SP005',
    name: 'CAFE PHIN',
    categoryId: '2',
    categoryLabel: 'Cà phê',
    categoryEmoji: '☕',
    supplierId: '1',
    supplierLabel: 'Circle K Central Kitchen',
    price: 20000,
    comparePrice: 22000,
    stock: 0,
    status: 'Hết hàng',
    glyph: 'CP',
  },
]

const FALLBACK_ORDERS = [
  {
    id: 'C01',
    customerName: 'Trương Ngọc Linh',
    assigneeName: 'Admin',
    total: 150000,
    status: 'Mới',
    createdAt: '2026-04-12T18:36:00',
  },
  {
    id: 'C02',
    customerName: 'Trần Trọng Quang',
    assigneeName: 'Admin',
    total: 200000,
    status: 'Đang xử lý',
    createdAt: '2026-04-11T08:30:00',
  },
  {
    id: 'C03',
    customerName: 'Trần Trọng Quang',
    assigneeName: 'Admin',
    total: 36000,
    status: 'Hủy',
    createdAt: '2026-04-11T12:47:00',
  },
  {
    id: 'C04',
    customerName: 'Trần Trọng Quang',
    assigneeName: 'Admin',
    total: 56000,
    status: 'Đang xử lý',
    createdAt: '2026-04-12T14:30:00',
  },
]

const FALLBACK_REVENUE_ROWS = [
  { period: 'Tuần 1', invoiceCount: 12, revenue: 1450000 },
  { period: 'Tuần 2', invoiceCount: 17, revenue: 1980000 },
  { period: 'Tuần 3', invoiceCount: 11, revenue: 1260000 },
  { period: 'Tuần 4', invoiceCount: 21, revenue: 2450000 },
]

const FALLBACK_TOP_PRODUCTS = [
  { id: 1, name: 'MATCHA PhaTea', quantity: 54 },
  { id: 2, name: 'HIGHLAND COFFEE', quantity: 42 },
  { id: 3, name: 'Cafe NGƯỜI MÊ LINH TÔI', quantity: 35 },
]

const FALLBACK_ROLES = [
  {
    id: 1,
    name: 'Admin',
    description: 'Toàn quyền cấu hình hệ thống và điều phối dữ liệu.',
  },
  {
    id: 2,
    name: 'Nhân viên bán hàng',
    description: 'Tạo hóa đơn, thao tác POS và cập nhật khách tại quầy.',
  },
  {
    id: 3,
    name: 'Quản lý ca',
    description: 'Theo dõi báo cáo, duyệt đơn và hỗ trợ vận hành cửa hàng.',
  },
]

const FALLBACK_PERMISSION_NAMES = [
  'TAO_HOA_DON',
  'QUAN_LY_SAN_PHAM',
  'XEM_BAO_CAO',
  'QUAN_LY_NGUOI_DUNG',
  'CAI_DAT_HE_THONG',
]

const FALLBACK_SETTINGS = {
  tenCuaHang: 'Circle K Nguyễn Huệ',
  diaChi: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  soDienThoai: '0912 345 678',
  email: 'admin@circlek-demo.vn',
  noiDungHoaDon: 'Cảm ơn quý khách đã mua hàng tại Circle K.',
  vatPercent: '8',
  logo: 'circle-k-demo.png',
}

const INITIAL_LOGIN_FORM = {
  username: 'admin.circlek',
  password: '123456',
}

const EMPTY_PRODUCT_FORM = {
  id: '',
  code: '',
  name: '',
  categoryId: '1',
  supplierId: '1',
  price: '',
  comparePrice: '',
  stock: '0',
}

const EMPTY_ACCOUNT_FORM = {
  id: '',
  username: '',
  password: '123456',
  fullName: '',
  roleId: '1',
  phone: '',
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
  if (value === true || value === 1 || value === '1' || value === 'true') {
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
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDateTime(value) {
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
    hour: '2-digit',
    minute: '2-digit',
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

function formatCompactNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0))
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

function getPermissionNames(user) {
  if (!Array.isArray(user?.permissions)) {
    return []
  }

  return user.permissions.map((permission) =>
    typeof permission === 'string' ? permission : permission.tenQuyen,
  )
}

function normalizeSession(rawSession) {
  if (!rawSession?.token || !rawSession?.user) {
    return null
  }

  const permissions = Array.isArray(rawSession.user.permissions)
    ? rawSession.user.permissions.map((permission) =>
        typeof permission === 'string'
          ? { tenQuyen: permission }
          : permission,
      )
    : []

  return {
    token: rawSession.token,
    mode: rawSession.mode || 'live',
    user: {
      ...rawSession.user,
      permissions,
    },
  }
}

function createDemoSession(username = 'admin.circlek') {
  return normalizeSession({
    token: 'demo-session',
    mode: 'demo',
    user: {
      maTaiKhoan: 1,
      maNhanVien: 1,
      username,
      hoTen: 'Admin Circle K',
      dienThoai: '0912 345 678',
      permissions: FALLBACK_PERMISSION_NAMES,
    },
  })
}

function pickCategoryEmoji(index) {
  return FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length]?.emoji || '📦'
}

function buildLookup(records, key = 'id', label = 'label') {
  return Object.fromEntries(records.map((record) => [String(record[key]), record[label]]))
}

function mapCategories(rawCategories) {
  if (!Array.isArray(rawCategories) || rawCategories.length === 0) {
    return FALLBACK_CATEGORIES
  }

  return rawCategories.map((item, index) => ({
    id: String(readField(item, 'MaDanhMuc', 'maDanhMuc') ?? index + 1),
    label: readField(item, 'TenDanhMuc', 'tenDanhMuc') || `Danh mục ${index + 1}`,
    emoji: pickCategoryEmoji(index),
  }))
}

function mapSuppliers(rawSuppliers) {
  if (!Array.isArray(rawSuppliers) || rawSuppliers.length === 0) {
    return FALLBACK_SUPPLIERS
  }

  return rawSuppliers.map((item, index) => ({
    id: String(readField(item, 'MaNCC', 'maNCC') ?? index + 1),
    label: readField(item, 'TenCongTy', 'tenCongTy') || `Nhà cung cấp ${index + 1}`,
  }))
}

function mapProducts(rawProducts, categories, suppliers) {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    return FALLBACK_PRODUCTS
  }

  const categoryLookup = buildLookup(categories)
  const categoryEmojiLookup = Object.fromEntries(
    categories.map((category) => [String(category.id), category.emoji]),
  )
  const supplierLookup = buildLookup(suppliers)

  return rawProducts
    .filter((product) => !toBooleanLike(readField(product, 'IsDeleted', 'isDeleted')))
    .map((product, index) => {
      const id = Number(readField(product, 'MaSanPham', 'maSanPham') ?? index + 1)
      const categoryId = String(readField(product, 'MaDanhMuc', 'maDanhMuc') ?? '1')
      const supplierId = String(readField(product, 'MaNCC', 'maNCC') ?? '1')
      const name = readField(product, 'TenSanPham', 'tenSanPham') || `Sản phẩm ${index + 1}`
      const stock = Number(readField(product, 'SoLuong', 'soLuong') ?? 0)

      return {
        id,
        code: `SP${String(id).padStart(3, '0')}`,
        name,
        categoryId,
        categoryLabel: categoryLookup[categoryId] || `Danh mục ${categoryId}`,
        categoryEmoji: categoryEmojiLookup[categoryId] || pickCategoryEmoji(index),
        supplierId,
        supplierLabel: supplierLookup[supplierId] || `Nhà cung cấp ${supplierId}`,
        price: Number(readField(product, 'Gia', 'gia') ?? 0),
        comparePrice: Math.round(Number(readField(product, 'Gia', 'gia') ?? 0) * 1.15),
        stock,
        status: stock > 0 ? 'Còn hàng' : 'Hết hàng',
        glyph: normalizeText(name).slice(0, 2).toUpperCase() || 'SP',
      }
    })
}

function mapOrders(rawOrders, currentUser) {
  if (!Array.isArray(rawOrders) || rawOrders.length === 0) {
    return FALLBACK_ORDERS
  }

  return rawOrders.map((order, index) => ({
    id: String(readField(order, 'MaHoaDon', 'maHoaDon') ?? `C${index + 1}`),
    customerName:
      readField(
        order,
        'TenKhachHang',
        'tenKhachHang',
        'HoTenKhachHang',
        'hoTenKhachHang',
      ) ||
      readField(order, 'TenNhanVien', 'tenNhanVien') ||
      currentUser?.hoTen ||
      'Khách lẻ',
    assigneeName:
      readField(order, 'TenNhanVien', 'tenNhanVien') ||
      currentUser?.hoTen ||
      currentUser?.username ||
      'Admin',
    total: Number(readField(order, 'TongTien', 'tongTien', 'ThanhTien', 'thanhTien') ?? 0),
    status: readField(order, 'TrangThai', 'trangThai') || 'Mới',
    createdAt: readField(order, 'NgayLap', 'ngayLap', 'createdAt') || new Date().toISOString(),
  }))
}

function mapRevenueRows(rawRows) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return FALLBACK_REVENUE_ROWS
  }

  return rawRows.map((row, index) => ({
    period: readField(row, 'period', 'Period') || `Mốc ${index + 1}`,
    invoiceCount: Number(readField(row, 'soHoaDon', 'SoHoaDon') ?? 0),
    revenue: Number(readField(row, 'tongDoanhThu', 'TongDoanhThu') ?? 0),
  }))
}

function mapTopProducts(rawRows, products) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return FALLBACK_TOP_PRODUCTS
  }

  const productLookup = Object.fromEntries(products.map((product) => [String(product.id), product.name]))

  return rawRows.map((row, index) => ({
    id: Number(readField(row, 'maSanPham', 'MaSanPham') ?? index + 1),
    name:
      readField(row, 'tenSanPham', 'TenSanPham') ||
      productLookup[String(readField(row, 'maSanPham', 'MaSanPham') ?? index + 1)] ||
      `Sản phẩm ${index + 1}`,
    quantity: Number(readField(row, 'tongSoLuongBan', 'TongSoLuongBan') ?? 0),
  }))
}

function mapRoles(rawRoles) {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) {
    return FALLBACK_ROLES
  }

  return rawRoles.map((role, index) => ({
    id: Number(readField(role, 'MaVaiTro', 'maVaiTro') ?? index + 1),
    name: readField(role, 'TenVaiTro', 'tenVaiTro') || `Vai trò ${index + 1}`,
    description:
      readField(role, 'MoTa', 'moTa') ||
      FALLBACK_ROLES[index % FALLBACK_ROLES.length].description,
  }))
}

function mapPermissions(rawPermissions) {
  if (!Array.isArray(rawPermissions) || rawPermissions.length === 0) {
    return FALLBACK_PERMISSION_NAMES
  }

  return rawPermissions.map((permission) =>
    readField(permission, 'TenQuyen', 'tenQuyen') || 'UNKNOWN_PERMISSION',
  )
}

function mapAccounts(rawAccounts, roles, currentUser) {
  const roleLookup = Object.fromEntries(roles.map((role) => [String(role.id), role.name]))

  if (!Array.isArray(rawAccounts) || rawAccounts.length === 0) {
    return [
      {
        id: Number(currentUser?.maTaiKhoan || 1),
        username: currentUser?.username || 'admin.circlek',
        fullName: currentUser?.hoTen || 'Admin Circle K',
        roleId: 1,
        roleLabel: 'Admin',
        phone: currentUser?.dienThoai || '0912 345 678',
        status: 'Hoạt động',
      },
      {
        id: 2,
        username: 'sale.circlek',
        fullName: 'Nhân viên quầy 01',
        roleId: 2,
        roleLabel: 'Nhân viên bán hàng',
        phone: '0903 111 222',
        status: 'Hoạt động',
      },
    ]
  }

  return rawAccounts.map((account, index) => {
    const roleId = Number(readField(account, 'MaVaiTro', 'maVaiTro') ?? 1)

    return {
      id: Number(readField(account, 'MaTaiKhoan', 'maTaiKhoan') ?? index + 1),
      username: readField(account, 'Username', 'username') || `user${index + 1}`,
      fullName: readField(account, 'HoTen', 'hoTen') || `Nhân viên ${index + 1}`,
      roleId,
      roleLabel:
        readField(account, 'TenVaiTro', 'tenVaiTro') ||
        roleLookup[String(roleId)] ||
        `Vai trò ${roleId}`,
      phone: readField(account, 'DienThoai', 'dienThoai') || '',
      status: toBooleanLike(readField(account, 'IsDeleted', 'isDeleted'))
        ? 'Tạm khóa'
        : 'Hoạt động',
    }
  })
}

function mapSettings(rawSettings) {
  if (!rawSettings) {
    return FALLBACK_SETTINGS
  }

  return {
    tenCuaHang: readField(rawSettings, 'tenCuaHang', 'TenCuaHang') || FALLBACK_SETTINGS.tenCuaHang,
    diaChi: readField(rawSettings, 'diaChi', 'DiaChi') || FALLBACK_SETTINGS.diaChi,
    soDienThoai:
      readField(rawSettings, 'soDienThoai', 'SoDienThoai') || FALLBACK_SETTINGS.soDienThoai,
    email: readField(rawSettings, 'email', 'Email') || FALLBACK_SETTINGS.email,
    noiDungHoaDon:
      readField(rawSettings, 'noiDungHoaDon', 'NoiDungHoaDon') ||
      FALLBACK_SETTINGS.noiDungHoaDon,
    vatPercent: String(
      readField(rawSettings, 'vatPercent', 'VatPercent') ?? FALLBACK_SETTINGS.vatPercent,
    ),
    logo: readField(rawSettings, 'logo', 'Logo') || FALLBACK_SETTINGS.logo,
  }
}

function upsertById(records, nextRecord) {
  const index = records.findIndex((record) => String(record.id) === String(nextRecord.id))

  if (index === -1) {
    return [nextRecord, ...records]
  }

  const next = [...records]
  next[index] = nextRecord
  return next
}

function getStatusTone(status) {
  const value = normalizeText(status)

  if (value.includes('moi')) {
    return 'info'
  }

  if (value.includes('dang xu ly') || value.includes('cho')) {
    return 'warning'
  }

  if (value.includes('hoan tat') || value.includes('thanh cong')) {
    return 'success'
  }

  if (value.includes('huy')) {
    return 'danger'
  }

  return 'neutral'
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = window.URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

function StatusPill({ tone = 'neutral', children }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>
}

function NoticeBar({ notice }) {
  if (!notice?.message) {
    return null
  }

  return (
    <div className={`notice-bar notice-bar--${notice.tone || 'info'}`}>
      <strong>{notice.tone === 'success' ? 'Đồng bộ' : 'Thông báo'}</strong>
      <span>{notice.message}</span>
    </div>
  )
}

function MetricCard({ eyebrow, value, label, tone = 'blue' }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__eyebrow">{eyebrow}</p>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
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
      <span className="sidebar__item-copy">
        <strong>{item.icon} {item.label}</strong>
        <small>{item.description}</small>
      </span>
    </button>
  )
}

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(() => normalizeSession(readSession()))
  const [booting, setBooting] = useState(Boolean(readSession()?.token))
  const [syncing, setSyncing] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState({
    tone: 'info',
    message: 'UI đang bám lại layout trong hồ sơ cá nhân.fig.',
  })
  const [activeSection, setActiveSection] = useState('orders')

  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [suppliers, setSuppliers] = useState(FALLBACK_SUPPLIERS)
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [orders, setOrders] = useState(FALLBACK_ORDERS)
  const [reportRows, setReportRows] = useState(FALLBACK_REVENUE_ROWS)
  const [topProducts, setTopProducts] = useState(FALLBACK_TOP_PRODUCTS)
  const [summary, setSummary] = useState({
    invoiceCount: FALLBACK_ORDERS.length,
    revenue: FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
  })
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [permissionNamesCatalog, setPermissionNamesCatalog] = useState(FALLBACK_PERMISSION_NAMES)
  const [accounts, setAccounts] = useState([])
  const [settingsForm, setSettingsForm] = useState(FALLBACK_SETTINGS)

  const [ordersSearch, setOrdersSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [salesSearch, setSalesSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [salesCategoryFilter, setSalesCategoryFilter] = useState('all')
  const [selectedProductId, setSelectedProductId] = useState(String(FALLBACK_PRODUCTS[0].id))
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM)
  const [cartItems, setCartItems] = useState([])
  const [saleQuantity, setSaleQuantity] = useState(1)
  const [cartNote, setCartNote] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [eventPromo, setEventPromo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT')
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [reportPreset, setReportPreset] = useState('month')
  const [branchFilter, setBranchFilter] = useState(BRANCH_OPTIONS[0])

  const deferredOrdersSearch = useDeferredValue(ordersSearch)
  const deferredProductSearch = useDeferredValue(productSearch)
  const deferredSalesSearch = useDeferredValue(salesSearch)
  const deferredUserSearch = useDeferredValue(userSearch)

  const currentUser = session?.user || null
  const permissionNames = getPermissionNames(currentUser)

  const availableNavItems = NAV_ITEMS.filter((item) =>
    permissionNames.includes(item.permission),
  )

  const activeMeta = availableNavItems.find((item) => item.id === activeSection) || availableNavItems[0]

  const profileInitials = normalizeText(currentUser?.hoTen || currentUser?.username || 'AD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AD'

  function persistSession(nextSession) {
    const normalized = normalizeSession(nextSession)
    setSession(normalized)

    if (normalized) {
      saveSession(normalized)
    } else {
      clearSession()
    }
  }

  function applyDemoData(source = 'demo') {
    const demoUser = session?.user || createDemoSession(loginForm.username).user
    const demoAccounts = [
      {
        id: Number(demoUser?.maTaiKhoan || 1),
        username: demoUser?.username || 'admin.circlek',
        fullName: demoUser?.hoTen || 'Admin Circle K',
        roleId: 1,
        roleLabel: 'Admin',
        phone: demoUser?.dienThoai || '0912 345 678',
        status: 'Hoạt động',
      },
      {
        id: 2,
        username: 'cashier.circlek',
        fullName: 'Nhân viên quầy 01',
        roleId: 2,
        roleLabel: 'Nhân viên bán hàng',
        phone: '0903 111 222',
        status: 'Hoạt động',
      },
    ]

    setCategories(FALLBACK_CATEGORIES)
    setSuppliers(FALLBACK_SUPPLIERS)
    setProducts(FALLBACK_PRODUCTS)
    setOrders(FALLBACK_ORDERS)
    setReportRows(FALLBACK_REVENUE_ROWS)
    setTopProducts(FALLBACK_TOP_PRODUCTS)
    setSummary({
      invoiceCount: FALLBACK_ORDERS.length,
      revenue: FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
    })
    setRoles(FALLBACK_ROLES)
    setPermissionNamesCatalog(FALLBACK_PERMISSION_NAMES)
    setAccounts(demoAccounts)
    setSettingsForm(FALLBACK_SETTINGS)
    setSelectedProductId(String(FALLBACK_PRODUCTS[0].id))
    setProductForm(EMPTY_PRODUCT_FORM)

    if (source === 'demo') {
      setNotice({
        tone: 'info',
        message: 'Đang chạy UI bằng dữ liệu demo nội bộ để bạn test layout mà không cần backend.',
      })
    }
  }

  function handleUnauthorized() {
    persistSession(null)
    setCartItems([])
    setShowCheckoutModal(false)
    setShowUserModal(false)
    setShowRoleModal(false)
    setBooting(false)
  }

  async function refreshDashboard({ silent = false } = {}) {
    if (!session?.token) {
      return
    }

    if (session.mode === 'demo') {
      applyDemoData('demo')
      setBooting(false)
      setSyncing(false)
      return
    }

    if (silent) {
      setSyncing(true)
    } else {
      setBooting(true)
    }

    const requests = [
      { key: 'me', run: () => api.getMe() },
      { key: 'products', enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS), run: () => api.getProducts() },
      { key: 'categories', enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS), run: () => api.getCategories() },
      { key: 'suppliers', enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS), run: () => api.getSuppliers() },
      { key: 'orders', enabled: permissionNames.includes(PERMISSIONS.SALES), run: () => api.getOrders() },
      { key: 'invoiceSummary', enabled: permissionNames.includes(PERMISSIONS.REPORTS), run: () => api.getInvoiceSummary({}) },
      { key: 'revenue', enabled: permissionNames.includes(PERMISSIONS.REPORTS), run: () => api.getRevenueReport({ groupBy: 'day' }) },
      { key: 'topProducts', enabled: permissionNames.includes(PERMISSIONS.REPORTS), run: () => api.getTopProductsReport({ limit: 5 }) },
      { key: 'roles', enabled: permissionNames.includes(PERMISSIONS.USERS), run: () => api.getRoles() },
      { key: 'permissions', enabled: permissionNames.includes(PERMISSIONS.USERS), run: () => api.getPermissions() },
      { key: 'accounts', enabled: permissionNames.includes(PERMISSIONS.USERS), run: () => api.getAccounts() },
      { key: 'settings', enabled: permissionNames.includes(PERMISSIONS.SETTINGS), run: () => api.getSystemSettings() },
    ].filter((item) => item.enabled !== false)

    const results = await Promise.allSettled(requests.map((request) => request.run()))

    if (results.some((result) => result.status === 'rejected' && result.reason?.status === 401)) {
      handleUnauthorized()
      setNotice({
        tone: 'warning',
        message: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.',
      })
      return
    }

    const payloads = {}
    const fallbackBlocks = []

    requests.forEach((request, index) => {
      const result = results[index]

      if (result.status === 'fulfilled') {
        payloads[request.key] = result.value
      } else {
        fallbackBlocks.push(request.key)
      }
    })

    const mappedCategories = mapCategories(payloads.categories)
    const mappedSuppliers = mapSuppliers(payloads.suppliers)
    const mappedProducts = mapProducts(payloads.products, mappedCategories, mappedSuppliers)
    const mappedRoles = mapRoles(payloads.roles)

    setCategories(mappedCategories)
    setSuppliers(mappedSuppliers)
    setProducts(mappedProducts)
    setOrders(mapOrders(payloads.orders, payloads.me || currentUser))
    setReportRows(mapRevenueRows(payloads.revenue))
    setTopProducts(mapTopProducts(payloads.topProducts, mappedProducts))
    setRoles(mappedRoles)
    setPermissionNamesCatalog(mapPermissions(payloads.permissions))
    setAccounts(mapAccounts(payloads.accounts, mappedRoles, payloads.me || currentUser))
    setSettingsForm(mapSettings(payloads.settings))

    if (payloads.invoiceSummary) {
      setSummary({
        invoiceCount: Number(
          readField(payloads.invoiceSummary, 'soHoaDon', 'SoHoaDon') ?? FALLBACK_ORDERS.length,
        ),
        revenue: Number(
          readField(payloads.invoiceSummary, 'tongDoanhThu', 'TongDoanhThu') ??
            FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
        ),
      })
    } else {
      setSummary({
        invoiceCount: FALLBACK_ORDERS.length,
        revenue: FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
      })
    }

    if (payloads.me) {
      persistSession({
        token: session.token,
        mode: 'live',
        user: {
          ...currentUser,
          ...payloads.me,
          permissions: payloads.me.permissions || currentUser?.permissions || [],
        },
      })
    }

    if (fallbackBlocks.length > 0) {
      const labels = fallbackBlocks
        .map((key) => {
          switch (key) {
            case 'products':
            case 'categories':
            case 'suppliers':
              return 'sản phẩm'
            case 'orders':
              return 'đơn hàng'
            case 'invoiceSummary':
            case 'revenue':
            case 'topProducts':
              return 'báo cáo'
            case 'roles':
            case 'permissions':
            case 'accounts':
              return 'người dùng'
            case 'settings':
              return 'cài đặt'
            default:
              return null
          }
        })
        .filter(Boolean)

      setNotice({
        tone: 'warning',
        message: `Một số service chưa phản hồi, đang dùng fallback cho: ${Array.from(new Set(labels)).join(', ')}.`,
      })
    } else {
      setNotice({
        tone: 'success',
        message: 'Dữ liệu đã đồng bộ đầy đủ từ gateway và các service hiện tại.',
      })
    }

    setBooting(false)
    setSyncing(false)
  }

  useEffect(() => {
    if (!session?.token) {
      setBooting(false)
      return
    }

    void refreshDashboard()
  }, [session?.token, session?.mode])

  useEffect(() => {
    if (availableNavItems.length === 0) {
      return
    }

    const activeAllowed = availableNavItems.some((item) => item.id === activeSection)
    if (!activeAllowed) {
      setActiveSection(availableNavItems[0].id)
    }
  }, [activeSection, availableNavItems])

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(String(products[0].id))
    }
  }, [products, selectedProductId])

  const selectedProduct =
    products.find((product) => String(product.id) === String(selectedProductId)) || products[0] || null

  const filteredOrders = orders.filter((order) => {
    const keyword = normalizeText(deferredOrdersSearch)
    if (!keyword) {
      return true
    }

    return [
      order.id,
      order.customerName,
      order.assigneeName,
      order.status,
    ].some((field) => normalizeText(field).includes(keyword))
  })

  const filteredProductRows = products.filter((product) => {
    const keyword = normalizeText(deferredProductSearch)
    const matchesKeyword = !keyword || [
      product.code,
      product.name,
      product.categoryLabel,
      product.supplierLabel,
    ].some((field) => normalizeText(field).includes(keyword))
    const matchesCategory =
      productCategoryFilter === 'all' || String(product.categoryId) === String(productCategoryFilter)

    return matchesKeyword && matchesCategory
  })

  const filteredSalesProducts = products.filter((product) => {
    const keyword = normalizeText(deferredSalesSearch)
    const matchesKeyword = !keyword || [
      product.code,
      product.name,
      product.categoryLabel,
    ].some((field) => normalizeText(field).includes(keyword))
    const matchesCategory =
      salesCategoryFilter === 'all' || String(product.categoryId) === String(salesCategoryFilter)

    return matchesKeyword && matchesCategory
  })

  const filteredUsers = accounts.filter((account) => {
    const keyword = normalizeText(deferredUserSearch)
    if (!keyword) {
      return true
    }

    return [
      account.username,
      account.fullName,
      account.roleLabel,
      account.phone,
    ].some((field) => normalizeText(field).includes(keyword))
  })

  const cartLines = cartItems
    .map((item) => {
      const product = products.find((record) => String(record.id) === String(item.productId))
      if (!product) {
        return null
      }

      return {
        ...product,
        quantity: Number(item.quantity || 0),
        lineTotal: Number(item.quantity || 0) * product.price,
      }
    })
    .filter(Boolean)

  const subtotal = cartLines.reduce((total, line) => total + line.lineTotal, 0)
  const discountValue = Number(discountAmount || 0)
  const vatValue = Math.max(0, Math.round((subtotal - discountValue) * VAT_RATE))
  const grandTotal = Math.max(0, subtotal - discountValue + vatValue)
  const orderStatusSummary = {
    all: orders.length,
    new: orders.filter((order) => normalizeText(order.status).includes('moi')).length,
    processing: orders.filter((order) => normalizeText(order.status).includes('dang xu ly')).length,
    done: orders.filter((order) => normalizeText(order.status).includes('hoan tat')).length,
    cancel: orders.filter((order) => normalizeText(order.status).includes('huy')).length,
  }

  const averageTicket = summary.invoiceCount > 0 ? summary.revenue / summary.invoiceCount : 0
  const maxRevenue = Math.max(...reportRows.map((row) => row.revenue), 1)

  function openDemoMode() {
    const demoSession = createDemoSession(loginForm.username || 'admin.circlek')
    persistSession(demoSession)
    applyDemoData('demo')
  }

  async function handleLogin(event) {
    event.preventDefault()
    setBusyAction('login')

    try {
      const result = await api.login(loginForm)
      persistSession({
        ...result,
        mode: 'live',
      })
      setNotice({
        tone: 'success',
        message: 'Đăng nhập thành công. Đang nạp giao diện theo đúng quyền của tài khoản.',
      })
    } catch (error) {
      openDemoMode()
      setNotice({
        tone: 'warning',
        message: `Gateway chưa sẵn sàng (${extractErrorMessage(error)}). Đã chuyển sang demo mode để test UI.`,
      })
    } finally {
      setBusyAction('')
    }
  }

  function handleLogout() {
    handleUnauthorized()
    setNotice({
      tone: 'info',
      message: 'Đã đăng xuất khỏi giao diện quản trị.',
    })
  }

  function handleSelectProductForEditor(product) {
    setProductForm({
      id: String(product.id),
      code: product.code,
      name: product.name,
      categoryId: String(product.categoryId),
      supplierId: String(product.supplierId),
      price: String(product.price),
      comparePrice: String(product.comparePrice || ''),
      stock: String(product.stock),
    })
  }

  function resetProductForm() {
    setProductForm(EMPTY_PRODUCT_FORM)
  }

  async function handleSaveProduct(event) {
    event.preventDefault()
    setBusyAction('save-product')

    const nextProduct = {
      id: productForm.id ? Number(productForm.id) : Date.now(),
      code: productForm.code.trim() || `SP${String(Date.now()).slice(-3)}`,
      name: productForm.name.trim(),
      categoryId: String(productForm.categoryId),
      categoryLabel: categories.find((item) => String(item.id) === String(productForm.categoryId))?.label || 'Danh mục',
      categoryEmoji: categories.find((item) => String(item.id) === String(productForm.categoryId))?.emoji || '📦',
      supplierId: String(productForm.supplierId),
      supplierLabel: suppliers.find((item) => String(item.id) === String(productForm.supplierId))?.label || 'Nhà cung cấp',
      price: Number(productForm.price || 0),
      comparePrice: Number(productForm.comparePrice || 0),
      stock: Number(productForm.stock || 0),
      status: Number(productForm.stock || 0) > 0 ? 'Còn hàng' : 'Hết hàng',
      glyph: normalizeText(productForm.name).slice(0, 2).toUpperCase() || 'SP',
    }

    try {
      if (session.mode === 'demo') {
        setProducts((current) => upsertById(current, nextProduct))
      } else {
        const payload = {
          tenSanPham: nextProduct.name,
          gia: nextProduct.price,
          soLuong: nextProduct.stock,
          maDanhMuc: Number(nextProduct.categoryId),
          maNCC: Number(nextProduct.supplierId),
        }

        if (productForm.id) {
          await api.updateProduct(productForm.id, payload)
        } else {
          await api.createProduct(payload)
        }

        await refreshDashboard({ silent: true })
      }

      resetProductForm()
      setNotice({
        tone: 'success',
        message: 'Thông tin sản phẩm đã được lưu.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm('Bạn có chắc muốn xóa mềm sản phẩm này?')) {
      return
    }

    setBusyAction(`delete-product-${productId}`)

    try {
      if (session.mode === 'demo') {
        setProducts((current) => current.filter((product) => String(product.id) !== String(productId)))
      } else {
        await api.deleteProduct(productId)
        await refreshDashboard({ silent: true })
      }

      setNotice({
        tone: 'success',
        message: 'Sản phẩm đã được gỡ khỏi danh sách hiển thị.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  function openAccountModal(account = null) {
    if (!account) {
      setAccountForm(EMPTY_ACCOUNT_FORM)
    } else {
      setAccountForm({
        id: String(account.id),
        username: account.username,
        password: '',
        fullName: account.fullName,
        roleId: String(account.roleId),
        phone: account.phone,
      })
    }

    setShowUserModal(true)
  }

  async function handleSaveAccount(event) {
    event.preventDefault()
    setBusyAction('save-account')

    const nextAccount = {
      id: accountForm.id ? Number(accountForm.id) : Date.now(),
      username: accountForm.username.trim(),
      fullName: accountForm.fullName.trim(),
      roleId: Number(accountForm.roleId || 1),
      roleLabel: roles.find((role) => String(role.id) === String(accountForm.roleId))?.name || 'Admin',
      phone: accountForm.phone.trim(),
      status: 'Hoạt động',
    }

    try {
      if (session.mode === 'demo') {
        setAccounts((current) => upsertById(current, nextAccount))
      } else if (accountForm.id) {
        await api.updateAccount(accountForm.id, {
          maVaiTro: nextAccount.roleId,
          hoTen: nextAccount.fullName,
          dienThoai: nextAccount.phone,
        })
        await refreshDashboard({ silent: true })
      } else {
        await api.createAccount({
          username: nextAccount.username,
          password: accountForm.password,
          maVaiTro: nextAccount.roleId,
          hoTen: nextAccount.fullName,
          dienThoai: nextAccount.phone,
        })
        await refreshDashboard({ silent: true })
      }

      setShowUserModal(false)
      setAccountForm(EMPTY_ACCOUNT_FORM)
      setNotice({
        tone: 'success',
        message: 'Tài khoản người dùng đã được cập nhật.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  async function handleSaveSettings(event) {
    event.preventDefault()
    setBusyAction('save-settings')

    try {
      if (session.mode !== 'demo') {
        await api.updateSystemSettings({
          tenCuaHang: settingsForm.tenCuaHang.trim(),
          diaChi: settingsForm.diaChi.trim(),
          soDienThoai: settingsForm.soDienThoai.trim(),
          email: settingsForm.email.trim(),
          noiDungHoaDon: settingsForm.noiDungHoaDon.trim(),
          vatPercent: Number(settingsForm.vatPercent || 0),
          logo: settingsForm.logo.trim(),
        })
      }

      setNotice({
        tone: 'success',
        message: 'Khối cài đặt đã được lưu.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  function changeCartQuantity(productId, delta) {
    setCartItems((current) => {
      const existing = current.find((item) => String(item.productId) === String(productId))

      if (!existing) {
        return [...current, { productId, quantity: Math.max(1, delta) }]
      }

      return current
        .map((item) =>
          String(item.productId) === String(productId)
            ? { ...item, quantity: Math.max(0, Number(item.quantity) + delta) }
            : item,
        )
        .filter((item) => Number(item.quantity) > 0)
    })
  }

  function handleAddToCart() {
    if (!selectedProduct) {
      return
    }

    if (selectedProduct.stock <= 0) {
      setNotice({
        tone: 'warning',
        message: 'Sản phẩm đang hết hàng nên chưa thể thêm vào giỏ.',
      })
      return
    }

    changeCartQuantity(selectedProduct.id, saleQuantity)
    setNotice({
      tone: 'success',
      message: `Đã thêm ${selectedProduct.name} vào giỏ hàng.`,
    })
  }

  function clearCart() {
    setCartItems([])
    setSaleQuantity(1)
    setDiscountAmount('0')
    setEventPromo('')
    setCartNote('')
  }

  async function confirmCheckout() {
    if (cartLines.length === 0) {
      return
    }

    setBusyAction('checkout')

    try {
      if (session.mode === 'demo') {
        const newOrder = {
          id: `C${String(Date.now()).slice(-3)}`,
          customerName: 'Khách tại quầy',
          assigneeName: currentUser?.hoTen || currentUser?.username || 'Admin',
          total: grandTotal,
          status: 'Mới',
          createdAt: new Date().toISOString(),
        }
        setOrders((current) => [newOrder, ...current])
      } else {
        await api.createOrder({
          maNhanVien: Number(currentUser?.maNhanVien || 1),
          phuongThucThanhToan: paymentMethod,
          items: cartLines.map((line) => ({
            maSanPham: Number(line.id),
            soLuong: Number(line.quantity),
          })),
        })

        await refreshDashboard({ silent: true })
      }

      setShowCheckoutModal(false)
      clearCart()
      setNotice({
        tone: 'success',
        message: 'Đơn hàng đã được tạo thành công từ giao diện POS.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    } finally {
      setBusyAction('')
    }
  }

  function handleExportReport() {
    downloadJson('circlek-report.json', {
      generatedAt: new Date().toISOString(),
      branchFilter,
      reportPreset,
      summary,
      reportRows,
      topProducts,
    })

    setNotice({
      tone: 'success',
      message: 'Đã xuất snapshot báo cáo dạng JSON để bạn kiểm tra nhanh.',
    })
  }

  function renderOrdersScreen() {
    return (
      <>
        <section className="section-grid section-grid--hero">
          <div className="panel panel--soft">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Quản lý đơn hàng</p>
                <h3>Danh sách đơn hàng</h3>
              </div>
              <div className="cluster-row">
                <StatusPill tone="info">Tất cả {orderStatusSummary.all}</StatusPill>
                <StatusPill tone="warning">Đang xử lý {orderStatusSummary.processing}</StatusPill>
              </div>
            </div>

            <div className="metric-row">
              <MetricCard eyebrow="Mới" value={orderStatusSummary.new} label="Đơn vừa tạo" tone="red" />
              <MetricCard eyebrow="Đang xử lý" value={orderStatusSummary.processing} label="Đơn cần theo dõi" tone="amber" />
              <MetricCard eyebrow="Hoàn tất" value={orderStatusSummary.done} label="Đơn đã chốt" tone="green" />
              <MetricCard eyebrow="Hủy" value={orderStatusSummary.cancel} label="Đơn thất bại" tone="slate" />
            </div>

            <div className="toolbar-row">
              <label className="searchbox">
                <span>🔍</span>
                <input
                  value={ordersSearch}
                  onChange={(event) => setOrdersSearch(event.target.value)}
                  placeholder="Tìm theo mã đơn, khách hàng hoặc trạng thái"
                />
              </label>
              <button className="ghost-button" type="button" onClick={() => setOrdersSearch('')}>
                Xóa lọc
              </button>
            </div>
          </div>

          <aside className="panel panel--accent">
            <p className="eyebrow">Admin</p>
            <h3>{currentUser?.hoTen || currentUser?.username || 'Admin'}</h3>
            <p className="panel__copy">
              Màn hình này bám artboard đơn hàng trong file `.fig`: sidebar nóng màu, header xanh và bảng sáng.
            </p>
            <div className="mini-stack">
              <StatusPill tone={session?.mode === 'demo' ? 'warning' : 'success'}>
                {session?.mode === 'demo' ? 'Demo mode' : 'Live mode'}
              </StatusPill>
              <StatusPill tone="neutral">{formatDateLong(new Date())}</StatusPill>
            </div>
          </aside>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Bảng dữ liệu</p>
              <h3>Danh sách đơn hàng</h3>
            </div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => void refreshDashboard({ silent: true })}
              disabled={syncing}
            >
              {syncing ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              title="Không có đơn hàng phù hợp"
              message="Thử đổi từ khóa tìm kiếm hoặc tạo đơn mới từ màn hình POS."
            />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách / nhân viên</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <span>{order.assigneeName}</span>
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <StatusPill tone={getStatusTone(order.status)}>{order.status}</StatusPill>
                      </td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="tiny-button" type="button">Xem</button>
                          <button className="tiny-button tiny-button--ghost" type="button">In</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    )
  }

  function renderReportsScreen() {
    return (
      <>
        <section className="section-grid section-grid--hero">
          <div className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Báo cáo và thống kê</p>
                <h3>Tổng quan doanh thu</h3>
              </div>
              <div className="toolbar-row">
                <select value={reportPreset} onChange={(event) => setReportPreset(event.target.value)}>
                  <option value="week">7 ngày gần nhất</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                </select>
                <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <button className="primary-button" type="button" onClick={handleExportReport}>
                  Xuất file
                </button>
              </div>
            </div>

            <div className="metric-row">
              <MetricCard eyebrow="Doanh thu" value={formatCurrency(summary.revenue)} label="Tổng doanh thu" tone="blue" />
              <MetricCard eyebrow="Hóa đơn" value={formatCompactNumber(summary.invoiceCount)} label="Số hóa đơn" tone="red" />
              <MetricCard eyebrow="TB / hóa đơn" value={formatCurrency(averageTicket)} label="Giá trị trung bình" tone="green" />
            </div>
          </div>

          <aside className="panel panel--soft">
            <p className="eyebrow">Bộ lọc nhanh</p>
            <h3>Chi nhánh & chu kỳ</h3>
            <p className="panel__copy">
              Layout phần báo cáo đang bám cụm artboard `Báo cáo và thống kê` trong file thiết kế mới.
            </p>
            <div className="mini-stack">
              <StatusPill tone="info">{reportPreset === 'month' ? 'Tháng 3' : reportPreset}</StatusPill>
              <StatusPill tone="neutral">{branchFilter}</StatusPill>
            </div>
          </aside>
        </section>

        <section className="section-grid section-grid--report">
          <article className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Biểu đồ</p>
                <h3>Doanh thu theo mốc</h3>
              </div>
            </div>

            <div className="bar-chart">
              {reportRows.map((row) => (
                <div key={row.period} className="bar-chart__item">
                  <div
                    className="bar-chart__bar"
                    style={{ height: `${Math.max(18, (row.revenue / maxRevenue) * 100)}%` }}
                  />
                  <strong>{formatCurrency(row.revenue)}</strong>
                  <span>{row.period}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Top sản phẩm</p>
                <h3>Bán chạy nhất</h3>
              </div>
            </div>

            <div className="stack-list">
              {topProducts.map((item, index) => (
                <div key={`${item.id}-${index}`} className="stack-list__item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>Đã bán {formatCompactNumber(item.quantity)} sản phẩm</p>
                  </div>
                  <StatusPill tone="success">Top {index + 1}</StatusPill>
                </div>
              ))}
            </div>
          </article>
        </section>
      </>
    )
  }

  function renderProductsScreen() {
    return (
      <>
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
      </>
    )
  }

  function renderSalesScreen() {
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

  function renderUsersScreen() {
    return (
      <>
        <section className="section-grid section-grid--hero">
          <div className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Nhân sự & phân quyền</p>
                <h3>Quản lý người dùng</h3>
              </div>
              <div className="toolbar-row">
                <button className="ghost-button" type="button" onClick={() => setShowRoleModal(true)}>
                  Add Roles
                </button>
                <button className="primary-button" type="button" onClick={() => openAccountModal()}>
                  Thêm tài khoản
                </button>
              </div>
            </div>

            <div className="metric-row">
              <MetricCard eyebrow="Tài khoản" value={accounts.length} label="Đang hiển thị" tone="blue" />
              <MetricCard eyebrow="Vai trò" value={roles.length} label="Role khả dụng" tone="red" />
              <MetricCard eyebrow="Quyền" value={permissionNamesCatalog.length} label="Permission catalog" tone="green" />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Danh sách tài khoản</p>
              <h3>Bảng người dùng</h3>
            </div>
            <label className="searchbox searchbox--compact">
              <span>🔍</span>
              <input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Tìm user, tên hoặc vai trò"
              />
            </label>
          </div>

          {filteredUsers.length === 0 ? (
            <EmptyState
              title="Không có người dùng phù hợp"
              message="Đổi từ khóa tìm kiếm hoặc thêm tài khoản mới."
            />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Họ tên</th>
                    <th>Vai trò</th>
                    <th>Điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.fullName}</td>
                      <td>{account.roleLabel}</td>
                      <td>{account.phone || '--'}</td>
                      <td>
                        <StatusPill tone={account.status === 'Hoạt động' ? 'success' : 'warning'}>
                          {account.status}
                        </StatusPill>
                      </td>
                      <td>
                        <button className="tiny-button" type="button" onClick={() => openAccountModal(account)}>
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    )
  }

  function renderSettingsScreen() {
    return (
      <>
        <section className="section-grid section-grid--settings">
          <article className="panel panel--accent">
            <div className="profile-card">
              <div className="profile-card__avatar">{profileInitials}</div>
              <div>
                <p className="eyebrow">Hồ sơ quản trị</p>
                <h3>{currentUser?.hoTen || 'Admin Circle K'}</h3>
                <span>{currentUser?.username || 'admin.circlek'}</span>
              </div>
            </div>

            <div className="stack-list">
              <div className="stack-list__item">
                <div>
                  <strong>Điện thoại</strong>
                  <p>{currentUser?.dienThoai || settingsForm.soDienThoai}</p>
                </div>
                <StatusPill tone="neutral">{session?.mode === 'demo' ? 'Demo' : 'Live'}</StatusPill>
              </div>
              <div className="stack-list__item">
                <div>
                  <strong>Quyền hiện có</strong>
                  <p>{permissionNames.length} quyền</p>
                </div>
                <StatusPill tone="info">Admin</StatusPill>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Cấu hình cửa hàng</p>
                <h3>Cài đặt hệ thống</h3>
              </div>
            </div>

            <form className="editor-form" onSubmit={handleSaveSettings}>
              <label>
                <span>Tên cửa hàng</span>
                <input
                  value={settingsForm.tenCuaHang}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, tenCuaHang: event.target.value }))}
                />
              </label>

              <label>
                <span>Địa chỉ</span>
                <input
                  value={settingsForm.diaChi}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, diaChi: event.target.value }))}
                />
              </label>

              <div className="form-split">
                <label>
                  <span>Điện thoại</span>
                  <input
                    value={settingsForm.soDienThoai}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, soDienThoai: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    value={settingsForm.email}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </label>
              </div>

              <div className="form-split">
                <label>
                  <span>VAT (%)</span>
                  <input
                    type="number"
                    value={settingsForm.vatPercent}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, vatPercent: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Logo</span>
                  <input
                    value={settingsForm.logo}
                    onChange={(event) => setSettingsForm((current) => ({ ...current, logo: event.target.value }))}
                  />
                </label>
              </div>

              <label>
                <span>Nội dung hóa đơn</span>
                <textarea
                  rows={4}
                  value={settingsForm.noiDungHoaDon}
                  onChange={(event) => setSettingsForm((current) => ({ ...current, noiDungHoaDon: event.target.value }))}
                />
              </label>

              <button className="primary-button" type="submit" disabled={busyAction === 'save-settings'}>
                {busyAction === 'save-settings' ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </form>
          </article>
        </section>
      </>
    )
  }

  function renderScreen() {
    switch (activeSection) {
      case 'orders':
        return renderOrdersScreen()
      case 'products':
        return renderProductsScreen()
      case 'reports':
        return renderReportsScreen()
      case 'sales':
        return renderSalesScreen()
      case 'users':
        return renderUsersScreen()
      case 'settings':
        return renderSettingsScreen()
      default:
        return renderOrdersScreen()
    }
  }

  if (!session) {
    return (
      <div className="login-shell">
        <section className="login-hero">
          <p className="eyebrow">Circle K Admin UI</p>
          <h1>Dựng lại UI từ hồ sơ cá nhân.fig theo layout sáng, task bar xanh dương.</h1>
          <p>
            Giao diện mới gom lại các artboard `đơn hàng`, `báo cáo`, `POS`, `Add Roles`
            và `cài đặt` vào cùng một shell React để bạn test nhanh.
          </p>
          <div className="metric-row">
            <MetricCard eyebrow="01" value="Orders" label="Bảng đơn hàng" tone="red" />
            <MetricCard eyebrow="02" value="POS" label="Giỏ hàng & thanh toán" tone="blue" />
            <MetricCard eyebrow="03" value="Roles" label="Popup phân quyền" tone="green" />
          </div>
        </section>

        <form className="login-card" onSubmit={handleLogin}>
          <div>
            <p className="eyebrow">Đăng nhập</p>
            <h2>Vào giao diện quản trị</h2>
          </div>

          <label>
            <span>Tên đăng nhập</span>
            <input
              value={loginForm.username}
              onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <div className="editor-actions">
            <button className="primary-button" type="submit" disabled={busyAction === 'login'}>
              {busyAction === 'login' ? 'Đang kết nối...' : 'Đăng nhập'}
            </button>
            <button className="ghost-button" type="button" onClick={openDemoMode}>
              Vào bản demo
            </button>
          </div>

          <p className="login-tip">
            Mặc định: <b>admin.circlek</b> / <b>123456</b>. Nếu gateway chưa chạy, nút demo vẫn mở được UI để test.
          </p>
        </form>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">CK</div>
          <div>
            <p className="eyebrow">Store Console</p>
            <h2>Circle K</h2>
          </div>
        </div>

        <nav className="sidebar__nav">
          {availableNavItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              active={item.id === activeSection}
              onSelect={(id) => startTransition(() => setActiveSection(id))}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <p>
            {session.mode === 'demo'
              ? 'Đang chạy với dữ liệu demo để test layout.'
              : 'Đang chạy với token backend hiện tại.'}
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar__copy">
            <p className="eyebrow">Task bar màu xanh dương</p>
            <h1>{activeMeta?.label || 'Dashboard'}</h1>
            <p>{activeMeta?.description || 'Giao diện quản trị theo thiết kế mới.'}</p>
          </div>

          <div className="topbar__actions">
            <button
              className="ghost-button ghost-button--light"
              type="button"
              onClick={() => void refreshDashboard({ silent: true })}
              disabled={syncing}
            >
              {syncing ? 'Đang đồng bộ...' : 'Làm mới'}
            </button>
            <div className="profile-chip">
              <div className="profile-chip__avatar">{profileInitials}</div>
              <div>
                <strong>{currentUser?.hoTen || currentUser?.username || 'Admin'}</strong>
                <span>{session.mode === 'demo' ? 'Demo mode' : 'Live mode'}</span>
              </div>
            </div>
            <button className="ghost-button ghost-button--light" type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <NoticeBar notice={notice} />

        {booting ? (
          <section className="panel panel--loading">
            <strong>Đang nạp dữ liệu giao diện...</strong>
            <p>UI sẽ dựng từ API live nếu có, hoặc fallback nội bộ nếu service chưa phản hồi.</p>
          </section>
        ) : (
          renderScreen()
        )}
      </main>

      {showUserModal ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Người dùng</p>
                <h3>{accountForm.id ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowUserModal(false)}>
                X
              </button>
            </div>

            <form className="editor-form" onSubmit={handleSaveAccount}>
              <label>
                <span>Username</span>
                <input
                  value={accountForm.username}
                  onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))}
                  required
                />
              </label>

              {!accountForm.id ? (
                <label>
                  <span>Password</span>
                  <input
                    value={accountForm.password}
                    onChange={(event) => setAccountForm((current) => ({ ...current, password: event.target.value }))}
                  />
                </label>
              ) : null}

              <label>
                <span>Họ tên</span>
                <input
                  value={accountForm.fullName}
                  onChange={(event) => setAccountForm((current) => ({ ...current, fullName: event.target.value }))}
                  required
                />
              </label>

              <div className="form-split">
                <label>
                  <span>Vai trò</span>
                  <select
                    value={accountForm.roleId}
                    onChange={(event) => setAccountForm((current) => ({ ...current, roleId: event.target.value }))}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Điện thoại</span>
                  <input
                    value={accountForm.phone}
                    onChange={(event) => setAccountForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>
              </div>

              <button className="primary-button" type="submit" disabled={busyAction === 'save-account'}>
                {busyAction === 'save-account' ? 'Đang lưu...' : 'Lưu tài khoản'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {showRoleModal ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card modal-card--wide">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Add Roles</p>
                <h3>Preview popup phân quyền</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowRoleModal(false)}>
                X
              </button>
            </div>

            <div className="section-grid section-grid--roles">
              <div className="stack-list">
                {roles.map((role) => (
                  <div key={role.id} className="stack-list__item">
                    <div>
                      <strong>{role.name}</strong>
                      <p>{role.description}</p>
                    </div>
                    <StatusPill tone="info">Role #{role.id}</StatusPill>
                  </div>
                ))}
              </div>

              <div className="permission-cloud">
                {permissionNamesCatalog.map((permission) => (
                  <span key={permission} className="permission-chip">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCheckoutModal ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Thanh toán</p>
                <h3>Xác nhận thanh toán</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setShowCheckoutModal(false)}>
                X
              </button>
            </div>

            <div className="checkout-review">
              <div className="totals-card">
                <div><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
                <div><span>Discount</span><strong>{formatCurrency(discountValue)}</strong></div>
                <div><span>Khuyến mãi</span><strong>{eventPromo || 'Không có'}</strong></div>
                <div><span>Thanh toán</span><strong>{paymentMethod}</strong></div>
                <div className="totals-card__grand"><span>Thành tiền</span><strong>{formatCurrency(grandTotal)}</strong></div>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={() => void confirmCheckout()}
                disabled={busyAction === 'checkout'}
              >
                {busyAction === 'checkout' ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
