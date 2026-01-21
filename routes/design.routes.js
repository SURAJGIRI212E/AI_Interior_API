import express from "express";
// import multer from "multer";
import authmiddleware from '../middlewares/auth.middleware.js';
import { getSuggestions, generateImage,getProjectDetails,getUserProjects } from "../controllers/design.controller.js";

const router = express.Router();


// Configure multer for file uploads
// const upload = multer({ storage: multer.memoryStorage() });

// POST /api/projects/create - Upload image and get suggestions
router.post("/create", authmiddleware, getSuggestions);

// POST /api/projects/:id/generate - Generate final design
router.post("/:id/generate",authmiddleware, generateImage);

// GET /api/projects/:id - Get project details
router.get("/:id",authmiddleware, getProjectDetails);

// GET /api/projects - Get all projects for a user
router.get("/user",authmiddleware, getUserProjects);

export default router;
