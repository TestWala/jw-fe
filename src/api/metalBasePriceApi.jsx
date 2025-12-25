import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const metalBasePriceApi = {

  fetchActiveMetalPrices: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.METAL_BASE_PRICES}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Fetch Active Metal Prices Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // ============================
  // UPDATE METAL BASE PRICE
  // ============================
  updateMetalPrices: async (updateData) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_METAL_BASE_PRICES}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Update Metal Prices Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default metalBasePriceApi;
