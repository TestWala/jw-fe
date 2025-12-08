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
    <div className="add-supplier-modal-bg">
      <div className="add-supplier-modal-box">
        <h3>Add New Supplier</h3>

        <form onSubmit={saveSupplier} className="add-supplier-modal-form">
          <div className="add-supplier-form-row">
            <div className="add-supplier-form-group">
              <label>Supplier Code *</label>
              <input
                value={form.supplierCode}
                onChange={(e) => setForm({ ...form, supplierCode: e.target.value })}
                required
                placeholder="e.g. SUP001"
              />
            </div>

            <div className="add-supplier-form-group">
              <label>Supplier Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className="add-supplier-form-row">
            <div className="add-supplier-form-group">
               <input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="Contact person name"
              />
            </div>

            <div className="add-supplier-form-group">
               <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="add-supplier-form-row">
            <div className="add-supplier-form-group">
               <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div className="add-supplier-form-group">
               <input
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                placeholder="e.g. Net 30"
              />
            </div>
          </div>

          <div className="add-supplier-form-row">
            <div className="add-supplier-form-group">
               <input
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                placeholder="GST Number"
              />
            </div>

            <div className="add-supplier-form-group">
               <input
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                placeholder="PAN Number"
              />
            </div>
          </div>

          <div className="add-supplier-form-row">
            <div className="add-supplier-form-group add-supplier-form-group-full">
               <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter complete address"
              ></textarea>
            </div>
          </div>

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