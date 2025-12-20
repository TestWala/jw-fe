import { useState, useEffect } from 'react';
import './styles/globals.css';
import './styles/responsive.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import History from './pages/History';
import Purchase from './pages/Purchase';
import AppProvider from './context/AppContext';
import LoginPage from "./pages/LoginPage";
import Categories from './pages/Categories';
import Users from './components/users/Users';
import Profile from './components/users/Profile'; // Import Profile component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {

  const [route, setRoute] = useState('dashboard');
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setAuthToken(token);
  }, []);

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

            setAuthToken(res.accessToken);
          }}
        />

        {/* ✅ Toasts also available on login page */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </>
    );
  }

  return (
    <AppProvider>
      <>
        {/* ✅ Global toaster */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          pauseOnHover
          draggable
          theme="light"
        />

        <div className="app-shell">
          <Navbar onNavigate={setRoute} />
          <div className="application-main">
            <Sidebar active={route} onNavigate={setRoute} />
            <div className="application-container">
              {route === 'dashboard' && <Dashboard />}
              {route === 'category' && <Categories />}
              {route === 'products' && <Products />}
              {route === 'purchase' && <Purchase />}
              {route === 'sales' && <Sales />}
              {route === 'history' && <History />}
              {route === 'profile' && <Profile />}
              {route === 'users' && <Users />}
            </div>
          </div>
        </div>
      </>
    </AppProvider>
  );
}
