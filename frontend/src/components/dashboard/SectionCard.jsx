// ── SectionCard ───────────────────────────────────────────────
// Generic wrapper used by every dashboard widget below the KPI row.
// Provides the consistent card shell (title, optional icon, optional
// header-right slot for tab switchers) so each widget only needs to
// implement its own content — not its own header markup.
//
// Reused by: RevenueTrendCard, SummaryMetricsCard, TopProductsCard,
// CategoryInsightsCard, TopCustomersCard, RecentActivityCard, LowStockCard.
function SectionCard({ title, Icon, headerRight, children, className = "" }) {
  return (
    <div className={`dash-section-card ${className}`.trim()}>
      <div className="dash-section-header">
        <div className="dash-section-title">
          {Icon && <Icon size={15} aria-hidden="true" />}
          {title}
        </div>
        {headerRight && <div className="dash-section-header-right">{headerRight}</div>}
      </div>
      <div className="dash-section-body">
        {children}
      </div>
    </div>
  );
}

export default SectionCard;
