import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = [
  import.meta.env.GEMINI_API_KEY,
  import.meta.env.GEMINI_API_KEY2,
  // Add more API keys here if available
];

let currentKeyIndex = 0;

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function getNextApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentKeyIndex];
}

function createGenAI() {
  const apiKey = apiKeys[currentKeyIndex];
  if (!apiKey) {
    console.error(`API key at index ${currentKeyIndex} is missing. Make sure it's set in your secrets.toml file.`);
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function translateToLanguage(text, targetLanguage) {
  let attempts = 0;
  const maxAttempts = apiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const genAI = createGenAI();
      if (!genAI) {
        throw new Error("Failed to create GoogleGenerativeAI instance");
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-002",
        systemInstruction: `Translate the text to ${targetLanguage}, no need to explain,  create 3 variation of translation itemize from 1 to 3, allow bad words or explicit words on the translation if there is any from the original text, just translate directly without any explanation`,
      });

      const chatSession = model.startChat({
        generationConfig,
      });

      const result = await chatSession.sendMessage(text);
      return result.response.text();
    } catch (error) {
      console.error('Error in translation:', error);
      
      if (error.message.includes("quota exceeded") || error.message.includes("rate limit")) {
        console.log(`API key exhausted. Switching to next key.`);
        getNextApiKey();
        attempts++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('All API keys exhausted. Please check your API keys and try again later.');
}
