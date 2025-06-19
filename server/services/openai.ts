import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

interface PRDAnalysisResult {
  requirements: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  riskAreas: string[];
}

interface DesignAnalysisResult {
  components: string[];
  userFlows: string[];
  accessibilityIssues: string[];
  responsiveDesign: boolean;
  designPatterns: string[];
}

interface CodeAnalysisResult {
  architecture: string;
  technologies: string[];
  endpoints: string[];
  components: string[];
  testCoverage: string;
  codeQuality: string;
}

interface TestScenarioData {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: "functional" | "visual" | "integration" | "performance";
  steps: string[];
  expectedResults: string;
}

interface AIInsight {
  type: "info" | "warning" | "error" | "success";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export class OpenAIService {
  async analyzePRD(prdContent: string): Promise<PRDAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert product analyst. Analyze the provided PRD document and extract key information. Return your analysis as JSON with the following structure:
            {
              "requirements": ["requirement1", "requirement2"],
              "userStories": ["story1", "story2"],
              "acceptanceCriteria": ["criteria1", "criteria2"],
              "functionalRequirements": ["func1", "func2"],
              "nonFunctionalRequirements": ["nonfunc1", "nonfunc2"],
              "riskAreas": ["risk1", "risk2"]
            }`,
          },
          {
            role: "user",
            content: `Analyze this PRD document: ${prdContent}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      throw new Error("Failed to analyze PRD: " + (error as Error).message);
    }
  }

  async analyzeDesign(designDescription: string): Promise<DesignAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a UX/UI design expert. Analyze the provided design information and return JSON with this structure:
            {
              "components": ["component1", "component2"],
              "userFlows": ["flow1", "flow2"],
              "accessibilityIssues": ["issue1", "issue2"],
              "responsiveDesign": true/false,
              "designPatterns": ["pattern1", "pattern2"]
            }`,
          },
          {
            role: "user",
            content: `Analyze this design: ${designDescription}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      throw new Error("Failed to analyze design: " + (error as Error).message);
    }
  }

  async analyzeCode(codeContent: string): Promise<CodeAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior software engineer. Analyze the provided code and return JSON with this structure:
            {
              "architecture": "description of architecture",
              "technologies": ["tech1", "tech2"],
              "endpoints": ["endpoint1", "endpoint2"],
              "components": ["component1", "component2"],
              "testCoverage": "coverage assessment",
              "codeQuality": "quality assessment"
            }`,
          },
          {
            role: "user",
            content: `Analyze this code: ${codeContent}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (error) {
      throw new Error("Failed to analyze code: " + (error as Error).message);
    }
  }

  async generateTestScenarios(
    prdAnalysis: PRDAnalysisResult,
    designAnalysis: DesignAnalysisResult,
    codeAnalysis: CodeAnalysisResult
  ): Promise<TestScenarioData[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a QA expert specializing in UAT testing. Based on the provided analysis data, generate comprehensive test scenarios. Return an array of test scenarios in JSON format:
            {
              "scenarios": [
                {
                  "title": "Test Title",
                  "description": "Detailed description",
                  "priority": "high|medium|low",
                  "type": "functional|visual|integration|performance",
                  "steps": ["step1", "step2"],
                  "expectedResults": "Expected outcome"
                }
              ]
            }`,
          },
          {
            role: "user",
            content: `Generate test scenarios based on:
            PRD Analysis: ${JSON.stringify(prdAnalysis)}
            Design Analysis: ${JSON.stringify(designAnalysis)}
            Code Analysis: ${JSON.stringify(codeAnalysis)}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result.scenarios || [];
    } catch (error) {
      throw new Error("Failed to generate test scenarios: " + (error as Error).message);
    }
  }

  async generateInsights(
    prdAnalysis: PRDAnalysisResult,
    designAnalysis: DesignAnalysisResult,
    codeAnalysis: CodeAnalysisResult
  ): Promise<AIInsight[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior product consultant. Analyze the provided data and generate actionable insights. Return JSON with this structure:
            {
              "insights": [
                {
                  "type": "info|warning|error|success",
                  "title": "Insight Title",
                  "description": "Detailed description",
                  "severity": "high|medium|low"
                }
              ]
            }`,
          },
          {
            role: "user",
            content: `Generate insights based on:
            PRD Analysis: ${JSON.stringify(prdAnalysis)}
            Design Analysis: ${JSON.stringify(designAnalysis)}
            Code Analysis: ${JSON.stringify(codeAnalysis)}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result.insights || [];
    } catch (error) {
      throw new Error("Failed to generate insights: " + (error as Error).message);
    }
  }
}

export const openaiService = new OpenAIService();
