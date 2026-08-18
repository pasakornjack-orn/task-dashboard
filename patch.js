const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/TaskTable.tsx', 'utf8');

code = code.replace(
  'import { ChevronDown, ChevronRight, Edit, Trash2, Eye, Download } from "lucide-react";',
  'import { ChevronDown, ChevronRight, Edit, Trash2, Eye, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";'
);

code = code.replace(
  'const [isViewModalOpen, setIsViewModalOpen] = useState(false);',
  'const [isViewModalOpen, setIsViewModalOpen] = useState(false);\n  const [sortConfig, setSortConfig] = useState<{ key: keyof Task | null, direction: \'asc\' | \'desc\' }>({ key: null, direction: \'asc\' });'
);

const helpers = `
  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Task) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 inline text-slate-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4 inline text-slate-800 dark:text-slate-200" /> : <ArrowDown className="ml-2 h-4 w-4 inline text-slate-800 dark:text-slate-200" />;
  };

  return (`;
code = code.replace('  return (', helpers);

const oldHeaders = `              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Task ID</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>`;

const newHeaders = `              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Task_Name')}>
                Task Name {getSortIcon('Task_Name')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Task_ID')}>
                Task ID {getSortIcon('Task_ID')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Assignee')}>
                Assignee {getSortIcon('Assignee')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Category')}>
                Category {getSortIcon('Category')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Start_Date')}>
                Start Date {getSortIcon('Start_Date')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Due_Date')}>
                Due Date {getSortIcon('Due_Date')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Status')}>
                Status {getSortIcon('Status')}
              </TableHead>`;

code = code.replace(oldHeaders, newHeaders);

const oldChildRows = '{expandedGroups[mainTask] && groupedTasks[mainTask].map(task => {';
const newChildRows = `{expandedGroups[mainTask] && groupedTasks[mainTask].sort((a, b) => {
                    if (!sortConfig.key) return 0;
                    let aVal: any = a[sortConfig.key];
                    let bVal: any = b[sortConfig.key];
                    
                    if (sortConfig.key === 'Task_ID') {
                      // Numerical sort for Task_ID
                      aVal = parseInt(String(aVal), 10) || 0;
                      bVal = parseInt(String(bVal), 10) || 0;
                    } else {
                      aVal = String(aVal || '').toLowerCase();
                      bVal = String(bVal || '').toLowerCase();
                    }
                    
                    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                  }).map(task => {`;

code = code.replace(oldChildRows, newChildRows);

fs.writeFileSync('src/components/dashboard/TaskTable.tsx', code);
