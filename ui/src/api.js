const BASE_URL = '/api/v1'

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

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
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
