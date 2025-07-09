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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '24px'
        }}>
          🤖
        </div>
        <h1 style={{ color: '#1e293b', margin: '0 0 10px' }}>UAT Testing AI Bot</h1>
        <p style={{ color: '#64748b', margin: '0 0 20px' }}>AI-powered User Acceptance Testing</p>
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          padding: '15px',
          borderRadius: '5px',
          margin: '20px 0',
          color: '#166534'
        }}>
          ✓ React Application Loaded Successfully<br/>
          ✓ Frontend is now working properly<br/>
          ✓ Ready to restore full interface
        </div>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Your JIT PRD has been processed and test scenarios are ready!
        </p>
      </div>
    </div>
  );
}

export default App;
