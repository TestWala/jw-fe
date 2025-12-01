import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ProductTable from '../components/Product/ProductTable';
import { addProduct } from '../api/productApi';


export default function Products() {
    const { products, reload } = useContext(AppContext);
    const [form, setForm] = useState({ name: '', type: 'gold', weight: 0, purity: '22K', pricePerGram: 0 });


    function submit(e) {
        e.preventDefault();
        addProduct({ ...form, pricePerGram: Number(form.pricePerGram), weight: Number(form.weight) });
        setForm({ name: '', type: 'gold', weight: 0, purity: '22K', pricePerGram: 0 });
        reload();
    }


    return (
        <div>
            <h2>Products</h2>
            <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <ProductTable products={products} />
                </div>
                <div style={{ width: 320, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
                    <h4>Add Product</h4>
                    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
                        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                        </select>
                        <input type="number" placeholder="Weight (g)" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} required />
                        <input placeholder="Purity" value={form.purity} onChange={e => setForm({ ...form, purity: e.target.value })} />
                        <input type="number" placeholder="Price per gram" value={form.pricePerGram} onChange={e => setForm({ ...form, pricePerGram: e.target.value })} required />
                        <button type="submit">Add</button>
                    </form>
                </div>
            </div>
        </div>
    );
}