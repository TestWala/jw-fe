import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const customerApi = {
  createCustomer: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADD_CUSTOMER, data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create Customer Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getAllCustomers: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_All_CUSTOMERS);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get All Customers Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getCustomerById: async (customerId) => {
    try {
      const res = await api.get(API_ENDPOINTS.GET_CUSTOMER_BY_ID(customerId));
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get Customer By ID Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
};

export default customerApi;
