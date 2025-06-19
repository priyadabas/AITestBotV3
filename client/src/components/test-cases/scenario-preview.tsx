import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type TestScenario } from "@/lib/api";

interface ScenarioPreviewProps {
  projectId: number;
}

export default function ScenarioPreview({ projectId }: ScenarioPreviewProps) {
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/scenarios`],
    queryFn: () => api.getTestScenarios(projectId),
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "functional":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "visual":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "integration":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "performance":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-full w-16"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Generated Test Scenarios</h3>
        <Badge variant="secondary" className="bg-blue-100 text-primary">
          {scenarios.length} scenarios
        </Badge>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <i className="fas fa-list-check text-4xl mb-4 text-slate-300"></i>
          <p className="text-sm">Test scenarios will appear here after AI analysis</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scenarios.slice(0, 3).map((scenario: TestScenario) => (
            <div
              key={scenario.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-800 mb-1">
                    {scenario.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">
                    {scenario.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(scenario.priority)}`}
                    >
                      {scenario.priority} Priority
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTypeColor(scenario.type)}`}
                    >
                      {scenario.type}
                    </Badge>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-slate-400 text-xs ml-3"></i>
              </div>
            </div>
          ))}

          {scenarios.length > 3 && (
            <div className="text-center text-sm text-slate-500">
              + {scenarios.length - 3} more scenarios
            </div>
          )}
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full mt-4"
        disabled={scenarios.length === 0}
      >
        View All Test Scenarios
      </Button>
    </Card>
  );
}
