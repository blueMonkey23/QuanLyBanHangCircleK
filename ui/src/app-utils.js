import {
  DEFAULT_PAYMENT_METHOD,
  FALLBACK_CATEGORIES,
  FALLBACK_SUPPLIERS,
  FALLBACK_PRODUCTS,
  FALLBACK_ORDERS,
  FALLBACK_ORDER_DETAIL_LOOKUP,
  FALLBACK_REVENUE_ROWS,
  FALLBACK_TOP_PRODUCTS,
  FALLBACK_ROLES,
  FALLBACK_PERMISSION_NAMES,
  FALLBACK_SETTINGS,
  DEMO_SESSION,
} from './app-config'

export function readField(record, ...keys) {
  for (const key of keys) {
    if (record && record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }

  return null
}

export function toBooleanLike(value) {
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

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function formatDateTime(value) {
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

export function formatDateLong(value) {
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

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0))
}

export function extractErrorMessage(error) {
  if (error?.payload?.message) {
    return error.payload.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Đã xảy ra lỗi không xác định.'
}

export function getPermissionNames(user) {
  if (!Array.isArray(user?.permissions)) {
    return []
  }

  return user.permissions.map((permission) =>
    typeof permission === 'string' ? permission : permission.tenQuyen,
  )
}

export function normalizeSession(rawSession) {
  if (!rawSession?.token || !rawSession?.user) {
    return null
  }

  if (rawSession.token === 'demo-session' || rawSession.mode === 'demo') {
    return {
      ...DEMO_SESSION,
      user: {
        ...DEMO_SESSION.user,
        ...rawSession.user,
        permissions: Array.isArray(rawSession.user.permissions) && rawSession.user.permissions.length > 0
          ? rawSession.user.permissions
          : DEMO_SESSION.user.permissions,
      },
    }
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
    mode: 'live',
    user: {
      ...rawSession.user,
      permissions,
    },
  }
}

export function pickCategoryEmoji(index) {
  return FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length]?.emoji || '📦'
}

export function buildLookup(records, key = 'id', label = 'label') {
  return Object.fromEntries(records.map((record) => [String(record[key]), record[label]]))
}

export function unwrapArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  return [
    payload.data,
    payload.items,
    payload.rows,
    payload.records,
    payload.result,
    payload.results,
  ].find(Array.isArray) || []
}

export function unwrapObjectPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }

  return payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload
}

export function mapCategories(rawCategories) {
  const categories = unwrapArrayPayload(rawCategories)

  if (categories.length === 0) {
    return []
  }

  return categories.map((item, index) => ({
    id: String(readField(item, 'MaDanhMuc', 'maDanhMuc') ?? index + 1),
    label: readField(item, 'TenDanhMuc', 'tenDanhMuc') || `Danh mục ${index + 1}`,
    emoji: pickCategoryEmoji(index),
  }))
}

export function mapSuppliers(rawSuppliers) {
  const suppliers = unwrapArrayPayload(rawSuppliers)

  if (suppliers.length === 0) {
    return []
  }

  return suppliers.map((item, index) => ({
    id: String(readField(item, 'MaNCC', 'maNCC') ?? index + 1),
    label: readField(item, 'TenCongTy', 'tenCongTy') || `Nhà cung cấp ${index + 1}`,
  }))
}

export function mapProducts(rawProducts, categories, suppliers) {
  const products = unwrapArrayPayload(rawProducts)

  if (products.length === 0) {
    return []
  }

  const categoryLookup = buildLookup(categories)
  const categoryEmojiLookup = Object.fromEntries(
    categories.map((category) => [String(category.id), category.emoji]),
  )
  const supplierLookup = buildLookup(suppliers)

  return products
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

export function mapOrders(rawOrders, currentUser) {
  const orders = unwrapArrayPayload(rawOrders)

  if (orders.length === 0) {
    return []
  }

  return orders.map((order, index) => ({
    id: String(readField(order, 'MaHoaDon', 'maHoaDon') ?? `C${index + 1}`),
    customerName:
      readField(
        order,
        'TenKhachHang',
        'tenKhachHang',
        'HoTenKhachHang',
        'hoTenKhachHang',
      ) || 'Khách lẻ',
    assigneeName:
      readField(order, 'TenNhanVien', 'tenNhanVien', 'UsernameNhanVien', 'usernameNhanVien') ||
      currentUser?.hoTen ||
      currentUser?.username ||
      'Admin',
    maNhanVien: Number(readField(order, 'MaNhanVien', 'maNhanVien') ?? currentUser?.maNhanVien ?? 0),
    total: Number(readField(order, 'TongTien', 'tongTien', 'ThanhTien', 'thanhTien') ?? 0),
    status: readField(order, 'TrangThai', 'trangThai') || 'Mới',
    createdAt:
      readField(order, 'NgayTao', 'ngayTao', 'NgayLap', 'ngayLap', 'createdAt') ||
      new Date().toISOString(),
    paymentMethod:
      readField(order, 'PhuongThucThanhToan', 'phuongThucThanhToan') || DEFAULT_PAYMENT_METHOD,
  }))
}

export function mapRevenueRows(rawRows) {
  const rows = unwrapArrayPayload(rawRows)

  if (rows.length === 0) {
    return []
  }

  return rows.map((row, index) => ({
    period: readField(row, 'period', 'Period') || `Mốc ${index + 1}`,
    invoiceCount: Number(readField(row, 'soHoaDon', 'SoHoaDon') ?? 0),
    revenue: Number(readField(row, 'tongDoanhThu', 'TongDoanhThu') ?? 0),
  }))
}

export function mapTopProducts(rawRows, products) {
  const rows = unwrapArrayPayload(rawRows)

  if (rows.length === 0) {
    return []
  }

  const productLookup = Object.fromEntries(products.map((product) => [String(product.id), product.name]))

  return rows.map((row, index) => ({
    id: Number(readField(row, 'maSanPham', 'MaSanPham') ?? index + 1),
    name:
      readField(row, 'tenSanPham', 'TenSanPham') ||
      productLookup[String(readField(row, 'maSanPham', 'MaSanPham') ?? index + 1)] ||
      `Sản phẩm ${index + 1}`,
    quantity: Number(readField(row, 'tongSoLuongBan', 'TongSoLuongBan') ?? 0),
  }))
}

export function mapRoles(rawRoles) {
  const roles = unwrapArrayPayload(rawRoles)

  if (roles.length === 0) {
    return []
  }

  return roles.map((role, index) => ({
    id: Number(readField(role, 'MaVaiTro', 'maVaiTro') ?? index + 1),
    name: readField(role, 'TenVaiTro', 'tenVaiTro') || `Vai trò ${index + 1}`,
    description:
      readField(role, 'MoTa', 'moTa') ||
      FALLBACK_ROLES[index % FALLBACK_ROLES.length].description,
  }))
}

export function mapPermissions(rawPermissions) {
  const permissions = unwrapArrayPayload(rawPermissions)

  if (permissions.length === 0) {
    return []
  }

  return permissions.map((permission) =>
    readField(permission, 'TenQuyen', 'tenQuyen') || 'UNKNOWN_PERMISSION',
  )
}

export function mapAccounts(rawAccounts, roles, currentUser, { fallbackOnEmpty = false } = {}) {
  const roleLookup = Object.fromEntries(roles.map((role) => [String(role.id), role.name]))
  const accounts = unwrapArrayPayload(rawAccounts)

  if (accounts.length === 0 && fallbackOnEmpty) {
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

  if (accounts.length === 0) {
    return []
  }

  return accounts.map((account, index) => {
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

export function mapSettings(rawSettings) {
  const settings = unwrapObjectPayload(rawSettings)

  if (!settings) {
    return FALLBACK_SETTINGS
  }

  return {
    tenCuaHang: readField(settings, 'tenCuaHang', 'TenCuaHang') || FALLBACK_SETTINGS.tenCuaHang,
    diaChi: readField(settings, 'diaChi', 'DiaChi') || FALLBACK_SETTINGS.diaChi,
    soDienThoai:
      readField(settings, 'soDienThoai', 'SoDienThoai') || FALLBACK_SETTINGS.soDienThoai,
    email: readField(settings, 'email', 'Email') || FALLBACK_SETTINGS.email,
    noiDungHoaDon:
      readField(settings, 'noiDungHoaDon', 'NoiDungHoaDon') ||
      FALLBACK_SETTINGS.noiDungHoaDon,
    vatPercent: String(
      readField(settings, 'vatPercent', 'VatPercent') ?? FALLBACK_SETTINGS.vatPercent,
    ),
    logo: readField(settings, 'logo', 'Logo') || FALLBACK_SETTINGS.logo,
  }
}

export function upsertById(records, nextRecord) {
  const index = records.findIndex((record) => String(record.id) === String(nextRecord.id))

  if (index === -1) {
    return [nextRecord, ...records]
  }

  const next = [...records]
  next[index] = nextRecord
  return next
}

export function getStatusTone(status) {
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

export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseVatPercent(value) {
  const numericValue = Number(value)

  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return numericValue
  }

  return 0
}

export function roundMoney(value) {
  return Math.round(Number(value || 0))
}

export function formatPaymentMethod(method) {
  switch (String(method || '').toUpperCase()) {
    case 'THE':
      return 'Thẻ'
    case 'CHUYEN_KHOAN':
      return 'Chuyển khoản'
    case 'TIEN_MAT':
    default:
      return 'Tiền mặt'
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildFallbackOrderDetail(order) {
  const cachedLines = FALLBACK_ORDER_DETAIL_LOOKUP[String(order?.id)] || []
  const sourceLines = cachedLines.length > 0
    ? cachedLines
    : Array.isArray(order?.lines) && order.lines.length > 0
      ? order.lines.map((line, index) => ({
          maChiTiet: `${order.id}-${index + 1}`,
          maHoaDon: order.id,
          maSanPham: line.productId || line.id || index + 1,
          tenSanPham: line.name || `Sản phẩm ${index + 1}`,
          soLuong: Number(line.quantity || 1),
          donGia: Number(line.price || line.unitPrice || line.lineTotal || 0),
          giamGia: Number(line.discount || 0),
        }))
      : [
          {
            maChiTiet: `${order?.id || 'demo'}-1`,
            maHoaDon: order?.id || 'demo',
            maSanPham: 0,
            tenSanPham: 'Giỏ hàng tổng hợp',
            soLuong: 1,
            donGia: Number(order?.total || 0),
            giamGia: 0,
          },
        ]

  return {
    hoaDon: {
      maHoaDon: order?.id || 'demo',
      maNhanVien: order?.maNhanVien || null,
      ngayTao: order?.createdAt || new Date().toISOString(),
      tongTien: Number(order?.total || 0),
      phuongThucThanhToan: order?.paymentMethod || DEFAULT_PAYMENT_METHOD,
    },
    chiTiet: sourceLines,
  }
}

export function buildInvoicePreview(order, detailRows, settings) {
  const fallback = buildFallbackOrderDetail(order)
  const rows = Array.isArray(detailRows) && detailRows.length > 0 ? detailRows : fallback.chiTiet
  const items = rows.map((detail, index) => {
    const quantity = Math.max(1, Number(readField(detail, 'soLuong', 'SoLuong') ?? 1))
    const unitPrice = Number(readField(detail, 'donGia', 'DonGia') ?? 0)
    const discount = Number(readField(detail, 'giamGia', 'GiamGia') ?? 0)
    const lineSubtotal = roundMoney(quantity * unitPrice)
    const lineTotal = Math.max(0, roundMoney(lineSubtotal - discount))

    return {
      id: readField(detail, 'maChiTiet', 'MaChiTiet') ?? `${order?.id || 'invoice'}-${index + 1}`,
      name: readField(detail, 'tenSanPham', 'TenSanPham') || `Sản phẩm ${index + 1}`,
      quantity,
      unitPrice,
      discount,
      lineSubtotal,
      lineTotal,
    }
  })

  const subtotal = items.reduce((total, item) => total + item.lineSubtotal, 0)
  const discountTotal = items.reduce((total, item) => total + item.discount, 0)
  const netFromDetails = items.reduce((total, item) => total + item.lineTotal, 0)
  const rawOrderTotal = Number(order?.total)
  const netAmount = Number.isFinite(rawOrderTotal) && rawOrderTotal >= 0 ? rawOrderTotal : netFromDetails
  const vatPercent = parseVatPercent(settings?.vatPercent)
  const vatAmount = Math.max(0, roundMoney((netAmount * vatPercent) / 100))
  const grandTotal = Math.max(0, roundMoney(netAmount + vatAmount))

  return {
    orderId: order?.id || fallback.hoaDon.maHoaDon,
    customerName: order?.customerName || 'Khách lẻ',
    assigneeName: order?.assigneeName || 'Nhân viên bán hàng',
    createdAt: order?.createdAt || fallback.hoaDon.ngayTao,
    paymentMethod: formatPaymentMethod(
      order?.paymentMethod || fallback.hoaDon.phuongThucThanhToan || DEFAULT_PAYMENT_METHOD,
    ),
    storeName: settings?.tenCuaHang || FALLBACK_SETTINGS.tenCuaHang,
    address: settings?.diaChi || FALLBACK_SETTINGS.diaChi,
    phone: settings?.soDienThoai || FALLBACK_SETTINGS.soDienThoai,
    email: settings?.email || FALLBACK_SETTINGS.email,
    note: settings?.noiDungHoaDon || FALLBACK_SETTINGS.noiDungHoaDon,
    vatPercent,
    items,
    subtotal,
    discountTotal,
    netAmount,
    vatAmount,
    grandTotal,
  }
}

export function renderInvoicePrintWindow(printWindow, invoice) {
  if (!printWindow) {
    throw new Error('Trình duyệt đang chặn cửa sổ in.')
  }

  const rowsMarkup = invoice.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(item.name)}</strong><br />
            <span>SL ${escapeHtml(item.quantity)} x ${escapeHtml(formatCurrency(item.unitPrice))}</span>
          </td>
          <td>${escapeHtml(formatCurrency(item.discount))}</td>
          <td>${escapeHtml(formatCurrency(item.lineTotal))}</td>
        </tr>
      `,
    )
    .join('')

  printWindow.document.open()
  printWindow.document.write(`<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Hoa don #${escapeHtml(invoice.orderId)}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, sans-serif;
      }

      body {
        margin: 0;
        padding: 32px;
        color: #16233a;
        background: #ffffff;
      }

      .sheet {
        max-width: 920px;
        margin: 0 auto;
        display: grid;
        gap: 24px;
      }

      .hero,
      .block,
      .totals {
        border: 1px solid #dfe7f5;
        border-radius: 18px;
        padding: 20px;
      }

      .hero {
        background: #f3f7ff;
      }

      .hero-top,
      .meta,
      .footer {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .meta-card,
      .block {
        background: #ffffff;
      }

      .meta-card {
        min-width: 180px;
        border: 1px solid #e5ecf8;
        border-radius: 14px;
        padding: 14px;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #5e6c84;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 14px 12px;
        border-bottom: 1px solid #e7edf8;
        text-align: left;
        vertical-align: top;
      }

      th {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #5e6c84;
      }

      .totals {
        display: grid;
        gap: 10px;
      }

      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .totals-row--grand {
        padding-top: 10px;
        border-top: 1px dashed #d6dfef;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <section class="hero">
        <div class="hero-top">
          <div>
            <p class="eyebrow">${escapeHtml(invoice.storeName)}</p>
            <h1>Hoa don ban hang</h1>
            <p>${escapeHtml(invoice.address)}</p>
            <p>${escapeHtml(invoice.phone)} • ${escapeHtml(invoice.email)}</p>
          </div>
          <div class="meta-card">
            <p class="eyebrow">Ma don</p>
            <h2>#${escapeHtml(invoice.orderId)}</h2>
            <p>${escapeHtml(formatDateTime(invoice.createdAt))}</p>
          </div>
        </div>

        <div class="meta" style="margin-top: 16px;">
          <div class="meta-card">
            <p class="eyebrow">Khach hang</p>
            <strong>${escapeHtml(invoice.customerName)}</strong>
          </div>
          <div class="meta-card">
            <p class="eyebrow">Nhan vien</p>
            <strong>${escapeHtml(invoice.assigneeName)}</strong>
          </div>
          <div class="meta-card">
            <p class="eyebrow">Thanh toan</p>
            <strong>${escapeHtml(invoice.paymentMethod)}</strong>
          </div>
        </div>
      </section>

      <section class="block">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>San pham</th>
              <th>Giam gia</th>
              <th>Thanh tien</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </section>

      <div class="footer">
        <section class="block" style="flex: 1 1 320px;">
          <p class="eyebrow">Noi dung hoa don</p>
          <p>${escapeHtml(invoice.note)}</p>
        </section>

        <section class="totals" style="width: min(320px, 100%);">
          <div class="totals-row"><span>Tam tinh</span><strong>${escapeHtml(formatCurrency(invoice.subtotal))}</strong></div>
          <div class="totals-row"><span>Giam gia</span><strong>${escapeHtml(formatCurrency(invoice.discountTotal))}</strong></div>
          <div class="totals-row"><span>Truoc VAT</span><strong>${escapeHtml(formatCurrency(invoice.netAmount))}</strong></div>
          <div class="totals-row"><span>VAT (${escapeHtml(invoice.vatPercent)}%)</span><strong>${escapeHtml(formatCurrency(invoice.vatAmount))}</strong></div>
          <div class="totals-row totals-row--grand"><span>Tong thanh toan</span><strong>${escapeHtml(formatCurrency(invoice.grandTotal))}</strong></div>
        </section>
      </div>
    </div>
  </body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.setTimeout(() => {
    printWindow.print()
  }, 150)
}
