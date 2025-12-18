import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

const supplierApi = {

  // ➤ Create Supplier
  createSupplier: async (data) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIER}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Create Supplier Error:", error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || "Failed to add supplier",
      };
    }
  },

  // ➤ Get All Suppliers
  getAllSuppliers: async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIER}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: res.data };
    } catch (error) {
      console.error("Get Suppliers Error:", error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || "Failed to load suppliers",
      };
    }
  },

};

export default supplierApi;
