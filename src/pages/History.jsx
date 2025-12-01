import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import StockHistoryTable from '../components/Stocks/StockHistoryTable';


export default function History() {
    const { stockHistory, sales, products } = useContext(AppContext);
    return (
        <div>
            <h2>History</h2>
            <h4>Stock changes</h4>
            <StockHistoryTable history={stockHistory} products={products} />


            <h4 style={{ marginTop: 18 }}>Sales</h4>
            <table style={{ width: '100%' }}>
                <thead><tr><th>Date</th><th>Product</th><th>Weight</th><th>Amount</th><th>Customer</th></tr></thead>
                <tbody>
                    {sales.map(s => {
                        const p = products.find(x => x.id === s.productId);
                        return (
                            <tr key={s.id}>
                                <td>{s.date}</td>
                                <td>{p ? p.name : '—'}</td>
                                <td>{s.weightSold}</td>
                                <td>₹{s.amount}</td>
                                <td>{s.customer}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}