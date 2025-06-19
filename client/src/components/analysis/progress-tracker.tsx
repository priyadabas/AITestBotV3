import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api, type AnalysisResult } from "@/lib/api";

interface ProgressTrackerProps {
  projectId: number;
}

export default function ProgressTracker({ projectId }: ProgressTrackerProps) {
  const { data: analysisResults = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/analysis`],
    queryFn: () => api.getAnalysisResults(projectId),
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const getAnalysisStatus = (type: string) => {
    return analysisResults.find(result => result.type === type);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return "fas fa-check text-green-600";
      case "in_progress":
        return "fas fa-spinner fa-spin text-yellow-600";
      case "failed":
        return "fas fa-times text-red-600";
      default:
        return "fas fa-clock text-slate-400";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-slate-500";
    }
  };

  const prdAnalysis = getAnalysisStatus("prd_analysis");
  const designAnalysis = getAnalysisStatus("design_analysis");
  const codeAnalysis = getAnalysisStatus("code_analysis");

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">AI Analysis Progress</h3>
          <p className="text-sm text-slate-600">Real-time analysis of your uploaded documents and code</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600">Processing...</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* PRD Analysis */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-200">
            <i className={getStatusIcon(prdAnalysis?.status)}></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-800">PRD Document Analysis</p>
              <span className={`text-xs font-medium ${getStatusColor(prdAnalysis?.status)}`}>
                {getStatusText(prdAnalysis?.status)}
              </span>
            </div>
            <Progress value={prdAnalysis?.progress || 0} className="h-2" />
            <p className="text-xs text-slate-600 mt-1">
              {prdAnalysis?.status === "completed" 
                ? "Analysis completed successfully"
                : prdAnalysis?.status === "in_progress"
                ? "Analyzing requirements and user stories..."
                : "Waiting to start analysis..."
              }
            </p>
          </div>
        </div>

        {/* Design Analysis */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-200">
            <i className={getStatusIcon(designAnalysis?.status)}></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-800">Design Pattern Analysis</p>
              <span className={`text-xs font-medium ${getStatusColor(designAnalysis?.status)}`}>
                {getStatusText(designAnalysis?.status)}
              </span>
            </div>
            <Progress value={designAnalysis?.progress || 0} className="h-2" />
            <p className="text-xs text-slate-600 mt-1">
              {designAnalysis?.status === "completed"
                ? "Design analysis completed successfully"
                : designAnalysis?.status === "in_progress"
                ? "Analyzing UI components and user flows..."
                : "Waiting for analysis to start..."
              }
            </p>
          </div>
        </div>

        {/* Code Analysis */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-slate-200">
            <i className={getStatusIcon(codeAnalysis?.status)}></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-800">Code Implementation Review</p>
              <span className={`text-xs font-medium ${getStatusColor(codeAnalysis?.status)}`}>
                {getStatusText(codeAnalysis?.status)}
              </span>
            </div>
            <Progress value={codeAnalysis?.progress || 0} className="h-2" />
            <p className="text-xs text-slate-600 mt-1">
              {codeAnalysis?.status === "completed"
                ? "Code analysis completed successfully"
                : codeAnalysis?.status === "in_progress"
                ? "Analyzing code implementation and architecture..."
                : "Waiting for previous analysis completion..."
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
