import Header from "@/components/layout/header";
import ProgressTracker from "@/components/analysis/progress-tracker";
import AIInsights from "@/components/analysis/ai-insights";

interface AnalysisPageProps {
  projectId: number;
}

export default function AnalysisPage({ projectId }: AnalysisPageProps) {
  return (
    <>
      <Header
        title="AI Analysis"
        description="Real-time analysis of your PRD, design, and code"
      />

      <main className="flex-1 p-6 overflow-auto">
        <ProgressTracker projectId={projectId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsights projectId={projectId} />
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Analysis Details</h3>
            <p className="text-sm text-slate-600">
              Detailed analysis results and recommendations will be displayed here once processing is complete.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
