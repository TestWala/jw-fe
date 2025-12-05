import React, { useState } from "react";
import supplierApi from "../api/supplierApi";
import "./AddSupplierModal.css";

export default function AddSupplierModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    supplierCode: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    paymentTerms: "",
    isActive: true
  });

  const [loading, setLoading] = useState(false);

  async function saveSupplier(e) {
    e.preventDefault();
    setLoading(true);

    const res = await supplierApi.createSupplier(form);

    setLoading(false);

    if (res.success) {
      alert("Supplier added successfully");
      onSaved(res.data);
      onClose();
    } else {
      alert("Failed: " + res.error);
    }
  }

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h3>Add New Supplier</h3>

        <form onSubmit={saveSupplier} className="modal-form">

          <label>Supplier Code</label>
          <input
            value={form.supplierCode}
            onChange={(e) => setForm({ ...form, supplierCode: e.target.value })}
            required
          />

          <label>Supplier Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Contact Person</label>
          <input
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <label>Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          ></textarea>

          <label>GST Number</label>
          <input
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
          />

          <label>PAN Number</label>
          <input
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
          />

          <label>Payment Terms</label>
          <input
            value={form.paymentTerms}
            onChange={(e) =>
              setForm({ ...form, paymentTerms: e.target.value })
            }
          />

          <div className="modal-btn-row">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
