import  prisma  from '../config/db.js';
import { AIService } from "../services/aiService.js";
const aiService = new AIService();



// POST /api/projects/create - Upload image and get suggestions
const getSuggestions = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const { userId } = req.user; 

    // Create project record
    const project = await prisma.project.create({
      data: {
        imageUrl,
        userId: userId || null,
      },
    });
    // Analyze image with AI
    console.log("Analyzing image...");
    const analysis = await aiService.analyzeImage(imageUrl);

    // Generate suggestions
    console.log("Generating suggestions...");
    const suggestions = await aiService.generateSuggestions(analysis);

    // Save suggestions to database
    await prisma.suggestion.createMany({
      data: suggestions.map((s) => ({
        ...s,
        projectId: project.id,
      })),
    });

    // Return project with suggestions
    const projectWithSuggestions = await prisma.project.findUnique({
      where: { id: project.id },
      include: { suggestions: true },
    });

    res.json({
      success: true,
      project: projectWithSuggestions,
      analysis, // Include for reference
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({
      error: "Failed to create project",
      details: error.message,
    });
  }
}

// POST /api/projects/:id/generate - Generate final design
const generateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedSuggestionIds,imageUrlinput } = req.body;

    if (!selectedSuggestionIds || selectedSuggestionIds.length === 0) {
      return res.status(400).json({ error: "No suggestions selected" });
    }

    // Get project and suggestions
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        suggestions: {
          where: {
            id: { in: selectedSuggestionIds },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Analyze original image again for context
    console.log("Re-analyzing original image...");
    const originalAnalysis = await aiService.analyzeImage(imageUrlinput);

    // Generate new design
    console.log("Generating new design image...");
    const { imageUrl, prompt } = await aiService.generateDesignImage(
      originalAnalysis,
      project.suggestions
    );

    // Save generated design
    const generatedDesign = await prisma.generatedDesign.create({
      data: {
        imageUrl,
        prompt,
        projectId: project.id,
      },
    });

    // Mark selected suggestions
    await prisma.suggestion.updateMany({
      where: {
        id: { in: selectedSuggestionIds },
      },
      data: {
        isSelected: true,
      },
    });

    res.json({
      success: true,
      design: generatedDesign,
    });
  } catch (error) {
    console.error("Design generation error:", error);
    res.status(500).json({
      error: "Failed to generate design",
      details: error.message,
    });
  }
}

// GET /api/projects/:projectId - Get project details
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
     const { userId } = req.user;
    const project = await prisma.project.findUnique({
      where: { id:projectId, userId },
      include: {
        suggestions: true,
        generated: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("Fetch project error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
}


const getUserProjects = async (req, res) => {
  try {
     const { userId } = req.user;
    const project = await prisma.project.findUnique({
      where: { userId },
      include: {
        imageUrl,
          orderBy: { createdAt: "desc" },
      },
    });
    if (!project) {
      return res.status(404).json({ error: "No projects found" });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("Fetch project error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
}


export { getSuggestions, generateImage,getProjectDetails,getUserProjects };