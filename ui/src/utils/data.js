export function toArray(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export function toObject(payload) {
  if (!payload) {
    return null
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload.data && typeof payload.data === 'object' ? payload.data : payload
  }

  return null
}

export function readField(record, keys, fallback = '') {
  if (!record || !Array.isArray(keys)) {
    return fallback
  }

  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }

  return fallback
}

export function formatCurrency(value) {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('vi-VN').format(amount)
}

export function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
