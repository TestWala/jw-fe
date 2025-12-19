import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import salesApi from "../api/salesApi";
import AddCustomerModal from "./AddCustomerModal";
import "./Sales.css";

export default function Sales() {
  const { categories, inventoryItems, customers, reload } = useContext(AppContext);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchByCategory, setSearchByCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [invoice, setInvoice] = useState({
    invoiceNumber: "INV-" + Date.now(),
    customerId: "",
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    finalAmount: 0,
    paymentMethod: "cash",
    paymentStatus: "paid",
    amountPaid: 0,
    notes: "",
    items: []
  });

  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemForm, setItemForm] = useState({
    quantity: 1,
    grossWeight: "",
    netWeight: "",
    purchaseRate: "",
    purchasePrice: "",
    sellingPrice: "",
    discountPercentage: "",
    discountAmount: ""
  });

  // Filter inventory based on mode
  const filteredInventory = searchByCategory
    ? (selectedCategoryId ? inventoryItems.filter(item => item.categoryId === selectedCategoryId) : [])
    : (searchQuery ? inventoryItems.filter(item =>
      item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : []);

  // Handle item-level discount percentage change
  // Handle item-level discount percentage change
  function handleItemDiscountPercentageChange(value) {
    const pct = Number(value) || 0;
    const price = Number(itemForm.sellingPrice) || 0;
    const qty = Number(itemForm.quantity) || 1;
    const discountAmt = Math.round((price * qty * pct) / 100); // Round off to nearest rupee

    setItemForm({
      ...itemForm,
      discountPercentage: value === "" ? "" : pct,
      discountAmount: value === "" ? "" : discountAmt
    });
  }

  // Handle item-level discount amount change
  function handleItemDiscountAmountChange(value) {
    const amt = Number(value) || 0;
    const price = Number(itemForm.sellingPrice) || 0;
    const qty = Number(itemForm.quantity) || 1;
    const total = price * qty;
    const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0; // One decimal place for percentage

    setItemForm({
      ...itemForm,
      discountPercentage: value === "" ? "" : pct,
      discountAmount: value === "" ? "" : amt
    });
  }


  function addItem() {
    if (!selectedItemId) return alert("Select item first");

    const qty = Number(itemForm.quantity);
    const price = Number(itemForm.sellingPrice);

    if (!qty || qty < 1) return alert("Invalid quantity");

    const discountAmt = Number(itemForm.discountAmount) || 0;
    const totalAmt = price * qty - discountAmt;

    const updatedItems = [
      ...invoice.items,
      {
        inventoryItemId: selectedItemId,
        quantity: qty,
        unitPrice: price,
        discountPercentage: itemForm.discountPercentage,
        discountAmount: discountAmt,
        totalAmount: totalAmt
      }
    ];

    updateTotals(updatedItems, invoice.discountPercentage, invoice.taxPercentage);

    setSelectedCategoryId("");
    setSelectedItemId("");
    setSearchQuery("");
    setItemForm({
      quantity: 1,
      grossWeight: "",
      netWeight: "",
      purchaseRate: "",
      purchasePrice: "",
      sellingPrice: "",
      discountPercentage: "",
      discountAmount: ""
    });
  }

  function deleteItem(index) {
    const updated = [...invoice.items];
    updated.splice(index, 1);
    updateTotals(updated, invoice.discountPercentage, invoice.taxPercentage);
  }

  function updateTotals(items, discountPct = 0, taxPct = 0) {
    const subtotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
    const discountAmount = (subtotal * discountPct) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxPct) / 100;
    const finalAmount = taxableAmount + taxAmount;

    setInvoice((prev) => ({
      ...prev,
      items,
      subtotal,
      discountPercentage: discountPct,
      discountAmount,
      taxPercentage: taxPct,
      taxAmount,
      finalAmount
    }));
  }

  function handleDiscountChange(value) {
    const discountPct = Number(value) || 0;
    updateTotals(invoice.items, discountPct, invoice.taxPercentage);
  }

  function handleTaxChange(value) {
    const taxPct = Number(value) || 0;
    updateTotals(invoice.items, invoice.discountPercentage, taxPct);
  }

  function resetForm() {
    setInvoice({
      invoiceNumber: "INV-" + Date.now(),
      customerId: "",
      subtotal: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 0,
      taxAmount: 0,
      finalAmount: 0,
      paymentMethod: "cash",
      paymentStatus: "paid",
      amountPaid: 0,
      notes: "",
      items: []
    });

    setSelectedCategoryId("");
    setSelectedItemId("");
    setSearchQuery("");
    setItemForm({
      quantity: 1,
      grossWeight: "",
      netWeight: "",
      purchaseRate: "",
      purchasePrice: "",
      sellingPrice: "",
      discountPercentage: 0,
      discountAmount: 0
    });
  }

  async function submitInvoice() {
    const payload = {
      ...invoice,
      customerId: invoice.customerId || null
    };

    const res = await salesApi.createInvoice(payload);

    if (res.success) {
      alert("Invoice created!");
      resetForm();
      reload();
      setShowSummary(false);
    } else {
      alert("Failed: " + res.error);
    }
  }

  function handleCustomerSaved(customer) {
    setInvoice((prev) => ({ ...prev, customerId: customer.id }));
    reload();
  }

  function handleItemSelect(id) {
    setSelectedItemId(id);
    const item = inventoryItems.find(i => i.id === id);

    if (item) {
      setItemForm({
        quantity: 1,
        grossWeight: item.grossWeight || "",
        netWeight: item.netWeight || "",
        purchaseRate: item.purchaseRate || "",
        purchasePrice: item.purchasePrice || "",
        sellingPrice: item.sellingPrice || "",
        discountPercentage: "",
        discountAmount: ""
      });
    }
  }

  const isSubmitDisabled = invoice.items.length === 0;

  return (
    <div className="sales-page">
      <h2>Create Sales Invoice</h2>

      {/* CUSTOMER */}
      <div className="customer-select">
        <label>Customer</label>
        <select
          value={invoice.customerId}
          onChange={(e) => setInvoice({ ...invoice, customerId: e.target.value })}
        >
          <option value="">Guest</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} ({c.phone})
            </option>
          ))}
        </select>

        <button className="add-customer-btn" onClick={() => setShowCustomerModal(true)}>
          + Add Customer
        </button>
      </div>

      {showCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSaved={handleCustomerSaved}
        />
      )}

      {/* ADD ITEM */}
      <div className="add-item-column">

        {/* ================= ROW 1: TOGGLE + SEARCH OR CATEGORY ================= */}
        <div className="add-item-row row-1">
          {/* TOGGLE + LABEL */}
          <div className="toggle-block">
            <span className="toggle-label">
              {searchByCategory
                ? "Select item by Category"
                : "Search item by code"}
            </span>

            <label className="ios-switch">
              <input
                type="checkbox"
                checked={searchByCategory}
                onChange={(e) => {
                  setSearchByCategory(e.target.checked);
                  setSearchQuery("");
                  setSelectedCategoryId("");
                  setSelectedItemId("");
                }}
              />
              <span className="ios-slider"></span>
            </label>

          </div>

          {/* INPUT AREA */}
          {!searchByCategory ? (
            <>
              <input
                type="text"
                list="inventory-list"
                placeholder="Enter item code"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);

                  // auto-select item if exact match
                  const matchedItem = inventoryItems.find(
                    item =>
                      `${item.itemCode}`.toLowerCase() === value.toLowerCase()
                  );

                  if (matchedItem) {
                    handleItemSelect(matchedItem.id);
                  } else {
                    setSelectedItemId("");
                  }
                }}
                className="search-input"
              />

              <datalist id="inventory-list">
                {inventoryItems.map(item => (
                  <option
                    key={item.id}
                    value={`${item.itemCode} - ${item.notes || "No description"}`}
                  />
                ))}
              </datalist>

            </>
          ) : (
            <>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedItemId("");
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedItemId}
                onChange={(e) => handleItemSelect(e.target.value)}
                disabled={!selectedCategoryId}
              >
                <option value="">Select Item</option>
                {filteredInventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemCode}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* ================= ROW 2: ITEM DETAILS ================= */}
        <div className="sales-row">
          <div className="sales-field">
            <label>Gross Weight (g)</label>
            <input value={itemForm.grossWeight} readOnly placeholder="Gross Wt" />
          </div>

          <div className="sales-field">
            <label>Net Weight (g)</label>
            <input value={itemForm.netWeight} readOnly placeholder="Net Wt" />
          </div>

          <div className="sales-field">
            <label>Purchase Rate (₹/g)</label>
            <input value={itemForm.purchaseRate} readOnly placeholder="Rate" />
          </div>

          <div className="sales-field">
            <label>Purchase Price (₹)</label>
            <input value={itemForm.purchasePrice} readOnly placeholder="Cost" />
          </div>
        </div>

        {/* ================= ROW 3: SELLING PRICE, DISCOUNT & ADD BUTTON ================= */}
        <div className="sales-row">
          <div className="sales-field">
            <label>Selling Price (₹)</label>
            <input
              type="number"
              value={itemForm.sellingPrice}
              placeholder="Selling Price"
              onChange={(e) => {
                const price = e.target.value;
                const qty = Number(itemForm.quantity) || 1;
                const pct = Number(itemForm.discountPercentage) || 0;
                const discountAmt = Math.round((price * qty * pct) / 100); // Round off

                setItemForm({
                  ...itemForm,
                  sellingPrice: price,
                  discountAmount: pct ? discountAmt : ""
                });
              }}
            />
          </div>

          <div className="sales-field discount-field">
            <label>Discount</label>

            <div className="discount-combined-box">
              <div className="discount-part">
                <span className="discount-symbol">%</span>
                <input
                  type="number"
                  value={itemForm.discountPercentage || ""}
                  onChange={(e) => handleItemDiscountPercentageChange(e.target.value)}
                  placeholder="0"
                />
              </div>

              <span className="discount-slash">/</span>

              <div className="discount-part">
                <span className="discount-symbol">₹</span>
                <input
                  type="number"
                  value={itemForm.discountAmount || ""}
                  onChange={(e) => handleItemDiscountAmountChange(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="sales-field btn-field">
            <button
              className="add-item-btn"
              disabled={!selectedItemId}
              onClick={addItem}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="items-table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Gross Weight (g)</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((it, i) => {
              const prod = inventoryItems.find((p) => p.id === it.inventoryItemId);
              return (
                <tr key={i}>
                  <td>{prod?.itemCode}</td>
                  <td>{prod?.grossWeight || "-"}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.unitPrice?.toFixed(2)}</td>
                  <td>₹{it.discountAmount?.toFixed(2)}</td>
                  <td>₹{it.totalAmount?.toFixed(2)}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteItem(i)}>
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* INVOICE TOTALS */}
      {invoice.items.length > 0 && (
        <div className="invoice-totals-box">
          <div className="totals-row">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-value">₹{invoice.subtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Invoice Discount (%):
              <input
                type="number"
                placeholder="0"
                value={invoice.discountPercentage}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value discount">
              - ₹{invoice.discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Tax (%):
              <input
                type="number"
                placeholder="0"
                value={invoice.taxPercentage}
                onChange={(e) => handleTaxChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value tax">
              + ₹{invoice.taxAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row final">
            <span className="totals-label">Final Amount:</span>
            <span className="totals-value">₹{invoice.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* SAVE BUTTON */}
      <button
        className={`add-sale-submit-btn ${isSubmitDisabled ? "btn-disabled" : ""}`}
        disabled={isSubmitDisabled}
        onClick={() => {
          if (!isSubmitDisabled) {
            setShowSummary(true);
          }
        }}
      >
        Save Invoice
      </button>

      {/* SUMMARY POPUP */}
      {showSummary && (
        <div className="summary-popup-backdrop">
          <div className="summary-popup">
            <h3>Invoice Summary</h3>

            <div className="summary-row">
              <span>Invoice Number:</span>
              <strong>{invoice.invoiceNumber}</strong>
            </div>

            <div className="summary-row">
              <span>Customer:</span>
              <strong>
                {invoice.customerId
                  ? customers.find((c) => c.id === invoice.customerId)?.fullName || "Guest"
                  : "Guest"}
              </strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Total Items:</span>
              <strong>{invoice.items.length}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>₹{invoice.subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <strong className="discount">- ₹{invoice.discountAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <strong className="tax">+ ₹{invoice.taxAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Final Amount:</span>
              <strong>₹{invoice.finalAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-btn-row">
              <button className="confirm-btn" onClick={submitInvoice}>
                ✔ Confirm Invoice
              </button>

              <button className="cancel-btn" onClick={() => setShowSummary(false)}>
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}