import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const categoriesApi = {

  createCategory: async (categoryData) => {
    try {
      const token = localStorage.getItem("accessToken");  
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_CATEGORY}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Create Category Error:", {
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

  getAllCategories: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_CATEGORIES}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get Categories Error:", {
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

export default categoriesApi;
