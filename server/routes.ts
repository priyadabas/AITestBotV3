import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { fileProcessor } from "./services/fileProcessor";
import { insertProjectSchema, insertUploadSchema, insertAnalysisResultSchema, insertTestScenarioSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // File uploads
  app.post("/api/projects/:projectId/uploads/prd", upload.single("file"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const processedFile = await fileProcessor.processPRD(req.file.path, req.file.originalname);
      
      const uploadData = {
        projectId,
        type: "prd",
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileUrl: req.file.path,
        metadata: processedFile.metadata,
      };

      const upload = await storage.createUpload(uploadData);

      // Start AI analysis
      const analysisResult = await storage.createAnalysisResult({
        projectId,
        type: "prd_analysis",
        status: "in_progress",
        progress: 0,
        results: null,
        insights: null,
      });

      // Perform AI analysis in background
      setTimeout(async () => {
        try {
          const analysis = await openaiService.analyzePRD(processedFile.content);
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "completed",
            progress: 100,
            results: analysis,
          });
        } catch (error) {
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "failed",
            progress: 0,
          });
        }
      }, 1000);

      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload PRD file" });
    }
  });

  app.post("/api/projects/:projectId/uploads/figma", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ message: "Figma URL is required" });
      }

      const processedFile = await fileProcessor.processFigmaURL(url);
      
      const uploadData = {
        projectId,
        type: "figma",
        fileName: "figma-design",
        fileSize: 0,
        fileUrl: url,
        metadata: processedFile.metadata,
      };

      const upload = await storage.createUpload(uploadData);

      // Start design analysis
      const analysisResult = await storage.createAnalysisResult({
        projectId,
        type: "design_analysis",
        status: "in_progress",
        progress: 0,
        results: null,
        insights: null,
      });

      // Perform AI analysis in background
      setTimeout(async () => {
        try {
          const analysis = await openaiService.analyzeDesign(processedFile.content);
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "completed",
            progress: 100,
            results: analysis,
          });
        } catch (error) {
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "failed",
            progress: 0,
          });
        }
      }, 2000);

      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to process Figma URL" });
    }
  });

  app.post("/api/projects/:projectId/uploads/code", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { repoUrl } = req.body;

      if (!repoUrl) {
        return res.status(400).json({ message: "Repository URL is required" });
      }

      const processedFile = await fileProcessor.processCodeRepository(repoUrl);
      
      const uploadData = {
        projectId,
        type: "code",
        fileName: "code-repository",
        fileSize: 0,
        fileUrl: repoUrl,
        metadata: processedFile.metadata,
      };

      const upload = await storage.createUpload(uploadData);

      // Start code analysis
      const analysisResult = await storage.createAnalysisResult({
        projectId,
        type: "code_analysis",
        status: "in_progress",
        progress: 0,
        results: null,
        insights: null,
      });

      // Perform AI analysis in background
      setTimeout(async () => {
        try {
          const analysis = await openaiService.analyzeCode(processedFile.content);
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "completed",
            progress: 100,
            results: analysis,
          });
        } catch (error) {
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "failed",
            progress: 0,
          });
        }
      }, 3000);

      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to process code repository" });
    }
  });

  // Analysis results
  app.get("/api/projects/:projectId/analysis", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const results = await storage.getAnalysisResultsByProject(projectId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analysis results" });
    }
  });

  // Generate test scenarios
  app.post("/api/projects/:projectId/generate-scenarios", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const analysisResults = await storage.getAnalysisResultsByProject(projectId);

      const prdAnalysis = analysisResults.find(r => r.type === "prd_analysis" && r.status === "completed");
      const designAnalysis = analysisResults.find(r => r.type === "design_analysis" && r.status === "completed");
      const codeAnalysis = analysisResults.find(r => r.type === "code_analysis" && r.status === "completed");

      if (!prdAnalysis) {
        return res.status(400).json({ message: "PRD analysis not completed" });
      }

      const scenarios = await openaiService.generateTestScenarios(
        prdAnalysis.results as any,
        designAnalysis?.results as any || {},
        codeAnalysis?.results as any || {}
      );

      const createdScenarios = await Promise.all(
        scenarios.map(scenario =>
          storage.createTestScenario({
            projectId,
            ...scenario,
            actualResults: null,
          })
        )
      );

      // Generate AI insights
      const insights = await openaiService.generateInsights(
        prdAnalysis.results as any,
        designAnalysis?.results as any || {},
        codeAnalysis?.results as any || {}
      );

      // Store insights in a general analysis result
      await storage.createAnalysisResult({
        projectId,
        type: "ai_insights",
        status: "completed",
        progress: 100,
        results: null,
        insights: insights,
      });

      res.json(createdScenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate test scenarios" });
    }
  });

  // Test scenarios
  app.get("/api/projects/:projectId/scenarios", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const scenarios = await storage.getTestScenariosByProject(projectId);
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test scenarios" });
    }
  });

  // AI insights
  app.get("/api/projects/:projectId/insights", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const analysisResults = await storage.getAnalysisResultsByProject(projectId);
      const insightsResult = analysisResults.find(r => r.type === "ai_insights");
      res.json(insightsResult?.insights || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
