import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import UploadPage from "@/pages/upload";
import AnalysisPage from "@/pages/analysis";
import TestCasesPage from "@/pages/test-cases";
import BotExecutionPage from "@/pages/bot-execution";
import DashboardPage from "@/pages/dashboard";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from './config';

function Router() {
  const [currentProjectId, setCurrentProjectId] = useState<number>(1);

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => api.getProjects(),
  });

  // Create a default project if none exist
  const { data: defaultProject } = useQuery({
    queryKey: ["default-project"],
    queryFn: async () => {
      if (!projects || projects.length === 0) {
        return api.createProject({
          name: "My UAT Testing Project",
          description: "AI-powered UAT testing for product development"
        });
      }
      return projects[0];
    },
    enabled: projects !== undefined,
  });

  const projectId = defaultProject?.id || currentProjectId;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentProjectId={projectId} />
      <div className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={() => <UploadPage projectId={projectId} />} />
          <Route path="/upload" component={() => <UploadPage projectId={projectId} />} />
          <Route path="/analysis" component={() => <AnalysisPage projectId={projectId} />} />
          <Route path="/test-cases" component={() => <TestCasesPage projectId={projectId} />} />
          <Route path="/bot-execution" component={() => <BotExecutionPage projectId={projectId} />} />
          <Route path="/dashboard" component={() => <DashboardPage projectId={projectId} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-slate-50">
          <div className="flex items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-white text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">UAT Testing AI Bot</h1>
              <p className="text-gray-600 mb-6">AI-powered testing for your product development</p>
              <div className="text-sm text-gray-500">
                <p>Application is loading...</p>
                <p>Frontend connected successfully!</p>
              </div>
            </div>
          </div>
        </div>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
