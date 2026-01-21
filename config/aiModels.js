import { ChatOpenAI } from "@langchain/openai";
// import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatGroq } from "@langchain/groq";
import {initChatModel} from "langchain";
import Replicate from "replicate";

// Free AI Models Configuration
export const models = {
  // For image analysis (vision) 
  vision: new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 2,
}),

  // For text generation (suggestions) - Using Hugging Face free models
  textGeneration:  new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 2,
}),

  // For image generation - Use Replicate (free tier available)
  imageGeneration: new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // Free tier: 50 predictions/month
  }),

//   imageGeneration: await initChatModel("black-forest-labs/flux.2-max",{
//   modelProvider: "openai",  // OpenAI provider (OpenRouter is compatible)
//   apiKey: process.env.OPENROUTER_API_KEY,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1"
//   }
//   }
// )
};

// Alternative: If you want fully free, use Together AI
export const freeModels = {
  textGeneration: new ChatOpenAI({
    modelName: "meta-llama/Llama-3-70b-chat-hf",
    temperature: 0.7,
    configuration: {
      baseURL: "https://api.together.xyz/v1",
      apiKey: process.env.TOGETHER_API_KEY, // Free $5 credits on signup
    },
  }),
};