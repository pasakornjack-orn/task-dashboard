const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/Charts.tsx', 'utf8');

// 1. Import LabelList
code = code.replace(
  'import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";',
  'import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from "recharts";'
);

// 2. Add LabelList to Workload chart
code = code.replace(
  '<Bar dataKey="tasks" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />',
  '<Bar dataKey="tasks" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>\n                  <LabelList dataKey="tasks" position="right" fill="#64748b" fontSize={12} />\n                </Bar>'
);

// 3. Add daily data logic
const dailyDataLogic = `
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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {`;

code = code.replace('  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {', dailyDataLogic);

// 4. Add Daily Tasks chart
const dailyChart = `
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
}`;

code = code.replace('    </div>\n  );\n}', dailyChart);

fs.writeFileSync('src/components/dashboard/Charts.tsx', code);
