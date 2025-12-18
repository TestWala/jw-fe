import axios from "axios";

const GOLD_API_KEY = "goldapi-d525smj8lx8hq-io";

const metalPriceApi = {

  fetchLatestMetalPrices: async () => {
    try {
      const response = await axios.get(
        "https://www.goldapi.io/api/XAU/INR",
        {
          headers: {
            "x-access-token": GOLD_API_KEY,
          },
        }
      );

      const goldPricePerGram = response.data.price_gram_24k;

      const silverResponse = await axios.get(
        "https://www.goldapi.io/api/XAG/INR",
        {
          headers: {
            "x-access-token": GOLD_API_KEY,
          },
        }
      );

      const silverPricePerGram = silverResponse.data.price_gram_24k;

      return {
        success: true,
        data: {
          gold: goldPricePerGram,
          silver: silverPricePerGram,
          currency: "INR",
          unit: "gram",
          source: "goldapi.io",
        },
      };
    } catch (error) {
      console.error("Gold API Error:", error.response?.data || error.message);
      return {
        success: false,
        error: "Unable to fetch metal prices",
      };
    }
  },
};

export default metalPriceApi;
