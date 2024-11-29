import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = [
  import.meta.env.GEMINI_API_KEY,
  //import.meta.env.GEMINI_API_KEY2,
  //import.meta.env.GEMINI_API_KEY3,
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

export async function translateToLanguage(text, targetLanguage, isGroupChat = false) {
  console.log('translateToLanguage - isGroupChat:', isGroupChat);
  let attempts = 0;
  const maxAttempts = apiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const genAI = createGenAI();
      if (!genAI) {
        throw new Error("Failed to create GoogleGenerativeAI instance");
      }

      const systemInstruction = isGroupChat
        ? `Translate the following text to ${targetLanguage}. Provide only the direct translation, no explanations or variations.`
        : `Translate the text to ${targetLanguage}, no need to explain, create 3 variation of translation itemize from 1 to 3, allow bad words or explicit words on the translation if there is any from the original text, just translate directly without any explanation`;

      console.log('Using prompt:', systemInstruction);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction,
      });

      const chatSession = model.startChat({
        generationConfig,
      });

      const result = await chatSession.sendMessage(text);
      const response = result.response.text();

      if (isGroupChat) {
        // For group chat, return just the direct translation
        return response.split('\n')[0].replace(/^\d+\.\s*/, '');
      } else {
        // For direct chat, return all variations
        const variations = response.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.\s*/, ''));
        
        // If we got less than 3 variations, duplicate the first one
        while (variations.length < 3) {
          variations.push(variations[0]);
        }

        return {
          messageVar1: variations[0],
          messageVar2: variations[1],
          messageVar3: variations[2],
          message: variations[0] // Set the first variation as the default message
        };
      }

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

export async function translateToMultipleLanguages(text, targetLanguages, isGroupChat = false) {
  const translations = {};
  
  const uniqueLanguages = [...new Set(targetLanguages)];
  
  await Promise.all(
    uniqueLanguages.map(async (language) => {
      try {
        const translation = await translateToLanguage(text, language, isGroupChat);
        translations[language] = isGroupChat ? translation : translation.message;
      } catch (error) {
        console.error(`Failed to translate to ${language}:`, error);
        translations[language] = text;
      }
    })
  );
  
  return translations;
}
