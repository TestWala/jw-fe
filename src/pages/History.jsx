import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./History.css";

export default function History() {
  const {
    sales,
    suppliers,
    customers,
    purchaseOrders,
    inventoryItems,
    stockHistory
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("inventory");

  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const sortedPurchases = [...purchaseOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const sortedInventory = [...stockHistory].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  /* Helpers */
  const getInventoryItem = (id) =>
    inventoryItems.find(i => i.id === id);

  const getSupplierName = (id) => {
    const s = suppliers.find(s => s.id === id);
    return s ? `${s.contactPerson} (${s.phone})` : "N/A";
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? `${c.fullName} (${c.phone})` : "Guest";
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>📜 Transaction History</h2>

        {/* ------------------- TABS ------------------- */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            📦 Inventory
          </button>

          <button
            className={`tab-btn ${activeTab === "sales" ? "active" : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            💰 Sales
          </button>

          <button
            className={`tab-btn ${activeTab === "purchase" ? "active" : ""}`}
            onClick={() => setActiveTab("purchase")}
          >
            📦 Purchase Orders
          </button>
        </div>

      </div>
      {/* ------------------- TAB CONTENT ------------------- */}
      <div className="tab-content">

        {/* ================= INVENTORY ================= */}
        {activeTab === "inventory" && (
          <section className="history-section fade-in">
            <h3>📊 Inventory Movements</h3>

            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>IN / OUT</th>
                    <th>Weight (g)</th>
                    <th>Unit Price</th>
                    <th>Final Amount</th>
                    <th>Ref No</th>
                    <th>Party</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedInventory.length ? sortedInventory.map(m => {
                    const item = getInventoryItem(m.inventoryItemId);

                    return (
                      <tr key={m.id}>
                        <td>
                          <strong>{item?.itemCode}</strong>
                          <br />
                          <small>{item?.notes}</small>
                        </td>

                        <td>{m.transactionType.toUpperCase()}</td>

                        <td>
                          <span className={`status-badge ${m.movementType}`}>
                            {m.movementType.toUpperCase()}
                          </span>
                        </td>

                        <td>{m.weight}</td>
                        <td>₹ {m.unitPrice?.toLocaleString()}</td>
                        <td>₹ {m.finalAmount?.toLocaleString()}</td>
                        <td>{m.referenceNumber}</td>

                        <td>
                          {m.transactionType === "purchase"
                            ? getSupplierName(m.supplierId)
                            : getCustomerName(m.customerId)}
                        </td>

                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="9" className="empty-text">
                        No Inventory Movements Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= SALES ================= */}
        {activeTab === "sales" && (
          <section className="history-section fade-in">
            <h3>💰 Sales Invoices</h3>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Final Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSales.length ? sortedSales.map(s => (
                    <tr key={s.id}>
                      <td>{s.invoiceNumber}</td>
                      <td>{getCustomerName(s.customerId)}</td>
                      <td>₹ {s.finalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${s.paymentStatus}`}>
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>{s.items?.length || 0}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="empty-text">No Sales Found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= PURCHASE ================= */}
        {activeTab === "purchase" && (
          <section className="history-section fade-in">
            <h3>📦 Purchase Orders</h3>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Final Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPurchases.length ? sortedPurchases.map(po => (
                    <tr key={po.id}>
                      <td>{po.poNumber}</td>
                      <td>{getSupplierName(po.supplierId)}</td>
                      <td>₹ {po.finalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${po.status}`}>
                          {po.status}
                        </span>
                      </td>
                      <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                      <td>{po.items?.length || 0}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="empty-text">No Purchase Orders Found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
