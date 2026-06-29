import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Colour palette ────────────────────────────────────────────
// Mirrors the StoreMax design tokens exactly.
const C = {
  indigo:  [79,  70,  229],  // #4F46E5 — primary brand
  dark:    [15,  23,  42],   // #0F172A — primary text
  gray:    [100, 116, 139],  // #64748B — secondary text
  light:   [248, 250, 252],  // #F8FAFC — alternate row
  white:   [255, 255, 255],
  green:   [22,  163, 74],   // #16A34A — paid status
  amber:   [161, 98,  7],    // #A16207 — partial status
  red:     [220, 38,  38],   // #DC2626 — due status
  border:  [226, 232, 240],  // #E2E8F0 — divider
};

// ── Local date formatter ──────────────────────────────────────
// Standalone helper — no React dependency.
const _fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
};

// ── Currency formatter ────────────────────────────────────────
// Standard PDF fonts (Helvetica) do not include the ₹ glyph.
// Rs. prefix is used for reliable cross-platform rendering.
// The on-screen UI continues to display ₹ via the browser.
const _fmtMoney = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-IN")}`;

// ── Status colour ─────────────────────────────────────────────
const _statusColor = (status) => {
  if (status === "paid")    return C.green;
  if (status === "partial") return C.amber;
  return C.red;
};

/**
 * generateInvoicePdf
 *
 * Generates and immediately downloads a PDF invoice.
 * Accepts the fully populated sale object returned by GET /api/sales/:id.
 *
 * @param {Object} sale  Populated Sale document (customer, products.product populated)
 */
const generateInvoicePdf = (sale) => {
  const doc       = new jsPDF({ unit: "mm", format: "a4" });
  const pageW     = doc.internal.pageSize.getWidth();
  const pageH     = doc.internal.pageSize.getHeight();
  const margin    = 18;
  const contentW  = pageW - margin * 2;

  // ── Header band ───────────────────────────────────────────
  doc.setFillColor(...C.indigo);
  doc.rect(0, 0, pageW, 32, "F");

  // Brand name — left
  doc.setTextColor(...C.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("StoreMax", margin, 14);

  // Tagline — left
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Inventory & Sales Management System", margin, 21);

  // "INVOICE" label — right
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageW - margin, 14, { align: "right" });

  // Invoice number — right
  const invoiceNum = sale.invoiceNumber || `#${sale._id.slice(-6).toUpperCase()}`;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceNum, pageW - margin, 22, { align: "right" });

  // ── Invoice meta + Bill To ────────────────────────────────
  let y = 42;

  // Left block: date and status
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.gray);
  doc.text("INVOICE DATE", margin, y);
  doc.text("PAYMENT STATUS", margin, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dark);
  doc.text(_fmtDate(sale.createdAt), margin + 36, y);

  const status = sale.paymentStatus || "paid";
  doc.setFont("helvetica", "bold");
  doc.setTextColor(..._statusColor(status));
  doc.text(status.toUpperCase(), margin + 36, y + 9);

  // Right block: Bill To
  const midX = pageW / 2 + 4;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.gray);
  doc.text("BILL TO", midX, y);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(sale.customer.name, midX, y + 9);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text(sale.customer.phone, midX, y + 16);

  // Wrap long address to available width
  const addrLines = doc.splitTextToSize(
    sale.customer.address,
    pageW - midX - margin
  );
  doc.text(addrLines, midX, y + 23);

  y += 46;

  // ── Divider ───────────────────────────────────────────────
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Products table ────────────────────────────────────────
  const tableRows = sale.products.map((item, index) => [
    index + 1,
    item.product?.name || "Deleted Product",
    item.quantity,
    _fmtMoney(item.product?.sellingPrice ?? 0),
    _fmtMoney((item.product?.sellingPrice ?? 0) * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Product Name", "Qty", "Unit Price", "Subtotal"]],
    body: tableRows,
    headStyles: {
      fillColor: C.indigo,
      textColor: C.white,
      fontStyle:  "bold",
      fontSize:   9,
      halign:     "left",
    },
    bodyStyles: {
      fontSize:  9,
      textColor: C.dark,
    },
    alternateRowStyles: {
      fillColor: C.light,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 38, halign: "right" },
      4: { cellWidth: 38, halign: "right" },
    },
    styles: {
      cellPadding: 3.5,
      lineColor:   C.border,
      lineWidth:   0.2,
    },
    tableLineColor: C.border,
    tableLineWidth: 0.2,
  });

  // ── Summary block ─────────────────────────────────────────
  const afterTable = doc.lastAutoTable.finalY + 10;
  const labelX     = pageW - margin - 68;
  const valueX     = pageW - margin;

  // Total items
  const totalQty = sale.products.reduce((sum, item) => sum + item.quantity, 0);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text("Total Items:", labelX, afterTable);
  doc.setTextColor(...C.dark);
  doc.text(`${totalQty}`, valueX, afterTable, { align: "right" });

  // Light divider above grand total
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(labelX, afterTable + 4, valueX, afterTable + 4);

  // Grand total
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("Grand Total:", labelX, afterTable + 12);
  doc.setTextColor(...C.indigo);
  doc.text(_fmtMoney(sale.totalAmount), valueX, afterTable + 12, {
    align: "right",
  });

  // ── Footer ────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text(
    "Generated by StoreMax — Inventory & Sales Management System",
    pageW / 2,
    pageH - 10,
    { align: "center" }
  );

  // ── Save ──────────────────────────────────────────────────
  const filename = sale.invoiceNumber
    ? `${sale.invoiceNumber}.pdf`
    : `Invoice-${sale._id.slice(-6).toUpperCase()}.pdf`;

  doc.save(filename);
};

export default generateInvoicePdf;
