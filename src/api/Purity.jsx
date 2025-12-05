import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllPurity = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_ALL_PURITY);
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
};