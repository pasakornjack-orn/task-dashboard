"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from "recharts";

interface ChartsProps {
  tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
  "To Do": "#95cfe5", // ci-blue
  "In Progress": "#d4c312", // ci-yellow
  "Under Review": "#db4a20", // ci-orange
  "Done": "#045c44", // ci-green
};

export function Charts({ tasks }: ChartsProps) {
  // Status Distribution Data
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.Status] = (acc[task.Status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
    color: STATUS_COLORS[status] || "#000",
  }));

  // Workload by Assignee Data
  const assigneeCounts = tasks.reduce((acc, task) => {
    acc[task.Assignee] = (acc[task.Assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assigneeData = Object.keys(assigneeCounts)
    .map(assignee => ({
      name: assignee,
      tasks: assigneeCounts[assignee],
    }))
    .sort((a, b) => b.tasks - a.tasks); // Sort by highest workload


  // Daily Task Volume Data
  const dailyCounts = tasks.reduce((acc, task) => {
    const date = task.Start_Date;
    if (date) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const dailyData = Object.keys(dailyCounts)
    .sort() // Sort by date ascending
    .map(date => {
      // Format date nicely (e.g. 'Aug 14')
      const d = new Date(date);
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        fullDate: date,
        tasks: dailyCounts[date],
      };
    });

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {value}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Status Distribution Doughnut Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>

          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Workload Distribution Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Workload by Assignee</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {assigneeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="tasks" position="right" fill="#64748b" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Daily Task Volume Bar Chart */}
      <Card className="shadow-sm md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daily Task Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  <LabelList dataKey="tasks" position="top" fill="#64748b" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
