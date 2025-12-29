import { createContext, useEffect, useState } from "react";

import inventoryApi from "../api/inventoryApi";
import categoriesApi from "../api/categoriesApi";
import salesApi from "../api/salesApi";
import customerApi from "../api/customerApi";
import supplierApi from "../api/supplierApi";
import purchaseApi from "../api/purchaseApi";
import purityApi from "../api/purityApi";
import stockMovementApi from "../api/stockMovement";
import metalBasePriceApi from "../api/metalBasePriceApi";

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
  const [metalPrices, setMetalPrices] = useState(null);

  /* ===============================
     ✅ HEADER METAL PRICES (NEW)
  =============================== */
  const [headerPrices, setHeaderPrices] = useState([]);

  // Load header prices once
  useEffect(() => {
    const stored = localStorage.getItem("metal_header_prices");
    if (stored) {
      setHeaderPrices(JSON.parse(stored));
    }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(
      "metal_header_prices",
      JSON.stringify(headerPrices)
    );
  }, [headerPrices]);

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    reload();
  }, []);

  const fetchInventoryItems = async () => {
    const items = await inventoryApi.getAllInventoryItems();
    setInventoryItems(items.data);
  };

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
        historyRes,
        metalPricesRes
      ] = await Promise.all([
        inventoryApi.getAllInventoryItems(),
        categoriesApi.getAllCategories(),
        purityApi.getAllPurity(),
        customerApi.getAllCustomers(),
        supplierApi.getAllSuppliers(),
        purchaseApi.getAllPurchaseOrders(),
        salesApi.getAllInvoices(),
        stockMovementApi.fetchAllStockMovements(),
        metalBasePriceApi.fetchActiveMetalPrices()
      ]);

      if (itemsRes?.success) setInventoryItems(itemsRes.data);
      if (catRes?.success) setCategories(catRes.data);
      if (purityRes?.success) setPurity(purityRes.data);

      if (customersRes?.success) setCustomers(customersRes.data);
      if (suppliersRes?.success) setSuppliers(suppliersRes.data);
      if (poRes?.success) setPurchaseOrders(poRes.data);

      if (salesRes?.success) setSales(salesRes.data);
      if (historyRes) setStockHistory(historyRes);
      if (metalPricesRes?.success) setMetalPrices(metalPricesRes.data);

    } catch (error) {
      console.error("Context Load Error:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        inventoryItems,
        fetchInventoryItems,
        stockHistory,
        sales,
        categories,
        purity,
        customers,
        suppliers,
        purchaseOrders,
        metalPrices,

        /* ✅ EXPOSE HEADER PRICES */
        headerPrices,
        setHeaderPrices,

        reload
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
