import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/Product/ProductCard';


export default function Dashboard() {
    const { products, sales } = useContext(AppContext);
    const totalValue = products.reduce((s, p) => s + (p.weight * p.pricePerGram), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todaysSales = sales.filter(s => s.date === today);


    return (
        <div>
            <h2>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <h4>Total stock value</h4>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>₹{totalValue}</div>
                    <div style={{ marginTop: 8 }}>Products: {products.length}</div>
                </div>


                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <h4>Today's sales</h4>
                    <div>{todaysSales.length} transactions</div>
                </div>
            </div>


            <h3 style={{ marginTop: 18 }}>Products</h3>
            <div style={{ display: 'grid', gap: 8 }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    );
}