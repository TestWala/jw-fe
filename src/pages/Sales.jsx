import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { addSale } from '../api/salesApi';

export default function Sales() {
    const { products, reload } = useContext(AppContext);
    const [form, setForm] = useState({
        productId: '',
        weightSold: 0,
        customer: ''
    });

    useEffect(() => {
        if (products.length > 0 && !form.productId) {
            setForm(f => ({ ...f, productId: products[0].id }));
        }
    }, [products]);

    function submit(e) {
        e.preventDefault();
        if (!form.productId) return alert('select product');

        const product = products.find(p => p.id === Number(form.productId));
        const amount = Number(form.weightSold) * product.pricePerGram;

        addSale({
            productId: Number(form.productId),
            weightSold: Number(form.weightSold),
            amount,
            customer: form.customer,
            date: new Date().toISOString().slice(0, 10)
        });

        reload();
        setForm({
            productId: products[0]?.id || '',
            weightSold: 0,
            customer: ''
        });
    }

    return (
        <div>
            <h2>Record Sale</h2>

            <form onSubmit={submit} style={{ maxWidth: 420, display: 'grid', gap: 8 }}>
                <select
                    value={form.productId}
                    onChange={e => setForm({ ...form, productId: e.target.value })}
                >
                    {products.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Weight sold (g)"
                    value={form.weightSold}
                    onChange={e => setForm({ ...form, weightSold: e.target.value })}
                    required
                />

                <input
                    placeholder="Customer name"
                    value={form.customer}
                    onChange={e => setForm({ ...form, customer: e.target.value })}
                />

                <button type="submit">Save Sale</button>
            </form>
        </div>
    );
}
