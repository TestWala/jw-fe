import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import salesApi from "../api/salesApi";
import AddCustomerModal from "./AddCustomerModal";
import "./Sales.css";

export default function Sales() {
  const { inventoryItems, customers, userid, reload } = useContext(AppContext);

  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [showSummary, setShowSummary] = useState(false);

  const [quantityError, setQuantityError] = useState("");

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
    unitPrice: "",
    discountPercentage: 0,
    availableQty: null
  });

  /** AUTO-SET UNIT PRICE */
  function handleItemSelect(itemId) {
    setSelectedItemId(itemId);

    const product = inventoryItems.find((p) => p.id === itemId);

    if (product) {
      setItemForm({
        ...itemForm,
        unitPrice: product.sellingPrice || 0
      });
    }
  }

  /** ADD ITEM */
  function addItem() {
    if (!selectedItemId) return alert("Select item first");

    const qty = Number(itemForm.quantity);
    const price = Number(itemForm.unitPrice);

    if (!qty || qty < 1) return alert("Invalid quantity");

    const discountAmt = (price * qty * itemForm.discountPercentage) / 100;
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

    setSelectedItemId("");
    setItemForm({ quantity: 1, unitPrice: "", discountPercentage: 0 });
  }

  /** DELETE ITEM */
  function deleteItem(index) {
    const updated = [...invoice.items];
    updated.splice(index, 1);
    updateTotals(updated, invoice.discountPercentage, invoice.taxPercentage);
  }

  /** RECALCULATE TOTALS */
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

  /** Handle invoice discount change */
  function handleDiscountChange(value) {
    const discountPct = Number(value) || 0;
    updateTotals(invoice.items, discountPct, invoice.taxPercentage);
  }

  /** Handle invoice tax change */
  function handleTaxChange(value) {
    const taxPct = Number(value) || 0;
    updateTotals(invoice.items, invoice.discountPercentage, taxPct);
  }

  /** RESET FORM AFTER SUBMIT */
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

    setSelectedItemId("");
    setItemForm({
      quantity: 1,
      unitPrice: "",
      discountPercentage: 0,
      availableQty: null
    });
    setQuantityError("");
  }

  async function submitInvoice() {
    const payload = {
      ...invoice,
      customerId: invoice.customerId || null
    };

    const res = await salesApi.createInvoice(payload, userid);

    if (res.success) {
      alert("Invoice created!");
      resetForm();
      reload();
      setShowSummary(false);
    } else {
      alert("Failed: " + res.error);
    }
  }

  /** When new customer added */
  function handleCustomerSaved(customer) {
    setInvoice((prev) => ({ ...prev, customerId: customer.id }));
    reload();
  }

  const isSubmitDisabled = invoice.items.length === 0;

  function handleItemSelect(id) {
    setSelectedItemId(id);
    setQuantityError(""); // Add this line

    const item = inventoryItems.find(i => i.id === id);

    if (item) {
      setItemForm({
        quantity: 1,
        unitPrice: item.sellingPrice || 0,
        discountPercentage: 0,
        availableQty: item.currentQuantity
      });
    }
  }
  function handleQuantityChange(value) {
    const val = Number(value);

    if (value === "" || val === 0) {
      setItemForm({ ...itemForm, quantity: value });
      setQuantityError("");
      return;
    }

    if (itemForm.availableQty !== null && val > itemForm.availableQty) {
      setQuantityError(`Cannot exceed available quantity of ${itemForm.availableQty}`);
    } else {
      setQuantityError("");
    }

    setItemForm({ ...itemForm, quantity: val });
  }

function addItem() {
  if (!selectedItemId) return alert("Select item first");

  const qty = Number(itemForm.quantity);
  const price = Number(itemForm.unitPrice);

  if (!qty || qty < 1) return alert("Invalid quantity");

  // Check if quantity exceeds available
  if (itemForm.availableQty !== null && qty > itemForm.availableQty) {
    setQuantityError(`Quantity cannot exceed available stock (${itemForm.availableQty})`);
    return;
  }

  const discountAmt = (price * qty * itemForm.discountPercentage) / 100;
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

  setSelectedItemId("");
  setItemForm({ quantity: 1, unitPrice: "", discountPercentage: 0, availableQty: null });
  setQuantityError(""); // Clear error after successful add
}

  return (
    <div className="sales-page">
      <h2>Create Sales Invoice</h2>

      {/* CUSTOMER */}
      <div className="customer-select">
        <label>Customer</label>
        <select
          value={invoice.customerId}
          onChange={(e) =>
            setInvoice({ ...invoice, customerId: e.target.value })
          }
        >
          <option value="">Guest</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} ({c.phone})
            </option>
          ))}
        </select>

        <button
          className="add-customer-btn"
          onClick={() => setShowCustomerModal(true)}
        >
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
      <div className="add-item-box">
        <div className="field">
          <label>Select Item</label>
          <select
            value={selectedItemId}
            onChange={(e) => handleItemSelect(e.target.value)}
          >
            <option value="">Select Item</option>
            {inventoryItems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.itemCode} – {p.shortName}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            Quantity (Available: {itemForm.availableQty ?? "-"})
          </label>
          <input
            type="number"
            value={itemForm.quantity}
            min={1}
            onChange={(e) => handleQuantityChange(e.target.value)}
            style={{
              borderColor: quantityError ? "#dc3545" : undefined
            }}
          />

          {quantityError && (
            <div style={{
              color: "#dc3545",
              fontSize: "0.875rem",
              marginTop: "0.25rem"
            }}>
              {quantityError}
            </div>
          )}
        </div>

        <div className="field">
          <label>Unit Price (₹)</label>
          <input
            type="number"
            value={itemForm.unitPrice}
            onChange={(e) =>
              setItemForm({ ...itemForm, unitPrice: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Discount %</label>
          <input
            type="number"
            value={itemForm.discountPercentage}
            onChange={(e) =>
              setItemForm({ ...itemForm, discountPercentage: e.target.value })
            }
          />
        </div>

        <div className="field add-btn-wrapper">
          <button
            disabled={!selectedItemId || !!quantityError}
            className={(!selectedItemId || quantityError) ? "btn-disabled" : ""}
            onClick={(selectedItemId && !quantityError) ? addItem : undefined}
          >
            Add Item
          </button>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="items-table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Disc %</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((it, i) => {
              const prod = inventoryItems.find(
                (p) => p.id === it.inventoryItemId
              );
              return (
                <tr key={i}>
                  <td>{prod?.shortName}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.unitPrice}</td>
                  <td>{it.discountPercentage}%</td>
                  <td>₹{it.totalAmount.toFixed(2)}</td>
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

      {/* INVOICE LEVEL DISCOUNT & TAX */}
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
                min="0"
                max="100"
                step="0.01"
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
                min="0"
                max="100"
                step="0.01"
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
        className={`add-sale-submit-btn ${isSubmitDisabled ? "btn-disabled" : ""
          }`}
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

              <button
                className="cancel-btn"
                onClick={() => setShowSummary(false)}
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}