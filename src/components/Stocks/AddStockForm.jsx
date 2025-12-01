import React, { useState } from 'react';
import { addStockEntry } from '../../api/stockApi';


export default function AddStockForm({ products, onAdded }) {
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [change, setChange] = useState(0);
    const [note, setNote] = useState('');


    function submit(e) {
        e.preventDefault();
        if (!productId) return alert('Select product');
        const entry = { productId: Number(productId), change: Number(change), date: new Date().toISOString().slice(0, 10), note };
        addStockEntry(entry);
        onAdded && onAdded();
        setChange(0); setNote('');
    }


    return (
        <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
            <label>Product
                <select value={productId} onChange={e => setProductId(e.target.value)}>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </label>


            <label>Change (positive to add, negative to remove)
                <input type="number" value={change} onChange={e => setChange(e.target.value)} required />
            </label>


            <label>Note
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Why change?" />
            </label>


            <button type="submit">Save</button>
        </form>
    );
}