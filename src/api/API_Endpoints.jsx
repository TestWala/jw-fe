// export const API_BASE_URL = "http://localhost:8080/api";
export const API_BASE_URL = "https://jw-be.onrender.com/api";


export const API_ENDPOINTS = {
    LOGIN_USER: "/auth/login",

    REGISTER_USER: "/user/register",
    GET_ALL_USERS: "/user",
    
    ADD_INVENTORY_ITEM: `/inventory-item`,
    GET_INVENTORY_ITEMS: "/inventory-item",
    UPDATE_INVENTORY_ITEM: `/inventory-item`,

    CREATE_CATEGORY: `/categories`,
    GET_ALL_CATEGORIES: "/categories",

    GET_ALL_PURITY: "/purity",

    ADD_SALES_INVOICE: `/sale/invoice`,
    GET_ALL_SALES_INVOICES: "/sale/invoices",
    GET_SALES_INVOICE_BY_ID: (invoiceId) => `/sale/${invoiceId}`,

    ADD_CUSTOMER: `/customers`,
    GET_All_CUSTOMERS: `/customers`,
    GET_CUSTOMER_BY_ID: (customerId) => `/customers/${customerId}`,

    
    CREATE_PURCHASE_ORDER: `/purchase-orders`,
    GET_ALL_PURCHASE_ORDERS: "/purchase-orders",
    GET_PURCHASE_ORDER_BY_ID: (id) => `/purchase-orders/${id}`,
    
    SUPPLIER: "/supplier",
    
    STOCK_MOVEMENTS: "/history"
};
