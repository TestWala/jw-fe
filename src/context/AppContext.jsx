import { createContext, useEffect, useState } from "react";

import inventoryApi from "../api/inventoryApi";
import categoriesApi from "../api/categoriesApi";
import salesApi from "../api/salesApi";
import customerApi from "../api/customerApi";
import supplierApi from "../api/supplierApi";
import purchaseApi from "../api/purchaseApi";
import purityApi from "../api/purityApi";
import metalPriceApi from "../api/metalPriceApi";
import stockMovementApi from "../api/stockMovement";

export const AppContext = createContext();

export default function AppProvider({ children }) {

    const [inventoryItems, setInventoryItems] = useState([]);
    const [stockHistory, setStockHistory] = useState([]);
    const [sales, setSales] = useState([]);

    const [categories, setCategories] = useState([]);
    const [purity, setPurity] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    // Metal Prices State
    const [metalPrices, setMetalPrices] = useState({
        gold: 0,
        silver: 0,
        currency: "INR",
        unit: "gram",
        timestamp: null
    });
    const [pricesLoading, setPricesLoading] = useState(false);
    const [pricesError, setPricesError] = useState(null);
    

    useEffect(() => {
        reload();
        fetchMetalPrices(); // Initial fetch
        
        // Auto-refresh prices every 5 minutes (300000ms)
        const priceInterval = setInterval(() => {
            fetchMetalPrices();
        }, 300000);

        // Cleanup interval on unmount
        return () => clearInterval(priceInterval);
    }, []);

    const reload = async () => {
        try {
            const [
                itemsRes,
                catRes,
                purityRes,
                customersRes,
                suppliersRes,
                poRes,
                salesRes,
                historyRes
            ] = await Promise.all([
                inventoryApi.getAllInventoryItems(),
                categoriesApi.getAllCategories(),
                purityApi.getAllPurity(),
                customerApi.getAllCustomers(),
                supplierApi.getAllSuppliers(),
                purchaseApi.getAllPurchaseOrders(),
                salesApi.getAllInvoices(),
                stockMovementApi.fetchAllStockMovements()
            ]);

            if (itemsRes.success) setInventoryItems(itemsRes.data);

            if (catRes.success) setCategories(catRes.data);
            if (purityRes.success) setPurity(purityRes.data);

            if (customersRes.success) setCustomers(customersRes.data);
            if (suppliersRes.success) setSuppliers(suppliersRes.data);
            if (poRes.success) setPurchaseOrders(poRes.data);

            if (salesRes.success) setSales(salesRes.data);

            if (historyRes) setStockHistory(historyRes);

        } catch (error) {
            console.error("Context Load Error:", error);
        }
    };

    const fetchMetalPrices = async () => {
        setPricesLoading(true);
        setPricesError(null);

        try {
            const response = await metalPriceApi.fetchLatestMetalPrices();

            if (response.success && response.data) {
                setMetalPrices({
                    gold: response.data.gold,
                    silver: response.data.silver,
                    currency: response.data.currency,
                    unit: response.data.unit,
                    timestamp: new Date().toISOString()
                });
                console.log("Metal prices updated:", response.data);
            } else {
                setPricesError(response.error || "Failed to fetch metal prices");
                console.error("Failed to fetch metal prices");
            }
        } catch (error) {
            setPricesError(error.message);
            console.error("Error fetching metal prices:", error);
        } finally {
            setPricesLoading(false);
        }
    };

    // Manual refresh function that components can call
    const refreshMetalPrices = async () => {
        await fetchMetalPrices();
    };

    return (
        <AppContext.Provider
            value={{
                inventoryItems,
                stockHistory,
                sales,
                categories,
                purity,
                customers,
                suppliers,
                purchaseOrders,
                metalPrices,
                pricesLoading,
                pricesError,
                reload,
                refreshMetalPrices,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}