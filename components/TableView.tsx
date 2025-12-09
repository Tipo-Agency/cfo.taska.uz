
import React, { useRef } from 'react';
import { Project, Role, Task, User, StatusOption, PriorityOption } from '../types';
import { Trash2, Calendar } from 'lucide-react';
import { getColorStyles } from '../constants';

interface TableViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  currentUser: User;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTask: (task: Task) => void;
}

const TableView: React.FC<TableViewProps> = ({ 
  tasks, 
  users, 
  projects, 
  statuses,
  priorities,
  currentUser,
  onUpdateTask,
  onDeleteTask,
  onOpenTask
}) => {

  const getStatusStyle = (statusName: string) => {
    const s = statuses.find(st => st.name === statusName);
    return getColorStyles(s?.color);
  };

  const getPriorityStyle = (priorityName: string) => {
    const p = priorities.find(pr => pr.name === priorityName);
    return getColorStyles(p?.color);
  };

  // REWRITTEN STRUCTURE:
  // 1. h-full w-full: Takes all available space from parent
  // 2. flex flex-col: Organizes children vertically
  // 3. overflow-hidden: Prevents the container itself from scrolling
  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-notion-dark-bg overflow-hidden border-t border-gray-200 dark:border-notion-dark-border">
      
      {/* SCROLLABLE AREA */}
      {/* flex-1: Takes all remaining height */}
      {/* overflow-auto: Adds scrollbars ONLY to this area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
          <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-[#202020] shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <tr>
              <th className="py-3 px-4 font-semibold text-xs w-1/3 text-gray-500 dark:text-gray-400 border-r border-transparent">Задача</th>
              <th className="py-3 px-4 font-semibold text-xs w-36 text-gray-500 dark:text-gray-400">Статус</th>
              <th className="py-3 px-4 font-semibold text-xs w-48 text-gray-500 dark:text-gray-400">Ответственный</th>
              <th className="py-3 px-4 font-semibold text-xs w-36 text-gray-500 dark:text-gray-400">Приоритет</th>
              <th className="py-3 px-4 font-semibold text-xs w-40 text-gray-500 dark:text-gray-400">Модуль</th>
              <th className="py-3 px-4 font-semibold text-xs w-36 text-gray-500 dark:text-gray-400">Срок</th>
              {currentUser.role === Role.ADMIN && <th className="py-3 px-4 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const projectStyles = getColorStyles(project?.color);
              const statusStyle = getStatusStyle(task.status);
              const priorityStyle = getPriorityStyle(task.priority);

              return (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-notion-dark-hover group transition-colors bg-white dark:bg-notion-dark-bg">
                  {/* Title */}
                  <td className="py-2 px-4 align-middle border-r border-transparent">
                    <div 
                        className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-md" 
                        onClick={() => onOpenTask(task)}
                    >
                        {task.title}
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="py-2 px-4 align-middle">
                    <div className={`relative px-2.5 py-1 rounded-md text-xs font-medium w-full transition-all h-7 flex items-center ${statusStyle.badge}`}>
                        <span className="truncate w-full">{task.status}</span>
                        <select 
                            value={task.status}
                            onChange={(e) => onUpdateTask(task.id, { status: e.target.value })}
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        >
                            {statuses.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-2 px-4 align-middle">
                      <div className="relative w-full">
                        <select 
                            value={task.assigneeId || ''}
                            onChange={(e) => onUpdateTask(task.id, { assigneeId: e.target.value || null })}
                            className="w-full bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-600 rounded px-1 py-1 text-xs cursor-pointer focus:ring-1 focus:ring-blue-100 outline-none text-gray-900 dark:text-gray-200 truncate appearance-none"
                        >
                            <option value="" className="bg-white dark:bg-[#2C2C2C]">Не назначено</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id} className="bg-white dark:bg-[#2C2C2C]">{u.name}</option>
                            ))}
                        </select>
                      </div>
                  </td>

                  {/* Priority */}
                  <td className="py-2 px-4 align-middle">
                     <div className={`relative px-2.5 py-0.5 rounded-md text-[10px] font-medium w-full transition-all h-6 flex items-center ${priorityStyle.badge}`}>
                        <span className="truncate w-full">{task.priority}</span>
                        <select 
                            value={task.priority}
                            onChange={(e) => onUpdateTask(task.id, { priority: e.target.value })}
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        >
                            {priorities.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                  </td>

                  {/* Module */}
                  <td className="py-2 px-4 align-middle">
                     <div className={`relative rounded-md px-2.5 py-0.5 text-xs font-medium w-full transition-all h-6 flex items-center ${project ? projectStyles.badge : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700'}`}>
                        <span className="truncate w-full">{project ? project.name : 'Без модуля'}</span>
                        <select
                            value={task.projectId || ''}
                            onChange={(e) => onUpdateTask(task.id, { projectId: e.target.value || null })}
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        >
                            <option value="">Без модуля</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                     </div>
                  </td>

                  {/* Date */}
                  <td className="py-2 px-4 align-middle">
                      <DatePickerCell date={task.endDate} onChange={(val) => onUpdateTask(task.id, { endDate: val })} />
                  </td>
                  
                  {currentUser.role === Role.ADMIN && (
                    <td className="py-2 px-4 align-middle text-right">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDeleteTask(task.id);
                            }}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="В архив"
                        >
                            <Trash2 size={14} />
                        </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {tasks.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-20">
                        <div className="text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#202020] flex items-center justify-center mb-2">
                                <Calendar size={24} className="opacity-50"/>
                            </div>
                            <span className="text-sm">Задач пока нет</span>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DatePickerCell: React.FC<{ date: string, onChange: (val: string) => void }> = ({ date, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        try { if (inputRef.current) inputRef.current.showPicker(); } 
        catch (err) { inputRef.current?.focus(); }
    };

    return (
        <div className="relative group/date w-full cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-notion-dark-hover rounded px-2 py-1 transition-colors min-h-[28px]">
                <span className="text-xs text-gray-600 dark:text-gray-400 pointer-events-none">{formatDate(date)}</span>
                <Calendar size={12} className="text-gray-400 opacity-0 group-hover/date:opacity-100 pointer-events-none" />
            </div>
            <input 
                ref={inputRef} type="date" value={date} onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default TableView;
