import axios from "axios";
import { API_BASE_URL,API_ENDPOINTS } from "./API_Endpoints";

export const purchaseApi = {

  // ➤ Create Purchase Order
  createPurchaseOrder: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_PURCHASE_ORDER}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };
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
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_PURCHASE_ORDERS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, data: response.data };
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
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_PURCHASE_ORDER_BY_ID(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, data: response.data };
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
