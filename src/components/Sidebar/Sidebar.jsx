import React from 'react';
import './Sidebar.css';


export default function Sidebar({ active, onNavigate }) {
    return (
        <aside className="sidebar">
            <nav>
                <button onClick={() => onNavigate('dashboard')} className={active === 'dashboard' ? 'active' : ''}>Dashboard</button>
                <button onClick={() => onNavigate('products')} className={active === 'products' ? 'active' : ''}>Products</button>
                <button onClick={() => onNavigate('addstock')} className={active === 'addstock' ? 'active' : ''}>Add Stock</button>
                <button onClick={() => onNavigate('sales')} className={active === 'sales' ? 'active' : ''}>Sales</button>
                <button onClick={() => onNavigate('history')} className={active === 'history' ? 'active' : ''}>History</button>
            </nav>
        </aside>
    );
}