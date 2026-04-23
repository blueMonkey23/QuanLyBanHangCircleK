import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import './App.css'
import { BRANCH_OPTIONS, NAV_ITEMS, logoPc } from './app-config'
import {
  buildInvoicePreview,
  downloadJson,
  getPermissionNames,
  normalizeText,
  parseVatPercent,
  roundMoney,
} from './app-utils'
import { NoticeBar, SidebarItem } from './components/common'
import LoginScreen from './screens/LoginScreen'
import OrdersScreen from './screens/OrdersScreen'
import ProductsScreen from './screens/ProductsScreen'
import ReportsScreen from './screens/ReportsScreen'
import SalesScreen from './screens/SalesScreen'
import SettingsScreen from './screens/SettingsScreen'
import UsersScreen from './screens/UsersScreen'
import OrderDetailModal from './modals/OrderDetailModal'
import UserModal from './modals/UserModal'
import RoleModal from './modals/RoleModal'
import CheckoutModal from './modals/CheckoutModal'
import useAppData from './hooks/useAppData'
import useAppOperations from './hooks/useAppOperations'
import useSectionRouting from './hooks/useSectionRouting'

function App() {
  const data = useAppData()
  const {
    session,
    booting,
    syncing,
    busyAction,
    setBusyAction,
    notice,
    setNotice,
    loginForm,
    setLoginForm,
    categories,
    suppliers,
    products,
    setProducts,
    orders,
    setOrders,
    reportRows,
    topProducts,
    summary,
    roles,
    permissionNamesCatalog,
    accounts,
    setAccounts,
    settingsForm,
    setSettingsForm,
    ensureSectionData,
    refreshSectionData,
    refreshSectionsData,
    invalidateSections,
    isSectionReady,
    handleLiveLogin,
    handleLogout: rawHandleLogout,
  } = data

  const [ordersSearch, setOrdersSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [salesSearch, setSalesSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [salesCategoryFilter, setSalesCategoryFilter] = useState('all')
  const [selectedProductId, setSelectedProductId] = useState(String(products[0]?.id || ''))
  const [reportPreset, setReportPreset] = useState('month')
  const [branchFilter, setBranchFilter] = useState(BRANCH_OPTIONS[0])

  const deferredOrdersSearch = useDeferredValue(ordersSearch)
  const deferredProductSearch = useDeferredValue(productSearch)
  const deferredSalesSearch = useDeferredValue(salesSearch)
  const deferredUserSearch = useDeferredValue(userSearch)

  const currentUser = session?.user || null
  const permissionNames = getPermissionNames(currentUser)

  const operations = useAppOperations({
    session,
    currentUser,
    categories,
    suppliers,
    setProducts,
    setOrders,
    roles,
    setAccounts,
    settingsForm,
    refreshSectionData: (section, options = {}) =>
      refreshSectionData(section, {
        ...options,
        overrideCurrentUser: currentUser,
        overridePermissionNames: permissionNames,
      }),
    refreshSectionsData: (sections, options = {}) =>
      refreshSectionsData(sections, {
        ...options,
        overrideCurrentUser: currentUser,
        overridePermissionNames: permissionNames,
      }),
    invalidateSections,
    setNotice,
    setBusyAction,
  })

  const {
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
    loadingOrderId,
    cartItems,
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
  } = operations

  const availableNavItems = NAV_ITEMS.filter((item) =>
    permissionNames.includes(item.permission),
  )
  const { activeSection, selectSection } = useSectionRouting(availableNavItems)

  const resolvedActiveSection = availableNavItems.some((item) => item.id === activeSection)
    ? activeSection
    : availableNavItems[0]?.id || ''

  const activeMeta = availableNavItems.find((item) => item.id === resolvedActiveSection) || availableNavItems[0]

  useEffect(() => {
    if (!session?.token || session.mode === 'demo' || !resolvedActiveSection || !currentUser) {
      return
    }

    void ensureSectionData(resolvedActiveSection, {
      overrideCurrentUser: currentUser,
      overridePermissionNames: permissionNames,
    })
  }, [
    currentUser,
    ensureSectionData,
    permissionNames,
    resolvedActiveSection,
    session?.mode,
    session?.token,
  ])

  const profileInitials = normalizeText(currentUser?.hoTen || currentUser?.username || 'AD')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AD'

  const resolvedSelectedProductId = selectedProductId || String(products[0]?.id || '')

  const selectedProduct =
    products.find((product) => String(product.id) === String(resolvedSelectedProductId)) || products[0] || null

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
  const checkoutVatPercent = parseVatPercent(settingsForm.vatPercent)
  const taxableAmount = Math.max(0, subtotal - discountValue)
  const vatValue = Math.max(0, roundMoney((taxableAmount * checkoutVatPercent) / 100))
  const grandTotal = Math.max(0, taxableAmount + vatValue)
  const orderStatusSummary = {
    all: orders.length,
    new: orders.filter((order) => normalizeText(order.status).includes('moi')).length,
    processing: orders.filter((order) => normalizeText(order.status).includes('dang xu ly')).length,
    done: orders.filter((order) => normalizeText(order.status).includes('hoan tat')).length,
    cancel: orders.filter((order) => normalizeText(order.status).includes('huy')).length,
  }

  const averageTicket = summary.invoiceCount > 0 ? summary.revenue / summary.invoiceCount : 0
  const maxRevenue = Math.max(...reportRows.map((row) => row.revenue), 1)
  const selectedInvoice = selectedOrderPreview
    ? buildInvoicePreview(selectedOrderPreview.order, selectedOrderPreview.detail, settingsForm)
    : null

  function handleLogout() {
    resetTransientUiState()
    rawHandleLogout()
  }

  function handleExportReport() {
    const payload = {
      generatedAt: new Date().toISOString(),
      branchFilter,
      reportPreset,
      summary,
      reportRows,
      topProducts,
    }

    downloadJson('circlek-report.json', payload)

    setNotice({
      tone: 'success',
      message: 'Đã xuất snapshot báo cáo dạng JSON để bạn kiểm tra nhanh.',
    })
  }

  function renderScreen() {
    switch (resolvedActiveSection) {
      case 'orders':
        return (
          <OrdersScreen
            orderStatusSummary={orderStatusSummary}
            currentUser={currentUser}
            ordersSearch={ordersSearch}
            setOrdersSearch={setOrdersSearch}
            filteredOrders={filteredOrders}
            refreshSectionData={() => refreshSectionData('orders', {
              silent: true,
              announce: true,
              overrideCurrentUser: currentUser,
              overridePermissionNames: permissionNames,
            })}
            syncing={syncing}
            handleViewOrder={handleViewOrder}
            handlePrintOrder={handlePrintOrder}
            loadingOrderId={loadingOrderId}
          />
        )
      case 'products':
        return (
          <ProductsScreen
            resetProductForm={resetProductForm}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            productCategoryFilter={productCategoryFilter}
            setProductCategoryFilter={setProductCategoryFilter}
            categories={categories}
            filteredProductRows={filteredProductRows}
            handleSelectProductForEditor={handleSelectProductForEditor}
            productForm={productForm}
            setProductForm={setProductForm}
            suppliers={suppliers}
            handleSaveProduct={handleSaveProduct}
            busyAction={busyAction}
            handleDeleteProduct={handleDeleteProduct}
          />
        )
      case 'reports':
        return (
          <ReportsScreen
            reportPreset={reportPreset}
            setReportPreset={setReportPreset}
            branchFilter={branchFilter}
            setBranchFilter={setBranchFilter}
            branchOptions={BRANCH_OPTIONS}
            handleExportReport={handleExportReport}
            summary={summary}
            averageTicket={averageTicket}
            reportRows={reportRows}
            maxRevenue={maxRevenue}
            topProducts={topProducts}
          />
        )
      case 'sales':
        return (
          <SalesScreen
            salesSearch={salesSearch}
            setSalesSearch={setSalesSearch}
            salesCategoryFilter={salesCategoryFilter}
            setSalesCategoryFilter={setSalesCategoryFilter}
            categories={categories}
            filteredSalesProducts={filteredSalesProducts}
            selectedProductId={resolvedSelectedProductId}
            setSelectedProductId={setSelectedProductId}
            setSaleQuantity={setSaleQuantity}
            selectedProduct={selectedProduct}
            saleQuantity={saleQuantity}
            cartNote={cartNote}
            setCartNote={setCartNote}
            handleAddToCart={() => handleAddToCart(selectedProduct)}
            cartLines={cartLines}
            changeCartQuantity={changeCartQuantity}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            eventPromo={eventPromo}
            setEventPromo={setEventPromo}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            subtotal={subtotal}
            discountValue={discountValue}
            vatValue={vatValue}
            grandTotal={grandTotal}
            setShowCheckoutModal={setShowCheckoutModal}
            clearCart={clearCart}
          />
        )
      case 'users':
        return (
          <UsersScreen
            setShowRoleModal={setShowRoleModal}
            openAccountModal={openAccountModal}
            accounts={accounts}
            roles={roles}
            permissionNamesCatalog={permissionNamesCatalog}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            filteredUsers={filteredUsers}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            profileInitials={profileInitials}
            currentUser={currentUser}
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
            permissionNames={permissionNames}
            handleSaveSettings={handleSaveSettings}
            busyAction={busyAction}
          />
        )
      default:
        return null
    }
  }

  if (!session) {
    return (
      <LoginScreen
        notice={notice}
        handleLiveLogin={handleLiveLogin}
        busyAction={busyAction}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
      />
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <img src={logoPc} alt="PC logo" />
          </div>
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
              active={item.id === resolvedActiveSection}
              onSelect={(id) => startTransition(() => selectSection(id))}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <p>Đang chạy với token backend hiện tại.</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar__copy">
            <h1>{activeMeta?.label || 'Dashboard'}</h1>
            <p>{activeMeta?.description || 'Giao diện quản trị theo thiết kế mới.'}</p>
          </div>

          <div className="topbar__actions">
            <button
              className="ghost-button ghost-button--light"
              type="button"
              onClick={() => void refreshSectionData(resolvedActiveSection, {
                silent: true,
                announce: true,
                overrideCurrentUser: currentUser,
                overridePermissionNames: permissionNames,
              })}
              disabled={syncing}
            >
              {syncing ? 'Đang đồng bộ...' : 'Làm mới'}
            </button>
            <div className="profile-chip">
              <div className="profile-chip__avatar">{profileInitials}</div>
              <div>
                <strong>{currentUser?.hoTen || currentUser?.username || 'Admin'}</strong>
                <span>{session?.mode === 'demo' ? 'Demo mode' : 'Live mode'}</span>
              </div>
            </div>
            <button className="ghost-button ghost-button--light" type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <NoticeBar notice={notice} />

        {booting || (session?.mode !== 'demo' && resolvedActiveSection && !isSectionReady(resolvedActiveSection)) ? (
          <section className="panel panel--loading">
            <strong>Đang nạp dữ liệu giao diện...</strong>
            <p>UI sẽ dựng từ API live nếu có, hoặc fallback nội bộ nếu service chưa phản hồi.</p>
          </section>
        ) : (
          renderScreen()
        )}
      </main>

      <OrderDetailModal
        selectedInvoice={showOrderModal ? selectedInvoice : null}
        onPrint={() => void handlePrintOrder()}
        onClose={() => setShowOrderModal(false)}
      />

      <UserModal
        show={showUserModal}
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        roles={roles}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleSaveAccount}
        busyAction={busyAction}
      />

      <RoleModal
        show={showRoleModal}
        roles={roles}
        permissionNamesCatalog={permissionNamesCatalog}
        onClose={() => setShowRoleModal(false)}
      />

      <CheckoutModal
        show={showCheckoutModal}
        subtotal={subtotal}
        discountValue={discountValue}
        checkoutVatPercent={checkoutVatPercent}
        vatValue={vatValue}
        eventPromo={eventPromo}
        paymentMethod={paymentMethod}
        grandTotal={grandTotal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={() => confirmCheckout({ cartLines, taxableAmount })}
        busyAction={busyAction}
      />
    </div>
  )
}

export default App
