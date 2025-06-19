import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async analyzePRD(prdContent: string): Promise<PRDAnalysisResult> {
    try {
      const prompt = `Analyze this PRD document and extract key information. Respond only with valid JSON in this exact format:

{
  "requirements": ["requirement1", "requirement2"],
  "userStories": ["story1", "story2"],
  "acceptanceCriteria": ["criteria1", "criteria2"],
  "functionalRequirements": ["func1", "func2"],
  "nonFunctionalRequirements": ["nonfunc1", "nonfunc2"],
  "riskAreas": ["risk1", "risk2"]
}

PRD Document:
${prdContent}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text and extract JSON
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON in the response
      let jsonData;
      try {
        jsonData = JSON.parse(cleanText);
      } catch {
        // If direct parsing fails, try to extract JSON block
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in Gemini response");
        }
        jsonData = JSON.parse(jsonMatch[0]);
      }
      
      // Validate the structure
      const requiredFields = ['requirements', 'userStories', 'acceptanceCriteria', 'functionalRequirements', 'nonFunctionalRequirements', 'riskAreas'];
      for (const field of requiredFields) {
        if (!Array.isArray(jsonData[field])) {
          jsonData[field] = [];
        }
      }
      
      return jsonData as PRDAnalysisResult;
    } catch (error) {
      console.error("Gemini PRD analysis error:", error);
      throw new Error("Failed to analyze PRD: " + (error as Error).message);
    }
  }

  async analyzeDesign(designDescription: string): Promise<DesignAnalysisResult> {
    try {
      const prompt = `You are a UX/UI design expert. Analyze the provided design information and return JSON with this structure:
      {
        "components": ["component1", "component2"],
        "userFlows": ["flow1", "flow2"],
        "accessibilityIssues": ["issue1", "issue2"],
        "responsiveDesign": true/false,
        "designPatterns": ["pattern1", "pattern2"]
      }

      Design information to analyze:
      ${designDescription}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error("Failed to analyze design: " + (error as Error).message);
    }
  }

  async analyzeCode(codeContent: string): Promise<CodeAnalysisResult> {
    try {
      const prompt = `You are a senior software engineer. Analyze the provided code and return JSON with this structure:
      {
        "architecture": "description of architecture",
        "technologies": ["tech1", "tech2"],
        "endpoints": ["endpoint1", "endpoint2"],
        "components": ["component1", "component2"],
        "testCoverage": "coverage assessment",
        "codeQuality": "quality assessment"
      }

      Code to analyze:
      ${codeContent}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      return JSON.parse(jsonMatch[0]);
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
      const prompt = `You are a QA expert specializing in UAT testing. Based on the provided analysis data, generate comprehensive test scenarios. Return an array of test scenarios in JSON format:
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
      }

      Analysis data:
      PRD Analysis: ${JSON.stringify(prdAnalysis)}
      Design Analysis: ${JSON.stringify(designAnalysis)}
      Code Analysis: ${JSON.stringify(codeAnalysis)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.scenarios || [];
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
      const prompt = `You are a senior product consultant. Analyze the provided data and generate actionable insights. Return JSON with this structure:
      {
        "insights": [
          {
            "type": "info|warning|error|success",
            "title": "Insight Title",
            "description": "Detailed description",
            "severity": "high|medium|low"
          }
        ]
      }

      Analysis data:
      PRD Analysis: ${JSON.stringify(prdAnalysis)}
      Design Analysis: ${JSON.stringify(designAnalysis)}
      Code Analysis: ${JSON.stringify(codeAnalysis)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights || [];
    } catch (error) {
      throw new Error("Failed to generate insights: " + (error as Error).message);
    }
  }
}

export const geminiService = new GeminiService();