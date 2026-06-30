import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { FiGrid, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// ── Tab configuration ────────────────────────────────────────
// Single source of truth for both tabs — same chart render path,
// only the dataKey/colour/seriesName differ. Avoids duplicating
// the chart JSX twice for two structurally similar datasets.
const TAB_CONFIG = [
  { key: "inventory", label: "By Stock",   dataKey: "inventoryValue", color: "#4f46e5", seriesName: "Inventory Value" },
  { key: "revenue",   label: "By Revenue", dataKey: "revenue",        color: "#16a34a", seriesName: "Revenue"         },
];

// ── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, activeTab }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="dash-tooltip">
      <p className="dash-tooltip-label">{p.label}</p>
      <p className="dash-tooltip-row">
        <span className="dash-tooltip-dot" />
        {activeTab === "inventory" ? "Stock Value" : "Revenue"}{" "}
        <strong>{formatCurrency(p.value)}</strong>
      </p>
      <p className="dash-tooltip-row dash-tooltip-row--muted">
        {activeTab === "inventory"
          ? `${p.productCount} ${p.productCount === 1 ? "product" : "products"}`
          : `${p.unitsSold} units sold`}
      </p>
    </div>
  );
}

// ── CategoryInsightsCard ──────────────────────────────────────
// inventoryByCategory: [{ _id: category, totalQuantity, inventoryValue, productCount }]
// revenueByCategory:   [{ _id: category, revenue, unitsSold }]
// No API calls — both datasets supplied via props from the single dashboard fetch.
function CategoryInsightsCard({ inventoryByCategory, revenueByCategory, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("inventory");

  const tab = TAB_CONFIG.find((t) => t.key === activeTab);

  const dataset = useMemo(() => {
    const source = activeTab === "inventory" ? inventoryByCategory : revenueByCategory;
    return (source || []).map((c) => ({
      label:        c._id || "Uncategorized",
      value:        activeTab === "inventory" ? c.inventoryValue : c.revenue,
      productCount: c.productCount,
      unitsSold:    c.unitsSold,
    }));
  }, [activeTab, inventoryByCategory, revenueByCategory]);

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
    <SectionCard title="Category Insights" Icon={FiGrid} headerRight={tabSwitcher}>

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
          <FiGrid className="dash-empty-icon" size={28} aria-hidden="true" />
          <p className="dash-empty-title">No category data yet</p>
          <p className="dash-empty-desc">Add products with categories to see this breakdown.</p>
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="dash-chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dataset} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval={0}
                angle={dataset.length > 5 ? -20 : 0}
                textAnchor={dataset.length > 5 ? "end" : "middle"}
                height={dataset.length > 5 ? 48 : 24}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                width={48}
              />
              <Tooltip content={<ChartTooltip activeTab={activeTab} />} cursor={{ fill: "#f8fafc" }} />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="circle"
                iconSize={8}
                formatter={() => <span className="dash-legend-label">{tab.seriesName}</span>}
              />
              <Bar
                dataKey="value"
                name={tab.seriesName}
                fill={tab.color}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
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

export default CategoryInsightsCard;
