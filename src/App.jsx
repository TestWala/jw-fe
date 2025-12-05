import { useState } from 'react';
import './styles/globals.css';
import './styles/responsive.css';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddInventory from './pages/AddInventory';
import Sales from './pages/Sales';
import History from './pages/History';
import Purchase from './pages/Purchase';


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
            {route === 'addstock' && <AddInventory />}
            {route === 'purchase' && <Purchase />}
            {route === 'sales' && <Sales />}
            {route === 'history' && <History />}
          </div>
        </div>
      </div>
    </AppProvider>
  );
}