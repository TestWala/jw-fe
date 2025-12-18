import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS} from "./API_Endpoints";

const stockMovementApi = {

    fetchAllStockMovements: async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.STOCK_MOVEMENTS}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching stock movements:", error);
            throw error;
        }
    }
}

export default stockMovementApi;