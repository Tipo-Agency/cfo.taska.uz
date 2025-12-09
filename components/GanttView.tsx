
import React from 'react';
import { Task, User, Project } from '../types';

interface GanttViewProps {
  tasks: Task[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
}

const GanttView: React.FC<GanttViewProps> = ({ tasks, projects, onOpenTask }) => {
  // Simple Mock date range logic
  const startDate = new Date('2025-10-01');
  const endDate = new Date('2025-12-31');
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = (d.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return (diff / totalDays) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e.getTime() - s.getTime()) / (1000 * 3600 * 24);
    const w = (diff / totalDays) * 100;
    return w < 1 ? 1 : w;
  };

  const groupedTasks = projects.map(p => ({
      project: p,
      tasks: tasks.filter(t => t.projectId === p.id)
  })).filter(g => g.tasks.length > 0);

  const noProjectTasks = tasks.filter(t => !t.projectId);
  if (noProjectTasks.length > 0) {
      groupedTasks.push({ project: { id: 'none', name: 'Без проекта' }, tasks: noProjectTasks });
  }

  const months = ['Окт', 'Ноя', 'Дек']; 

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-notion-dark-bg border border-notion-border dark:border-notion-dark-border rounded-lg shadow-sm">
      {/* Timeline Header */}
      <div className="flex border-b border-notion-border dark:border-notion-dark-border h-10 bg-gray-50 dark:bg-[#202020]">
        <div className="w-56 border-r border-notion-border dark:border-notion-dark-border shrink-0 p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
            Проект / Задача
        </div>
        <div className="flex-1 flex relative">
           {months.map((m, i) => (
               <div key={m} className="flex-1 border-l border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 p-2 font-medium">
                   {m} 2025
               </div>
           ))}
        </div>
      </div>

      {/* Timeline Body */}
      <div className="overflow-y-auto flex-1 pb-20 bg-white dark:bg-notion-dark-bg">
        {groupedTasks.map(group => (
            <div key={group.project.id} className="mb-0">
                <div className="bg-gray-50/90 dark:bg-[#202020]/90 backdrop-blur px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 sticky top-0 border-b border-gray-100 dark:border-gray-800 z-10">
                    {group.project.name}
                </div>
                {group.tasks.map(task => {
                    const left = getPosition(task.startDate);
                    const width = getWidth(task.startDate, task.endDate);
                    
                    return (
                        <div key={task.id} className="flex h-9 hover:bg-gray-50 dark:hover:bg-notion-dark-hover border-b border-gray-100 dark:border-gray-800 group">
                             <div className="w-56 border-r border-notion-border dark:border-notion-dark-border shrink-0 px-3 text-xs truncate text-notion-text dark:text-notion-dark-text flex items-center cursor-pointer hover:underline" onClick={() => onOpenTask(task)}>
                                {task.title}
                             </div>
                             <div className="flex-1 relative flex items-center my-1">
                                 {/* Grid Lines */}
                                 <div className="absolute inset-0 flex pointer-events-none">
                                    <div className="flex-1 border-r border-dashed border-gray-100 dark:border-gray-800"></div>
                                    <div className="flex-1 border-r border-dashed border-gray-100 dark:border-gray-800"></div>
                                    <div className="flex-1 border-r border-dashed border-gray-100 dark:border-gray-800"></div>
                                 </div>

                                 {/* Task Bar */}
                                 <div 
                                    onClick={() => onOpenTask(task)}
                                    className="absolute h-5 rounded bg-blue-500/90 border border-blue-600 hover:bg-blue-600 cursor-pointer transition-all shadow-sm flex items-center z-10"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`
                                    }}
                                    title={`${task.title} (${task.startDate} - ${task.endDate})`}
                                 >
                                    <span className="text-[10px] text-white px-1.5 truncate w-full font-medium drop-shadow-sm select-none">
                                        {width > 8 ? task.title : ''}
                                    </span>
                                 </div>
                             </div>
                        </div>
                    );
                })}
            </div>
        ))}
      </div>
    </div>
  );
};

export default GanttView;
