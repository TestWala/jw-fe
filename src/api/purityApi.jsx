import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const purityApi = {

  getAllPurity: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_PURITY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Get Purity Error:", {
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

export default purityApi;
