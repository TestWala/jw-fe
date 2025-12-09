import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import purchaseApi from "../api/purchaseApi";
import AddSupplierModal from "./AddSupplierModal";
import "./Purchase.css";

export default function PurchaseOrder() {
  const { inventoryItems, suppliers, userid, reload } = useContext(AppContext);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [purchaseOrder, setPurchaseOrder] = useState({
    poNumber: "PO-" + Date.now(),
    supplierId: "",
    expectedDeliveryDate: "",
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    shippingCharges: 0,
    finalAmount: 0,
    paymentTerms: "",
    deliveryTerms: "",
    notes: "",
    items: []
  });

  const [selectedInvItemId, setSelectedInvItemId] = useState("");
  const [itemForm, setItemForm] = useState({
    itemCode: "",
    itemName: "",
    metalType: "",
    purity: "",
    expectedWeight: "",
    quantity: 1,
    unitPrice: "",
    makingCharges: 0,
  });

  function handleItemSelect(id) {
    setSelectedInvItemId(id);

    const item = inventoryItems.find(i => i.id === id);

    if (item) {
      setItemForm({
        ...itemForm,
        itemCode: item.itemCode,
        itemName: item.shortName,
        metalType: item.metalType,
        purity: item.purityId,
        expectedWeight: item.netWeight,
        unitPrice: item.purchasePrice || 0,
      });
    }
  }

  /** Add purchase item into PO */
  function addItem() {
    if (!selectedInvItemId) return alert("Select an item");

    const qty = Number(itemForm.quantity);
    const price = Number(itemForm.unitPrice);
    const making = Number(itemForm.makingCharges);

    const totalAmt = qty * price + making;

    const poItem = {
      inventoryItemId: selectedInvItemId,
      itemCode: itemForm.itemCode,
      itemName: itemForm.itemName,
      metalType: itemForm.metalType,
      purity: itemForm.purity,
      expectedWeight: Number(itemForm.expectedWeight),
      actualWeight: Number(itemForm.expectedWeight),
      quantity: qty,
      unitPrice: price,
      makingCharges: making,
      totalAmount: totalAmt
    };

    const updatedItems = [...purchaseOrder.items, poItem];

    updateTotals(
      updatedItems,
      purchaseOrder.discountAmount,
      purchaseOrder.taxAmount,
      purchaseOrder.shippingCharges
    );

    setSelectedInvItemId("");
    setItemForm({
      itemCode: "",
      itemName: "",
      metalType: "",
      purity: "",
      expectedWeight: "",
      quantity: 1,
      unitPrice: "",
      makingCharges: 0,
    });
  }

  /** Delete item */
  function deleteItem(index) {
    const updatedItems = [...purchaseOrder.items];
    updatedItems.splice(index, 1);
    updateTotals(
      updatedItems,
      purchaseOrder.discountAmount,
      purchaseOrder.taxAmount,
      purchaseOrder.shippingCharges
    );
  }

  /** Auto-calc totals */
  function updateTotals(items, discount = 0, tax = 0, shipping = 0) {
    const subtotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
    const finalAmount = subtotal - Number(discount) + Number(tax) + Number(shipping);

    setPurchaseOrder(prev => ({
      ...prev,
      items,
      subtotal,
      discountAmount: Number(discount),
      taxAmount: Number(tax),
      shippingCharges: Number(shipping),
      finalAmount,
    }));
  }

  /** Handle discount change */
  function handleDiscountChange(value) {
    const discount = Number(value) || 0;
    updateTotals(
      purchaseOrder.items,
      discount,
      purchaseOrder.taxAmount,
      purchaseOrder.shippingCharges
    );
  }

  /** Handle tax change */
  function handleTaxChange(value) {
    const tax = Number(value) || 0;
    updateTotals(
      purchaseOrder.items,
      purchaseOrder.discountAmount,
      tax,
      purchaseOrder.shippingCharges
    );
  }

  /** Handle shipping change */
  function handleShippingChange(value) {
    const shipping = Number(value) || 0;
    updateTotals(
      purchaseOrder.items,
      purchaseOrder.discountAmount,
      purchaseOrder.taxAmount,
      shipping
    );
  }

  function resetForm() {
    setPurchaseOrder({
      poNumber: "PO-" + Date.now(),
      supplierId: "",
      expectedDeliveryDate: "",
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      shippingCharges: 0,
      finalAmount: 0,
      paymentTerms: "",
      deliveryTerms: "",
      notes: "",
      items: []
    });

    setSelectedInvItemId("");

    setItemForm({
      itemCode: "",
      itemName: "",
      metalType: "",
      purity: "",
      expectedWeight: "",
      quantity: 1,
      unitPrice: "",
      makingCharges: 0
    });
  }

  /** Submit purchase order (after confirmation) */
  async function submitOrder() {
    console.log("Submitting PO:", purchaseOrder);
    const res = await purchaseApi.createPurchaseOrder(userid, purchaseOrder);

    if (res.success) {
      alert("Purchase Order Created");
      resetForm();
      reload();
      setShowSummary(false);
    } else {
      alert("Failed: " + res.error);
    }
  }

  /** Supplier saved from modal */
  function handleSupplierSaved(supplier) {
    setPurchaseOrder(prev => ({ ...prev, supplierId: supplier.id }));
    reload();
  }

  const isSubmitDisabled = purchaseOrder.items.length === 0;

  return (
    <div className="purchase-page">
      <h2>Create Purchase Order</h2>

      {/* Supplier */}
      <div className="supplier-select">
        <label>Supplier</label>
        <select
          value={purchaseOrder.supplierId}
          onChange={(e) =>
            setPurchaseOrder({ ...purchaseOrder, supplierId: e.target.value })
          }
        >
          <option value="">Select Supplier</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.phone})
            </option>
          ))}
        </select>

        <button
          className="add-supplier-btn"
          onClick={() => setShowSupplierModal(true)}
        >
          + Add Supplier
        </button>
      </div>

      {showSupplierModal && (
        <AddSupplierModal
          onClose={() => setShowSupplierModal(false)}
          onSaved={handleSupplierSaved}
        />
      )}

      {/* Expected Delivery Date & Payment Terms */}
      <div className="order-details-row">
        <div className="field">
          <label>Expected Delivery Date</label>
          <input
            type="date"
            value={purchaseOrder.expectedDeliveryDate}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, expectedDeliveryDate: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Payment Terms</label>
          <input
            type="text"
            placeholder="e.g., Net 30"
            value={purchaseOrder.paymentTerms}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, paymentTerms: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Delivery Terms</label>
          <input
            type="text"
            placeholder="e.g., FOB"
            value={purchaseOrder.deliveryTerms}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, deliveryTerms: e.target.value })
            }
          />
        </div>
      </div>

      {/* ADD ITEM SECTION */}
      <div className="add-item-box">
        <div className="field">
          <label>Select Inventory Item</label>
          <select
            value={selectedInvItemId}
            onChange={(e) => handleItemSelect(e.target.value)}
          >
            <option value="">Select</option>
            {inventoryItems.map(i => (
              <option key={i.id} value={i.id}>
                {i.itemCode} – {i.shortName}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            value={itemForm.quantity}
            onChange={(e) =>
              setItemForm({ ...itemForm, quantity: e.target.value })
            }
          />
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
          <label>Expected Weight</label>
          <input
            type="number"
            value={itemForm.expectedWeight}
            onChange={(e) =>
              setItemForm({ ...itemForm, expectedWeight: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Making Charges (₹)</label>
          <input
            type="number"
            value={itemForm.makingCharges}
            onChange={(e) =>
              setItemForm({ ...itemForm, makingCharges: e.target.value })
            }
          />
        </div>

        <div className="field add-btn-wrapper">
          <button
            disabled={!selectedInvItemId}
            className={!selectedInvItemId ? "btn-disabled" : ""}
            onClick={selectedInvItemId ? addItem : undefined}
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
              <th>Weight</th>
              <th>Unit Price</th>
              <th>Making</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {purchaseOrder.items.map((it, i) => (
              <tr key={i}>
                <td>{it.itemName}</td>
                <td>{it.quantity}</td>
                <td>{it.expectedWeight}</td>
                <td>₹{it.unitPrice}</td>
                <td>₹{it.makingCharges}</td>
                <td>₹{it.totalAmount.toFixed(2)}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteItem(i)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PO LEVEL CHARGES & TOTALS */}
      {purchaseOrder.items.length > 0 && (
        <div className="po-totals-box">
          <div className="totals-row">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-value">₹{purchaseOrder.subtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Discount (₹):
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrder.discountAmount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value discount">
              - ₹{purchaseOrder.discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Tax (₹):
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrder.taxAmount}
                onChange={(e) => handleTaxChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value tax">
              + ₹{purchaseOrder.taxAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Shipping (₹):
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrder.shippingCharges}
                onChange={(e) => handleShippingChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value shipping">
              + ₹{purchaseOrder.shippingCharges.toFixed(2)}
            </span>
          </div>

          <div className="totals-row final">
            <span className="totals-label">Final Amount:</span>
            <span className="totals-value">₹{purchaseOrder.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {purchaseOrder.items.length > 0 && (
        <div className="notes-section">
          <label>Notes</label>
          <textarea
            rows="3"
            placeholder="Additional notes or instructions..."
            value={purchaseOrder.notes}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, notes: e.target.value })
            }
          />
        </div>
      )}

      <button
        className={`save-purchase-submit-btn ${isSubmitDisabled ? "btn-disabled" : ""}`}
        onClick={() => {
          if (!isSubmitDisabled) {
            setShowSummary(true);
          }
        }}
        disabled={isSubmitDisabled}
      >
        Create Purchase Order
      </button>

      {/* SUMMARY POPUP */}
      {showSummary && (
        <div className="summary-popup-backdrop">
          <div className="summary-popup">
            <h3>Purchase Order Summary</h3>

            <div className="summary-row">
              <span>PO Number:</span>
              <strong>{purchaseOrder.poNumber}</strong>
            </div>

            <div className="summary-row">
              <span>Supplier:</span>
              <strong>
                {purchaseOrder.supplierId
                  ? suppliers.find((s) => s.id === purchaseOrder.supplierId)?.name || "Unknown"
                  : "Not Selected"}
              </strong>
            </div>

            {purchaseOrder.expectedDeliveryDate && (
              <div className="summary-row">
                <span>Expected Delivery:</span>
                <strong>{purchaseOrder.expectedDeliveryDate}</strong>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Total Items:</span>
              <strong>{purchaseOrder.items.length}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>₹{purchaseOrder.subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Discount:</span>
              <strong className="discount">- ₹{purchaseOrder.discountAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Tax:</span>
              <strong className="tax">+ ₹{purchaseOrder.taxAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <strong className="shipping">+ ₹{purchaseOrder.shippingCharges.toFixed(2)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Final Amount:</span>
              <strong>₹{purchaseOrder.finalAmount.toFixed(2)}</strong>
            </div>

            {purchaseOrder.paymentTerms && (
              <div className="summary-row">
                <span>Payment Terms:</span>
                <strong>{purchaseOrder.paymentTerms}</strong>
              </div>
            )}

            <div className="summary-btn-row">
              <button className="confirm-btn" onClick={submitOrder}>
                ✔ Confirm Order
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