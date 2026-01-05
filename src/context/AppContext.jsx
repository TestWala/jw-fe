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
import goldLoanApi from "../api/goldLoanApi";
import settingsApi from "../api/settingsApi";

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

  const [metalPrices, setMetalPrices] = useState([]);
  const [settings, setSettings] = useState([]);

  const [goldLoans, setGoldLoans] = useState([]);
  const [goldLoanStats, setGoldLoanStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalAmount: 0,
    monthlyInterest: 0
  });

  /* ===============================
     HEADER METAL PRICES
  =============================== */
  const [headerPrices, setHeaderPrices] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("metal_header_prices");
    if (stored) setHeaderPrices(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("metal_header_prices", JSON.stringify(headerPrices));
  }, [headerPrices]);

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    reload();
  }, []);

  /* ===============================
     SETTINGS ONLY RELOAD
  =============================== */
  const reloadSettings = async () => {
    const res = await settingsApi.getAllSettings();
    if (res?.success) setSettings(res.data);
  };

  /* ===============================
     FULL RELOAD
  =============================== */
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
        metalPricesRes,
        goldLoansRes,
        settingsRes
      ] = await Promise.all([
        inventoryApi.getAllInventoryItems(),
        categoriesApi.getAllCategories(),
        purityApi.getAllPurity(),
        customerApi.getAllCustomers(),
        supplierApi.getAllSuppliers(),
        purchaseApi.getAllPurchaseOrders(),
        salesApi.getAllInvoices(),
        stockMovementApi.fetchAllStockMovements(),
        metalBasePriceApi.fetchActiveMetalPrices(),
        goldLoanApi.getAllLoans(),
        settingsApi.getAllSettings()
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
      if (settingsRes?.success) setSettings(settingsRes.data);

      if (goldLoansRes?.success) {
        setGoldLoans(goldLoansRes.data);

        const activeLoans = goldLoansRes.data.filter(l => l.status === "ACTIVE");
        setGoldLoanStats({
          totalLoans: goldLoansRes.data.length,
          activeLoans: activeLoans.length,
          totalAmount: activeLoans.reduce((s, l) => s + l.loanAmount, 0),
          monthlyInterest: activeLoans.reduce(
            (s, l) => s + (l.loanAmount * l.interestRate) / 100,
            0
          )
        });
      }

    } catch (error) {
      console.error("Context Load Error:", error);
    }
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
        goldLoans,
        goldLoanStats,

        headerPrices,
        setHeaderPrices,

        settings,
        setSettings,
        reloadSettings,
        reload
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
