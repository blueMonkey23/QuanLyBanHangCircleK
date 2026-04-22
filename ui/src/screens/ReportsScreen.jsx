import { MetricCard, StatusPill } from '../components/common'
import { formatCompactNumber, formatCurrency } from '../app-utils'

function ReportsScreen({
  reportPreset,
  setReportPreset,
  branchFilter,
  setBranchFilter,
  branchOptions,
  handleExportReport,
  summary,
  averageTicket,
  reportRows,
  maxRevenue,
  topProducts,
}) {
  return (
    <>
      <section className="section-grid section-grid--hero">
        <div className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Báo cáo và thống kê</p>
              <h3>Tổng quan doanh thu</h3>
            </div>
            <div className="toolbar-row">
              <select value={reportPreset} onChange={(event) => setReportPreset(event.target.value)}>
                <option value="week">7 ngày gần nhất</option>
                <option value="month">Tháng này</option>
                <option value="quarter">Quý này</option>
              </select>
              <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              <button className="primary-button" type="button" onClick={handleExportReport}>
                Xuất file
              </button>
            </div>
          </div>

          <div className="metric-row">
            <MetricCard eyebrow="Doanh thu" value={formatCurrency(summary.revenue)} label="Tổng doanh thu" tone="blue" />
            <MetricCard eyebrow="Hóa đơn" value={formatCompactNumber(summary.invoiceCount)} label="Số hóa đơn" tone="red" />
            <MetricCard eyebrow="TB / hóa đơn" value={formatCurrency(averageTicket)} label="Giá trị trung bình" tone="green" />
          </div>
        </div>

        <aside className="panel panel--soft">
          <p className="eyebrow">Bộ lọc nhanh</p>
          <h3>Chi nhánh & chu kỳ</h3>
          <p className="panel__copy">
            Layout phần báo cáo đang bám cụm artboard `Báo cáo và thống kê` trong file thiết kế mới.
          </p>
          <div className="mini-stack">
            <StatusPill tone="info">{reportPreset === 'month' ? 'Tháng 3' : reportPreset}</StatusPill>
            <StatusPill tone="neutral">{branchFilter}</StatusPill>
          </div>
        </aside>
      </section>

      <section className="section-grid section-grid--report">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Biểu đồ</p>
              <h3>Doanh thu theo mốc</h3>
            </div>
          </div>

          <div className="bar-chart">
            {reportRows.map((row) => (
              <div key={row.period} className="bar-chart__item">
                <div
                  className="bar-chart__bar"
                  style={{ height: `${Math.max(18, (row.revenue / maxRevenue) * 100)}%` }}
                />
                <strong>{formatCurrency(row.revenue)}</strong>
                <span>{row.period}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Top sản phẩm</p>
              <h3>Bán chạy nhất</h3>
            </div>
          </div>

          <div className="stack-list">
            {topProducts.map((item, index) => (
              <div key={`${item.id}-${index}`} className="stack-list__item">
                <div>
                  <strong>{item.name}</strong>
                  <p>Đã bán {formatCompactNumber(item.quantity)} sản phẩm</p>
                </div>
                <StatusPill tone="success">Top {index + 1}</StatusPill>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}

export default ReportsScreen
