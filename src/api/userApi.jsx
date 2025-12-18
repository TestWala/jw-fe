import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const userApi = {

  registerUser: async (userData) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.RESIGTER_USER}`,
        userData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };

    } catch (error) {
      console.error("User Registration Error:", error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },
  getAllUsers: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_USERS}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get All Users Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch users",
      };
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_USERS}/${userId}`,
        userData,
        {
          headers: {  
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Update User Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update user",
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_USERS}/${userId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      return { success: true, data: res.data };
    }

    catch (error) {
      console.error("Get User By ID Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch user",
      };
    }
  },

};

export default userApi;
