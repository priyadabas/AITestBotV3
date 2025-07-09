import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
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

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
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

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
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
      const prompt = `Based on the PRD, design, and code analysis, generate comprehensive test scenarios that can be automated with Playwright. Each scenario should include specific, actionable steps that can be executed programmatically.

PRD Analysis:
${JSON.stringify(prdAnalysis, null, 2)}

Design Analysis:
${JSON.stringify(designAnalysis, null, 2)}

Code Analysis:
${JSON.stringify(codeAnalysis, null, 2)}

Generate test scenarios in this exact JSON format:
[
  {
    "title": "Test scenario title",
    "description": "Detailed description of what this test validates",
    "priority": "high",
    "type": "functional",
    "steps": [
      "Navigate to the home page",
      "Click on 'Login' button",
      "Enter username 'testuser' in the username field",
      "Enter password 'testpass' in the password field",
      "Click 'Submit' button",
      "Verify 'Welcome' message appears"
    ],
    "expectedResults": "User should be successfully logged in and see welcome message"
  }
]

Focus on:
- Functional user workflows
- Critical user journeys
- Error handling scenarios
- UI component interactions
- Form submissions and validations
- Navigation flows

Make sure each step is specific enough for automated testing with Playwright.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
      // Clean the response text and extract JSON
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let jsonData;
      try {
        jsonData = JSON.parse(cleanText);
      } catch {
        // If direct parsing fails, try to extract JSON array
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("No valid JSON array found in response");
        }
        jsonData = JSON.parse(jsonMatch[0]);
      }
      
      // Validate array structure
      if (!Array.isArray(jsonData)) {
        throw new Error("Response is not an array");
      }
      
      return jsonData as TestScenarioData[];
    } catch (error) {
      console.error("Gemini test scenario generation error:", error);
      throw new Error("Failed to generate test scenarios: " + (error as Error).message);
    }
  }

  async generateInsights(
    prdAnalysis: PRDAnalysisResult,
    designAnalysis: DesignAnalysisResult,
    codeAnalysis: CodeAnalysisResult
  ): Promise<AIInsight[]> {
    try {
      const prompt = `Analyze the PRD, design, and code analysis results to generate actionable insights for improving the testing strategy and identifying potential issues.

PRD Analysis:
${JSON.stringify(prdAnalysis, null, 2)}

Design Analysis:
${JSON.stringify(designAnalysis, null, 2)}

Code Analysis:
${JSON.stringify(codeAnalysis, null, 2)}

Generate insights in this exact JSON format:
[
  {
    "type": "warning",
    "title": "Insight title",
    "description": "Detailed description of the insight",
    "severity": "high"
  }
]

Focus on:
- Potential testing gaps
- Risk areas that need attention
- Quality concerns
- User experience issues
- Technical debt
- Security considerations`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
      // Clean the response text and extract JSON
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let jsonData;
      try {
        jsonData = JSON.parse(cleanText);
      } catch {
        // If direct parsing fails, try to extract JSON array
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("No valid JSON array found in response");
        }
        jsonData = JSON.parse(jsonMatch[0]);
      }
      
      // Validate array structure
      if (!Array.isArray(jsonData)) {
        throw new Error("Response is not an array");
      }
      
      return jsonData as AIInsight[];
    } catch (error) {
      console.error("Gemini insights generation error:", error);
      throw new Error("Failed to generate insights: " + (error as Error).message);
    }
  }

  async generateTestScenariosFromPRD(prdContent: string): Promise<TestScenarioData[]> {
    try {
      const prompt = `Analyze this PRD document and generate comprehensive test scenarios that can be automated with Playwright. Focus on core user workflows and critical functionality.

PRD Document:
${prdContent}

Generate test scenarios in this exact JSON format:
[
  {
    "title": "Test scenario title",
    "description": "Detailed description of what this test validates",
    "priority": "high",
    "type": "functional",
    "steps": [
      "Navigate to the home page",
      "Click on 'Login' button",
      "Enter username 'testuser' in the username field",
      "Enter password 'testpass' in the password field",
      "Click 'Submit' button",
      "Verify 'Welcome' message appears"
    ],
    "expectedResults": "User should be successfully logged in and see welcome message"
  }
]

Focus on:
- Core user workflows from the PRD
- Critical business functionality
- User authentication flows
- Data input and validation
- Navigation and user journeys
- Error handling scenarios

Make sure each step is specific enough for automated testing with Playwright.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text || "";
      
      // Clean the response text and extract JSON
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let jsonData;
      try {
        jsonData = JSON.parse(cleanText);
      } catch {
        // If direct parsing fails, try to extract JSON array
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("No valid JSON array found in response");
        }
        jsonData = JSON.parse(jsonMatch[0]);
      }
      
      // Validate array structure
      if (!Array.isArray(jsonData)) {
        throw new Error("Response is not an array");
      }
      
      return jsonData as TestScenarioData[];
    } catch (error) {
      console.error("Gemini test scenario generation error:", error);
      throw new Error("Failed to generate test scenarios from PRD: " + (error as Error).message);
    }
  }
}

export const geminiService = new GeminiService();