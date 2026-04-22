const BASE_URL = '/api/v1'
const STORAGE_KEY = 'circlek.session'

let authToken = ''

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function setAuthToken(token) {
  authToken = token || ''
}

export function saveSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  setAuthToken(session?.token || '')
}

export function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw)
    setAuthToken(session?.token || '')
    return session
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }

  setAuthToken('')
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  }

  if (options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export const api = {
  login(payload) {
    return request('/users/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getMe() {
    return request('/users/auth/me')
  },
  getAccounts() {
    return request('/users/accounts')
  },
  getRoles() {
    return request('/users/roles')
  },
  getPermissions() {
    return request('/users/permissions')
  },
  createAccount(payload) {
    return request('/users/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateAccount(maTaiKhoan, payload) {
    return request(`/users/accounts/${maTaiKhoan}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  updatePassword(maTaiKhoan, payload) {
    return request(`/users/accounts/${maTaiKhoan}/password`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteAccount(maTaiKhoan) {
    return request(`/users/accounts/${maTaiKhoan}`, {
      method: 'DELETE',
    })
  },
  getCustomers(filters) {
    return request(`/users/customers${buildQuery(filters)}`)
  },
  createCustomer(payload) {
    return request('/users/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateCustomer(maKhachHang, payload) {
    return request(`/users/customers/${maKhachHang}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteCustomer(maKhachHang) {
    return request(`/users/customers/${maKhachHang}`, {
      method: 'DELETE',
    })
  },
  getSystemSettings() {
    return request('/users/system-settings')
  },
  updateSystemSettings(payload) {
    return request('/users/system-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  getProducts() {
    return request('/products')
  },
  getCategories() {
    return request('/products/categories')
  },
  getSuppliers() {
    return request('/products/suppliers')
  },
  createProduct(payload) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateProduct(maSanPham, payload) {
    return request(`/products/${maSanPham}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteProduct(maSanPham) {
    return request(`/products/${maSanPham}`, {
      method: 'DELETE',
    })
  },
  getOrders() {
    return request('/orders')
  },
  getOrderDetail(maHoaDon) {
    return request(`/orders/${maHoaDon}`)
  },
  createOrder(payload) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getRevenueReport(filters) {
    return request(`/reports/revenue${buildQuery(filters)}`)
  },
  getTopProductsReport(filters) {
    return request(`/reports/top-products${buildQuery(filters)}`)
  },
  getInvoiceSummary(filters) {
    return request(`/reports/invoice-summary${buildQuery(filters)}`)
  },
}
