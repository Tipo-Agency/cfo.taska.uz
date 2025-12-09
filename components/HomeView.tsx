
import React from 'react';
import { Task, User, ActivityLog } from '../types';
import { CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  tasks: Task[];
  recentActivity: ActivityLog[];
  onOpenTask: (task: Task) => void;
  onNavigateToInbox: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
    currentUser, 
    tasks, 
    recentActivity,
    onOpenTask,
    onNavigateToInbox
}) => {
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'Выполнено');
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="max-w-5xl mx-auto w-full pt-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{greeting}, {currentUser.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">Вот обзор вашего рабочего пространства.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl border border-gray-200 dark:border-notion-dark-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-notion-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-notion-dark-bg-subtle/50">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-blue-500" /> 
                        Мои задачи
                    </h2>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-notion-dark-bg px-2 py-1 rounded border border-gray-200 dark:border-gray-700">{myTasks.length}</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {myTasks.length > 0 ? myTasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => onOpenTask(task)}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-notion-dark-hover cursor-pointer transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {task.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-2">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {task.endDate}
                                </div>
                                <span className="capitalize">{task.priority} приоритет</span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                            У вас нет активных задач. Отличная работа!
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6">
             <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl border border-gray-200 dark:border-notion-dark-border shadow-sm overflow-hidden flex flex-col h-full">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-notion-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-notion-dark-bg-subtle/50">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Clock size={18} className="text-orange-500" /> 
                        Активность
                    </h2>
                </div>
                <div className="flex-1 p-0 overflow-y-auto max-h-[400px]">
                    {recentActivity.slice(0, 5).map(log => (
                        <div key={log.id} className="p-3 border-b border-gray-50 dark:border-gray-800 last:border-0 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white text-xs">{log.userName}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                                {log.action} <span className="text-gray-800 dark:text-gray-200">"{log.details}"</span>
                            </p>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">Тишина...</div>
                    )}
                </div>
                <button onClick={onNavigateToInbox} className="p-3 text-xs text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-100 dark:border-gray-800 font-medium flex items-center justify-center gap-1">
                    Смотреть все <ArrowRight size={12} />
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
