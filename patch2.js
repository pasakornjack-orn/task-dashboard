const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/TaskTable.tsx', 'utf8');

code = code.replace(
  'import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";',
  'import { TaskViewModal } from "./TaskViewModal";'
);

const oldModalStart = code.indexOf('<Dialog open={isViewModalOpen}');
const oldModalEnd = code.indexOf('</Dialog>', oldModalStart) + 9;
const oldModal = code.substring(oldModalStart, oldModalEnd);
const newModal = '<TaskViewModal task={selectedTask} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />';

code = code.replace(oldModal, newModal);

fs.writeFileSync('src/components/dashboard/TaskTable.tsx', code);
