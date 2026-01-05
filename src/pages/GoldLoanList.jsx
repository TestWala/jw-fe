import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./GoldLoanList.css";

export default function GoldLoanList({ onNavigate }) {
  const { goldLoans, goldLoanStats } = useContext(AppContext);
  const loans = goldLoans || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "ALL" || loan.status === filterStatus;

    return matchesSearch && matchesFilter;
  });


  const stats = [
    {
      label: "Total Loans",
      value: goldLoanStats.totalLoans,
      icon: "📋"
    },
    {
      label: "Active Loans",
      value: goldLoanStats.activeLoans,
      icon: "✓"
    },
    {
      label: "Total Amount",
      value: `₹${goldLoanStats.totalAmount.toLocaleString("en-IN")}`,
      icon: "💰"
    },
    {
      label: "Monthly Interest",
      value: `₹${goldLoanStats.monthlyInterest.toLocaleString("en-IN")}`,
      icon: "📈"
    }
  ];

  return (
    <div className="GoldLoanList">
      {/* ================= HEADER ================= */}
      <div className="GoldLoanList__header">
        <h2 className="GoldLoanList__title">Gold Loans</h2>

        <button
          className="GoldLoanList__createBtn"
          onClick={() => onNavigate("gold-loan-create")}
        >
          + Create Gold Loan
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="GoldLoanList__statsGrid">
        {stats.map((stat, i) => (
          <div key={i} className="GoldLoanList__statCard">
            <div className="GoldLoanList__statIcon">{stat.icon}</div>
            <div>
              <p className="GoldLoanList__statLabel">{stat.label}</p>
              <h3 className="GoldLoanList__statValue">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ================= TABLE BOX ================= */}
      <div className="GoldLoanList__tableBox">
        {/* -------- Controls -------- */}
        <div className="GoldLoanList__controls">
          <div className="GoldLoanList__searchBox">
            <span className="GoldLoanList__searchIcon">🔍</span>
            <input
              className="GoldLoanList__searchInput"
              type="text"
              placeholder="Search by loan ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="GoldLoanList__filterBtns">
            {["ALL", "ACTIVE", "CLOSED"].map((status) => (
              <button
                key={status}
                className={`GoldLoanList__filterBtn ${filterStatus === status
                    ? "GoldLoanList__filterBtn--active"
                    : ""
                  }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* -------- Table -------- */}
        <div className="GoldLoanList__tableWrapper">
          <table className="GoldLoanList__table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Interest</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    {searchTerm || filterStatus !== "ALL"
                      ? "No gold loans found matching your filters"
                      : "No gold loans found. Create your first loan!"}
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, idx) => (
                  <tr key={loan.id || idx}>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "#a8871e",
                        fontFamily: "Montserrat"
                      }}
                    >
                      {loan.id || `GL-${idx + 1}`}
                    </td>

                    <td>{loan.customerName}</td>

                    <td style={{ fontWeight: 600 }}>
                      ₹{(loan.loanAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>{loan.interestRate}% / Month</td>

                    <td>
                      <span
                        className={`GoldLoanList__status GoldLoanList__status--${loan.status.toLowerCase()}`}
                      >
                        {loan.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="GoldLoanList__viewBtn"
                     onClick={() => onNavigate("gold-loan-details", loan.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}