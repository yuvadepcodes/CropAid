import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeLeafImage(base64Data: string): Promise<AnalysisResult> {
  const ai = getAI();
  
  const prompt = `
    Analyze this image of a plant leaf. Identify the crop type and detect if there is any disease. 
    Focus on common agricultural crops in India (Rice, Wheat, Potato, Tomato, Corn, etc.).
    Provide a detailed diagnosis including the crop type, disease name, confidence score (0-1), health status (healthy, warning, or critical), a plain-language description, and actionable remedies.
    
    If the image is not of a plant leaf, or is too blurry, indicate that in the description and suggest a retake. Use "Unknown" for cropType and diseaseName if they cannot be identified.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data.split(',')[1] || base64Data, // Handle data URL or raw base64
              mimeType: "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropType: { type: Type.STRING },
            diseaseName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            healthStatus: { 
              type: Type.STRING,
              enum: ["healthy", "warning", "critical"]
            },
            description: { type: Type.STRING },
            remedies: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["cropType", "diseaseName", "confidence", "healthStatus", "description", "remedies"]
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
