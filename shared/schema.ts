import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================
// Tables
// ============================

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Uploads (PRD, Figma, Code)
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  type: text("type").notNull(), // 'prd', 'figma', 'code'
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileUrl: text("file_url"),
  metadata: jsonb("metadata"), // Store additional file info
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// AI Analysis Results
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  type: text("type").notNull(), // 'prd_analysis', 'design_analysis', 'code_analysis', 'ai_insights'
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'failed'
  progress: integer("progress").default(0), // 0-100
  results: jsonb("results").default(null),
  insights: jsonb("insights").default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Test Scenarios
export type ScenarioStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export const testScenarios = pgTable("test_scenarios", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'high', 'medium', 'low'
  type: text("type").notNull(), // 'functional', 'visual', 'integration', 'performance'
  steps: jsonb("steps"), // Array of test steps
  expectedResults: text("expected_results"),
  actualResults: text("actual_results"),
  status: text("status").$type<ScenarioStatus>().default("pending"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Bot Executions (Project-level batch runs)
export const botExecutions = pgTable("bot_executions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'running', 'completed', 'failed'
  progress: integer("progress").default(0).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  results: jsonb("results"), // Detailed execution results
  screenshots: jsonb("screenshots"), // Array of screenshot URLs
  logs: text("logs"),
  report: text("report"), // Markdown execution report
  executedScenarios: integer("executed_scenarios").default(0).notNull(),
  passedScenarios: integer("passed_scenarios").default(0).notNull(),
  failedScenarios: integer("failed_scenarios").default(0).notNull(),
});

// ============================
// Insert Schemas
// ============================

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  uploadedAt: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTestScenarioSchema = createInsertSchema(testScenarios).omit({
  id: true,
  generatedAt: true,
});

export const insertBotExecutionSchema = createInsertSchema(botExecutions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// ============================
// Types
// ============================

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;

export type TestScenario = typeof testScenarios.$inferSelect;
export type InsertTestScenario = z.infer<typeof insertTestScenarioSchema>;

export type BotExecution = typeof botExecutions.$inferSelect;
export type InsertBotExecution = z.infer<typeof insertBotExecutionSchema>;

// ============================
// Relations
// ============================

export const projectsRelations = relations(projects, ({ many }) => ({
  uploads: many(uploads),
  analysisResults: many(analysisResults),
  testScenarios: many(testScenarios),
  botExecutions: many(botExecutions),
}));

export const uploadsRelations = relations(uploads, ({ one }) => ({
  project: one(projects, {
    fields: [uploads.projectId],
    references: [projects.id],
  }),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  project: one(projects, {
    fields: [analysisResults.projectId],
    references: [projects.id],
  }),
}));

export const testScenariosRelations = relations(testScenarios, ({ one, many }) => ({
  project: one(projects, {
    fields: [testScenarios.projectId],
    references: [projects.id],
  }),
  botExecutions: many(botExecutions),
}));

export const botExecutionsRelations = relations(botExecutions, ({ one }) => ({
  project: one(projects, {
    fields: [botExecutions.projectId],
    references: [projects.id],
  }),
}));
