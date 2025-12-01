import { dummySales } from '../data/dummySales';
import { getProducts, updateProduct } from './productApi';


const KEY = 'jewelry_sales_v1';


export function getSales() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
        localStorage.setItem(KEY, JSON.stringify(dummySales));
        return [...dummySales];
    }
    return JSON.parse(raw);
}


export function addSale(sale) {
    const sales = getSales();
    const nextId = sales.length ? Math.max(...sales.map(s => s.id)) + 1 : 1;
    const s = { ...sale, id: nextId };
    sales.push(s);
    localStorage.setItem(KEY, JSON.stringify(sales));


    // decrease product weight
    try {
        const prod = getProducts().find(p => p.id === s.productId);
        if (prod) {
            prod.weight = Number(prod.weight) - Number(s.weightSold);
            updateProduct(prod);
        }
    } catch (err) {
        console.warn('Failed to update product after sale', err);
    }


    return s;
}