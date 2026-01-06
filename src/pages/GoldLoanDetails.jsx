import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import goldLoanApi from "../api/goldLoanApi";
import { toast } from "react-toastify";
import "./GoldLoanDetails.css";

export default function GoldLoanDetails({ loanId, onNavigate }) {
  const { goldLoans, reload } = useContext(AppContext);
  const [loan, setLoan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    type: "Interest",
    mode: "Cash",
    date: new Date().toISOString().split("T")[0]
  });
  useEffect(() => {
    if (!loanId) return;

    const foundLoan = goldLoans.find(l => l.id === loanId);

    if (foundLoan) {
      setLoan(foundLoan);
      setLoading(false);
    } else {
      fetchLoanDetails();
    }
  }, [loanId, goldLoans]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const response = await goldLoanApi.getLoanById(loanId);

      if (response?.success) {
        setLoan(response.data);
      } else {
        toast.error("Loan not found");
        onNavigate("gold-loan");
      }
    } catch (error) {
      console.error("Error fetching loan:", error);
      toast.error("Error loading loan details");
      onNavigate("gold-loan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      const payment = {
        amount: parseFloat(paymentData.amount),
        type: paymentData.type,
        mode: paymentData.mode,
        date: paymentData.date
      };

      const response = await goldLoanApi.addPayment(loanId, payment);

      if (response?.success) {
        toast.success("Payment added successfully!");
        setShowPaymentModal(false);
        setPaymentData({
          amount: "",
          type: "Interest",
          mode: "Cash",
          date: new Date().toISOString().split("T")[0]
        });
        // Reload to get updated data
        await reload();
      } else {
        toast.error(response?.message || "Failed to add payment");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Error adding payment");
    }
  };

  const handleCloseLoan = async () => {
    if (!window.confirm("Are you sure you want to close this loan?")) {
      return;
    }

    try {
      const response = await goldLoanApi.closeLoan(loanId);
      if (response?.success) {
        toast.success("Loan closed successfully!");
        await reload();
        onNavigate("gold-loan");
      } else {
        toast.error(response?.message || "Failed to close loan");
      }
    } catch (error) {
      console.error("Error closing loan:", error);
      toast.error("Error closing loan");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading loan details...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loan not found</p>
        <button onClick={() => onNavigate("gold-loan")}>
          Back to Loan List
        </button>
      </div>
    );
  }

  const totalNetWeight = loan.goldItems?.reduce(
    (sum, item) => sum + (parseFloat(item.netWeight) || 0),
    0
  ) || 0;

  const totalPaid = loan.payments?.reduce(
    (sum, payment) => sum + (parseFloat(payment.amount) || 0),
    0
  ) || 0;

  const monthlyInterest = (loan.loanAmount * loan.interestRate) / 100;

  return (
    <div className="GoldLoanDetails">
      {/* Header */}
      <div className="details-header">
        <div>
          <button
            className="back-btn"
            onClick={() => onNavigate("gold-loan")}
          >
            ← Back
          </button>
          <h2 className="details-title">Loan Details</h2>
          <p className="loan-id">{loan.id}</p>
        </div>
        <div className="header-actions">
          <span
            className={`status-badge status-badge--${loan.status.toLowerCase()}`}
          >
            {loan.status}
          </span>
          {loan.status === "ACTIVE" && (
            <>
              <button
                className="btn-payment"
                onClick={() => setShowPaymentModal(true)}
              >
                + Add Payment
              </button>
              <button className="btn-close-loan" onClick={handleCloseLoan}>
                Close Loan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">Loan Amount</p>
          <h3 className="summary-value">
            ₹{loan.loanAmount.toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="summary-card">
          <p className="summary-label">Interest Rate</p>
          <h3 className="summary-value">{loan.interestRate}% / Month</h3>
        </div>
        <div className="summary-card">
          <p className="summary-label">Monthly Interest</p>
          <h3 className="summary-value">
            ₹{monthlyInterest.toLocaleString("en-IN")}
          </h3>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Paid</p>
          <h3 className="summary-value">
            ₹{totalPaid.toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* Customer & Loan Info */}
      <div className="info-section">
        <div className="info-card">
          <h4>Customer Information</h4>
          <div className="info-grid">
            <div>
              <span className="info-label">Name:</span>
              <span className="info-value">{loan.customerName}</span>
            </div>
            <div>
              <span className="info-label">Phone:</span>
              <span className="info-value">{loan.phoneNumber}</span>
            </div>
            <div>
              <span className="info-label">Address:</span>
              <span className="info-value">{loan.address}</span>
            </div>
            {loan.customerId && (
              <div>
                <span className="info-label">Customer ID:</span>
                <span className="info-value">{loan.customerId}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-card">
          <h4>Loan Information</h4>
          <div className="info-grid">
            <div>
              <span className="info-label">Tenure:</span>
              <span className="info-value">{loan.tenure} months</span>
            </div>
            <div>
              <span className="info-label">Due Date:</span>
              <span className="info-value">
                {new Date(loan.dueDate).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div>
              <span className="info-label">Gold Rate:</span>
              <span className="info-value">
                ₹{loan.goldRate?.toLocaleString("en-IN")}/g
              </span>
            </div>
            <div>
              <span className="info-label">LTV Ratio:</span>
              <span className="info-value">{loan.loanToValue}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Items */}
      <div className="section">
        <h4>Pledged Gold Items ({loan.goldItems?.length || 0})</h4>
        <div className="table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Purity</th>
                <th>Gross Weight</th>
                <th>Net Weight</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {loan.goldItems?.map((item, i) => (
                <tr key={i}>
                  <td>{item.item}</td>
                  <td>{item.purity}</td>
                  <td>{item.grossWeight} g</td>
                  <td>{item.netWeight} g</td>
                  <td>₹{item.value?.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">
                  <strong>Total Net Weight:</strong>
                </td>
                <td>
                  <strong>{totalNetWeight.toFixed(2)} g</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="section">
        <h4>Payment History ({loan.payments?.length || 0})</h4>
        <div className="table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {loan.payments?.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No payments recorded
                  </td>
                </tr>
              ) : (
                loan.payments?.map((payment, i) => (
                  <tr key={i}>
                    <td>
                      {new Date(payment.date).toLocaleDateString("en-IN")}
                    </td>
                    <td>{payment.type}</td>
                    <td>₹{payment.amount?.toLocaleString("en-IN")}</td>
                    <td>{payment.mode}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Payment</h3>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>

            <div className="form-group">
              <label>Payment Type</label>
              <select
                value={paymentData.type}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, type: e.target.value })
                }
              >
                <option value="Interest">Interest</option>
                <option value="Principal">Principal</option>
                <option value="Principal + Interest">
                  Principal + Interest
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <select
                value={paymentData.mode}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, mode: e.target.value })
                }
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={paymentData.date}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, date: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddPayment}>
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}