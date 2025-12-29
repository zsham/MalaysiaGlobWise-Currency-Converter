
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialInsights = async (from: string, to: string, amount: number, rate: number) => {
  const ai = getAI();
  const prompt = `
    Analyze the currency exchange from ${from} to ${to}.
    Current rate: 1 ${from} = ${rate} ${to}.
    User is converting: ${amount} ${from}.
    
    Format your response in simple Markdown with these sections:
    
    ### 🎯 The Verdict
    Give a 1-sentence recommendation (e.g., "Historically strong time to convert" or "Consider waiting for a better rate").
    
    ### 📈 Market Pulse
    Briefly describe the current trend for this pair in 2-3 sentences.
    
    ### 💡 Pro Tip
    One smart piece of advice or an interesting economic fact related to these specific currencies.
    
    Keep it professional, human-like, and highly actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 600,
      }
    });
    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Financial insights are currently unavailable.";
  }
};
