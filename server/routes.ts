import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { geminiService } from "./services/gemini";
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
  app.post("/api/projects/:projectId/upload/prd", upload.single("file"), async (req, res) => {
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
          const analysis = await geminiService.analyzePRD(processedFile.content);
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "completed",
            progress: 100,
            results: analysis,
          });
        } catch (error) {
          console.error("Gemini API error:", error);
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "failed",
            progress: 0,
            results: { error: (error as Error).message }
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
          const analysis = await geminiService.analyzeDesign(processedFile.content);
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
          const analysis = await geminiService.analyzeCode(processedFile.content);
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

  // Generate basic test scenarios (PRD only)
  app.post("/api/projects/:projectId/generate-scenarios", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const analysisResults = await storage.getAnalysisResultsByProject(projectId);

      const prdAnalysis = analysisResults.find(r => r.type === "prd_analysis" && r.status === "completed");
      const designAnalysis = analysisResults.find(r => r.type === "design_analysis" && r.status === "completed");

      if (!prdAnalysis) {
        return res.status(400).json({ message: "PRD analysis is required for test case generation" });
      }

      const scenarios = await geminiService.generateTestScenarios(
        prdAnalysis.results as any,
        designAnalysis?.results as any || {},
        {
          architecture: "",
          technologies: [],
          endpoints: [],
          components: [],
          testCoverage: "",
          codeQuality: ""
        }
      );

      const createdScenarios = await Promise.all(
        scenarios.map((scenario: any) =>
          storage.createTestScenario({
            projectId,
            ...scenario,
            actualResults: null,
          })
        )
      );

      // Generate AI insights
      const insights = await geminiService.generateInsights(
        prdAnalysis.results as any,
        designAnalysis?.results as any || {},
        {
          architecture: "",
          technologies: [],
          endpoints: [],
          components: [],
          testCoverage: "",
          codeQuality: ""
        }
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

  // Create manual test scenario
  app.post("/api/projects/:projectId/scenarios", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const scenarioData = insertTestScenarioSchema.parse({
        projectId,
        ...req.body
      });

      const scenario = await storage.createTestScenario(scenarioData);
      res.status(201).json(scenario);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid test scenario data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test scenario" });
    }
  });

  // Update test scenario
  app.put("/api/projects/:projectId/scenarios/:scenarioId", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.scenarioId);
      const updates = req.body;

      const scenario = await storage.updateTestScenario(scenarioId, updates);
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to update test scenario" });
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

  // Demo endpoint to populate sample data
  app.post("/api/projects/:projectId/demo", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);

      // Create sample analysis results
      const prdAnalysis = await storage.createAnalysisResult({
        projectId,
        type: "prd_analysis",
        status: "completed",
        progress: 100,
        results: {
          requirements: ["User authentication system", "Product catalog with search", "Shopping cart functionality", "Secure payment processing", "Order tracking system"],
          userStories: ["As a customer, I want to browse products", "As a customer, I want to add items to cart", "As a customer, I want to checkout securely"],
          acceptanceCriteria: ["Users can complete purchase in under 3 minutes", "Payment success rate > 99%", "App works on iOS 14+ and Android 10+"],
          functionalRequirements: ["User login/signup", "Product search and filtering", "Cart management", "Payment integration"],
          nonFunctionalRequirements: ["2 second load time", "1000+ concurrent users", "99.9% uptime", "HTTPS encryption"],
          riskAreas: ["Payment security", "User data privacy", "Performance under load", "Mobile compatibility"]
        },
        insights: null,
      });

      const designAnalysis = await storage.createAnalysisResult({
        projectId,
        type: "design_analysis",
        status: "completed",
        progress: 100,
        results: {
          components: ["Navigation bar", "Product grid", "Cart sidebar", "Checkout form", "User profile"],
          userFlows: ["Product discovery", "Add to cart", "Checkout process", "Order confirmation"],
          accessibilityIssues: ["Missing alt text on product images", "Insufficient color contrast"],
          responsiveDesign: true,
          designPatterns: ["Material Design", "Card-based layout", "Progressive disclosure"]
        },
        insights: null,
      });

      const codeAnalysis = await storage.createAnalysisResult({
        projectId,
        type: "code_analysis",
        status: "completed",
        progress: 100,
        results: {
          architecture: "React Native with Redux state management",
          technologies: ["React Native", "Redux", "Express.js", "MongoDB", "Stripe API"],
          endpoints: ["/api/auth", "/api/products", "/api/cart", "/api/orders", "/api/payments"],
          components: ["ProductList", "CartManager", "CheckoutFlow", "UserAuth"],
          testCoverage: "65% - needs improvement in payment flow tests",
          codeQuality: "Good - follows React Native best practices with some optimization opportunities"
        },
        insights: null,
      });

      // Generate sample test scenarios
      const scenarios = [
        {
          title: "User Registration and Login Flow",
          description: "Test complete user onboarding process including registration, email verification, and login",
          priority: "high",
          type: "functional",
          steps: ["Navigate to signup page", "Enter valid user details", "Verify email", "Login with credentials"],
          expectedResults: "User successfully registers and logs in",
          actualResults: null,
          status: null,
        },
        {
          title: "Product Search and Filtering",
          description: "Verify product search functionality and category filtering works correctly",
          priority: "high",
          type: "functional",
          steps: ["Enter search term", "Apply category filter", "Sort by price", "Verify results"],
          expectedResults: "Relevant products displayed with correct sorting and filtering",
          actualResults: null,
          status: null,
        },
        {
          title: "Shopping Cart Management",
          description: "Test adding, removing, and modifying items in shopping cart",
          priority: "medium",
          type: "functional",
          steps: ["Add product to cart", "Modify quantity", "Remove item", "View cart total"],
          expectedResults: "Cart updates correctly with accurate pricing",
          actualResults: null,
          status: null,
        },
        {
          title: "Payment Processing Flow",
          description: "Test secure payment processing with different payment methods",
          priority: "high",
          type: "integration",
          steps: ["Proceed to checkout", "Enter payment details", "Submit payment", "Verify confirmation"],
          expectedResults: "Payment processed successfully with order confirmation",
          actualResults: null,
          status: null,
        },
        {
          title: "Mobile Responsiveness Test",
          description: "Verify app layout and functionality on different screen sizes",
          priority: "medium",
          type: "visual",
          steps: ["Test on iPhone", "Test on Android tablet", "Check landscape mode", "Verify touch targets"],
          expectedResults: "App displays correctly on all devices with proper touch interaction",
          actualResults: null,
          status: null,
        }
      ];

      const createdScenarios = await Promise.all(
        scenarios.map(scenario => storage.createTestScenario({ projectId, ...scenario }))
      );

      // Generate AI insights
      const insights = [
        {
          type: "success",
          title: "Strong Security Foundation",
          description: "Payment processing and user authentication follow industry best practices with proper encryption",
          severity: "low"
        },
        {
          type: "warning",
          title: "Performance Optimization Needed",
          description: "Product loading times may exceed 2-second target under high load conditions",
          severity: "medium"
        },
        {
          type: "error",
          title: "Accessibility Compliance Gap",
          description: "Missing accessibility features could prevent compliance with WCAG 2.1 AA standards",
          severity: "high"
        },
        {
          type: "info",
          title: "Test Coverage Enhancement",
          description: "Consider adding more comprehensive end-to-end tests for payment flows",
          severity: "medium"
        }
      ];

      await storage.createAnalysisResult({
        projectId,
        type: "ai_insights",
        status: "completed",
        progress: 100,
        results: null,
        insights: insights,
      });

      res.json({ message: "Demo data created successfully", scenarios: createdScenarios.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to create demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
