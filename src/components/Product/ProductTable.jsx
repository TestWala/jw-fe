import React from 'react';
import './ProductTable.css';


export default function ProductTable({ products, onEdit }) {
    return (
        <table className="prod-table">
            <thead>
                <tr><th>ID</th><th>Product</th><th>Weight (g)</th><th>Price/g</th><th>Value</th></tr>
            </thead>
            <tbody>
                {products.map(p => (
                    <tr key={p.id} onClick={() => onEdit && onEdit(p)}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.weight}</td>
                        <td>₹{p.pricePerGram}</td>
                        <td>₹{Number(p.weight) * Number(p.pricePerGram)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}