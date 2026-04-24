import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function analyzeTrafficFine(fineData: any) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const prompt = `
    Como um assistente jurídico especializado em multas de trânsito brasileiras, analise os seguintes dados de um auto de infração:
    - Auto: ${fineData.auto}
    - Placa: ${fineData.placa}
    - Código: ${fineData.codigo}
    - Data/Hora: ${fineData.dataHora}

    Forneça uma análise técnica concisa incluindo:
    1. IA Insights (principais falhas formais possíveis).
    2. Nulidades Identificadas (Base legal e artigos).
    3. Probabilidade de sucesso (0-100).
    4. Ações recomendadas.

    Formate a resposta como um objeto JSON.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    // In a real app we'd parse JSON, here we return the extracted text
    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return null;
  }
}
