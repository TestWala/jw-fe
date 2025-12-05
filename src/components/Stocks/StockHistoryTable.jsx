import React from 'react';


export default function StockHistoryTable({ history, products }) {
    function productName(pid) { const p = products.find(x => x.id === pid); return p ? p.name : '—'; }
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Date</th><th>Product</th><th>Change</th><th>Note</th></tr></thead>
            <tbody>
                {history.map(h => (
                    <tr key={h.id}>
                        <td>{h.date}</td>
                        <td>{productName(h.productId)}</td>
                        <td>{h.change}</td>
                        <td>{h.note}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}