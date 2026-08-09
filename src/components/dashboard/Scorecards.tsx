import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { ListTodo, Clock, CheckCircle2, Search } from "lucide-react";

interface ScorecardsProps {
  tasks: Task[];
}

export function Scorecards({ tasks }: ScorecardsProps) {
  const statusCounts = {
    "To Do": tasks.filter((t) => t.Status === "To Do").length,
    "In Progress": tasks.filter((t) => t.Status === "In Progress").length,
    "Done": tasks.filter((t) => t.Status === "Done").length,
    "Under Review": tasks.filter((t) => t.Status === "Under Review").length,
  };

  const cards = [
    { title: "Total Tasks", count: tasks.length, color: "text-ci-green", border: "border-l-ci-green", bgColor: "bg-ci-green/10" },
    { title: "To Do", count: statusCounts["To Do"], color: "text-ci-blue", border: "border-l-ci-blue", bgColor: "bg-ci-blue/10" },
    { title: "In Progress", count: statusCounts["In Progress"], color: "text-ci-yellow", border: "border-l-ci-yellow", bgColor: "bg-ci-yellow/10" },
    { title: "Under Review", count: statusCounts["Under Review"], color: "text-ci-orange", border: "border-l-ci-orange", bgColor: "bg-ci-orange/10" },
    { title: "Done", count: statusCounts["Done"], color: "text-ci-green", border: "border-l-ci-green", bgColor: "bg-ci-green/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((c, i) => (
        <Card key={i} className={`border-l-4 ${c.border} ${c.bgColor} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-6 space-y-0">
            <CardTitle className={`text-base font-bold ${c.color}`}>{c.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <div className={`text-4xl font-bold ${c.color}`}>{c.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
