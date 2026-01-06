

export default function ReviewStep({ formData }) {
  const totalNetWeight = formData.goldItems.reduce((sum, item) => sum + parseFloat(item.netWeight || 0), 0);
  const monthlyInterest = (formData.loanAmount * formData.interestRate) / 100;

  return (
    <div>
      <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 600 }}>Review & Approve</h3>
      
      <div style={{ display: "grid", gap: "20px" }}>
        {/* Customer Info */}
        <div style={{ background: "#fafafa", padding: "16px", borderRadius: "10px" }}>
          <h4 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>Customer Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Name</p>
              <p style={{ fontSize: "14px", fontWeight: 500 }}>{formData.customerName}</p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Phone</p>
              <p style={{ fontSize: "14px", fontWeight: 500 }}>{formData.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div style={{ background: "#fafafa", padding: "16px", borderRadius: "10px" }}>
          <h4 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>Loan Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Loan Amount</p>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>₹{formData.loanAmount.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Interest Rate</p>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>{formData.interestRate}% / month</p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Monthly Interest</p>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>₹{monthlyInterest.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#777" }}>Total Gold Weight</p>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>{totalNetWeight.toFixed(2)} g</p>
            </div>
          </div>
        </div>

        {/* Gold Items */}
        <div style={{ background: "#fafafa", padding: "16px", borderRadius: "10px" }}>
          <h4 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>Gold Items ({formData.goldItems.length})</h4>
          {formData.goldItems.map((item, i) => (
            <div key={i} style={{
              padding: "10px",
              background: "#fff",
              borderRadius: "6px",
              marginBottom: "8px",
              fontSize: "14px"
            }}>
              {item.item} - {item.purity} - {item.grossWeight}g / {item.netWeight}g
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}