import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./History.css";

export default function History() {
  const { sales, purchaseOrders } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="history-page">
      <h2>📜 Transaction History</h2>

      {/* ------------------- TABS ------------------- */}
      <div className="tabs-container">
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

      {/* ------------------- TAB CONTENT ------------------- */}
      <div className="tab-content">
        {/* SALES TAB */}
        {activeTab === "sales" && (
          <section className="history-section fade-in">
            <h3>💰 Sales Invoices</h3>

            <div className="table-wrapper">
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
                  {sales.length > 0 ? (
                    sales.map((s) => (
                      <tr key={s.id}>
                        <td>{s.invoiceNumber}</td>
                        <td>{s.customerName || "N/A"}</td>
                        <td>₹ {s.finalAmount?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${s.paymentStatus}`}>
                            {s.paymentStatus}
                          </span>
                        </td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>{s.items?.length || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-text">
                        No Sales Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PURCHASE TAB */}
        {activeTab === "purchase" && (
          <section className="history-section fade-in">
            <h3>📦 Purchase Orders</h3>

            <div className="table-wrapper">
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
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((po) => (
                      <tr key={po.id}>
                        <td>{po.poNumber}</td>
                        <td>{po.supplierName || "N/A"}</td>
                        <td>₹ {po.finalAmount?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${po.status}`}>
                            {po.status}
                          </span>
                        </td>
                        <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                        <td>{po.items?.length || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-text">
                        No Purchase Orders Found
                      </td>
                    </tr>
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
