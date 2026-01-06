import { useState, useEffect } from "react";
import "./StepStyles.css";

export default function ValuationStep({ formData, onUpdate }) {
  const [data, setData] = useState({
    goldRate: formData.goldRate || 6000,
    loanToValue: formData.loanToValue || 75
  });

  const calculateTotalValue = () => {
    return formData.goldItems.reduce((total, item) => {
      const weight = parseFloat(item.netWeight) || 0;
      const purityMultiplier =
        item.purity === "24K"
          ? 1
          : item.purity === "22K"
            ? 0.916
            : item.purity === "18K"
              ? 0.75
              : 0.583;
      return total + weight * data.goldRate * purityMultiplier;
    }, 0);
  };

  const totalValue = calculateTotalValue();
  const maxLoanAmount = (totalValue * data.loanToValue) / 100;

  useEffect(() => {
    if (!formData.goldItems?.length) return;

    const updatedItems = formData.goldItems.map(item => {
      const weight = parseFloat(item.netWeight) || 0;

      const purityMultiplier =
        item.purity === "24K" ? 1 :
          item.purity === "22K" ? 0.916 :
            item.purity === "18K" ? 0.75 :
              0.583;

      return {
        ...item,
        value: Math.floor(weight * data.goldRate * purityMultiplier)
      };
    });

    onUpdate({
      goldRate: data.goldRate,
      loanToValue: data.loanToValue,
      loanAmount: Math.floor(maxLoanAmount),
      goldItems: updatedItems
    });

  }, [
    data.goldRate,
    data.loanToValue,
    formData.goldItems,
    maxLoanAmount,
    onUpdate
  ]);



  return (
    <div className="step-form">
      <h3 className="step-title">Valuation</h3>
      <p className="step-description">
        Set the gold rate and loan-to-value ratio
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="goldRate">
            Gold Rate (per gram) <span className="required">*</span>
          </label>
          <div className="input-with-prefix">
            <span className="prefix">₹</span>
            <input
              id="goldRate"
              type="number"
              value={data.goldRate}
              onChange={(e) =>
                setData({ ...data, goldRate: parseFloat(e.target.value) })
              }
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="loanToValue">
            Loan-to-Value Ratio <span className="required">*</span>
          </label>
          <div className="input-with-suffix">
            <input
              id="loanToValue"
              type="number"
              value={data.loanToValue}
              onChange={(e) =>
                setData({ ...data, loanToValue: parseFloat(e.target.value) })
              }
              min="1"
              max="100"
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      {/* Valuation Summary */}
      <div className="valuation-summary">
        <h4>Valuation Summary</h4>

        <table className="summary-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Purity</th>
              <th>Net Wt</th>
              <th>Rate/g</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {formData.goldItems.map((item, index) => {
              const weight = parseFloat(item.netWeight) || 0;
              const purityMultiplier =
                item.purity === "24K"
                  ? 1
                  : item.purity === "22K"
                    ? 0.916
                    : item.purity === "18K"
                      ? 0.75
                      : 0.583;
              const value = Math.floor(
                weight * data.goldRate * purityMultiplier
              );

              return (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td>{item.purity}</td>
                  <td>{weight} g</td>
                  <td>₹{(data.goldRate * purityMultiplier).toFixed(0)}</td>
                  <td>₹{value.toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-right">
                <strong>Total Gold Value:</strong>
              </td>
              <td>
                <strong>₹{totalValue.toLocaleString("en-IN")}</strong>
              </td>
            </tr>
            <tr className="highlight-row">
              <td colSpan="4" className="text-right">
                <strong>Maximum Loan Amount ({data.loanToValue}%):</strong>
              </td>
              <td>
                <strong>₹{maxLoanAmount.toLocaleString("en-IN")}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="info-box">
        <span className="info-icon">💡</span>
        <p>
          The loan amount is calculated as {data.loanToValue}% of the total
          gold value based on current market rates.
        </p>
      </div>
    </div>
  );
}