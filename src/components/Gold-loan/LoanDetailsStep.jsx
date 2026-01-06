import { useState, useEffect } from "react";
import "./StepStyles.css";

export default function LoanDetailsStep({ formData, onUpdate }) {
  const [data, setData] = useState({
    loanAmount: formData.loanAmount || 0,
    interestRate: formData.interestRate || 2,
    tenure: formData.tenure || 12,
    dueDate: formData.dueDate || ""
  });

  useEffect(() => {
    setData(prevData => {
      if (!prevData.tenure) {
        return prevData;
      }

      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + Number(prevData.tenure));

      const dueDateStr = dueDate.toISOString().split("T")[0];

      // Avoid unnecessary state updates
      if (prevData.dueDate === dueDateStr) {
        return prevData;
      }

      return {
        ...prevData,
        dueDate: dueDateStr
      };
    });
  }, [data.tenure]);


  useEffect(() => {
    onUpdate(data);
  }, [data]);

  const monthlyInterest = (data.loanAmount * data.interestRate) / 100;
  const totalInterest = monthlyInterest * data.tenure;
  const totalRepayment = data.loanAmount + totalInterest;

  return (
    <div className="step-form">
      <h3 className="step-title">Loan Details</h3>
      <p className="step-description">Configure the loan terms and conditions</p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="loanAmount">
            Loan Amount <span className="required">*</span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">₹</span>
            <input
              id="loanAmount"
              type="number"
              value={data.loanAmount}
              onChange={(e) =>
                setData({ ...data, loanAmount: parseFloat(e.target.value) })
              }
              max={formData.loanAmount}
            />
          </div>
          <small className="help-text">
            Maximum: ₹{formData.loanAmount.toLocaleString("en-IN")}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="interestRate">
            Interest Rate (Monthly) <span className="required">*</span>
          </label>
          <div className="input-with-suffix">
            <input
              id="interestRate"
              type="number"
              step="0.1"
              value={data.interestRate}
              onChange={(e) =>
                setData({ ...data, interestRate: parseFloat(e.target.value) })
              }
            />
            <span className="suffix">%</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tenure">
            Tenure <span className="required">*</span>
          </label>
          <select
            id="tenure"
            value={data.tenure}
            onChange={(e) =>
              setData({ ...data, tenure: parseInt(e.target.value) })
            }
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
            <option value={18}>18 Months</option>
            <option value={24}>24 Months</option>
            <option value={36}>36 Months</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={data.dueDate}
            onChange={(e) => setData({ ...data, dueDate: e.target.value })}
          />
        </div>
      </div>

      {/* Loan Calculation Summary */}
      <div className="calculation-summary">
        <h4>Loan Calculation</h4>

        <div className="calc-grid">
          <div className="calc-item">
            <span className="calc-label">Principal Amount</span>
            <span className="calc-value">
              ₹{data.loanAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="calc-item">
            <span className="calc-label">Interest Rate</span>
            <span className="calc-value">{data.interestRate}% / Month</span>
          </div>

          <div className="calc-item">
            <span className="calc-label">Monthly Interest</span>
            <span className="calc-value">
              ₹{monthlyInterest.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="calc-item">
            <span className="calc-label">Tenure</span>
            <span className="calc-value">{data.tenure} Months</span>
          </div>

          <div className="calc-item highlight">
            <span className="calc-label">Total Interest</span>
            <span className="calc-value">
              ₹{totalInterest.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="calc-item highlight">
            <span className="calc-label">Total Repayment</span>
            <span className="calc-value">
              ₹{totalRepayment.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className="info-box">
        <span className="info-icon">📅</span>
        <p>
          The customer needs to pay ₹{monthlyInterest.toLocaleString("en-IN")}{" "}
          monthly as interest. The principal can be repaid at any time before
          the due date.
        </p>
      </div>
    </div>
  );
}