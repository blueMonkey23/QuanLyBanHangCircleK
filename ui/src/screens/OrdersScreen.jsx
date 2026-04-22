import { EmptyState, MetricCard, StatusPill } from '../components/common'
import { formatCurrency, formatDateTime, getStatusTone } from '../app-utils'

function OrdersScreen({
  orderStatusSummary,
  ordersSearch,
  setOrdersSearch,
  filteredOrders,
  refreshSectionData,
  syncing,
  handleViewOrder,
  handlePrintOrder,
  loadingOrderId,
}) {
  return (
    <>
      <section className="section-grid">
        <div className="panel panel--soft">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Quản lý đơn hàng</p>
              <h3>Danh sách đơn hàng</h3>
            </div>
            <div className="cluster-row">
              <StatusPill tone="info">Tất cả {orderStatusSummary.all}</StatusPill>
              <StatusPill tone="warning">Đang xử lý {orderStatusSummary.processing}</StatusPill>
            </div>
          </div>

          <div className="metric-row">
            <MetricCard eyebrow="Mới" value={orderStatusSummary.new} label="Đơn vừa tạo" tone="red" />
            <MetricCard eyebrow="Đang xử lý" value={orderStatusSummary.processing} label="Đơn cần theo dõi" tone="amber" />
            <MetricCard eyebrow="Hoàn tất" value={orderStatusSummary.done} label="Đơn đã chốt" tone="green" />
            <MetricCard eyebrow="Hủy" value={orderStatusSummary.cancel} label="Đơn thất bại" tone="slate" />
          </div>

          <div className="toolbar-row">
            <label className="searchbox">
              <span>🔍</span>
              <input
                value={ordersSearch}
                onChange={(event) => setOrdersSearch(event.target.value)}
                placeholder="Tìm theo mã đơn, khách hàng hoặc trạng thái"
              />
            </label>
            <button className="ghost-button" type="button" onClick={() => setOrdersSearch('')}>
              Xóa lọc
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Bảng dữ liệu</p>
            <h3>Danh sách đơn hàng</h3>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void refreshSectionData()}
            disabled={syncing}
          >
            {syncing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            title="Không có đơn hàng phù hợp"
            message="Thử đổi từ khóa tìm kiếm hoặc tạo đơn mới từ màn hình POS."
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách / nhân viên</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <span>{order.assigneeName}</span>
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <StatusPill tone={getStatusTone(order.status)}>{order.status}</StatusPill>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="tiny-button"
                          type="button"
                          onClick={() => void handleViewOrder(order)}
                          disabled={loadingOrderId === String(order.id)}
                        >
                          {loadingOrderId === String(order.id) ? 'Đang tải...' : 'Xem'}
                        </button>
                        <button
                          className="tiny-button tiny-button--ghost"
                          type="button"
                          onClick={() => void handlePrintOrder(order)}
                          disabled={loadingOrderId === String(order.id)}
                        >
                          In
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

export default OrdersScreen
