import axios from "axios";
import { API_BASE_URL,API_ENDPOINTS } from "./API_Endpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const userApi = {

  // ➤ GET USERS BY ROLE
  getUsersByRole: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_USER_BY_ROLE);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get Users By Role Error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

};

export default userApi;
