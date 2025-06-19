import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./file-upload";
import { api } from "@/lib/api";

interface UploadSectionProps {
  projectId: number;
}

export default function UploadSection({ projectId }: UploadSectionProps) {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{
    prd?: any;
    figma?: any;
    code?: any;
  }>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadPRDMutation = useMutation({
    mutationFn: (file: File) => api.uploadPRD(projectId, file),
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, prd: data }));
      toast({ title: "PRD uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/analysis`] });
    },
    onError: () => {
      toast({ title: "Failed to upload PRD", variant: "destructive" });
    },
  });

  const uploadFigmaMutation = useMutation({
    mutationFn: (url: string) => api.uploadFigmaURL(projectId, url),
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, figma: data }));
      toast({ title: "Figma design connected successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/analysis`] });
    },
    onError: () => {
      toast({ title: "Failed to connect Figma design", variant: "destructive" });
    },
  });

  const uploadCodeMutation = useMutation({
    mutationFn: (url: string) => api.uploadCodeRepo(projectId, url),
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, code: data }));
      toast({ title: "Code repository connected successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/analysis`] });
    },
    onError: () => {
      toast({ title: "Failed to connect code repository", variant: "destructive" });
    },
  });

  const handleFigmaSubmit = () => {
    if (figmaUrl.trim()) {
      uploadFigmaMutation.mutate(figmaUrl.trim());
    }
  };

  const handleRepoSubmit = () => {
    if (repoUrl.trim()) {
      uploadCodeMutation.mutate(repoUrl.trim());
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* PRD Upload */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-file-text text-primary"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">PRD Document</h3>
            <p className="text-sm text-slate-600">Upload your Product Requirements Document</p>
          </div>
        </div>

        {!uploadedFiles.prd ? (
          <FileUpload
            onFileSelect={(file) => uploadPRDMutation.mutate(file)}
            uploadText="Drop your PRD file here"
            supportedFormats="Supports PDF, DOCX, TXT files up to 10MB"
          />
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <i className="fas fa-check-circle text-green-600"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{uploadedFiles.prd.fileName}</p>
              <p className="text-xs text-green-600">
                {(uploadedFiles.prd.fileSize / (1024 * 1024)).toFixed(1)} MB • Uploaded successfully
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadedFiles(prev => ({ ...prev, prd: undefined }))}
              className="text-green-600 hover:text-green-800"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        )}
      </Card>

      {/* Figma Design Upload */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <i className="fab fa-figma text-purple-600"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Figma Design</h3>
            <p className="text-sm text-slate-600">Paste Figma URL or upload design files</p>
          </div>
        </div>

        {!uploadedFiles.figma ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="figma-url" className="block text-sm font-medium text-slate-700 mb-2">
                Figma URL
              </Label>
              <Input
                id="figma-url"
                type="url"
                placeholder="https://figma.com/file/..."
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={handleFigmaSubmit}
              disabled={!figmaUrl.trim() || uploadFigmaMutation.isPending}
              className="w-full"
            >
              {uploadFigmaMutation.isPending ? "Connecting..." : "Connect Figma"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <i className="fab fa-figma text-purple-600"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-800">Figma Design Connected</p>
              <p className="text-xs text-purple-600">Connected successfully</p>
            </div>
          </div>
        )}
      </Card>

      {/* Code Repository Upload */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <i className="fab fa-github text-gray-800"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Code Repository</h3>
            <p className="text-sm text-slate-600">Connect GitHub repo or upload code files</p>
          </div>
        </div>

        {!uploadedFiles.code ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="repo-url" className="block text-sm font-medium text-slate-700 mb-2">
                GitHub URL
              </Label>
              <Input
                id="repo-url"
                type="url"
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRepoSubmit}
              disabled={!repoUrl.trim() || uploadCodeMutation.isPending}
              className="w-full"
            >
              {uploadCodeMutation.isPending ? "Connecting..." : "Connect Repository"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <i className="fab fa-github text-gray-800"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Repository Connected</p>
              <p className="text-xs text-gray-600">Connected successfully</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
