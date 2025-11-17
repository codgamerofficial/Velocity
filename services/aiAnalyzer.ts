
import { GoogleGenAI } from "@google/genai";
import { TestResult } from "../types";

export const analyzeNetworkResult = async (result: TestResult): Promise<string> => {
  try {
    // Note: API_KEY is injected via process.env.API_KEY as per instructions
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as a senior network engineer. Analyze the following internet connection test result and provide a concise, professional report.
      
      **Metrics:**
      - Download Speed: ${result.downloadSpeed.toFixed(2)} Mbps
      - Upload Speed: ${result.uploadSpeed.toFixed(2)} Mbps
      - Ping (Latency): ${result.ping} ms
      - Jitter: ${result.jitter} ms
      - Packet Loss: ${result.packetLoss.toFixed(2)} %
      - Connection Type: ${result.networkType} ${result.isWifi6E ? '(Wi-Fi 6E Detected)' : ''}
      - Server: ${result.serverLocation}
      - Provider: ${result.provider || 'Unknown'}
      
      **Please provide:**
      1. **Overall Rating** (Poor/Fair/Good/Excellent/Pro-Grade).
      2. **Use Case Suitability**: Can this handle 4K streaming, competitive gaming (FPS), large file uploads, or Zoom calls?
      3. **Potential Bottlenecks**: Based on the jitter/ping/loss ratio.
      4. **Technical Recommendation**: One specific tip to improve this specific connection.

      Format the output in clean Markdown. Keep it under 150 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Unable to generate AI analysis at this time. Please check your API configuration or internet connection.";
  }
};
