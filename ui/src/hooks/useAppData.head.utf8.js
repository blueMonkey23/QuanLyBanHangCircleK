<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from 'react'
=======
import { useEffect, useState } from 'react'
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91
import { api, clearSession, readSession, saveSession } from '../api'
import {
  FALLBACK_CATEGORIES,
  FALLBACK_ORDERS,
  FALLBACK_PERMISSION_NAMES,
  FALLBACK_PRODUCTS,
  FALLBACK_REVENUE_ROWS,
  FALLBACK_ROLES,
  FALLBACK_SETTINGS,
  FALLBACK_SUPPLIERS,
  FALLBACK_TOP_PRODUCTS,
  INITIAL_LOGIN_FORM,
  PERMISSIONS,
} from '../app-config'
import {
  extractErrorMessage,
  getPermissionNames,
  mapAccounts,
  mapCategories,
  mapOrders,
  mapPermissions,
  mapProducts,
  mapRevenueRows,
  mapRoles,
  mapSettings,
  mapSuppliers,
  mapTopProducts,
  normalizeSession,
  readField,
  unwrapObjectPayload,
} from '../app-utils'

function getFallbackSummary() {
  return {
    invoiceCount: FALLBACK_ORDERS.length,
    revenue: FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
  }
}

function useAppData({ onUnauthorizedUiReset } = {}) {
  const initialSession = normalizeSession(readSession())

  const [session, setSession] = useState(initialSession)
  const [booting, setBooting] = useState(() => Boolean(initialSession?.token))
  const [syncing, setSyncing] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState({
    tone: 'info',
    message: 'UI dang bam lai layout trong ho so ca nhan.fig.',
  })
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
<<<<<<< HEAD
  const [resourceStatus, setResourceStatus] = useState(() => createResourceStatus())
=======
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [suppliers, setSuppliers] = useState(FALLBACK_SUPPLIERS)
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [orders, setOrders] = useState(FALLBACK_ORDERS)
  const [reportRows, setReportRows] = useState(FALLBACK_REVENUE_ROWS)
  const [topProducts, setTopProducts] = useState(FALLBACK_TOP_PRODUCTS)
  const [summary, setSummary] = useState(getFallbackSummary)
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [permissionNamesCatalog, setPermissionNamesCatalog] = useState(FALLBACK_PERMISSION_NAMES)
<<<<<<< HEAD
  const [accounts, setAccounts] = useState([])
  const [settingsForm, setSettingsForm] = useState(FALLBACK_SETTINGS)

  const currentUser = session?.user || null
  const permissionNames = useMemo(() => getPermissionNames(currentUser), [currentUser])
  const sessionToken = session?.token || ''
  const sessionMode = session?.mode || ''

  const resetLiveViewState = useCallback((nextUser = null) => {
    setCategories(FALLBACK_CATEGORIES)
    setSuppliers(FALLBACK_SUPPLIERS)
    setProducts(FALLBACK_PRODUCTS)
    setOrders(FALLBACK_ORDERS)
    setReportRows(FALLBACK_REVENUE_ROWS)
    setTopProducts(FALLBACK_TOP_PRODUCTS)
    setSummary(getFallbackSummary())
    setRoles(FALLBACK_ROLES)
    setPermissionNamesCatalog(FALLBACK_PERMISSION_NAMES)
    setAccounts(mapAccounts([], FALLBACK_ROLES, nextUser))
    setSettingsForm(FALLBACK_SETTINGS)
    setResourceStatus(createResourceStatus())
  }, [])

  const persistSession = useCallback((nextSession) => {
=======
  const [accounts, setAccounts] = useState(() =>
    initialSession?.mode === 'demo'
      ? mapAccounts([], FALLBACK_ROLES, initialSession.user, { fallbackOnEmpty: true })
      : [],
  )
  const [settingsForm, setSettingsForm] = useState(FALLBACK_SETTINGS)

  function persistSession(nextSession) {
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91
    const normalized = normalizeSession(nextSession)
    setSession(normalized)

    if (normalized) {
      saveSession(normalized)
    } else {
      clearSession()
    }
  }

<<<<<<< HEAD
  const handleUnauthorized = useCallback(() => {
=======
  function createDemoSession() {
    return {
      ...DEMO_SESSION,
      user: {
        ...DEMO_SESSION.user,
        permissions: [...DEMO_SESSION.user.permissions],
      },
    }
  }

  function applyDemoState(nextSession) {
    const demoSession = nextSession || createDemoSession()
    setCategories(FALLBACK_CATEGORIES)
    setSuppliers(FALLBACK_SUPPLIERS)
    setProducts(FALLBACK_PRODUCTS)
    setOrders(FALLBACK_ORDERS)
    setReportRows(FALLBACK_REVENUE_ROWS)
    setTopProducts(FALLBACK_TOP_PRODUCTS)
    setSummary(getFallbackSummary())
    setRoles(FALLBACK_ROLES)
    setPermissionNamesCatalog(FALLBACK_PERMISSION_NAMES)
    setAccounts(mapAccounts([], FALLBACK_ROLES, demoSession.user, { fallbackOnEmpty: true }))
    setSettingsForm(FALLBACK_SETTINGS)
    setSyncing(false)
    setBooting(false)
  }

  function enterDemoMode(message) {
    const demoSession = createDemoSession()
    persistSession(demoSession)
    applyDemoState(demoSession)
    setNotice({
      tone: 'warning',
      message,
    })
  }

  function handleUnauthorized() {
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91
    persistSession(null)
    onUnauthorizedUiReset?.()
    setBooting(false)
  }

  async function refreshDashboard({ silent = false, permissionNames = [], currentUser = null } = {}) {
    if (!session?.token || session.mode === 'demo') {
      return
    }

    if (silent) {
      setSyncing(true)
    } else {
      setBooting(true)
    }

<<<<<<< HEAD
    if (resources.length === 0) {
      setBooting(false)
      setSyncing(false)
=======
    const requests = [
      { key: 'me', run: () => api.getMe() },
      {
        key: 'products',
        enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS),
        run: () => api.getProducts(),
      },
      {
        key: 'categories',
        enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS),
        run: () => api.getCategories(),
      },
      {
        key: 'suppliers',
        enabled: permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS),
        run: () => api.getSuppliers(),
      },
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

    const meRequestFailed =
      results[0]?.status === 'rejected' && !results[0]?.reason?.status

    if (meRequestFailed) {
      enterDemoMode('Khong ket noi duoc backend, UI da chuyen sang demo mode voi du lieu mau day du.')
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91
      return
    }

    if (results.some((result) => result.status === 'rejected' && result.reason?.status === 401)) {
      handleUnauthorized()
      setNotice({
        tone: 'warning',
        message: 'Phien dang nhap da het han. Hay dang nhap lai.',
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

    const shouldMapCatalog = payloads.products || payloads.categories || payloads.suppliers
    const shouldMapReports = payloads.invoiceSummary || payloads.revenue || payloads.topProducts
    const shouldMapUsers = payloads.roles || payloads.permissions || payloads.accounts

    let mappedProducts = products
    let mappedRoles = roles

    if (shouldMapCatalog) {
      const mappedCategories = mapCategories(payloads.categories)
      const mappedSuppliers = mapSuppliers(payloads.suppliers)
      mappedProducts = mapProducts(payloads.products, mappedCategories, mappedSuppliers)

      setCategories(mappedCategories)
      setSuppliers(mappedSuppliers)
      setProducts(mappedProducts)
    }

    if (payloads.orders) {
      setOrders(mapOrders(payloads.orders, payloads.me || currentUser))
    }

    if (shouldMapReports) {
      const invoiceSummary = unwrapObjectPayload(payloads.invoiceSummary)
      setReportRows(mapRevenueRows(payloads.revenue))
      setTopProducts(mapTopProducts(payloads.topProducts, mappedProducts))
      setSummary({
        invoiceCount: Number(readField(invoiceSummary, 'soHoaDon', 'SoHoaDon') ?? 0),
        revenue: Number(readField(invoiceSummary, 'tongDoanhThu', 'TongDoanhThu') ?? 0),
      })
    }

    if (shouldMapUsers) {
      mappedRoles = mapRoles(payloads.roles)
      setRoles(mappedRoles)
      setPermissionNamesCatalog(mapPermissions(payloads.permissions))
      setAccounts(mapAccounts(payloads.accounts, mappedRoles, payloads.me || currentUser))
    }

    if (payloads.settings) {
      setSettingsForm(mapSettings(payloads.settings))
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
      setNotice({
        tone: 'warning',
        message: `Mot so service chua phan hoi, dang giu/fallback cho: ${fallbackBlocks.join(', ')}.`,
      })
    } else {
      setNotice({
        tone: 'success',
        message: 'Du lieu da dong bo day du tu gateway va cac service hien tai.',
      })
    }

    setBooting(false)
    setSyncing(false)
<<<<<<< HEAD
  }, [
    applyResourceFallback,
    applyResourcePayload,
    currentUser,
    handleUnauthorized,
    loadResource,
    permissionNames,
    resourceStatus,
    session,
  ])

  const ensureSectionData = useCallback((section, options = {}) => (
    loadSections([section], { ...options, force: false })
  ), [loadSections])

  const refreshSectionData = useCallback((section, options = {}) => (
    loadSections([section], { ...options, force: true })
  ), [loadSections])

  const refreshSectionsData = useCallback((sections, options = {}) => (
    loadSections(sections, { ...options, force: true })
  ), [loadSections])

  const invalidateSections = useCallback((sections) => {
    const resources = getResourcesForSections(Array.isArray(sections) ? sections : [sections])

    setResourceStatus((current) => ({
      ...current,
      ...Object.fromEntries(resources.map((resource) => [resource, 'idle'])),
    }))
  }, [])

  const isSectionReady = useCallback((section) => {
    const resources = getResourcesForSections([section])
    return resources.length > 0 && resources.every((resource) => resourceStatus[resource] === 'ready')
  }, [resourceStatus])

  const isSectionLoading = useCallback((section) => {
    const resources = getResourcesForSections([section])
    return resources.some((resource) => resourceStatus[resource] === 'loading')
  }, [resourceStatus])

  const bootstrapSession = useCallback(async () => {
    if (!sessionToken || sessionMode === 'demo') {
      setBooting(false)
      return
    }

    setBooting(true)

    try {
      const me = await api.getMe()
      persistSession({
        token: sessionToken,
        mode: 'live',
        user: {
          ...me,
          permissions: me.permissions || [],
        },
      })
    } catch (error) {
      if (error?.status === 401) {
        handleUnauthorized()
        setNotice({
          tone: 'warning',
          message: 'Phien dang nhap da het han. Hay dang nhap lai.',
        })
        return
      }

      handleUnauthorized()
      setNotice({
        tone: 'warning',
        message: `Khong xac thuc duoc phien dang nhap: ${extractErrorMessage(error)}. Hay dang nhap lai khi backend san sang.`,
      })
      return
    }

    setBooting(false)
  }, [handleUnauthorized, persistSession, sessionMode, sessionToken])
=======
  }
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91

  async function handleLiveLogin(event) {
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
        message: 'Dang nhap thanh cong. Dang nap giao dien theo dung quyen cua tai khoan.',
      })
    } catch (error) {
      setNotice({
        tone: 'warning',
        message: error?.status === 401
          ? 'Ten dang nhap hoac mat khau khong dung.'
          : `Khong dang nhap duoc: ${extractErrorMessage(error)}`,
      })
    } finally {
      setBusyAction('')
    }
  }

  function handleLogout() {
    handleUnauthorized()
    setNotice({
      tone: 'info',
      message: 'Da dang xuat khoi giao dien quan tri.',
    })
  }

  useEffect(() => {
    if (sessionToken && sessionMode !== 'demo') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshDashboard({
        permissionNames: getPermissionNames(session?.user),
        currentUser: session?.user || null,
      })
    }
<<<<<<< HEAD

    setBooting(false)
  }, [bootstrapSession, sessionMode, sessionToken])
=======
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, session?.mode])
>>>>>>> 64d87e8012a53710c3850198fcbd5b9837612b91

  return {
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
    setCategories,
    suppliers,
    setSuppliers,
    products,
    setProducts,
    orders,
    setOrders,
    reportRows,
    setReportRows,
    topProducts,
    setTopProducts,
    summary,
    setSummary,
    roles,
    setRoles,
    permissionNamesCatalog,
    setPermissionNamesCatalog,
    accounts,
    setAccounts,
    settingsForm,
    setSettingsForm,
    refreshDashboard,
    handleLiveLogin,
    handleLogout,
  }
}

export default useAppData
