import { GoogleGenAI } from "@google/genai";

export interface FilePart {
  inlineData: {
    data: string; // base64
    mimeType: string;
  };
}

const model = "gemini-2.5-flash";

export const run = async (
  apiKey: string,
  prompt: string,
  file?: FilePart
): Promise<{ response: string } | { error: string }> => {
  try {
    if (!apiKey || typeof apiKey !== 'string') {
      return { error: 'Missing API key. Please provide a valid Gemini API key.' };
    }

    const ai = new GoogleGenAI({ apiKey });
    const contents = file ? { parts: [{ text: prompt }, file] } : prompt;
    const systemInstruction = file
      ? "You are an AI assistant specializing in analyzing PDF documents and Mill Test Reports (MTRs). When a PDF of an MTR is provided, your primary task is to analyze its content and extract key information such as Product Description, Heat Number, Mechanical Properties, and Chemical Properties. Present the extracted information in a clear, structured, and easy-to-read format. If the user asks a question about the PDF, answer it concisely."
      : "You are an AI assistant specializing in Mill Test Reports (MTRs). Your primary task is to analyze text from an MTR and extract key information such as Product Description, Heat Number, Mechanical Properties, and Chemical Properties. Present the extracted information in a clear, structured, and easy-to-read format. If the user asks a general question about MTRs, answer it concisely.";

    const result = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
      },
    });

    const response = result.text;
    return { response };
  } catch (error) {
    console.error("Error running chat:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: `Failed to communicate with the Gemini API. ${errorMessage}` };
  }
};
