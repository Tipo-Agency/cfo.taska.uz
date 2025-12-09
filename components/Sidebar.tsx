
import React from 'react';
import { 
  Bug, 
  CheckSquare, 
  Target, 
  FileText, 
  Plus, 
  Home,
  Inbox,
  Layout,
  Trash2,
  Users,
  Briefcase,
  Zap,
  Star,
  Heart,
  Flag,
  Rocket,
  Settings
} from 'lucide-react';
import { TableCollection, User, Role } from '../types';
import { LogoIcon } from './AppIcons';

interface SidebarProps {
  tables: TableCollection[];
  activeTableId: string;
  onSelectTable: (id: string) => void;
  onNavigate: (view: 'home' | 'inbox' | 'search') => void;
  currentView: string;
  currentUser: User;
  onCreateTable: () => void;
  onOpenSettings: () => void;
  onDeleteTable: (id: string) => void;
  unreadCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  tables, 
  activeTableId, 
  onSelectTable, 
  onNavigate,
  currentView,
  currentUser,
  onCreateTable,
  onOpenSettings,
  onDeleteTable,
  unreadCount
}) => {
  
  const getIcon = (iconName: string, colorClass?: string) => {
    const className = colorClass || 'text-gray-500';
    const props = { size: 18, className };

    switch (iconName) {
      case 'Bug': return <Bug {...props} />;
      case 'CheckSquare': return <CheckSquare {...props} />;
      case 'Target': return <Target {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'Flag': return <Flag {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      default: return <Layout {...props} />;
    }
  };

  return (
    <div className="w-64 bg-notion-sidebar dark:bg-notion-dark-sidebar border-r border-notion-border dark:border-notion-dark-border h-screen flex flex-col text-notion-text dark:text-notion-dark-text transition-all duration-300 shrink-0">
      {/* Workspace Header */}
      <div 
        onClick={() => onNavigate('home')}
        className="p-3 m-2 mb-4 flex items-center gap-3 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer transition-colors"
        title="На главную"
      >
        <LogoIcon className="w-6 h-6 shrink-0" />
        <span className="font-semibold text-sm">CFO Workspace</span>
      </div>

      {/* Standard Links */}
      <div className="px-2 py-1 space-y-0.5 mb-4 shrink-0">
        <div 
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'home' ? 'bg-notion-hover dark:bg-notion-dark-hover text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-notion-dark-text/70 hover:bg-notion-hover dark:hover:bg-notion-dark-hover hover:text-notion-text dark:hover:text-white'}`}
        >
          <Home size={16} /> <span className="text-sm">Главная</span>
        </div>
        <div 
            onClick={() => onNavigate('inbox')}
            className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'inbox' ? 'bg-notion-hover dark:bg-notion-dark-hover text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-notion-dark-text/70 hover:bg-notion-hover dark:hover:bg-notion-dark-hover hover:text-notion-text dark:hover:text-white'}`}
        >
            <div className="relative">
                <Inbox size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#f7f7f5] dark:border-[#202020]"></span>
                )}
            </div>
            <span className="text-sm flex-1">Входящие</span>
            {unreadCount > 0 && (
                <span className="text-notion-text dark:text-white text-[10px] font-medium opacity-60">{unreadCount}</span>
            )}
        </div>
      </div>

      {/* Tables List (Scrollable Area) */}
      <div className="px-3 flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="text-xs font-bold text-notion-muted dark:text-notion-dark-muted mb-2 px-2 uppercase flex justify-between items-center sticky top-0 bg-notion-sidebar dark:bg-notion-dark-sidebar z-10 py-1">
            <span>Пространство</span>
        </div>

        <div className="space-y-0.5 pb-4">
          {tables.map(table => (
            <div
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded cursor-pointer text-sm group transition-colors ${
                activeTableId === table.id && currentView === 'table'
                  ? 'bg-notion-hover dark:bg-notion-dark-hover font-medium text-notion-text dark:text-white' 
                  : 'text-notion-text/70 dark:text-notion-dark-text/70 hover:bg-notion-hover dark:hover:bg-notion-dark-hover hover:text-notion-text dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                  {getIcon(table.icon, table.color)}
                  <span className="truncate">{table.name}</span>
              </div>
              {currentUser.role === Role.ADMIN && !table.isSystem && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteTable(table.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                  >
                      <Trash2 size={12} />
                  </button>
              )}
            </div>
          ))}

          {currentUser.role === Role.ADMIN && (
             <button 
                onClick={onCreateTable}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm text-notion-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover hover:text-notion-text dark:hover:text-white mt-2 transition-colors"
            >
                <Plus size={16} />
                <span>Добавить страницу</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Settings - Fixed at Bottom */}
      {currentUser.role === Role.ADMIN && (
        <div className="p-3 mt-auto border-t border-notion-border dark:border-notion-dark-border shrink-0 bg-notion-sidebar dark:bg-notion-dark-sidebar">
             <button 
                onClick={onOpenSettings}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-notion-text dark:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors font-medium"
            >
                <Settings size={16} />
                <span>Настройки</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
