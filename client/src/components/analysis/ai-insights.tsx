import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";

interface AIInsightsProps {
  projectId: number;
}

interface AIInsight {
  type: "info" | "warning" | "error" | "success";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export default function AIInsights({ projectId }: AIInsightsProps) {
  const { data: insights = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/insights`],
    queryFn: () => api.getInsights(projectId),
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return "fas fa-check-circle text-green-600";
      case "warning":
        return "fas fa-exclamation-triangle text-yellow-600";
      case "error":
        return "fas fa-times-circle text-red-600";
      default:
        return "fas fa-info-circle text-blue-600";
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "warning":
        return "text-yellow-800";
      case "error":
        return "text-red-800";
      default:
        return "text-blue-800";
    }
  };

  const getInsightDescColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-700";
      case "warning":
        return "text-yellow-700";
      case "error":
        return "text-red-700";
      default:
        return "text-blue-700";
    }
  };

  // Calculate confidence based on insights
  const calculateConfidence = () => {
    if (insights.length === 0) return 0;
    
    const errorCount = insights.filter((i: AIInsight) => i.type === "error").length;
    const warningCount = insights.filter((i: AIInsight) => i.type === "warning").length;
    const successCount = insights.filter((i: AIInsight) => i.type === "success").length;
    
    const totalScore = successCount * 100 - errorCount * 30 - warningCount * 15;
    const maxPossibleScore = insights.length * 100;
    
    return Math.max(0, Math.min(100, (totalScore / maxPossibleScore) * 100));
  };

  const confidence = calculateConfidence();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <i className="fas fa-lightbulb text-purple-600"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">AI Insights</h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <i className="fas fa-brain text-4xl mb-4 text-slate-300"></i>
          <p className="text-sm">AI insights will appear here after analysis is complete</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight: AIInsight, index: number) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getInsightBgColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <i className={`${getInsightIcon(insight.type)} mt-0.5`}></i>
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${getInsightTextColor(insight.type)}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-xs ${getInsightDescColor(insight.type)}`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Analysis Confidence</span>
            <span className="font-medium text-slate-800">{Math.round(confidence)}%</span>
          </div>
          <Progress value={confidence} className="h-2 mt-2" />
        </div>
      )}
    </Card>
  );
}
