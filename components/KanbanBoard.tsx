
import React from 'react';
import { Project, Role, Task, User, StatusOption } from '../types';
import { MoreHorizontal, Plus } from 'lucide-react';
import { getColorStyles } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  statuses: StatusOption[];
  currentUser: User;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onOpenTask: (task: Task) => void;
  onAddClick: (status: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  users, 
  projects, 
  statuses,
  currentUser,
  onUpdateStatus,
  onOpenTask,
  onAddClick
}) => {
  const getTasksByStatus = (statusName: string) => {
    return tasks.filter(t => t.status === statusName);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.setData('taskId', taskId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, statusName: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
          onUpdateStatus(taskId, statusName);
      }
  };

  return (
    <div className="flex h-full overflow-x-auto gap-4 pb-4">
      {statuses.map(status => {
          const statusTasks = getTasksByStatus(status.name);
          const statusStyles = getColorStyles(status.color);

          return (
            <div 
                key={status.id} 
                className="flex-shrink-0 w-80 flex flex-col rounded-lg p-2 bg-gray-50 dark:bg-[#191919] border border-gray-100 dark:border-notion-dark-border"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.name)}
            >
              <div className="flex items-center justify-between mb-3 px-2 pt-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{status.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[#2C2C2C] px-1.5 py-0.5 rounded shadow-sm">{statusTasks.length}</span>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onAddClick(status.name)}
                        className="text-gray-400 hover:bg-white dark:hover:bg-[#2C2C2C] hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
                        title="Добавить задачу"
                    >
                        <Plus size={14} />
                    </button>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar">
                {statusTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const project = projects.find(p => p.id === task.projectId);
                    const projectStyles = getColorStyles(project?.color);

                    return (
                        <div 
                            key={task.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => onOpenTask(task)}
                            className="bg-white dark:bg-[#2C2C2C] p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing"
                        >
                            <div className="text-sm font-medium mb-3 text-gray-800 dark:text-gray-200 leading-snug">{task.title}</div>
                            
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    {assignee && (
                                        <div className="relative group/avatar">
                                            <img src={assignee.avatar} className="w-5 h-5 rounded-full border border-gray-100 dark:border-gray-500" alt="avatar" />
                                            <div className="absolute bottom-full mb-1 left-0 hidden group-hover/avatar:block text-[10px] bg-black text-white px-1 rounded whitespace-nowrap z-10">
                                                {assignee.name}
                                            </div>
                                        </div>
                                    )}
                                    {project && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium truncate max-w-[80px] ${projectStyles.badge}`}>
                                            {project.name}
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{task.endDate}</div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          );
      })}
    </div>
  );
};

export default KanbanBoard;
