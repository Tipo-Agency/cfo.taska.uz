
import React from 'react';
import { Project, StatusOption, User } from '../types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  statuses: StatusOption[];
  users: User[];
  projects: Project[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  userFilter: string;
  setUserFilter: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  hideDone: boolean;
  setHideDone: (val: boolean) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  statuses,
  users,
  projects,
  statusFilter,
  setStatusFilter,
  userFilter,
  setUserFilter,
  projectFilter,
  setProjectFilter,
  hideDone,
  setHideDone
}) => {
  
  const hasActiveFilters = statusFilter || userFilter || projectFilter || hideDone;
  const clearFilters = () => {
      setStatusFilter('');
      setUserFilter('');
      setProjectFilter('');
      setHideDone(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-1">
      {/* Status Filter */}
      <select 
        value={statusFilter} 
        onChange={e => setStatusFilter(e.target.value)}
        className={`text-sm border rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${statusFilter ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2C] hover:border-gray-300'}`}
      >
        <option value="">Все статусы</option>
        {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>

      {/* User Filter */}
      <select 
        value={userFilter} 
        onChange={e => setUserFilter(e.target.value)}
        className={`text-sm border rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${userFilter ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2C] hover:border-gray-300'}`}
      >
        <option value="">Все сотрудники</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>

      {/* Project Filter */}
      <select 
        value={projectFilter} 
        onChange={e => setProjectFilter(e.target.value)}
        className={`text-sm border rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-colors ${projectFilter ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2C] hover:border-gray-300'}`}
      >
        <option value="">Все модули</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {/* Hide Done Toggle */}
      <label className={`flex items-center gap-2 text-sm cursor-pointer select-none px-2 py-1.5 rounded-lg transition-colors ${hideDone ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'}`}>
          <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} className="hidden" />
          <div className={`w-4 h-4 rounded border flex items-center justify-center ${hideDone ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-[#2C2C2C]'}`}>
              {hideDone && <X size={12} className="text-white" />}
          </div>
          <span>Скрыть выполненные</span>
      </label>

      {/* Clear Button */}
      {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 underline ml-auto">
              Сбросить
          </button>
      )}
    </div>
  );
};

export default FilterBar;
