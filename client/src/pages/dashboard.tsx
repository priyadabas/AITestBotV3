import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
  projectId: number;
}

export default function DashboardPage({ projectId }: DashboardPageProps) {
  return (
    <>
      <Header
        title="Results Dashboard"
        description="Overview of test results and recommendations"
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tests</p>
                <p className="text-2xl font-bold text-slate-800">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-list-check text-blue-600"></i>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Passed Tests</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed Tests</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-times-circle text-red-600"></i>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-12 text-center">
          <i className="fas fa-chart-line text-6xl text-slate-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Dashboard Coming Soon</h3>
          <p className="text-slate-600">
            Comprehensive test results and analytics will be displayed here after test execution.
          </p>
        </Card>
      </main>
    </>
  );
}
