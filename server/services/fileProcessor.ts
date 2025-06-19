import { readFileSync } from "fs";
import path from "path";

interface ProcessedFile {
  content: string;
  metadata: Record<string, any>;
}

export class FileProcessor {
  async processPRD(filePath: string, fileName: string): Promise<ProcessedFile> {
    try {
      const extension = path.extname(fileName).toLowerCase();
      let content = "";
      let metadata = {};

      switch (extension) {
        case ".txt":
          content = readFileSync(filePath, "utf-8");
          metadata = { type: "text", encoding: "utf-8" };
          break;
        case ".pdf":
          // For now, we'll handle PDF as text placeholder
          // In production, you'd use a library like pdf-parse
          content = "PDF content would be extracted here using a proper PDF parser";
          metadata = { type: "pdf", pages: 1 };
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      return {
        content,
        metadata: {
          ...metadata,
          fileName,
          fileSize: readFileSync(filePath).length,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to process PRD file: ${(error as Error).message}`);
    }
  }

  async processFigmaURL(url: string): Promise<ProcessedFile> {
    try {
      // For now, we'll extract the file ID from the URL
      const fileIdMatch = url.match(/file\/([^\/]+)/);
      if (!fileIdMatch) {
        throw new Error("Invalid Figma URL format");
      }

      const fileId = fileIdMatch[1];
      
      return {
        content: `Figma design file: ${fileId}`,
        metadata: {
          type: "figma",
          fileId,
          url,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to process Figma URL: ${(error as Error).message}`);
    }
  }

  async processCodeRepository(repoUrl: string): Promise<ProcessedFile> {
    try {
      // Extract repository information from URL
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) {
        throw new Error("Invalid GitHub URL format");
      }

      const [, owner, repo] = repoMatch;

      return {
        content: `GitHub repository: ${owner}/${repo}`,
        metadata: {
          type: "github",
          owner,
          repo,
          url: repoUrl,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to process code repository: ${(error as Error).message}`);
    }
  }

  async processCodeArchive(filePath: string, fileName: string): Promise<ProcessedFile> {
    try {
      const stats = readFileSync(filePath);
      
      return {
        content: "Code archive uploaded - would be extracted and analyzed",
        metadata: {
          type: "archive",
          fileName,
          fileSize: stats.length,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to process code archive: ${(error as Error).message}`);
    }
  }
}

export const fileProcessor = new FileProcessor();
