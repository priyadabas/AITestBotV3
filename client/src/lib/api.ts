import { apiRequest } from "./queryClient";

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  id: number;
  projectId: number;
  type: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  metadata?: any;
  uploadedAt: string;
}

export interface AnalysisResult {
  id: number;
  projectId: number;
  type: string;
  status: string;
  progress: number;
  results?: any;
  insights?: any;
  createdAt: string;
  completedAt?: string;
}

export interface TestScenario {
  id: number;
  projectId: number;
  title: string;
  description: string;
  priority: string;
  type: string;
  steps?: string[];
  expectedResults?: string;
  actualResults?: string;
  status: string;
  generatedAt: string;
}

export const api = {
  // Projects
  async createProject(data: { name: string; description?: string }): Promise<Project> {
    const response = await apiRequest("POST", "/api/projects", data);
    return response.json();
  },

  async getProjects(): Promise<Project[]> {
    const response = await apiRequest("GET", "/api/projects");
    return response.json();
  },

  async getProject(id: number): Promise<Project> {
    const response = await apiRequest("GET", `/api/projects/${id}`);
    return response.json();
  },

  // File uploads
  async uploadPRD(projectId: number, file: File): Promise<Upload> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}/upload/prd`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to upload PRD file");
    }

    return response.json();
  },

  async uploadFigmaURL(projectId: number, url: string): Promise<Upload> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/uploads/figma`, { url });
    return response.json();
  },

  async uploadCodeRepo(projectId: number, repoUrl: string): Promise<Upload> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/uploads/code`, { repoUrl });
    return response.json();
  },

  // Analysis
  async getAnalysisResults(projectId: number): Promise<AnalysisResult[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/analysis`);
    return response.json();
  },

  async generateScenarios(projectId: number): Promise<TestScenario[]> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/generate-scenarios`);
    return response.json();
  },

  // Test scenarios
  async getTestScenarios(projectId: number): Promise<TestScenario[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/scenarios`);
    return response.json();
  },

  // AI insights
  async getInsights(projectId: number): Promise<any[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/insights`);
    return response.json();
  },

  // Bot execution
  async executeBotScenarios(projectId: number, scenarioIds?: number[], baseUrl?: string): Promise<any> {
    const response = await apiRequest("POST", `/api/projects/${projectId}/execute-scenarios`, { 
      scenarioIds, 
      baseUrl 
    });
    return response.json();
  },

  async getBotExecutions(projectId: number): Promise<any[]> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/executions`);
    return response.json();
  },

  async getBotExecution(projectId: number, executionId: number): Promise<any> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/executions/${executionId}`);
    return response.json();
  },

  async getBotExecutionReport(projectId: number, executionId: number): Promise<string> {
    const response = await apiRequest("GET", `/api/projects/${projectId}/executions/${executionId}/report`);
    return response.text();
  },
};
