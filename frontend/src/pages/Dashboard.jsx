import { useState, useEffect, useMemo } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import api from "../services/api";
import { CARD_CONFIG, KpiCard, KpiSkeletonCard } from "../components/dashboard/KpiCard";
import InsightsStrip from "../components/dashboard/InsightsStrip";
import RevenueTrendCard from "../components/dashboard/RevenueTrendCard";
import SummaryMetricsCard from "../components/dashboard/SummaryMetricsCard";
import TopProductsCard from "../components/dashboard/TopProductsCard";
import CategoryInsightsCard from "../components/dashboard/CategoryInsightsCard";
import TopCustomersCard from "../components/dashboard/TopCustomersCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import LowStockCard from "../components/dashboard/LowStockCard";
import "./Dashboard.css";

// ── Dashboard ─────────────────────────────────────────────────
// Page orchestrator only — fetches data and composes the reusable
// dashboard widgets. All presentation, chart logic, and per-widget
// empty/loading/error handling lives inside the components themselves.
function Dashboard() {
  const [kpiStats, setKpiStats]     = useState(null); // /analytics/dashboard
  const [chartData, setChartData]   = useState(null); // /analytics/charts
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Single combined fetch — both endpoints requested in parallel via
  // Promise.all. Used for both the initial mount and the manual refresh
  // button, so there is exactly one code path for loading dashboard data.
  const fetchDashboard = async () => {
    if (!isInitialLoading) setRefreshing(true);
    setError("");

    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/charts"),
      ]);
      setKpiStats(statsRes.data);
      setChartData(chartsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard analytics.");
    } finally {
      setIsInitialLoading(false);
      setRefreshing(false);
    }
  };

  // Run once on mount — same pattern as every other page in the app
  useEffect(() => {
    fetchDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Memoized derived values ────────────────────────────────
  // Composed once per chartData change, not on every render (e.g. the
  // refresh-spinner toggle), so SummaryMetricsCard doesn't see a new
  // object reference unless the underlying data actually changed.
  const summaryData = useMemo(() => {
    if (!chartData) return null;
    return {
      todayStats:     chartData.todayStats,
      monthStats:     chartData.monthStats,
      orderStats:     chartData.orderStats,
      inventoryStats: chartData.inventoryStats,
    };
  }, [chartData]);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }, [lastUpdated]);

  // True only when the very first load attempt has finished and failed,
  // leaving nothing to display. A failed *refresh* (data already loaded)
  // does not hit this branch — stale data stays visible with a small banner.
  const hasNoData = !kpiStats && !chartData;

  return (
    <div className="dashboard-page">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="dashboard-header-row">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your inventory, customers and sales
          </p>
        </div>

        <div className="dashboard-header-actions">
          {formattedLastUpdated && (
            <span className="dashboard-updated">Updated {formattedLastUpdated}</span>
          )}
          <button
            className="dashboard-refresh-btn"
            onClick={fetchDashboard}
            disabled={isInitialLoading || refreshing}
            type="button"
            aria-label="Refresh dashboard"
          >
            <FiRefreshCw
              size={14}
              className={refreshing ? "dashboard-refresh-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Full-page error — only when nothing has ever loaded ──── */}
      {!isInitialLoading && error && hasNoData && (
        <div className="error-card" role="alert">
          <FiAlertTriangle size={20} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchDashboard} type="button">
            <FiRefreshCw size={14} aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

      {/* ── Stale-data banner — refresh failed, but old data remains ── */}
      {error && !hasNoData && (
        <div className="dashboard-stale-banner" role="alert">
          <FiAlertTriangle size={15} aria-hidden="true" />
          Couldn't refresh — showing previously loaded data.
        </div>
      )}

      {/* ── Main Content — rendered once, props carry loading state ── */}
      {!(error && hasNoData) && (
        <>

          {/* ── KPI Row (existing 5 cards) ───────────────── */}
          <div className="stats-grid">
            {isInitialLoading ? (
              Array.from({ length: 5 }).map((_, i) => <KpiSkeletonCard key={i} />)
            ) : (
              CARD_CONFIG.map(({ key, label, Icon, iconVariant, format, warnIfPositive }) => (
                <KpiCard
                  key={key}
                  label={label}
                  value={format(kpiStats[key])}
                  rawValue={kpiStats[key]}
                  Icon={Icon}
                  iconVariant={iconVariant}
                  warnIfPositive={warnIfPositive}
                />
              ))
            )}
          </div>

          {/* ── Insights Strip ────────────────────────────── */}
          <InsightsStrip data={chartData} loading={isInitialLoading} />

          {/* ── Revenue Trend + Summary Metrics ──────────── */}
          <div className="dashboard-grid-primary">
            <RevenueTrendCard
              revenueTrend={chartData?.revenueTrend}
              monthlyRevenue={chartData?.monthlyRevenue}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
            <SummaryMetricsCard
              data={summaryData}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
          </div>

          {/* ── Top Products + Category Insights ─────────── */}
          <div className="dashboard-grid-secondary">
            <TopProductsCard
              topSelling={chartData?.topSelling}
              highestRevenue={chartData?.highestRevenue}
              slowMoving={chartData?.slowMoving}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
            <CategoryInsightsCard
              inventoryByCategory={chartData?.inventoryByCategory}
              revenueByCategory={chartData?.revenueByCategory}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
          </div>

          {/* ── Top Customers + Recent Activity ──────────── */}
          <div className="dashboard-grid-secondary">
            <TopCustomersCard
              topCustomers={chartData?.topCustomers}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
            <RecentActivityCard
              recentSales={chartData?.recentSales}
              recentCustomers={chartData?.recentCustomers}
              loading={isInitialLoading}
              error={null}
              onRetry={fetchDashboard}
            />
          </div>

          {/* ── Low Stock Alert (full width) ─────────────── */}
          <LowStockCard
            lowStockList={chartData?.lowStockList}
            loading={isInitialLoading}
            error={null}
            onRetry={fetchDashboard}
          />

        </>
      )}

    </div>
  );
}

export default Dashboard;
