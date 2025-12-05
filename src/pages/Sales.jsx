import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import salesApi from "../api/salesApi";
import AddCustomerModal from "./AddCustomerModal";
import "./Sales.css";

export default function Sales() {
  const { inventoryItems, customers, userid, reload } = useContext(AppContext);

  const [showCustomerModal, setShowCustomerModal] = useState(false);

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
    discountPercentage: 0
  });

  /** Auto-set unit price when selecting item */
  function handleItemSelect(itemId) {
    setSelectedItemId(itemId);

    const product = inventoryItems.find(p => p.id === itemId);

    if (product) {
      // Auto-fill selling price
      setItemForm({
        ...itemForm,
        unitPrice: product.sellingPrice || 0
      });
    }
  }

  /** Add invoice item */
  function addItem() {
    if (!selectedItemId) return alert("Select item first");

    const product = inventoryItems.find(p => p.id === selectedItemId);

    const qty = Number(itemForm.quantity);
    const price = Number(itemForm.unitPrice);

    if (!qty || qty < 1) return alert("Invalid quantity");

    const discountAmt = (price * qty * itemForm.discountPercentage) / 100;
    const totalAmt = price * qty - discountAmt;

    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventoryItemId: selectedItemId,
          quantity: qty,
          unitPrice: price,
          discountPercentage: itemForm.discountPercentage,
          discountAmount: discountAmt,
          totalAmount: totalAmt
        }
      ]
    }));

    // Reset add form
    setSelectedItemId("");
    setItemForm({ quantity: 1, unitPrice: "", discountPercentage: 0 });
  }

  /** DELETE ITEM FROM INVOICE */
  function deleteItem(index) {
    const newList = [...invoice.items];
    newList.splice(index, 1);

    setInvoice(prev => ({ ...prev, items: newList }));
  }

  async function submitInvoice() {

    if (invoice.items.length === 0)
      return alert("Add at least one product");

    const payload = {
      ...invoice,
      customerId: invoice.customerId || null
    };

    console.log("Submitting Invoice:", payload);
    const res = await salesApi.createInvoice(payload, userid);

    if (res.success) {
      alert("Invoice created!");
      reload();
    } else {
      alert("Failed: " + res.error);
    }
  }

  /** When new customer is saved */
  function handleCustomerSaved(customer) {
    setInvoice(prev => ({ ...prev, customerId: customer.id }));
    reload();
  }

  return (
    <div className="sales-page">
      <h2>Create Sales Invoice</h2>

      {/* CUSTOMER DROPDOWN */}
      <div className="customer-select">
        <label>Customer</label>
        <select
          value={invoice.customerId}
          onChange={(e) => setInvoice({ ...invoice, customerId: e.target.value })}
        >
          <option value="">Guest</option>

          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.fullName} ({c.phone})
            </option>
          ))}
        </select>

        <button className="add-customer-btn"
          onClick={() => setShowCustomerModal(true)}>
          + Add Customer
        </button>
      </div>

      {/* MODAL */}
      {showCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSaved={handleCustomerSaved}
        />
      )}

      {/* ADD ITEM BOX */}
      <div className="add-item-box">

        <div className="field">
          <label>Select Item</label>
          <select
            value={selectedItemId}
            onChange={(e) => handleItemSelect(e.target.value)}
          >
            <option value="">Select Item</option>
            {inventoryItems.map(p => (
              <option key={p.id} value={p.id}>
                {p.itemCode} – {p.shortName}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Unit Price (₹)</label>
          <input
            type="number"
            value={itemForm.unitPrice}
            onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
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
            disabled={!selectedItemId}
            onClick={selectedItemId ? addItem : undefined}
            className={!selectedItemId ? "btn-disabled" : ""}
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
            <th>Price</th>
            <th>Total</th>
            <th> </th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((it, i) => {
            const prod = inventoryItems.find(p => p.id === it.inventoryItemId);
            return (
              <tr key={i}>
                <td>{prod?.shortName}</td>
                <td>{it.quantity}</td>
                <td>{it.unitPrice}</td>
                <td>{it.totalAmount}</td>

                <td>
                  <button className="delete-btn" onClick={() => deleteItem(i)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      width="20"
                      viewBox="0 0 24 24"
                      fill="red"
                    >
                      <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 
                                  2 0 0 0 2-2V6h1V4h-5V3H9zm2 5v10h2V8h-2z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="submit-btn" onClick={submitInvoice}>
        Save Invoice
      </button>
    </div>
  );
}
