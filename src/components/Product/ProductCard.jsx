import React from 'react';
import './ProductCard.css';


export default function ProductCard({ product }) {
return (
<div className="p-card">
<img src={product.image || '/icons/icon-192.png'} alt="img" />
<div className="p-info">
<h4>{product.name}</h4>
<div>Type: {product.type}</div>
<div>Weight: {product.weight} g</div>
<div>Purity: {product.purity}</div>
<div>Price/g: ₹{product.pricePerGram}</div>
</div>
</div>
);
}