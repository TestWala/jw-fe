import { dummyProducts } from '../data/dummyProducts';


const KEY = 'jewelry_products_v1';


export function getProducts() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
        localStorage.setItem(KEY, JSON.stringify(dummyProducts));
        return [...dummyProducts];
    }
    return JSON.parse(raw);
}


export function addProduct(product) {
    const products = getProducts();
    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const p = { ...product, id: nextId };
    products.push(p);
    localStorage.setItem(KEY, JSON.stringify(products));
    return p;
}


export function updateProduct(updated) {
    const products = getProducts().map(p => (p.id === updated.id ? updated : p));
    localStorage.setItem(KEY, JSON.stringify(products));
    return updated;
}


export function findProductById(id) {
    return getProducts().find(p => p.id === id);
}