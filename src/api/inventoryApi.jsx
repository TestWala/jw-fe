import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const inventoryApi = {

  addInventoryItem: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ADD_INVENTORY_ITEM}`,
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
      console.error("Add Inventory Item Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAllInventoryItems: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_INVENTORY_ITEMS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get Inventory Items Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateInventoryItem: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_INVENTORY_ITEM}`,
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
      console.error("Update Inventory Item Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  deleteInventoryItem: async (itemId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DELETE_INVENTORY_ITEM(itemId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return { success: true, data: response.data };
    }
    catch (error) {
      console.error("Delete Inventory Item Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

};

export default inventoryApi;
