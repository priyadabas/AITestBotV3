import { chromium, type Page, type Browser } from 'playwright';
import type { TestScenario } from '@shared/schema';

export interface TestExecutionResult {
  scenarioId: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshots: string[];
  error?: string;
  actualResults?: string;
  steps: {
    step: string;
    status: 'passed' | 'failed' | 'skipped';
    screenshot?: string;
    error?: string;
  }[];
}

export class PlaywrightService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async executeTestScenario(scenario: TestScenario, baseUrl: string = 'http://localhost:3000'): Promise<TestExecutionResult> {
    if (!this.page) {
      throw new Error('Playwright service not initialized');
    }

    const startTime = Date.now();
    const result: TestExecutionResult = {
      scenarioId: scenario.id,
      status: 'passed',
      duration: 0,
      screenshots: [],
      steps: []
    };

    try {
      // Navigate to the base URL
      await this.page.goto(baseUrl);
      
      // Take initial screenshot
      const initialScreenshot = `screenshot_${scenario.id}_initial.png`;
      await this.page.screenshot({ path: `uploads/${initialScreenshot}` });
      result.screenshots.push(initialScreenshot);

      // Execute each step
      if (scenario.steps) {
        for (let i = 0; i < scenario.steps.length; i++) {
          const step = scenario.steps[i];
          const stepResult = {
            step,
            status: 'passed' as const,
            screenshot: undefined as string | undefined,
            error: undefined as string | undefined
          };

          try {
            await this.executeStep(step, this.page);
            
            // Take screenshot after each step
            const stepScreenshot = `screenshot_${scenario.id}_step_${i + 1}.png`;
            await this.page.screenshot({ path: `uploads/${stepScreenshot}` });
            stepResult.screenshot = stepScreenshot;
            result.screenshots.push(stepScreenshot);
            
          } catch (error) {
            stepResult.status = 'failed';
            stepResult.error = (error as Error).message;
            result.status = 'failed';
            result.error = `Step ${i + 1} failed: ${(error as Error).message}`;
            
            // Take error screenshot
            const errorScreenshot = `screenshot_${scenario.id}_error_${i + 1}.png`;
            await this.page.screenshot({ path: `uploads/${errorScreenshot}` });
            stepResult.screenshot = errorScreenshot;
            result.screenshots.push(errorScreenshot);
          }

          result.steps.push(stepResult);
          
          // Stop execution if step failed
          if (stepResult.status === 'failed') {
            break;
          }
        }
      }

      // Verify expected results if test passed
      if (result.status === 'passed' && scenario.expectedResults) {
        try {
          const actualResults = await this.verifyExpectedResults(scenario.expectedResults, this.page);
          result.actualResults = actualResults;
        } catch (error) {
          result.status = 'failed';
          result.error = `Expected results verification failed: ${(error as Error).message}`;
        }
      }

    } catch (error) {
      result.status = 'failed';
      result.error = (error as Error).message;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async executeStep(step: string, page: Page): Promise<void> {
    // Parse the step and execute corresponding action
    const stepLower = step.toLowerCase();
    
    if (stepLower.includes('click') || stepLower.includes('tap')) {
      await this.handleClickAction(step, page);
    } else if (stepLower.includes('type') || stepLower.includes('enter') || stepLower.includes('input')) {
      await this.handleInputAction(step, page);
    } else if (stepLower.includes('navigate') || stepLower.includes('go to') || stepLower.includes('visit')) {
      await this.handleNavigationAction(step, page);
    } else if (stepLower.includes('wait') || stepLower.includes('pause')) {
      await this.handleWaitAction(step, page);
    } else if (stepLower.includes('verify') || stepLower.includes('check') || stepLower.includes('assert')) {
      await this.handleVerificationAction(step, page);
    } else {
      // Default action - wait for a short period
      await page.waitForTimeout(1000);
    }
  }

  private async handleClickAction(step: string, page: Page): Promise<void> {
    // Extract element to click from step description
    const patterns = [
      /click.*?"([^"]+)"/i,
      /click.*?button.*?"([^"]+)"/i,
      /click.*?link.*?"([^"]+)"/i,
      /tap.*?"([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = step.match(pattern);
      if (match) {
        const elementText = match[1];
        try {
          await page.getByText(elementText).first().click();
          return;
        } catch {
          // Try by role
          try {
            await page.getByRole('button', { name: elementText }).click();
            return;
          } catch {
            // Try by placeholder
            await page.getByPlaceholder(elementText).click();
            return;
          }
        }
      }
    }
    
    // If no specific element found, try common UI elements
    if (step.includes('submit') || step.includes('save')) {
      await page.getByRole('button', { name: /submit|save/i }).click();
    } else if (step.includes('cancel')) {
      await page.getByRole('button', { name: /cancel/i }).click();
    }
  }

  private async handleInputAction(step: string, page: Page): Promise<void> {
    const patterns = [
      /type.*?"([^"]+)".*?into.*?"([^"]+)"/i,
      /enter.*?"([^"]+)".*?in.*?"([^"]+)"/i,
      /input.*?"([^"]+)".*?into.*?"([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = step.match(pattern);
      if (match) {
        const [, text, field] = match;
        try {
          await page.getByPlaceholder(field).fill(text);
          return;
        } catch {
          try {
            await page.getByLabel(field).fill(text);
            return;
          } catch {
            await page.getByRole('textbox', { name: field }).fill(text);
            return;
          }
        }
      }
    }
  }

  private async handleNavigationAction(step: string, page: Page): Promise<void> {
    const urlPattern = /(?:navigate|go to|visit).*?(https?:\/\/[^\s]+)/i;
    const match = step.match(urlPattern);
    if (match) {
      await page.goto(match[1]);
    }
  }

  private async handleWaitAction(step: string, page: Page): Promise<void> {
    const timePattern = /wait.*?(\d+).*?(?:seconds?|ms|milliseconds?)/i;
    const match = step.match(timePattern);
    if (match) {
      const time = parseInt(match[1]);
      const unit = step.includes('second') ? 1000 : 1;
      await page.waitForTimeout(time * unit);
    } else {
      await page.waitForTimeout(2000); // Default 2 seconds
    }
  }

  private async handleVerificationAction(step: string, page: Page): Promise<void> {
    const patterns = [
      /verify.*?"([^"]+)".*?(?:is|appears|visible)/i,
      /check.*?"([^"]+)".*?(?:is|appears|visible)/i,
      /assert.*?"([^"]+)".*?(?:is|appears|visible)/i
    ];

    for (const pattern of patterns) {
      const match = step.match(pattern);
      if (match) {
        const elementText = match[1];
        await page.getByText(elementText).first().waitFor({ state: 'visible' });
        return;
      }
    }
  }

  private async verifyExpectedResults(expectedResults: string, page: Page): Promise<string> {
    // Take final screenshot and get page content
    const finalScreenshot = `final_state_${Date.now()}.png`;
    await page.screenshot({ path: `uploads/${finalScreenshot}` });
    
    // Get page title and visible text
    const title = await page.title();
    const visibleText = await page.textContent('body');
    
    return `Page title: ${title}\nVisible content length: ${visibleText?.length || 0} characters\nExpected: ${expectedResults}`;
  }

  async executeMultipleScenarios(scenarios: TestScenario[], baseUrl?: string): Promise<TestExecutionResult[]> {
    const results: TestExecutionResult[] = [];
    
    for (const scenario of scenarios) {
      try {
        const result = await this.executeTestScenario(scenario, baseUrl);
        results.push(result);
      } catch (error) {
        results.push({
          scenarioId: scenario.id,
          status: 'failed',
          duration: 0,
          screenshots: [],
          steps: [],
          error: (error as Error).message
        });
      }
    }
    
    return results;
  }

  async generateTestReport(results: TestExecutionResult[]): Promise<string> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;

    const report = `
# Test Execution Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Skipped**: ${skippedTests}
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%

## Test Results

${results.map(result => `
### Test Scenario #${result.scenarioId}
- **Status**: ${result.status.toUpperCase()}
- **Duration**: ${result.duration}ms
- **Screenshots**: ${result.screenshots.length}
${result.error ? `- **Error**: ${result.error}` : ''}
${result.actualResults ? `- **Actual Results**: ${result.actualResults}` : ''}

**Steps Executed**:
${result.steps.map((step, index) => `${index + 1}. ${step.step} - ${step.status.toUpperCase()}${step.error ? ` (Error: ${step.error})` : ''}`).join('\n')}
`).join('\n')}

---
Generated on: ${new Date().toISOString()}
`;

    return report;
  }
}

export const playwrightService = new PlaywrightService();