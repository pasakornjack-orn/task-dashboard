const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/GanttChart.tsx', 'utf8');

code = code.replace(
  'import { Button } from "@/components/ui/button";',
  'import { Button } from "@/components/ui/button";\nimport { TaskViewModal } from "./TaskViewModal";'
);

code = code.replace(
  'const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});',
  'const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});\n  const [selectedTask, setSelectedTask] = useState<Task | null>(null);\n  const [isViewModalOpen, setIsViewModalOpen] = useState(false);'
);

code = code.replace(
  '<div className="w-64 flex-shrink-0 p-3 pl-10 text-sm border-r border-slate-200 dark:border-slate-800 flex items-center">',
  '<div className="w-64 flex-shrink-0 p-3 pl-10 text-sm border-r border-slate-200 dark:border-slate-800 flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setSelectedTask(task); setIsViewModalOpen(true); }}>'
);

code = code.replace(
  '    </Card>',
  '      <TaskViewModal task={selectedTask} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />\n    </Card>'
);

fs.writeFileSync('src/components/dashboard/GanttChart.tsx', code);
