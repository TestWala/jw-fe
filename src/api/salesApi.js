import axios from "axios";
import { API_BASE_URL } from "./API_Endpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const salesApi = {
  // ➤ CREATE SALES INVOICE
  createInvoice: async (invoiceData, userId) => {
    try {
      const res = await api.post(`/sales/invoice?userId=${userId}`, invoiceData);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create Invoice Error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // ➤ GET ALL SALES INVOICES
  getAllInvoices: async () => {
    try {
      const res = await api.get(`/sales/invoices`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Fetch All Invoices Error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // ➤ GET INVOICE BY ID
  getInvoiceById: async (invoiceId) => {
    try {
      const res = await api.get(`/sales/${invoiceId}`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Fetch Invoice By ID Error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
};

export default salesApi;
