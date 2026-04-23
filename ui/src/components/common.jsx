export function StatusPill({ tone = 'neutral', children }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>
}

export function NoticeBar({ notice }) {
  if (!notice?.message) {
    return null
  }

  return (
    <div className={`notice-bar notice-bar--${notice.tone || 'info'}`}>
      <strong>{notice.tone === 'success' ? 'Đồng bộ' : 'Thông báo'}</strong>
      <span>{notice.message}</span>
    </div>
  )
}

export function MetricCard({ eyebrow, value, label, tone = 'blue' }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__eyebrow">{eyebrow}</p>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

export function SidebarItem({ item, active, onSelect }) {
  return (
    <button
      className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
      type="button"
      onClick={() => onSelect(item.id)}
    >
      <span className="sidebar__item-badge">{item.badge}</span>
      <span className="sidebar__item-copy">
        <strong>{item.icon} {item.label}</strong>
        <small>{item.description}</small>
      </span>
    </button>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}
