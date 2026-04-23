import { useState } from 'react'
import { api } from '../api'
import {
  DEFAULT_PAYMENT_METHOD,
  EMPTY_ACCOUNT_FORM,
  EMPTY_PRODUCT_FORM,
} from '../app-config'
import {
  buildFallbackOrderDetail,
  buildInvoicePreview,
  extractErrorMessage,
  normalizeText,
  readField,
  renderInvoicePrintWindow,
  upsertById,
} from '../app-utils'

function useAppOperations({
  session,
  currentUser,
  categories,
  suppliers,
  setProducts,
  setOrders,
  roles,
  setAccounts,
  settingsForm,
  refreshSectionData,
  refreshSectionsData,
  invalidateSections,
  setNotice,
  setBusyAction,
}) {
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM)
  const [selectedOrderPreview, setSelectedOrderPreview] = useState(null)
  const [loadingOrderId, setLoadingOrderId] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [saleQuantity, setSaleQuantity] = useState(1)
  const [cartNote, setCartNote] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [eventPromo, setEventPromo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT')
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  function resetTransientUiState() {
    setCartItems([])
    setShowCheckoutModal(false)
    setShowUserModal(false)
    setShowRoleModal(false)
    setShowOrderModal(false)
    setSelectedOrderPreview(null)
    setLoadingOrderId('')
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

        await refreshSectionData('products', { silent: true })
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
        await refreshSectionData('products', { silent: true })
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
        setAccounts((current) => upsertById(current, nextAccount))
      } else {
        const result = await api.createAccount({
          username: nextAccount.username,
          password: accountForm.password,
          maVaiTro: nextAccount.roleId,
          hoTen: nextAccount.fullName,
          dienThoai: nextAccount.phone,
        })
        setAccounts((current) => upsertById(current, {
          ...nextAccount,
          id: Number(readField(result, 'maTaiKhoan', 'MaTaiKhoan') ?? nextAccount.id),
        }))
      }

      setShowUserModal(false)
      setAccountForm(EMPTY_ACCOUNT_FORM)
      void refreshSectionData('users', { silent: true }).catch((error) => {
        setNotice({
          tone: 'warning',
          message: `Tai khoan da duoc luu, nhung chua refresh duoc danh sach: ${extractErrorMessage(error)}`,
        })
      })
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
          logo: String(settingsForm.logo || '').trim(),
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

  function handleAddToCart(selectedProduct) {
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

  async function confirmCheckout({ cartLines, taxableAmount }) {
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
          total: taxableAmount,
          status: 'Mới',
          createdAt: new Date().toISOString(),
          paymentMethod,
          lines: cartLines.map((line) => ({
            id: line.id,
            productId: line.id,
            name: line.name,
            quantity: line.quantity,
            unitPrice: line.price,
            discount: 0,
          })),
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

        await refreshSectionsData(['orders', 'sales'], { silent: true })
        invalidateSections(['reports'])
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

  async function loadOrderPreview(order) {
    const orderId = String(order?.id || '')
    setLoadingOrderId(orderId)

    try {
      const numericOrderId = Number(orderId)
      const shouldUseFallback = !Number.isInteger(numericOrderId) || numericOrderId <= 0

      if (shouldUseFallback) {
        const fallback = buildFallbackOrderDetail(order)
        return {
          order: {
            ...order,
            id: String(fallback.hoaDon.maHoaDon),
            total: Number(fallback.hoaDon.tongTien),
            createdAt: fallback.hoaDon.ngayTao,
            paymentMethod: fallback.hoaDon.phuongThucThanhToan,
          },
          detail: fallback.chiTiet,
        }
      }

      const result = await api.getOrderDetail(numericOrderId)
      return {
        order: {
          ...order,
          id: String(readField(result?.hoaDon, 'maHoaDon', 'MaHoaDon') ?? orderId),
          total: Number(readField(result?.hoaDon, 'tongTien', 'TongTien') ?? order.total ?? 0),
          createdAt: readField(result?.hoaDon, 'ngayTao', 'NgayTao') || order.createdAt,
          customerName:
            readField(result?.hoaDon, 'tenKhachHang', 'TenKhachHang', 'hoTenKhachHang', 'HoTenKhachHang') ||
            order.customerName ||
            'Khách lẻ',
          assigneeName:
            readField(result?.hoaDon, 'tenNhanVien', 'TenNhanVien', 'usernameNhanVien', 'UsernameNhanVien') ||
            order.assigneeName ||
            currentUser?.hoTen ||
            currentUser?.username ||
            'Admin',
          paymentMethod:
            readField(result?.hoaDon, 'phuongThucThanhToan', 'PhuongThucThanhToan') ||
            order.paymentMethod ||
            DEFAULT_PAYMENT_METHOD,
          maNhanVien:
            Number(readField(result?.hoaDon, 'maNhanVien', 'MaNhanVien') ?? order.maNhanVien ?? 0),
        },
        detail: Array.isArray(result?.chiTiet) ? result.chiTiet : [],
      }
    } finally {
      setLoadingOrderId((current) => (current === orderId ? '' : current))
    }
  }

  async function handleViewOrder(order) {
    try {
      const preview = await loadOrderPreview(order)
      setSelectedOrderPreview(preview)
      setShowOrderModal(true)
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    }
  }

  async function handlePrintOrder(order = selectedOrderPreview?.order) {
    if (!order) {
      return
    }

    const printWindow = window.open('', '_blank', 'width=1080,height=820')
    if (!printWindow) {
      setNotice({
        tone: 'warning',
        message: 'Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup rồi thử lại.',
      })
      return
    }

    printWindow.document.write('<p style="font-family: Arial, sans-serif; padding: 24px;">Đang tạo hóa đơn...</p>')

    try {
      const preview =
        selectedOrderPreview && String(selectedOrderPreview.order?.id) === String(order.id)
          ? selectedOrderPreview
          : await loadOrderPreview(order)

      renderInvoicePrintWindow(
        printWindow,
        buildInvoicePreview(preview.order, preview.detail, settingsForm),
      )
    } catch (error) {
      printWindow.close()
      setNotice({
        tone: 'warning',
        message: extractErrorMessage(error),
      })
    }
  }

  return {
    productForm,
    setProductForm,
    showUserModal,
    setShowUserModal,
    showRoleModal,
    setShowRoleModal,
    showOrderModal,
    setShowOrderModal,
    accountForm,
    setAccountForm,
    selectedOrderPreview,
    setSelectedOrderPreview,
    loadingOrderId,
    cartItems,
    setCartItems,
    saleQuantity,
    setSaleQuantity,
    cartNote,
    setCartNote,
    discountAmount,
    setDiscountAmount,
    eventPromo,
    setEventPromo,
    paymentMethod,
    setPaymentMethod,
    showCheckoutModal,
    setShowCheckoutModal,
    resetTransientUiState,
    handleSelectProductForEditor,
    resetProductForm,
    handleSaveProduct,
    handleDeleteProduct,
    openAccountModal,
    handleSaveAccount,
    handleSaveSettings,
    changeCartQuantity,
    handleAddToCart,
    clearCart,
    confirmCheckout,
    handleViewOrder,
    handlePrintOrder,
  }
}

export default useAppOperations
