function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBooleanFlag(value) {
  if (Buffer.isBuffer(value)) {
    return value[0] === 1;
  }

  if (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.data) &&
    value.type === 'Buffer'
  ) {
    return value.data[0] === 1;
  }

  return value === true || value === 1 || value === '1' || value === 'true';
}

function toDateTimeValue(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function toDateOnlyValue(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function mapMessageRow(row, fallbackMessage) {
  if (!row) {
    return fallbackMessage ? { message: fallbackMessage } : null;
  }

  const message = row.message || row.Message || fallbackMessage;
  return message ? { message } : row;
}

module.exports = {
  toNumberOrNull,
  toBooleanFlag,
  toDateTimeValue,
  toDateOnlyValue,
  mapMessageRow,
};
