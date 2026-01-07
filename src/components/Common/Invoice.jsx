import "../../pages/Sales.css";

export default function Invoice({ invoiceData, inventoryItems, getPurityLabel }) {
  return (
    <div className="printable-invoice">
      <div className="invoice-header">
        <div className="company-info">
          <h1>Your Company Name</h1>
          <p>Address Line 1</p>
          <p>Address Line 2</p>
          <p>Phone: +91 XXXXX XXXXX</p>
          <p>Email: info@company.com</p>
          <p>GSTIN: XXXXXXXXXXXX</p>
        </div>

        <div className="invoice-details">
          <h2>INVOICE</h2>
          <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
          <p><strong>Date:</strong> {invoiceData.createdAt}</p>
        </div>
      </div>

      <div className="invoice-divider"></div>

      <div className="customer-info">
        <h3>Bill To:</h3>
        {invoiceData.customer ? (
          <>
            <p><strong>{invoiceData.customer.fullName}</strong></p>
            <p>Phone: {invoiceData.customer.phone}</p>
            {invoiceData.customer.email && <p>Email: {invoiceData.customer.email}</p>}
            {invoiceData.customer.address && <p>Address: {invoiceData.customer.address}</p>}
          </>
        ) : (
          <p><strong>Guest Customer</strong></p>
        )}
      </div>

      <div className="invoice-divider"></div>

      <table className="printable-items-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Item Code</th>
            <th>Gross Wt</th>
            <th>Net Wt</th>
            <th>Purity</th>
            <th>Rate</th>
            <th>Making</th>
            <th>Other</th>
            <th>Sell Price</th>
            <th>Tax</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((it, i) => {
            const prod = inventoryItems.find((p) => p.id === it.inventoryItemId);
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{prod?.itemCode}</td>
                <td>{prod?.grossWeight?.toFixed(3)}g</td>
                <td>{prod?.netWeight?.toFixed(3)}g</td>
                <td>{getPurityLabel(prod?.purityId)}</td>
                <td>₹{it.unitPrice?.toFixed(2)}</td>
                <td>₹{it.makingCharges?.toFixed(2)}</td>
                <td>₹{(it.otherChargesPrice || 0).toFixed(2)}</td>
                <td>₹{it.sellPrice?.toFixed(2)}</td>
                <td>₹{it.taxAmount?.toFixed(2)}</td>
                <td>₹{it.totalAmount?.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="invoice-summary">
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>₹{invoiceData.subtotal.toFixed(2)}</span>
        </div>

        <div className="summary-item">
          <span>Total Tax:</span>
          <span>₹{invoiceData.totalTaxAmount.toFixed(2)}</span>
        </div>

        {invoiceData.invoiceDiscount > 0 && (
          <div className="summary-item discount-item">
            <span>Discount:</span>
            <span>- ₹{invoiceData.invoiceDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="summary-item total-item">
          <span><strong>Grand Total:</strong></span>
          <span><strong>₹{invoiceData.finalAmount.toFixed(2)}</strong></span>
        </div>
      </div>

      <div className="invoice-footer">
        <div className="terms-conditions">
          <h4>Terms & Conditions:</h4>
          <ul>
            <li>Goods once sold cannot be returned or exchanged</li>
            <li>Subject to jurisdiction only</li>
            <li>Payment terms: As agreed</li>
          </ul>
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>

      <div className="invoice-footer-note">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}