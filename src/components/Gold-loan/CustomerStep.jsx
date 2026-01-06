import { useState, useEffect } from "react";
import "./StepStyles.css";

export default function CustomerStep({ formData, onUpdate }) {
  const [data, setData] = useState({
    customerName: formData.customerName || "",
    customerId: formData.customerId || "",
    phoneNumber: formData.phoneNumber || "",
    address: formData.address || ""
  });

  useEffect(() => {
    onUpdate(data);
  }, [data]);

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="step-form">
      <h3 className="step-title">Customer Information</h3>
      <p className="step-description">
        Enter the customer's details for the gold loan application
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="customerName">
            Customer Name <span className="required">*</span>
          </label>
          <input
            id="customerName"
            type="text"
            placeholder="Enter full name"
            value={data.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerId">Customer ID (Optional)</label>
          <input
            id="customerId"
            type="text"
            placeholder="e.g., CUST-001"
            value={data.customerId}
            onChange={(e) => handleChange("customerId", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">
            Phone Number <span className="required">*</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="Enter 10-digit number"
            value={data.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            maxLength={10}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="address"
            placeholder="Enter complete address"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={3}
            required
          />
        </div>
      </div>

      <div className="info-box">
        <span className="info-icon">ℹ️</span>
        <p>
          Please verify all customer details before proceeding. These details
          will be used in the loan agreement.
        </p>
      </div>
    </div>
  );
}