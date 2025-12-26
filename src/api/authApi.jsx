import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./API_Endpoints";

export const authApi = {

    loginuser: async (credentials) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.LOGIN_USER}`,
                credentials,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error("Login Error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });

            return {
                success: false,
                error: error.response?.data?.message || "Login failed",
            };
        }
    },

    validateAccessToken: async () => {
        try {
            const token = localStorage.getItem("accessToken");
            
            const response = await axios.get(
                `${API_BASE_URL}${API_ENDPOINTS.VALIDATE_ACCESS_TOKEN}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // backend returns boolean (true / false)
            return { success: true, isValid: response.data };

        } catch (error) {
            console.error("Token Validation Error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });

            return { success: false, isValid: false };
        }
    },

};
