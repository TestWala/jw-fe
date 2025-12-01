import { dummyStock } from '../data/dummyStock';
import { getProducts, updateProduct } from './productApi';


const KEY = 'jewelry_stock_v1';


export function getStockHistory() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
        localStorage.setItem(KEY, JSON.stringify(dummyStock));
        return [...dummyStock];
    }
    return JSON.parse(raw);
}


export function addStockEntry(entry) {
    const history = getStockHistory();
    const nextId = history.length ? Math.max(...history.map(h => h.id)) + 1 : 1;
    const e = { ...entry, id: nextId };
    history.push(e);
    localStorage.setItem(KEY, JSON.stringify(history));


    // update product weight if product exists
    try {
        const prod = getProducts().find(p => p.id === e.productId);
        if (prod) {
            prod.weight = Number(prod.weight) + Number(e.change);
            updateProduct(prod);
        }
    } catch (err) {
        console.warn('Failed to update product weight', err);
    }


    return e;
}