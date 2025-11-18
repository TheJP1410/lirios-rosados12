import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRomanticMessage = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Genera una frase romántica o afectuosa MUY CORTA (máximo 3 o 4 palabras) para mostrar como un título gigante en 3D.
      Ejemplos: "Te Amo Mucho", "Eres mi Luz", "Para mi Amor", "Siempre Juntos".
      El tono debe ser dulce y sincero.
      Solo devuelve el texto limpio, sin comillas ni explicaciones.`,
    });
    
    return response.text?.trim() || "Eres mi Luz";
  } catch (error) {
    console.error("Error generating text:", error);
    return "Para Ti";
  }
};