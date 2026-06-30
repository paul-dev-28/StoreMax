import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FiUsers, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const truncate = (str, max = 16) => (str.length > max ? `${str.slice(0, max)}…` : str);

// ── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{p.name}</p>
      <p className="dash-tooltip-row">
        <span className="dash-tooltip-dot" />
        Total Spent <strong>{formatCurrency(p.totalSpent)}</strong>
      </p>
      <p className="dash-tooltip-row dash-tooltip-row--muted">
        {p.orderCount} {p.orderCount === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

// ── TopCustomersCard ──────────────────────────────────────────
// topCustomers: [{ _id, name, totalSpent, orderCount }]
// No API calls — data supplied via props from the single dashboard fetch.
function TopCustomersCard({ topCustomers, loading, error, onRetry }) {
  const dataset = useMemo(
    () => (topCustomers || []).map((c) => ({ ...c, label: truncate(c.name) })),
    [topCustomers]
  );

  const hasData = dataset.length > 0;

  return (
    <SectionCard title="Top Customers" Icon={FiUsers}>

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
          <FiUsers className="dash-empty-icon" size={28} aria-hidden="true" />
          <p className="dash-empty-title">No customer spending yet</p>
          <p className="dash-empty-desc">Top spenders appear here once orders are recorded.</p>
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="dash-chart-wrapper">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
            <BarChart
              data={dataset}
              layout="vertical"
              barCategoryGap="30%"
              margin={{
                top: 20,
               right: 20,
               left: 10,
                bottom: 10,
              }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar
                dataKey="totalSpent"
                fill="#2563EB"
                radius={[0, 6, 6, 0]}
                maxBarSize={22}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </SectionCard>
  );
}

export default TopCustomersCard;
