import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import AddStockForm from '../components/Stocks/AddStockForm';


export default function AddStock() {
    const { products, reload } = useContext(AppContext);
    return (
        <div>
            <h2>Add / Adjust Stock</h2>
            <AddStockForm products={products} onAdded={reload} />
            <p style={{ marginTop: 12 }}>Tip: use negative value to reduce stock.</p>
        </div>
    );
}