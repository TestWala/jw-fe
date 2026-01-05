import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";
 
const settingsApi = {

  /* =========================
     CREATE SETTING
  ========================= */
  createSetting: async (payload) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SETTINGS}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Create Setting Error:", {
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

  /* =========================
     UPDATE SETTING
  ========================= */
  updateSetting: async (payload) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_SETTING}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Update Setting Error:", {
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

  /* =========================
     GET SETTING BY KEY
  ========================= */
  getSettingByKey: async (key) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_SETTING_BY_KEY(key)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Get Setting By Key Error:", {
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

  /* =========================
     GET ALL ACTIVE SETTINGS
  ========================= */
  getAllSettings: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.SETTINGS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Get All Settings Error:", {
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

export default settingsApi;
