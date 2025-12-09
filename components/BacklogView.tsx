
import React from 'react';
import { Task, Project, PriorityOption, Role, User } from '../types';
import { ArrowRight, Calendar, Trash2, Plus } from 'lucide-react';
import { getColorStyles } from '../constants';

interface BacklogViewProps {
  tasks: Task[];
  projects: Project[];
  priorities: PriorityOption[];
  currentUser: User;
  onTakeToWork: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTask: (task: Task) => void;
}

const BacklogView: React.FC<BacklogViewProps> = ({
  tasks,
  projects,
  priorities,
  currentUser,
  onTakeToWork,
  onDeleteTask,
  onOpenTask
}) => {

  const getPriorityStyle = (priorityName: string) => {
    const p = priorities.find(pr => pr.name === priorityName);
    return getColorStyles(p?.color);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 w-full">
      <div className="bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-notion-dark-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-notion-dark-border bg-gray-50/50 dark:bg-notion-dark-bg-subtle/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Задачи в ожидании</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-notion-dark-bg px-2 py-1 rounded border border-gray-200 dark:border-gray-700">{tasks.length}</span>
            </div>
        </div>
        
        {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                В бэклоге пусто. Добавьте новые идеи!
            </div>
        ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    const projectStyles = getColorStyles(project?.color);
                    const priorityStyles = getPriorityStyle(task.priority);

                    return (
                        <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-notion-dark-hover group transition-colors">
                            <div className="flex-1 cursor-pointer" onClick={() => onOpenTask(task)}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</span>
                                    {project && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium truncate max-w-[100px] ${projectStyles.badge}`}>
                                            {project.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                                    <span className={`px-1.5 py-0.5 rounded border text-[10px] ${priorityStyles.badge}`}>
                                        {task.priority}
                                    </span>
                                    <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(task.startDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onTakeToWork(task)}
                                    className="bg-white dark:bg-[#2C2C2C] border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 shadow-sm"
                                >
                                    В работу <ArrowRight size={14}/>
                                </button>
                                {currentUser.role === Role.ADMIN && (
                                    <button 
                                        onClick={() => onDeleteTask(task.id)}
                                        className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default BacklogView;
