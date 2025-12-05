import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import supplierApi from "../api/supplierApi";
import purchaseApi from "../api/purchaseApi";
import AddSupplierModal from "./AddSupplierModal";
import "./Purchase.css";

export default function PurchaseOrder() {
  const { inventoryItems, suppliers, userid, reload } = useContext(AppContext);

  const [showSupplierModal, setShowSupplierModal] = useState(false);

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
      quantity: qty,
      unitPrice: price,
      makingCharges: making,
      totalAmount: totalAmt
    };

    const updatedItems = [...purchaseOrder.items, poItem];

    updateTotals(updatedItems);

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
    updateTotals(updatedItems);
  }

  /** Auto-calc totals */
  function updateTotals(items) {
    const subtotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
    const finalAmount =
      subtotal +
      Number(purchaseOrder.taxAmount || 0) +
      Number(purchaseOrder.shippingCharges || 0) -
      Number(purchaseOrder.discountAmount || 0);

    setPurchaseOrder(prev => ({
      ...prev,
      items,
      subtotal,
      finalAmount,
    }));
  }

  /** Submit purchase order */
  async function submitOrder() {
  
    if (purchaseOrder.items.length === 0)
      return alert("Add at least one item");

    console.log("Submitting PO:", purchaseOrder);
    const res = await purchaseApi.createPurchaseOrder(userid, purchaseOrder);

    if (res.success) {
      alert("Purchase Order Created");
      reload();
    } else {
      alert("Failed: " + res.error);
    }
  }

  /** Supplier saved from modal */
  function handleSupplierSaved(supplier) {
    setPurchaseOrder(prev => ({ ...prev, supplierId: supplier.id }));
    reload();
  }

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
          <label>Unit Price</label>
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
          <label>Making Charges</label>
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
      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Weight</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th> </th>
          </tr>
        </thead>

        <tbody>
          {purchaseOrder.items.map((it, i) => (
            <tr key={i}>
              <td>{it.itemName}</td>
              <td>{it.quantity}</td>
              <td>{it.expectedWeight}</td>
              <td>{it.unitPrice}</td>
              <td>{it.totalAmount}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteItem(i)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="totals-box">
        <p>Subtotal: ₹{purchaseOrder.subtotal}</p>
        <p>Discount: ₹{purchaseOrder.discountAmount}</p>
        <p>Tax: ₹{purchaseOrder.taxAmount}</p>
        <p>Shipping: ₹{purchaseOrder.shippingCharges}</p>
        <h3>Final Amount: ₹{purchaseOrder.finalAmount}</h3>
      </div>

      <button className="submit-btn" onClick={submitOrder}>
        Save Purchase Order
      </button>
    </div>
  );
}
