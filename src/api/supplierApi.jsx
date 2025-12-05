// src/api/supplierApi.js

import axios from "axios";
import { API_BASE_URL,API_ENDPOINTS } from "./API_Endpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const supplierApi = {
   createSupplier: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.SUPPLIER, data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create Supplier Error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add supplier",
      };
    }
  },

   getAllSuppliers: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SUPPLIER);
      console.log("suppliers data ",res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get Suppliers Error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to load suppliers",
      };
    }
  },
};

export default supplierApi;
