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

};
