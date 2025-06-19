import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testFullPRDAnalysis() {
  try {
    console.log("Testing full PRD analysis flow...");
    
    // Read the test PRD
    const prdContent = fs.readFileSync('test-prd.txt', 'utf8');
    
    // Test PRD analysis
    const prdPrompt = `Analyze this PRD document and extract key information. Respond only with valid JSON in this exact format:

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

    const prdResult = await model.generateContent(prdPrompt);
    const prdResponse = await prdResult.response;
    const prdText = prdResponse.text();
    
    console.log("PRD Analysis Result:");
    console.log(prdText);
    
    // Parse PRD analysis
    const cleanPrdText = prdText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let prdAnalysis;
    try {
      prdAnalysis = JSON.parse(cleanPrdText);
    } catch {
      const jsonMatch = cleanPrdText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prdAnalysis = JSON.parse(jsonMatch[0]);
      }
    }
    
    if (prdAnalysis) {
      // Generate test scenarios
      const scenarioPrompt = `Based on this PRD analysis, generate comprehensive test scenarios. Respond only with valid JSON:

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

PRD Analysis: ${JSON.stringify(prdAnalysis)}`;

      const scenarioResult = await model.generateContent(scenarioPrompt);
      const scenarioResponse = await scenarioResult.response;
      const scenarioText = scenarioResponse.text();
      
      console.log("\nTest Scenarios Result:");
      console.log(scenarioText);
      
      // Generate insights
      const insightPrompt = `Generate actionable insights based on this PRD analysis. Respond only with valid JSON:

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

PRD Analysis: ${JSON.stringify(prdAnalysis)}`;

      const insightResult = await model.generateContent(insightPrompt);
      const insightResponse = await insightResult.response;
      const insightText = insightResponse.text();
      
      console.log("\nAI Insights Result:");
      console.log(insightText);
      
      console.log("\n✅ Full PRD analysis flow completed successfully!");
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testFullPRDAnalysis();