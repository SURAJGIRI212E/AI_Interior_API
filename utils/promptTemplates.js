export const PROMPTS = {
  // Step 1: Analyze the uploaded image
  analyzeImage: `You are a Professional Interior Designer with 20 years of experience.

TASK: Analyze this room image and describe it in detail.

Provide:
1. Room type (bedroom, living room, kitchen, etc.)
2. Current style (modern, traditional, minimalist, etc.)
3. Existing furniture and layout
4. Lighting conditions
5. Color scheme
6. Problems or areas for improvement

Be specific and detailed. Focus on what you SEE in the image.

Output format:
{
  "roomType": "living room",
  "currentStyle": "modern minimalist",
  "existingItems": ["white sofa", "wooden coffee table", "floor lamp"],
  "layout": "L-shaped seating area facing window",
  "lighting": "natural light from large window, one floor lamp",
  "colorScheme": "neutral whites and beiges with wooden accents",
  "issues": ["lacks warmth", "empty wall space", "harsh lighting"]
}`,

  // Step 2: Generate improvement suggestions
generateSuggestions: (roomAnalysis) => `You are a Senior Interior Architect.

CONTEXT:
Room Analysis: ${JSON.stringify(roomAnalysis, null, 2)}

TASK: Suggest 5-8 realistic improvements to enhance this space.

RULES:
1. Be SPECIFIC (not "add art" but "add a 60x40 inch abstract canvas in warm earth tones")
2. Focus on achievable changes
3. Mix budget levels (DIY to furniture purchases)
4. Target "Modern Warm Minimalist" aesthetic
5. Keep the room layout similar - don't suggest major structural changes

Output ONLY valid JSON (no markdown, no extra text):
{
  "suggestions": [
    {
      "title": "Specific Item Name",
      "description": "Detailed, actionable description with dimensions and placement",
      "category": "layout|lighting|color|decor",
      "impact": "high|medium|low",
      "cost": "$|$$|$$$"
    }
  ]
}`,

  // Step 3: Generate image creation prompt
generateImagePrompt: (originalAnalysis, selectedSuggestions) => `You are an Architectural Visualization Expert.

Create a detailed prompt for an AI image generator (Stable Diffusion / DALL-E).

ORIGINAL ROOM:
${JSON.stringify(originalAnalysis, null, 2)}

CHANGES TO APPLY:
${selectedSuggestions.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}

TASK: Write a single paragraph describing the NEW room design.

REQUIREMENTS:
- Maintain the same room layout and structure
- Incorporate ALL selected changes naturally
- Use photorealistic keywords: "8k, architectural photography, professional interior design, soft natural lighting, highly detailed textures, realistic materials"
- Describe camera angle matching original
- Keep the description under 400 words

Output format:
{
  "imagePrompt": "Your detailed prompt here",
  "negativePrompt": "blurry, unrealistic, cartoon, sketch, low quality, distorted, bad proportions"
}`,
};