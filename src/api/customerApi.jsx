import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const customerApi = {

  createCustomer: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ADD_CUSTOMER}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      return { success: true, data: res.data };

    } catch (error) {
      console.error("Create Customer Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  getAllCustomers: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_All_CUSTOMERS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      return { success: true, data: res.data };

    } catch (error) {
      console.error("Get All Customers Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  getCustomerById: async (customerId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.GET_CUSTOMER_BY_ID(customerId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      return { success: true, data: res.data };

    } catch (error) {
      console.error("Get Customer By ID Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

};

export default customerApi;
