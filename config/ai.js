import { initChatModel } from "langchain/chat_models/universal";
import { ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import dotenv from 'dotenv';
dotenv.config();

// 1. Universal Chat Model (Vision Capable) input image and text, output text capable model

// export const getChatModel = async () => {
//   return await initChatModel("nvidia/nemotron-nano-12b-v2-vl:free", {
//     modelProvider: "openai",  // OpenAI provider (OpenRouter is compatible)
//   apiKey: process.env.OPENROUTER_API_KEY,
//   temperature:0.2,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1"
//   }
//   });
// };

export const getChatModel = async () => {
  return  new ChatOpenAI({
    modelName: "nvidia/nemotron-nano-12b-v2-vl:free",
    temperature: 0.2,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      // OpenRouter sometimes requires these headers to avoid 403/400 errors
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Replace with your site URL
        "X-Title": "Interior Design AI",
      },
    },
  });
};

// 2. Image Generator (DALL-E 3) input text and image, output image capable model
export const imageGenerator = new DallEAPIWrapper({
  n: 1,
  model: "dall-e-3",
  size: "1024x1024",
  quality: "hd", // HD is crucial for realism
  style: "natural", // 'natural' prevents the 'cartoon/AI' look
  apiKey: process.env.OPENAI_API_KEY
});