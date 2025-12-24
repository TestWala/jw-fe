import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./Dashboard.css";

export default function Dashboard() {
  const {
    inventoryItems,
    categories,
    sales,
    purchaseOrders
  } = useContext(AppContext);

  // category → metal map
  const categoryMetalMap = Object.fromEntries(
    categories.map(c => [c.id, c.metalType])
  );

  // Total SKUs
  const totalItems = inventoryItems.filter(
    i => i.status === "IN_STOCK"
  ).length;

  // Gold & Silver totals (single loop)
  const totals = inventoryItems.reduce(
    (acc, item) => {
      if (item.status !== "IN_STOCK") return acc;

      const metalType = categoryMetalMap[item.categoryId];
      const weight = Number(item.grossWeight || 0);

      if (metalType === "gold") acc.gold += weight;
      if (metalType === "silver") acc.silver += weight;
      if (metalType === "platinum") acc.platinum += weight;

      return acc;
    },
    { gold: 0, silver: 0, platinum: 0 }
  );

  const totalGold = totals.gold;
  const totalSilver = totals.silver;
  const totalPlatinum = totals.platinum;

  // Low stock
  const lowStock = inventoryItems.filter(
    i => Number(i.currentQuantity) < 2
  ).length;


  // ---------------------------------------------------------
  // 🟡 CREATE RECENT TRANSACTION LIST (SALES + PURCHASE)
  // ---------------------------------------------------------

  // Convert purchase orders → transaction rows
  const purchaseTx = purchaseOrders.flatMap(po => {
    // For each PO, get items from inventory
    return po.items.map(poItem => {
      const inventoryItem = inventoryItems.find(
        inv => inv.id === poItem.inventoryItemId
      );

      return {
        date: po.createdAt || po.expectedDeliveryDate || new Date().toISOString(),
        type: "Purchase",
        poNumber: po.poNumber,
        amount: inventoryItem?.purchasePrice || 0,
        quantity: inventoryItem?.quantity || 1,
        itemCode: inventoryItem?.itemCode || "-",
        categoryName: inventoryItem?.categoryName || "-",
        supplier: po.supplierName || "N/A"
      };
    });
  });

  // Convert sales invoices → transaction rows
  const salesTx = sales.flatMap(inv => {
    return inv.items.map(item => {
      const inventoryItem = inventoryItems.find(
        i => i.id === item.inventoryItemId
      );

      return {
        date: inv.createdAt || new Date().toISOString(),
        type: "Sale",
        invoiceNumber: inv.invoiceNumber,
        amount: item.totalAmount || 0,
        quantity: item.quantity || 1,
        itemCode: inventoryItem?.itemCode || "-",
        categoryName: inventoryItem?.categoryName || "-",
        customer: inv.customerName || "Walk-in Customer"
      };
    });
  });

  // Combine + Sort + Slice
  const recent = [...purchaseTx, ...salesTx]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>

      </div>

      {/* Cards */}
      <div className="card-row">
        <div className="dash-card">
          <h4>Total Inventory Items</h4>
          <p className="value">{totalItems}</p>
        </div>

        <div className="dash-card">
          <h4>Total Gold Weight (g)</h4>
          <p className="value">{totalGold.toFixed(2)}</p>
        </div>

        <div className="dash-card">
          <h4>Total Silver Weight (g)</h4>
          <p className="value">{totalSilver.toFixed(2)}</p>
        </div>

        <div className="dash-card">
          <h4>Total Platinum Weight (g)</h4>
          <p className="value">{totalPlatinum.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <h3 className="recent-title">Recent Transactions (Last 10)</h3>
      <div className="recent-table-wrapper">

        <table className="recent-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Item Code</th>
              <th>Party</th>
              <th>Unit</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {recent.length > 0 ? (
              recent.map((t, i) => (
                <tr key={i} className={t.type === "Sale" ? "sale-row" : "purchase-row"}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`type-badge ${t.type.toLowerCase()}`}>
                      {t.type}
                    </span>
                  </td>
                  <td>{t.type === "Sale" ? t.invoiceNumber : t.poNumber}</td>
                  <td>{t.itemCode}</td>
                  <td>{t.type === "Sale" ? t.customer : t.supplier}</td>
                  <td>{t.quantity}</td>
                  <td>₹{t.amount?.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}