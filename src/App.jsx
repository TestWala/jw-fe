import { useState, useEffect } from "react";
import "./styles/globals.css";
import "./styles/responsive.css";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";
import PurchaseOrder from "./pages/PurchaseOrder";
import AppProvider from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import Categories from "./pages/Categories";
import Users from "./components/users/Users";
import Profile from "./components/users/Profile";
import MetalPriceSettings from "./components/users/MetalPriceSettings";
import InstallPromptPopup from "./components/Common/InstallPromptPopup";
import GoldLoanList from "./pages/GoldLoanList";
import GoldLoanDetails from "./pages/GoldLoanDetails";
import CreateGoldLoan from "./pages/CreateGoldLoan";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from "./api/authApi";
import Settings from "./components/users/Settings";

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [authToken, setAuthToken] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Gold Loan state management
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loans, setLoans] = useState([
    {
      id: "GL-2025-001",
      customerName: "Rajesh Kumar",
      loanAmount: 45000,
      interestRate: 2,
      status: "ACTIVE",
      dueDate: "2025-01-10",
      goldItems: [
        {
          item: "Gold Chain",
          purity: "22K",
          grossWeight: 12.5,
          netWeight: 10.0,
          value: 60000
        }
      ],
      payments: [
        {
          date: "2025-01-01",
          type: "Interest",
          amount: 1200,
          mode: "Cash"
        }
      ]
    },
    {
      id: "GL-2025-002",
      customerName: "Priya Sharma",
      loanAmount: 80000,
      interestRate: 2,
      status: "ACTIVE",
      dueDate: "2025-01-15",
      goldItems: [
        {
          item: "Gold Bangles",
          purity: "22K",
          grossWeight: 25.0,
          netWeight: 22.0,
          value: 110000
        }
      ],
      payments: []
    },
    {
      id: "GL-2024-125",
      customerName: "Amit Patel",
      loanAmount: 120000,
      interestRate: 2,
      status: "CLOSED",
      dueDate: "2024-12-20",
      goldItems: [
        {
          item: "Gold Necklace",
          purity: "22K",
          grossWeight: 40.0,
          netWeight: 35.0,
          value: 175000
        }
      ],
      payments: [
        {
          date: "2024-12-01",
          type: "Interest",
          amount: 2400,
          mode: "Cash"
        },
        {
          date: "2024-12-20",
          type: "Principal + Interest",
          amount: 122400,
          mode: "Bank Transfer"
        }
      ]
    }
  ]);
  

  // ✅ Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setAuthToken(false);
        setLoading(false);
        return;
      }

      const res = await authApi.validateAccessToken(token);

      if (!res.isValid) {
        localStorage.clear();
        setAuthToken(false);
      } else {
        setAuthToken(true);
      }

      setLoading(false);
    };

    validateToken();
  }, []);

  // Gold Loan handlers
  const handleNavigate = (page, loanId = null) => {
    setRoute(page);
    if (loanId) {
      setSelectedLoanId(loanId);
    }
  };

  const handleAddPayment = (loanId, payment) => {
    setLoans(
      loans.map((loan) =>
        loan.id === loanId
          ? { ...loan, payments: [...loan.payments, payment] }
          : loan
      )
    );
  };

  const handleCreateLoan = (newLoan) => {
    const loanId = `GL-2025-${String(loans.length + 1).padStart(3, "0")}`;
    setLoans([...loans, { ...newLoan, id: loanId }]);
    setRoute("gold-loan");
  };

  const selectedLoan = loans.find((loan) => loan.id === selectedLoanId);

  // ⏳ Prevent flicker before validation completes
  if (loading) {
    return null; // or loader/spinner
  }

  // 🔐 Not authenticated → Login
  if (!authToken) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(res) => {
            if (res.accessToken) {
              localStorage.setItem("accessToken", res.accessToken);
            }

            if (res.refreshToken) {
              localStorage.setItem("refreshToken", res.refreshToken);
            }

            if (res.user) {
              localStorage.setItem("user", JSON.stringify(res.user));
            }

            setAuthToken(true);
          }}
        />

        <ToastContainer position="bottom-right" autoClose={3000} />
      </>
    );
  }

  // ✅ Authenticated app
  return (
    <AppProvider>
      <>
        <InstallPromptPopup />

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          pauseOnHover
          draggable
          theme="light"
        />

        <div className="app-shell">
          <Navbar onNavigate={setRoute} />

          <div className="application-main">
            <Sidebar active={route} onNavigate={setRoute} />

            <div className="application-container">
              {route === "dashboard" && <Dashboard />}
              {route === "category" && <Categories />}
              {route === "products" && <Products />}
              {route === "purchase" && <PurchaseOrder />}
              {route === "sales" && <Sales />}
              {route === "settings" && <Settings />}
              {route === "gold-loan" && (
                <GoldLoanList 
                  onNavigate={handleNavigate} 
                 />
              )}
            {route === "gold-loan-details" && selectedLoanId && (
  <GoldLoanDetails
    loanId={selectedLoanId}
    onNavigate={handleNavigate}
  />
)}
              {route === "gold-loan-create" && (
                <CreateGoldLoan
                  onNavigate={handleNavigate}
                  onCreateLoan={handleCreateLoan}
                />
              )}
              {route === "history" && <History />}
              {route === "profile" && <Profile />}
              {route === "users" && <Users />}
              {route === "set-prices" && <MetalPriceSettings />}
            </div>
          </div>
        </div>
      </>
    </AppProvider>
  );
}