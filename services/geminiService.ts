
import { GoogleGenAI } from "@google/genai";
import { RateDataResponse, ExchangeRates, GroundingSource } from "../types.ts";

export const fetchCurrentRates = async (): Promise<RateDataResponse> => {
  // MUST use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Provide the current exchange rates for these pairs:
    - 1 USD to EUR
    - 1 USD to JPY
    - 1 USD to INR
    
    Return the data in a clear format. 
    Also include a 1-sentence summary of the current FX market sentiment.
    
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
      USD_EUR: extractRate('USD', 'EUR', 0.94),
      USD_JPY: extractRate('USD', 'JPY', 151.2),
      USD_INR: extractRate('USD', 'INR', 83.5),
      EUR_JPY: extractRate('EUR', 'JPY', 160.5),
      lastUpdated: new Date().toISOString(),
    };

    return {
      rates,
      summary: text,
      sources
    };
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    // Fallback to static estimated rates if search fails
    return {
      rates: {
        USD_EUR: 0.94,
        USD_JPY: 151.2,
        USD_INR: 83.5,
        EUR_JPY: 160.5,
        lastUpdated: new Date().toISOString()
      },
      summary: "Real-time rates currently unavailable. Showing latest estimated market values.",
      sources: []
    };
  }
};
