import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type TestScenario } from "@/lib/api";

interface TestCasesPageProps {
  projectId: number;
}

export default function TestCasesPage({ projectId }: TestCasesPageProps) {
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

  return (
    <>
      <Header
        title="Test Cases"
        description="AI-generated test scenarios based on your requirements"
      />

      <main className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : scenarios.length === 0 ? (
          <Card className="p-12 text-center">
            <i className="fas fa-list-check text-6xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Test Cases Generated</h3>
            <p className="text-slate-600 mb-4">
              Upload your PRD, design, and code files to generate AI-powered test scenarios.
            </p>
            <Button variant="outline">
              Go to Upload & Setup
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {scenarios.map((scenario: TestScenario) => (
              <Card key={scenario.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {scenario.description}
                    </p>
                    <div className="flex items-center space-x-2 mb-4">
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
                  <Button variant="outline" size="sm">
                    <i className="fas fa-play mr-2"></i>
                    Run Test
                  </Button>
                </div>

                {scenario.steps && scenario.steps.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Test Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {scenario.steps.map((step, index) => (
                        <li key={index} className="text-xs text-slate-600">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {scenario.expectedResults && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Expected Results:</h4>
                    <p className="text-xs text-slate-600">{scenario.expectedResults}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
