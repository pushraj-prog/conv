
import { GoogleGenAI } from "@google/genai";
import { RateDataResponse, ExchangeRates, GroundingSource } from "../types.ts";

export const fetchCurrentRates = async (): Promise<RateDataResponse> => {
  // Use the pre-configured environment variable directly
  const apiKey = process.env.API_KEY || "";
  
  // We no longer throw here to allow the UI to handle the connection state 
  // and provide the AI Studio key selector if needed.
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Provide the current exchange rates for these pairs:
    - 1 USD to EUR
    - 1 USD to JPY
    - 1 USD to INR
    - 1 EUR to JPY
    
    Format the results exactly as "USD/EUR: [value]", "USD/JPY: [value]", etc.
    Include a 2-sentence summary of the current market trend for these currencies.
    
    Today's date: ${new Date().toISOString()}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Market Source",
        uri: chunk.web?.uri || "#"
      }));

    const extractRate = (from: string, to: string, defaultVal: number): number => {
      const patterns = [
        new RegExp(`${from}\\/${to}[:\\s]+(\\d+\\.?\\d*)`, 'i'),
        new RegExp(`${from}\\sto\\s${to}[:\\s]+(\\d+\\.?\\d*)`, 'i'),
        new RegExp(`1\\s*${from}\\s*=\\s*(\\d+\\.?\\d*)`, 'i')
      ];
      
      for (const regex of patterns) {
        const match = text.match(regex);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (!isNaN(val) && val > 0) return val;
        }
      }
      return defaultVal;
    };

    const rates: ExchangeRates = {
      USD_EUR: extractRate('USD', 'EUR', 0.92),
      USD_JPY: extractRate('USD', 'JPY', 150.5),
      USD_INR: extractRate('USD', 'INR', 83.3),
      EUR_JPY: extractRate('EUR', 'JPY', 163.2),
      lastUpdated: new Date().toISOString(),
    };

    return {
      rates,
      summary: text,
      sources
    };
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    // If it's a key-related error, propagate it so the UI can show the Connect button
    const errorMsg = error.message?.toLowerCase() || "";
    if (errorMsg.includes("api key") || errorMsg.includes("403") || errorMsg.includes("401") || errorMsg.includes("not found")) {
      throw new Error("API_KEY_REQUIRED");
    }

    // Standard fallback for other transient network issues
    return {
      rates: {
        USD_EUR: 0.92,
        USD_JPY: 150.5,
        USD_INR: 83.3,
        EUR_JPY: 163.2,
        lastUpdated: new Date().toISOString()
      },
      summary: "Currently displaying market estimates. Connect your API key for real-time grounded data.",
      sources: []
    };
  }
};
