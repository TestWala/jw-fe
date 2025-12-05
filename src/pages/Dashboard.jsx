import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { inventoryItems, sales, purchaseOrders } = useContext(AppContext);

  // Total SKUs
  const totalItems = inventoryItems.length;

  // Total gold/silver weights
  const totalGold = inventoryItems
    .filter(i => i.metalType === "gold")
    .reduce((sum, i) => sum + Number(i.netWeight), 0);

  const totalSilver = inventoryItems
    .filter(i => i.metalType === "silver")
    .reduce((sum, i) => sum + Number(i.netWeight), 0);

  // Low stock items
  const lowStock = inventoryItems.filter(
    i => Number(i.currentQuantity) < Number(i.minimumStockLevel)
  ).length;

  // ---------------------------------------------------------
  // 🟡 CREATE RECENT TRANSACTION LIST (SALES + PURCHASE)
  // ---------------------------------------------------------

  // Convert purchase orders → transaction rows
  const purchaseTx = purchaseOrders.flatMap(po =>
    po.items.map(item => ({
      date: po.createdAt,
      type: "Purchase",
      amount: item.totalAmount,
      quantity: item.quantity,
      itemCode: item.itemCode ?? "-",
      name: item.itemName ?? "-",
    }))
  );

  // Convert sales invoices → transaction rows
  const salesTx = sales.flatMap(inv =>
    inv.items.map(item => {
      const prod = inventoryItems.find(i => i.id === item.inventoryItemId);

      return {
        date: inv.createdAt,
        type: "Sale",
        amount: item.totalAmount,
        quantity: item.quantity,
        itemCode: prod?.itemCode ?? "-",
        name: prod?.shortName ?? "-",
      };
    })
  );

  // Combine + Sort + Slice
  const recent = [...purchaseTx, ...salesTx]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

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
          <h4>Low Stock Items</h4>
          <p className="value">{lowStock}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <h3 className="recent-title">Latest 5 Transactions</h3>

      <table className="recent-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>

        <tbody>
          {recent.map((t, i) => (
            <tr key={i}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.type}</td>
              <td>{t.itemCode}</td>
              <td>{t.name}</td>
              <td>{t.quantity}</td>
              <td>{t.amount?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
