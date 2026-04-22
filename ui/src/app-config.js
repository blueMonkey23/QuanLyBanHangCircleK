import logoPc from './assets/logo-pc.svg'

export const DEFAULT_VAT_PERCENT = 8
export const DEFAULT_PAYMENT_METHOD = 'TIEN_MAT'

export const PERMISSIONS = {
  SALES: 'TAO_HOA_DON',
  PRODUCTS: 'QUAN_LY_SAN_PHAM',
  REPORTS: 'XEM_BAO_CAO',
  USERS: 'QUAN_LY_NGUOI_DUNG',
  SETTINGS: 'CAI_DAT_HE_THONG',
}

export const NAV_ITEMS = [
  {
    id: 'orders',
    path: '/dashboard/orders',
    badge: '01',
    icon: '',
    label: 'Quản lý bán hàng',
    description: 'Danh sách đơn hàng, bộ lọc trạng thái và bảng chi tiết.',
    permission: PERMISSIONS.SALES,
  },
  {
    id: 'products',
    path: '/dashboard/products',
    badge: '02',
    icon: '',
    label: 'Quản lý sản phẩm',
    description: 'Lưới sản phẩm, form cập nhật và tồn kho theo file thiết kế.',
    permission: PERMISSIONS.PRODUCTS,
  },
  {
    id: 'reports',
    path: '/dashboard/reports',
    badge: '03',
    icon: '',
    label: 'Báo cáo & thống kê',
    description: 'KPI doanh thu, biểu đồ cột và top sản phẩm bán ra.',
    permission: PERMISSIONS.REPORTS,
  },
  {
    id: 'sales',
    path: '/dashboard/sales',
    badge: '04',
    icon: '',
    label: 'Thêm vào giỏ hàng',
    description: 'POS sáng màu với category pills, giỏ hàng và thanh toán.',
    permission: PERMISSIONS.SALES,
  },
  {
    id: 'users',
    path: '/dashboard/users',
    badge: '05',
    icon: '',
    label: 'Quản lý người dùng',
    description: 'Danh sách tài khoản, vai trò và popup Add Roles.',
    permission: PERMISSIONS.USERS,
  },
  {
    id: 'settings',
    path: '/dashboard/settings',
    badge: '06',
    icon: '',
    label: 'Cài đặt',
    description: 'Hồ sơ quản trị, thông tin cửa hàng và cấu hình hóa đơn.',
    permission: PERMISSIONS.SETTINGS,
  },
]

export const BRANCH_OPTIONS = [
  'Tất cả chi nhánh',
  'Circle K Quận 1',
  'Circle K Mê Linh',
  'Circle K Tuyên Quang',
]

export const FALLBACK_CATEGORIES = [
  { id: '1', label: 'Đồ ăn', emoji: '🌭' },
  { id: '2', label: 'Cà phê', emoji: '☕' },
  { id: '3', label: 'Đồ uống khác', emoji: '🥤' },
  { id: '4', label: 'Combo có sẵn', emoji: '🎁' },
]

export const FALLBACK_SUPPLIERS = [
  { id: '1', label: 'Circle K Central Kitchen' },
  { id: '2', label: 'Highlands Distributor' },
  { id: '3', label: 'PhaTea Vendor' },
]

export const FALLBACK_PRODUCTS = [
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

export const FALLBACK_ORDERS = [
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

export const FALLBACK_ORDER_DETAIL_LOOKUP = {
  C01: [
    {
      maChiTiet: 'C01-1',
      maHoaDon: 'C01',
      maSanPham: 1,
      tenSanPham: 'MATCHA PhaTea',
      soLuong: 2,
      donGia: 80000,
      giamGia: 10000,
    },
  ],
  C02: [
    {
      maChiTiet: 'C02-1',
      maHoaDon: 'C02',
      maSanPham: 2,
      tenSanPham: 'HIGHLAND COFFEE',
      soLuong: 4,
      donGia: 50000,
      giamGia: 0,
    },
  ],
  C03: [
    {
      maChiTiet: 'C03-1',
      maHoaDon: 'C03',
      maSanPham: 5,
      tenSanPham: 'CAFE PHIN',
      soLuong: 2,
      donGia: 18000,
      giamGia: 0,
    },
  ],
  C04: [
    {
      maChiTiet: 'C04-1',
      maHoaDon: 'C04',
      maSanPham: 3,
      tenSanPham: 'Bánh mì tam giác',
      soLuong: 2,
      donGia: 28000,
      giamGia: 0,
    },
  ],
}

export const FALLBACK_REVENUE_ROWS = [
  { period: 'Tuần 1', invoiceCount: 12, revenue: 1450000 },
  { period: 'Tuần 2', invoiceCount: 17, revenue: 1980000 },
  { period: 'Tuần 3', invoiceCount: 11, revenue: 1260000 },
  { period: 'Tuần 4', invoiceCount: 21, revenue: 2450000 },
]

export const FALLBACK_TOP_PRODUCTS = [
  { id: 1, name: 'MATCHA PhaTea', quantity: 54 },
  { id: 2, name: 'HIGHLAND COFFEE', quantity: 42 },
  { id: 3, name: 'Cafe NGƯỜI MÊ LINH TÔI', quantity: 35 },
]

export const FALLBACK_ROLES = [
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

export const FALLBACK_PERMISSION_NAMES = [
  'TAO_HOA_DON',
  'QUAN_LY_SAN_PHAM',
  'XEM_BAO_CAO',
  'QUAN_LY_NGUOI_DUNG',
  'CAI_DAT_HE_THONG',
]

export const DEMO_SESSION = {
  token: 'demo-session',
  mode: 'demo',
  user: {
    maTaiKhoan: 1,
    maNhanVien: 1,
    username: 'admin.circlek',
    hoTen: 'Admin Circle K',
    dienThoai: '0912 345 678',
    maVaiTro: 1,
    tenVaiTro: 'Admin',
    permissions: FALLBACK_PERMISSION_NAMES,
  },
}

export const FALLBACK_SETTINGS = {
  tenCuaHang: 'Circle K Nguyễn Huệ',
  diaChi: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  soDienThoai: '0912 345 678',
  email: 'admin@circlek-demo.vn',
  noiDungHoaDon: 'Cảm ơn quý khách đã mua hàng tại Circle K.',
  vatPercent: '8',
  logo: logoPc,
}

export const INITIAL_LOGIN_FORM = {
  username: 'admin.circlek',
  password: '123456',
}

export const EMPTY_PRODUCT_FORM = {
  id: '',
  code: '',
  name: '',
  categoryId: '1',
  supplierId: '1',
  price: '',
  comparePrice: '',
  stock: '0',
}

export const EMPTY_ACCOUNT_FORM = {
  id: '',
  username: '',
  password: '123456',
  fullName: '',
  roleId: '1',
  phone: '',
}

export { logoPc }
