import React, { useState } from "react";
import customerApi from "../api/customerApi";
import { toast } from "react-toastify";
import "./AddCustomerModal.css";

export default function AddCustomerModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    customerCode: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    dateOfBirth: "",
    anniversaryDate: ""
  });

  const validateForm = () => {
    if (!form.fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    // India phone validation
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error("Enter a valid Indian 10-digit phone number starting with 6-9");
      return false;
    }

    return true;
  };

  async function saveCustomer() {
    if (!validateForm()) return;

    const res = await customerApi.createCustomer(form);

    if (res.success) {
      toast.success("Customer added successfully");
      onSaved(res.data);
      onClose();
    } else {
      toast.error(res.error || "Failed to add customer");
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>Add New Customer</h3>

        <div className="customer-form-row-data">
          <input
            placeholder="Customer Code"
            value={form.customerCode}
            onChange={(e) => setForm({ ...form, customerCode: e.target.value })}
          />

          <input
            placeholder="Full Name *"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="customer-form-row-data">
          <input
            placeholder="Phone *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            placeholder="GST Number"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
          />

          <input
            placeholder="PAN Number"
            value={form.panNumber}
            onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
          />
        </div>

        <label>DOB</label>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
        />

        <label>Anniversary</label>
        <input
          type="date"
          value={form.anniversaryDate}
          onChange={(e) =>
            setForm({ ...form, anniversaryDate: e.target.value })
          }
        />

        <textarea
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <div className="btn-row">
          <button className="save-btn" onClick={saveCustomer}>
            Save
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
