import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BotExecutionPageProps {
  projectId: number;
}

export default function BotExecutionPage({ projectId }: BotExecutionPageProps) {
  return (
    <>
      <Header
        title="Bot Execution"
        description="Run AI-powered bots to execute your test scenarios"
        action={{
          label: "Start All Tests",
          icon: "fas fa-play",
          onClick: () => console.log("Starting all tests"),
        }}
      />

      <main className="flex-1 p-6 overflow-auto">
        <Card className="p-12 text-center">
          <i className="fas fa-robot text-6xl text-slate-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Bot Execution Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            AI-powered test execution bots will run your test scenarios automatically.
          </p>
          <Button variant="outline" disabled>
            <i className="fas fa-play mr-2"></i>
            Execute Tests
          </Button>
        </Card>
      </main>
    </>
  );
}
