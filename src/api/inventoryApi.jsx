import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========== API FUNCTIONS ==========
export const addInventoryItem = async (userId, data) => {
  try {
    const url = API_ENDPOINTS.ADD_INVENTORY_ITEM(userId);

    const response = await api.post(url, data);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Add Inventory Item Error:", error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};


export const getInventoryItems = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_INVENTORY_ITEMS);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get Inventory Items Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Default export (optional utility style)
const inventoryApi = { addInventoryItem, getInventoryItems };
export default inventoryApi;
