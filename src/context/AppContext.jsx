import React, { createContext, useEffect, useState } from "react";

import { getInventoryItems } from "../api/inventoryApi";
import { getAllCategories } from "../api/categoriesApi";
import { getAllPurity } from "../api/Purity";
import salesApi from "../api/salesApi";
import customerApi from "../api/customerApi";
import supplierApi from "../api/supplierApi";
import purchaseApi from "../api/purchaseApi";
import userApi from "../api/userApi"; // if needed

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

    const [userid, setUserId] = useState(); // Dummy user ID for API calls
    useEffect(() => {
        reload();
    }, []);

    const reload = async () => {
        try {
            const [
                itemsRes,
                catRes,
                purityRes,
                customersRes,
                suppliersRes,                
                purchaseOrdersRes,
                usersRes,
                salesRes
            ] = await Promise.all([
                getInventoryItems(),
                getAllCategories(),
                getAllPurity(),
                customerApi.getAllCustomers(),
                supplierApi.getAllSuppliers(),
                purchaseApi.getAllPurchaseOrders(),
                userApi.getUsersByRole(),
                salesApi.getAllInvoices()
            ]);

            if (itemsRes.success) setInventoryItems(itemsRes.data);
 
            if (catRes.success) setCategories(catRes.data);
            if (purityRes.success) setPurity(purityRes.data);

            if (customersRes.success) setCustomers(customersRes.data);
            if (suppliersRes.success) setSuppliers(suppliersRes.data);
            if (purchaseOrdersRes.success) setPurchaseOrders(purchaseOrdersRes.data);
            if (salesRes.success) setSales(salesRes.data);
            if (suppliersRes.success) setSuppliers(suppliersRes.data);
            if (purchaseOrdersRes.success) setPurchaseOrders(purchaseOrdersRes.data);
            if (usersRes.success) {
                const user = usersRes.data[0];
                console.log("Loaded user:", user);
                setUserId(user.id);
            }
        } catch (error) {
            console.error("Context Load Error:", error);
        }
    };

    return (
        <AppContext.Provider
            value={{
                inventoryItems,                 
                sales,
                categories,
                purity,
                customers,
                suppliers,
                purchaseOrders,
                userid,
                sales,
                reload,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
