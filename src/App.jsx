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

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authApi } from "./api/authApi";

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [authToken, setAuthToken] = useState(false);
  const [loading, setLoading] = useState(true);

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
