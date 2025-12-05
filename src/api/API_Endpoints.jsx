// apiConfig.js

export const API_BASE_URL = "http://localhost:8080/api";

export const API_ENDPOINTS = {
    ADD_INVENTORY_ITEM: (userId) => `/inventory-item?userId=${userId}`,
    GET_INVENTORY_ITEMS: "/inventory-item",

    GET_ALL_CATEGORIES: "/categories",
    GET_ALL_PURITY: "/purity",

    GET_USER_BY_ROLE: `/user/role/admin`,

    ADD_SALES_INVOICE: "/sales/invoice",

    ADD_CUSTOMER: `/customers`,
    GET_All_CUSTOMERS: `/customers`,
    GET_CUSTOMER_BY_ID: (customerId) => `/customers/${customerId}`,

    
    SUPPLIER: "/supplier",
    CREATE_PURCHASE_ORDER:(userId) => `/purchase-orders?userId=${userId}`,
    GET_ALL_PURCHASE_ORDERS: "/purchase-orders",
};
