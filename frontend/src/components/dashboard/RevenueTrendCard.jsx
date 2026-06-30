import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FiTrendingUp, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// "YYYY-MM-DD" → "24 Jun"
const formatDayLabel = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// "YYYY-MM" → "Jun"
const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split("-");
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short" });
};

const TABS = [
  { key: "today", label: "Today" },
  { key: "7d",    label: "7 Days" },
  { key: "30d",   label: "30 Days" },
  { key: "mo",    label: "Monthly" },
];

// ── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const { revenue, orders } = payload[0].payload;
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{label}</p>
      <p className="dash-tooltip-row">
        <span className="dash-tooltip-dot" />
        Revenue <strong>{formatCurrency(revenue)}</strong>
      </p>
      <p className="dash-tooltip-row dash-tooltip-row--muted">
        {orders} {orders === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

// ── RevenueTrendCard ──────────────────────────────────────────
// revenueTrend:   [{ _id: "YYYY-MM-DD", revenue, orders }]  — last 30 days
// monthlyRevenue: [{ _id: "YYYY-MM",    revenue, orders }]  — last 12 months
// No API calls — all data supplied via props from the single dashboard fetch.
function RevenueTrendCard({ revenueTrend, monthlyRevenue, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("30d");

  // Slice/format the right dataset per tab — pure view logic, no extra fetch
  const chartData = useMemo(() => {
    if (!revenueTrend) return [];

    if (activeTab === "today") {
      const last = revenueTrend[revenueTrend.length - 1];
      return last ? [{ label: "Today", revenue: last.revenue, orders: last.orders }] : [];
    }
    if (activeTab === "7d") {
      return revenueTrend.slice(-7).map((d) => ({
        label: formatDayLabel(d._id), revenue: d.revenue, orders: d.orders,
      }));
    }
    if (activeTab === "30d") {
      return revenueTrend.map((d) => ({
        label: formatDayLabel(d._id), revenue: d.revenue, orders: d.orders,
      }));
    }
    // monthly
    return (monthlyRevenue || []).map((d) => ({
      label: formatMonthLabel(d._id), revenue: d.revenue, orders: d.orders,
    }));
  }, [activeTab, revenueTrend, monthlyRevenue]);

  const hasData = chartData.some((d) => d.revenue > 0);

  const tabSwitcher = (
    <div className="dash-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`dash-tab${activeTab === tab.key ? " dash-tab--active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard title="Revenue Trend" Icon={FiTrendingUp} headerRight={tabSwitcher} className="dash-card--trend">

      {loading && (
        <div className="dash-chart-skeleton shimmer" aria-hidden="true" />
      )}

      {!loading && error && (
        <div className="dash-card-error">
          <FiAlertTriangle size={18} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={onRetry} type="button">
            <FiRefreshCw size={13} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="dash-empty-state">
          <FiTrendingUp className="dash-empty-icon" size={28} aria-hidden="true" />
          <p className="dash-empty-title">No revenue yet</p>
          <p className="dash-empty-desc">Sales will appear here once you create your first order.</p>
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="dash-chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            {activeTab === "today" ? (
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={48} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={64}
                  animationDuration={600} animationEasing="ease-out" />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={48} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#BFDBFE", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

    </SectionCard>
  );
}

export default RevenueTrendCard;
