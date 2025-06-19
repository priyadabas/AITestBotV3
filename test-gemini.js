import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Return only valid JSON: {\"test\": \"success\"}";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini response:", text);
    console.log("API key exists:", !!process.env.GEMINI_API_KEY);
    console.log("API key starts with AIza:", process.env.GEMINI_API_KEY?.startsWith('AIza'));
  } catch (error) {
    console.error("Gemini test error:", error);
  }
}

testGemini();