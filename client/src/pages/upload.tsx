import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import UploadSection from "@/components/upload/upload-section";
import ProgressTracker from "@/components/analysis/progress-tracker";
import ScenarioPreview from "@/components/test-cases/scenario-preview";
import AIInsights from "@/components/analysis/ai-insights";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface UploadPageProps {
  projectId: number;
}

export default function UploadPage({ projectId }: UploadPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateScenariosMutation = useMutation({
    mutationFn: () => api.generateScenarios(projectId),
    onSuccess: () => {
      toast({ title: "Test scenarios generated successfully!" });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/insights`] });
    },
    onError: () => {
      toast({ 
        title: "Failed to generate test scenarios", 
        description: "Please ensure all required analysis is complete.",
        variant: "destructive" 
      });
    },
  });

  return (
    <>
      <Header
        title="Upload & Setup"
        description="Upload your PRD, Figma designs, and code to generate AI-powered UAT test scenarios"
        action={{
          label: "Start AI Analysis",
          icon: "fas fa-brain",
          onClick: () => generateScenariosMutation.mutate(),
          disabled: generateScenariosMutation.isPending,
        }}
      />

      <main className="flex-1 p-6 overflow-auto">
        <UploadSection projectId={projectId} />
        <ProgressTracker projectId={projectId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScenarioPreview projectId={projectId} />
          <AIInsights projectId={projectId} />
        </div>
      </main>
    </>
  );
}
