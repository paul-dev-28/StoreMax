import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FiPackage, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// Truncate long product names for the Y-axis tick label
const truncate = (str, max = 16) => (str.length > max ? `${str.slice(0, max)}…` : str);

// ── Tab configuration ────────────────────────────────────────
// Single source of truth for all 3 tabs — same chart render path,
// only the dataKey/colour/formatter differ. Avoids duplicating the
// chart JSX three times.
const TAB_CONFIG = [
  { key: "top",     label: "Top Selling",     dataKey: "unitsSold", color: "#2563EB", unit: "units" },
  { key: "revenue", label: "Highest Revenue", dataKey: "revenue",   color: "#16a34a", unit: "₹"     },
  { key: "slow",    label: "Slow Moving",     dataKey: "unitsSold", color: "#f59e0b", unit: "units" },
];

// ── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{p.name}</p>
      <p className="dash-tooltip-row dash-tooltip-row--muted">{p.category}</p>
      <p className="dash-tooltip-row">
        <span className="dash-tooltip-dot" />
        {p.unitsSold} units sold
      </p>
      <p className="dash-tooltip-row">Revenue <strong>{formatCurrency(p.revenue)}</strong></p>
    </div>
  );
}

// ── TopProductsCard ───────────────────────────────────────────
// topSelling / highestRevenue / slowMoving:
//   [{ _id, name, category, unitsSold, revenue }]
// No API calls — all three datasets supplied via props from the
// single dashboard fetch; switching tabs only changes which prop
// array (and which TAB_CONFIG entry) is rendered.
function TopProductsCard({ topSelling, highestRevenue, slowMoving, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("top");

  const tab = TAB_CONFIG.find((t) => t.key === activeTab);

  const dataset = useMemo(() => {
    const source =
      activeTab === "top"     ? topSelling :
      activeTab === "revenue" ? highestRevenue :
                                 slowMoving;

    return (source || []).map((p) => ({
      ...p,
      label: truncate(p.name),
    }));
  }, [activeTab, topSelling, highestRevenue, slowMoving]);

  const hasData = dataset.length > 0;

  const tabSwitcher = (
    <div className="dash-tabs">
      {TAB_CONFIG.map((t) => (
        <button
          key={t.key}
          className={`dash-tab${activeTab === t.key ? " dash-tab--active" : ""}`}
          onClick={() => setActiveTab(t.key)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard title="Product Performance" Icon={FiPackage} headerRight={tabSwitcher}>

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
          <FiPackage className="dash-empty-icon" size={28} aria-hidden="true" />
          <p className="dash-empty-title">No product sales yet</p>
          <p className="dash-empty-desc">This list fills in once you start recording sales.</p>
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="dash-chart-wrapper">
          <ResponsiveContainer width="100%" height={Math.max(220, dataset.length * 42)}>
            <BarChart
              data={dataset}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                tickFormatter={(v) => (tab.unit === "₹" ? `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : v)}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar
                dataKey={tab.dataKey}
                fill={tab.color}
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

export default TopProductsCard;
