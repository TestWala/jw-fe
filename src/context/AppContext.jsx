import React, { createContext, useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';
import { getStockHistory } from '../api/stockApi';
import { getSales } from '../api/salesApi'


export const AppContext = createContext();


export default function AppProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [stockHistory, setStockHistory] = useState([]);
    const [sales, setSales] = useState([]);


    useEffect(() => {
        setProducts(getProducts());
        setStockHistory(getStockHistory());
        setSales(getSales());
    }, []);


    const reload = () => {
        setProducts(getProducts());
        setStockHistory(getStockHistory());
        setSales(getSales());
    };


    return (
        <AppContext.Provider value={{ products, stockHistory, sales, reload }}>
            {children}
        </AppContext.Provider>
    );
}
