import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { api, type TestScenario } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";

const testScenarioSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["high", "medium", "low"]),
  type: z.enum(["functional", "visual", "integration", "performance"]),
  steps: z.string().min(1, "Test steps are required"),
  expectedResults: z.string().min(1, "Expected results are required"),
});

type TestScenarioForm = z.infer<typeof testScenarioSchema>;

interface TestCasesPageProps {
  projectId: number;
}

export default function TestCasesPage({ projectId }: TestCasesPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/scenarios`],
    queryFn: () => api.getTestScenarios(projectId),
  });

  const form = useForm<TestScenarioForm>({
    resolver: zodResolver(testScenarioSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "functional",
      steps: "",
      expectedResults: "",
    },
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (data: TestScenarioForm) => {
      const stepsArray = data.steps.split('\n').filter(step => step.trim());
      const scenarioData = {
        ...data,
        steps: stepsArray,
        status: "pending",
      };
      
      const response = await fetch(`/api/projects/${projectId}/scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scenarioData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create test scenario");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/scenarios`] });
      setIsDialogOpen(false);
      form.reset();
    },
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

  const onSubmit = (data: TestScenarioForm) => {
    createScenarioMutation.mutate(data);
  };

  return (
    <>
      <Header
        title="Test Cases"
        description="AI-generated test scenarios based on your requirements"
        action={{
          label: "Add Test Case",
          onClick: () => setIsDialogOpen(true),
          icon: "plus",
        }}
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

      {/* Add Test Case Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Manual Test Case</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Case Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test case title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this test case covers"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Steps</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter each test step on a new line:&#10;1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Results</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the expected outcome"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createScenarioMutation.isPending}
                >
                  {createScenarioMutation.isPending ? "Creating..." : "Create Test Case"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
