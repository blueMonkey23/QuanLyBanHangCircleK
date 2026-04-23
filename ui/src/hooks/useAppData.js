import { useCallback, useEffect, useState } from 'react'
import { api, clearSession, readSession, saveSession } from '../api'
import {
  DEMO_SESSION,
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

const RESOURCE_KEYS = ['catalog', 'orders', 'reports', 'users', 'settings']

const SECTION_RESOURCE_MAP = {
  orders: ['orders'],
  products: ['catalog'],
  sales: ['catalog'],
  reports: ['reports'],
  users: ['users'],
  settings: ['settings'],
}

function createResourceStatus(status = 'idle') {
  return Object.fromEntries(RESOURCE_KEYS.map((key) => [key, status]))
}

function getResourcesForSections(sections) {
  return Array.from(
    new Set(
      sections.flatMap((section) => SECTION_RESOURCE_MAP[section] || []),
    ),
  )
}

function hasPermissionForResource(resource, permissionNames) {
  switch (resource) {
    case 'catalog':
    case 'orders':
      return permissionNames.includes(PERMISSIONS.SALES) || permissionNames.includes(PERMISSIONS.PRODUCTS)
    case 'reports':
      return permissionNames.includes(PERMISSIONS.REPORTS)
    case 'users':
      return permissionNames.includes(PERMISSIONS.USERS)
    case 'settings':
      return permissionNames.includes(PERMISSIONS.SETTINGS)
    default:
      return false
  }
}

function getFallbackSummary() {
  return {
    invoiceCount: FALLBACK_ORDERS.length,
    revenue: FALLBACK_ORDERS.reduce((total, order) => total + order.total, 0),
  }
}

function useAppData({ onUnauthorizedUiReset } = {}) {
  const initialSession = normalizeSession(readSession())

  const [session, setSession] = useState(initialSession)
  const [booting, setBooting] = useState(() => Boolean(initialSession?.token && initialSession.mode !== 'demo'))
  const [syncing, setSyncing] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [notice, setNotice] = useState({
    tone: 'info',
    message: 'UI Ä‘ang bÃ¡m láº¡i layout trong há»“ sÆ¡ cÃ¡ nhÃ¢n.fig.',
  })
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [resourceStatus, setResourceStatus] = useState(() =>
    initialSession?.mode === 'demo' ? createResourceStatus('ready') : createResourceStatus(),
  )

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [suppliers, setSuppliers] = useState(FALLBACK_SUPPLIERS)
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [orders, setOrders] = useState(FALLBACK_ORDERS)
  const [reportRows, setReportRows] = useState(FALLBACK_REVENUE_ROWS)
  const [topProducts, setTopProducts] = useState(FALLBACK_TOP_PRODUCTS)
  const [summary, setSummary] = useState(getFallbackSummary)
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [permissionNamesCatalog, setPermissionNamesCatalog] = useState(FALLBACK_PERMISSION_NAMES)
  const [accounts, setAccounts] = useState(() =>
    initialSession?.mode === 'demo'
      ? mapAccounts([], FALLBACK_ROLES, initialSession.user, { fallbackOnEmpty: true })
      : [],
  )
  const [settingsForm, setSettingsForm] = useState(FALLBACK_SETTINGS)

  const currentUser = session?.user || null
  const permissionNames = getPermissionNames(currentUser)

  const resetLiveViewState = useCallback((nextUser = currentUser) => {
    setCategories(FALLBACK_CATEGORIES)
    setSuppliers(FALLBACK_SUPPLIERS)
    setProducts(FALLBACK_PRODUCTS)
    setOrders(FALLBACK_ORDERS)
    setReportRows(FALLBACK_REVENUE_ROWS)
    setTopProducts(FALLBACK_TOP_PRODUCTS)
    setSummary(getFallbackSummary())
    setRoles(FALLBACK_ROLES)
    setPermissionNamesCatalog(FALLBACK_PERMISSION_NAMES)
    setAccounts(mapAccounts([], FALLBACK_ROLES, nextUser, { fallbackOnEmpty: true }))
    setSettingsForm(FALLBACK_SETTINGS)
    setResourceStatus(createResourceStatus())
  }, [currentUser])

  const persistSession = useCallback((nextSession) => {
    const normalized = normalizeSession(nextSession)
    setSession(normalized)

    if (normalized) {
      saveSession(normalized)
    } else {
      clearSession()
    }
  }, [])

  function createDemoSession() {
    return {
      ...DEMO_SESSION,
      user: {
        ...DEMO_SESSION.user,
        permissions: [...DEMO_SESSION.user.permissions],
      },
    }
  }

  const applyDemoState = useCallback((nextSession) => {
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
    setResourceStatus(createResourceStatus('ready'))
    setSyncing(false)
    setBooting(false)
  }, [])

  const enterDemoMode = useCallback((message) => {
    const demoSession = createDemoSession()
    persistSession(demoSession)
    applyDemoState(demoSession)
    setNotice({
      tone: 'warning',
      message,
    })
  }, [applyDemoState, persistSession])

  const handleUnauthorized = useCallback(() => {
    persistSession(null)
    resetLiveViewState(null)
    onUnauthorizedUiReset?.()
    setBooting(false)
  }, [onUnauthorizedUiReset, persistSession, resetLiveViewState])

  const applyResourcePayload = useCallback((resource, payload, activeUser) => {
    switch (resource) {
      case 'catalog': {
        const mappedCategories = mapCategories(payload.categories)
        const mappedSuppliers = mapSuppliers(payload.suppliers)
        const mappedProducts = mapProducts(payload.products, mappedCategories, mappedSuppliers)
        setCategories(mappedCategories)
        setSuppliers(mappedSuppliers)
        setProducts(mappedProducts)
        break
      }
      case 'orders':
        setOrders(mapOrders(payload.orders, activeUser))
        break
      case 'reports': {
        const invoiceSummary = unwrapObjectPayload(payload.invoiceSummary)

        setReportRows(mapRevenueRows(payload.revenue))
        setTopProducts(mapTopProducts(payload.topProducts, products))
        setSummary({
          invoiceCount: Number(
            readField(invoiceSummary, 'soHoaDon', 'SoHoaDon') ?? 0,
          ),
          revenue: Number(
            readField(invoiceSummary, 'tongDoanhThu', 'TongDoanhThu') ?? 0,
          ),
        })
        break
      }
      case 'users': {
        const mappedRoles = mapRoles(payload.roles)
        setRoles(mappedRoles)
        setPermissionNamesCatalog(mapPermissions(payload.permissions))
        setAccounts(mapAccounts(payload.accounts, mappedRoles, activeUser))
        break
      }
      case 'settings':
        setSettingsForm(mapSettings(payload.settings))
        break
      default:
        break
    }
  }, [products])

  const applyResourceFallback = useCallback((resource, activeUser) => {
    switch (resource) {
      case 'catalog':
        setCategories(FALLBACK_CATEGORIES)
        setSuppliers(FALLBACK_SUPPLIERS)
        setProducts(FALLBACK_PRODUCTS)
        break
      case 'orders':
        setOrders(FALLBACK_ORDERS)
        break
      case 'reports':
        setReportRows(FALLBACK_REVENUE_ROWS)
        setTopProducts(FALLBACK_TOP_PRODUCTS)
        setSummary(getFallbackSummary())
        break
      case 'users':
        setRoles(FALLBACK_ROLES)
        setPermissionNamesCatalog(FALLBACK_PERMISSION_NAMES)
        setAccounts(mapAccounts([], FALLBACK_ROLES, activeUser, { fallbackOnEmpty: true }))
        break
      case 'settings':
        setSettingsForm(FALLBACK_SETTINGS)
        break
      default:
        break
    }
  }, [])

  const loadResource = useCallback(async (resource) => {
    switch (resource) {
      case 'catalog': {
        const [productsPayload, categoriesPayload, suppliersPayload] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getSuppliers(),
        ])

        return {
          products: productsPayload,
          categories: categoriesPayload,
          suppliers: suppliersPayload,
        }
      }
      case 'orders':
        return {
          orders: await api.getOrders(),
        }
      case 'reports': {
        const [invoiceSummary, revenue, topProductsPayload] = await Promise.all([
          api.getInvoiceSummary({}),
          api.getRevenueReport({ groupBy: 'day' }),
          api.getTopProductsReport({ limit: 5 }),
        ])

        return {
          invoiceSummary,
          revenue,
          topProducts: topProductsPayload,
        }
      }
      case 'users': {
        const [rolesPayload, permissionsPayload, accountsPayload] = await Promise.all([
          api.getRoles(),
          api.getPermissions(),
          api.getAccounts(),
        ])

        return {
          roles: rolesPayload,
          permissions: permissionsPayload,
          accounts: accountsPayload,
        }
      }
      case 'settings':
        return {
          settings: await api.getSystemSettings(),
        }
      default:
        return null
    }
  }, [])

  const loadSections = useCallback(async (
    sections,
    {
      force = false,
      silent = false,
      announce = false,
      overrideCurrentUser = currentUser,
      overridePermissionNames = permissionNames,
    } = {},
  ) => {
    if (!session?.token || session.mode === 'demo') {
      return
    }

    const resources = getResourcesForSections(Array.isArray(sections) ? sections : [sections])
      .filter((resource) => hasPermissionForResource(resource, overridePermissionNames))
      .filter((resource) => force || resourceStatus[resource] !== 'ready')
      .filter((resource) => resourceStatus[resource] !== 'loading')

    if (resources.length === 0) {
      return
    }

    const shouldShowBooting = !silent && resources.some((resource) => resourceStatus[resource] !== 'ready')

    if (shouldShowBooting) {
      setBooting(true)
    } else if (silent) {
      setSyncing(true)
    }

    setResourceStatus((current) => ({
      ...current,
      ...Object.fromEntries(resources.map((resource) => [resource, 'loading'])),
    }))

    const results = await Promise.allSettled(
      resources.map(async (resource) => ({
        resource,
        payload: await loadResource(resource),
      })),
    )

    const unauthorized = results.find(
      (result) => result.status === 'rejected' && result.reason?.status === 401,
    )

    if (unauthorized) {
      handleUnauthorized()
      setNotice({
        tone: 'warning',
        message: 'PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n. HÃ£y Ä‘Äƒng nháº­p láº¡i.',
      })
      return
    }

    const failedResources = []

    results.forEach((result, index) => {
      const resource = resources[index]

      if (result.status === 'fulfilled') {
        applyResourcePayload(resource, result.value.payload, overrideCurrentUser)
      } else {
        failedResources.push(resource)
        applyResourceFallback(resource, overrideCurrentUser)
      }
    })

    setResourceStatus((current) => ({
      ...current,
      ...Object.fromEntries(resources.map((resource) => [resource, 'ready'])),
    }))

    if (failedResources.length > 0) {
      setNotice({
        tone: 'warning',
        message: `Khong tai duoc mot so khoi du lieu (${failedResources.join(', ')}), UI dang dung fallback cho cac khoi nay.`,
      })
    } else if (announce) {
      setNotice({
        tone: 'success',
        message: 'Du lieu cua man hien tai da duoc cap nhat.',
      })
    }

    setBooting(false)
    setSyncing(false)
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
    if (!session?.token || session.mode === 'demo') {
      setBooting(false)
      return
    }

    setBooting(true)

    try {
      const me = await api.getMe()
      persistSession({
        token: session.token,
        mode: 'live',
        user: {
          ...session.user,
          ...me,
          permissions: me.permissions || session.user?.permissions || [],
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

      enterDemoMode(`Backend chua san sang (${extractErrorMessage(error)}). UI dang chay bang demo data.`)
      return
    }

    setBooting(false)
  }, [enterDemoMode, handleUnauthorized, persistSession, session])

  async function handleLiveLogin(event) {
    event.preventDefault()
    setBusyAction('login')

    try {
      const result = await api.login(loginForm)
      setResourceStatus(createResourceStatus())
      persistSession({
        ...result,
        mode: 'live',
      })
      setNotice({
        tone: 'success',
        message: 'Dang nhap thanh cong. Dang nap giao dien theo dung quyen cua tai khoan.',
      })
    } catch (error) {
      enterDemoMode(`Backend chua san sang (${extractErrorMessage(error)}). UI dang chay bang demo data.`)
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
    if (session?.token && session.mode !== 'demo') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void bootstrapSession()
      return
    }

    setBooting(false)
  }, [bootstrapSession, session?.mode, session?.token])

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
    ensureSectionData,
    refreshSectionData,
    refreshSectionsData,
    invalidateSections,
    isSectionReady,
    isSectionLoading,
    handleLiveLogin,
    handleLogout,
  }
}

export default useAppData
