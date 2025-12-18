import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS} from "./API_Endpoints";

const salesApi = {

  // ➤ CREATE SALES INVOICE
  createInvoice: async (invoiceData) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ADD_SALES_INVOICE}`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create Invoice Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // ➤ GET ALL SALES INVOICES
  getAllInvoices: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_SALES_INVOICES}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Fetch All Invoices Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // ➤ GET INVOICE BY ID
  getInvoiceById: async (invoiceId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_SALES_INVOICE_BY_ID(invoiceId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Fetch Invoice By ID Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

};

export default salesApi;
