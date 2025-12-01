import React, { useState } from 'react';
import './styles/globals.css';
import './styles/responsive.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddStock from './pages/AddStock';
import Sales from './pages/Sales';
import History from './pages/History';


import AppProvider from './context/AppContext';


export default function App() {
  const [route, setRoute] = useState('dashboard');
  return (
    <AppProvider>
      <div className="app-shell">
        <Navbar />
        <div className="main">
          <Sidebar active={route} onNavigate={setRoute} />
          <div className="container">
            {route === 'dashboard' && <Dashboard />}
            {route === 'products' && <Products />}
            {route === 'addstock' && <AddStock />}
            {route === 'sales' && <Sales />}
            {route === 'history' && <History />}
          </div>
        </div>
      </div>
    </AppProvider>
  );
}