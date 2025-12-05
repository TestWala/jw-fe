import React from 'react';
import './Sidebar.css';

export default function Sidebar({ active, onNavigate }) {
    return (
        <aside className="sidebar">
            <nav>

                <button onClick={() => onNavigate('dashboard')} 
                        className={active === 'dashboard' ? 'active' : ''}>
                    <span className="icon">📊</span>
                    <span>Dashboard</span>
                </button>

                <button onClick={() => onNavigate('products')} 
                        className={active === 'products' ? 'active' : ''}>
                    <span className="icon">📦</span>
                    <span>Products</span>
                </button>

                <button onClick={() => onNavigate('addstock')} 
                        className={active === 'addstock' ? 'active' : ''}>
                    <span className="icon">➕</span>
                    <span>Add Stock</span>
                </button>

                <button onClick={() => onNavigate('sales')} 
                        className={active === 'sales' ? 'active' : ''}>
                    <span className="icon">💰</span>
                    <span>Sales</span>
                </button>

                <button onClick={() => onNavigate('purchase')} 
                        className={active === 'purchase' ? 'active' : ''}>
                    <span className="icon">🧾</span>
                    <span>Purchase</span>
                </button>

                <button onClick={() => onNavigate('history')} 
                        className={active === 'history' ? 'active' : ''}>
                    <span className="icon">📜</span>
                    <span>History</span>
                </button>

            </nav>
        </aside>
    );
}
