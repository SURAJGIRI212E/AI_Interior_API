import { models } from "../config/aiModels.js";
import { PROMPTS } from "../utils/promptTemplates.js";
import { HumanMessage } from "@langchain/core/messages";

export class AIService {
  // Step 1: Analyze uploaded image
  async analyzeImage(imageUrl) {
    try {
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: PROMPTS.analyzeImage,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      });

      const response = await models.vision.invoke([message]);
      
      // Parse JSON from response
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from vision model response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Image analysis error:", error);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  // Step 2: Generate suggestions based on analysis
  async generateSuggestions(roomAnalysis) {
    try {
      const prompt = PROMPTS.generateSuggestions(roomAnalysis);
      
      const response = await models.textGeneration.invoke(prompt);
      
      // Clean response and parse JSON
      let content = response.content || response;
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      // Extract JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Failed to extract JSON from suggestions response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error("Invalid suggestions format");
      }

      return parsed.suggestions;
    } catch (error) {
      console.error("Suggestions generation error:", error);
      throw new Error(`Suggestions generation failed: ${error.message}`);
    }
  }

  // Step 3: Generate new interior image
  async generateDesignImage(originalAnalysis, selectedSuggestions) {
    try {
      // First, create the image prompt
      const promptResponse = await models.textGeneration.invoke(
        PROMPTS.generateImagePrompt(originalAnalysis, selectedSuggestions)
      );

      let content = promptResponse.content || promptResponse;
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const promptData = JSON.parse(jsonMatch[0]);

      // Generate image using Stable Diffusion on Replicate
      const output = await models.imageGeneration.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: promptData.imagePrompt,
            negative_prompt: promptData.negativePrompt,
            width: 1024,
            height: 768,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }
      );

      // const output = await models.imageGeneration.invoke({
      //   prompt: promptData.imagePrompt,
      //   negative_prompt: promptData.negativePrompt, 
      // })



      return {
        imageUrl: output[0],
        prompt: promptData.imagePrompt,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}