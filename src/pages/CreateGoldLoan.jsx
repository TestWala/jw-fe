import React, { useState, useContext } from "react";
import CustomerStep from "../components/Gold-loan/CustomerStep";
import GoldItemsStep from "../components/Gold-loan/GoldItemsStep";
import ValuationStep from "../components/Gold-loan/ValuationStep";
import LoanDetailsStep from "../components/Gold-loan/LoanDetailsStep";
import ReviewStep from "../components/Gold-loan/ReviewStep";
import goldLoanApi from "../api/goldLoanApi";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const steps = ["Customer", "Gold Items", "Valuation", "Loan Details", "Review"];

export default function CreateGoldLoan({ onNavigate, onCreateLoan }) {
  const { reload } = useContext(AppContext);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    phoneNumber: "",
    address: "",
    goldItems: [],
    goldRate: 6000,
    loanToValue: 75,
    loanAmount: 0,
    interestRate: 2,
    tenure: 12,
    dueDate: ""
  });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleUpdateData = (data) => {
    setFormData({ ...formData, ...data });
  };

 const handleSubmit = async () => {
  try {
    const res = await goldLoanApi.createLoan(formData);

    if (res.success) {
      toast.success("Gold loan created successfully");
      await reload();
      onNavigate("gold-loan");
    } else {
      toast.error(res.message || "Failed to create loan");
    }
  } catch (err) {
    toast.error("Error creating loan");
    console.error(err);
  }
};

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <CustomerStep formData={formData} onUpdate={handleUpdateData} />;
      case 1:
        return <GoldItemsStep formData={formData} onUpdate={handleUpdateData} />;
      case 2:
        return <ValuationStep formData={formData} onUpdate={handleUpdateData} />;
      case 3:
        return <LoanDetailsStep formData={formData} onUpdate={handleUpdateData} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        button {
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
      `}</style>

   <div  style={{
    display:"flex",
    alignItems: "center",
    justifyContent: "space-between"

   }}>
    
      <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "24px", fontWeight: 600, marginBottom: "20px" }}>
        Create Gold Loan
      </h2>
       <button
        onClick={() => onNavigate("gold-loan")}
        style={{
          background: "transparent",
          border: "1px solid #d0d0d0",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#555",
          marginBottom: "20px"
        }}
      >
        ← Back to Gold Loans
      </button>

   </div>

      {/* Stepper */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "40px",
        position: "relative"
      }}>
        {/* Progress Line */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "0",
          right: "0",
          height: "2px",
          background: "#e6e6e6",
          zIndex: 0
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(135deg, #c9a227, #a8871e)",
            width: `${(step / (steps.length - 1)) * 100}%`,
            transition: "width 0.3s ease"
          }} />
        </div>

        {steps.map((label, i) => (
          <div key={i} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            flex: 1,
            position: "relative",
            zIndex: 1
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: i <= step ? "linear-gradient(135deg, #c9a227, #a8871e)" : "#fff",
              border: i <= step ? "none" : "2px solid #e6e6e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: i <= step ? "#fff" : "#999",
              fontSize: "14px",
              marginBottom: "8px"
            }}>
              {i + 1}
            </div>
            <span style={{ 
              fontSize: "13px", 
              color: i <= step ? "#2b2b2b" : "#999",
              fontWeight: i === step ? 600 : 400
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
        marginBottom: "20px"
      }}>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        {step > 0 && (
          <button
            onClick={handleBack}
            style={{
              padding: "10px 24px",
              border: "1px solid #d0d0d0",
              background: "#fff",
              color: "#c9a227",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500
            }}
          >
            ← Back
          </button>
        )}

        {step < steps.length - 1 && (
          <button
            onClick={handleNext}
            style={{
              padding: "10px 24px",
              border: "none",
              background: "linear-gradient(135deg, #c9a227, #a8871e)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(201, 162, 39, 0.35)"
            }}
          >
            Next →
          </button>
        )}

        {step === steps.length - 1 && (
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 24px",
              border: "none",
              background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(46, 125, 50, 0.35)"
            }}
          >
            Approve Loan
          </button>
        )}
      </div>
    </div>
  );
}

