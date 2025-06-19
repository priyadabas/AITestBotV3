import {
  projects,
  uploads,
  analysisResults,
  testScenarios,
  botExecutions,
  type Project,
  type InsertProject,
  type Upload,
  type InsertUpload,
  type AnalysisResult,
  type InsertAnalysisResult,
  type TestScenario,
  type InsertTestScenario,
  type BotExecution,
  type InsertBotExecution,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;

  // Uploads
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUploadsByProject(projectId: number): Promise<Upload[]>;
  getUpload(id: number): Promise<Upload | undefined>;

  // Analysis Results
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResultsByProject(projectId: number): Promise<AnalysisResult[]>;
  updateAnalysisResult(id: number, updates: Partial<AnalysisResult>): Promise<AnalysisResult>;

  // Test Scenarios
  createTestScenario(scenario: InsertTestScenario): Promise<TestScenario>;
  getTestScenariosByProject(projectId: number): Promise<TestScenario[]>;
  updateTestScenario(id: number, updates: Partial<TestScenario>): Promise<TestScenario>;

  // Bot Executions
  createBotExecution(execution: InsertBotExecution): Promise<BotExecution>;
  getBotExecutionsByProject(projectId: number): Promise<BotExecution[]>;
  updateBotExecution(id: number, updates: Partial<BotExecution>): Promise<BotExecution>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  // Uploads
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async getUploadsByProject(projectId: number): Promise<Upload[]> {
    return await db.select().from(uploads).where(eq(uploads.projectId, projectId));
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  // Analysis Results
  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const [result] = await db
      .insert(analysisResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getAnalysisResultsByProject(projectId: number): Promise<AnalysisResult[]> {
    return await db.select().from(analysisResults).where(eq(analysisResults.projectId, projectId));
  }

  async updateAnalysisResult(id: number, updates: Partial<AnalysisResult>): Promise<AnalysisResult> {
    const [result] = await db
      .update(analysisResults)
      .set(updates)
      .where(eq(analysisResults.id, id))
      .returning();
    if (!result) {
      throw new Error("Analysis result not found");
    }
    return result;
  }

  // Test Scenarios
  async createTestScenario(insertScenario: InsertTestScenario): Promise<TestScenario> {
    const [scenario] = await db
      .insert(testScenarios)
      .values(insertScenario)
      .returning();
    return scenario;
  }

  async getTestScenariosByProject(projectId: number): Promise<TestScenario[]> {
    return await db.select().from(testScenarios).where(eq(testScenarios.projectId, projectId));
  }

  async updateTestScenario(id: number, updates: Partial<TestScenario>): Promise<TestScenario> {
    const [scenario] = await db
      .update(testScenarios)
      .set(updates)
      .where(eq(testScenarios.id, id))
      .returning();
    if (!scenario) {
      throw new Error("Test scenario not found");
    }
    return scenario;
  }

  // Bot Executions
  async createBotExecution(insertExecution: InsertBotExecution): Promise<BotExecution> {
    const [execution] = await db
      .insert(botExecutions)
      .values(insertExecution)
      .returning();
    return execution;
  }

  async getBotExecutionsByProject(projectId: number): Promise<BotExecution[]> {
    return await db.select().from(botExecutions).where(eq(botExecutions.projectId, projectId));
  }

  async updateBotExecution(id: number, updates: Partial<BotExecution>): Promise<BotExecution> {
    const [execution] = await db
      .update(botExecutions)
      .set(updates)
      .where(eq(botExecutions.id, id))
      .returning();
    if (!execution) {
      throw new Error("Bot execution not found");
    }
    return execution;
  }
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private uploads: Map<number, Upload> = new Map();
  private analysisResults: Map<number, AnalysisResult> = new Map();
  private testScenarios: Map<number, TestScenario> = new Map();
  private botExecutions: Map<number, BotExecution> = new Map();
  
  private currentProjectId = 1;
  private currentUploadId = 1;
  private currentAnalysisId = 1;
  private currentScenarioId = 1;
  private currentExecutionId = 1;

  // Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description || null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error("Project not found");
    }
    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  // Uploads
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = {
      id,
      projectId: insertUpload.projectId,
      type: insertUpload.type,
      fileName: insertUpload.fileName,
      fileSize: insertUpload.fileSize,
      fileUrl: insertUpload.fileUrl || null,
      metadata: insertUpload.metadata || null,
      uploadedAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUploadsByProject(projectId: number): Promise<Upload[]> {
    return Array.from(this.uploads.values()).filter(
      (upload) => upload.projectId === projectId
    );
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  // Analysis Results
  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentAnalysisId++;
    const result: AnalysisResult = {
      id,
      projectId: insertResult.projectId,
      type: insertResult.type,
      status: insertResult.status || "pending",
      progress: insertResult.progress || 0,
      results: insertResult.results || null,
      insights: insertResult.insights || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async getAnalysisResultsByProject(projectId: number): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values()).filter(
      (result) => result.projectId === projectId
    );
  }

  async updateAnalysisResult(id: number, updates: Partial<AnalysisResult>): Promise<AnalysisResult> {
    const existing = this.analysisResults.get(id);
    if (!existing) {
      throw new Error("Analysis result not found");
    }
    const updated: AnalysisResult = {
      ...existing,
      ...updates,
      completedAt: updates.status === "completed" ? new Date() : existing.completedAt,
    };
    this.analysisResults.set(id, updated);
    return updated;
  }

  // Test Scenarios
  async createTestScenario(insertScenario: InsertTestScenario): Promise<TestScenario> {
    const id = this.currentScenarioId++;
    const scenario: TestScenario = {
      id,
      projectId: insertScenario.projectId,
      title: insertScenario.title,
      description: insertScenario.description,
      priority: insertScenario.priority,
      type: insertScenario.type,
      steps: insertScenario.steps || null,
      expectedResults: insertScenario.expectedResults || null,
      actualResults: insertScenario.actualResults || null,
      status: insertScenario.status || null,
      generatedAt: new Date(),
    };
    this.testScenarios.set(id, scenario);
    return scenario;
  }

  async getTestScenariosByProject(projectId: number): Promise<TestScenario[]> {
    return Array.from(this.testScenarios.values()).filter(
      (scenario) => scenario.projectId === projectId
    );
  }

  async updateTestScenario(id: number, updates: Partial<TestScenario>): Promise<TestScenario> {
    const existing = this.testScenarios.get(id);
    if (!existing) {
      throw new Error("Test scenario not found");
    }
    const updated: TestScenario = { ...existing, ...updates };
    this.testScenarios.set(id, updated);
    return updated;
  }

  // Bot Executions
  async createBotExecution(insertExecution: InsertBotExecution): Promise<BotExecution> {
    const id = this.currentExecutionId++;
    const execution: BotExecution = {
      id,
      projectId: insertExecution.projectId,
      scenarioId: insertExecution.scenarioId,
      status: insertExecution.status || "pending",
      results: insertExecution.results || null,
      screenshots: insertExecution.screenshots || null,
      logs: insertExecution.logs || null,
      startedAt: null,
      completedAt: null,
    };
    this.botExecutions.set(id, execution);
    return execution;
  }

  async getBotExecutionsByProject(projectId: number): Promise<BotExecution[]> {
    return Array.from(this.botExecutions.values()).filter(
      (execution) => execution.projectId === projectId
    );
  }

  async updateBotExecution(id: number, updates: Partial<BotExecution>): Promise<BotExecution> {
    const existing = this.botExecutions.get(id);
    if (!existing) {
      throw new Error("Bot execution not found");
    }
    const updated: BotExecution = {
      ...existing,
      ...updates,
      startedAt: updates.status === "running" && !existing.startedAt ? new Date() : existing.startedAt,
      completedAt: (updates.status === "completed" || updates.status === "failed") ? new Date() : existing.completedAt,
    };
    this.botExecutions.set(id, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();
