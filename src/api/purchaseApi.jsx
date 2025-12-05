import axios from "axios";
import { API_BASE_URL } from "./API_Endpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const purchaseApi = {
  // ➤ Create Purchase Order
  createPurchaseOrder: async (userId, data) => {
    try {
      const res = await api.post(
        `/purchase-orders?userId=${userId}`,
        data
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create PO Error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create purchase order",
      };
    }
  },

  // ➤ Get All Purchase Orders
  getAllPurchaseOrders: async () => {
    try {
      const res = await api.get(`/purchase-orders`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get All PO Error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to load purchase orders",
      };
    }
  },

  // ➤ Get Purchase Order by ID
  getPurchaseOrderById: async (id) => {
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get PO Error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Purchase order not found",
      };
    }
  },
};

export default purchaseApi;
