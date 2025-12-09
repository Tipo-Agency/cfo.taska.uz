
import React from 'react';
import { useAppLogic } from './hooks/useAppLogic';
import { LogoIcon, FAVICON_SVG_DATA_URI } from './components/AppIcons';
import { 
  Search, Inbox, Home, Settings, LogOut, ChevronRight, 
  LayoutList, KanbanSquare as KanbanIcon, Calendar, Plus, Bell, Loader2, Moon, Sun,
  Bug, CheckSquare, Target, FileText, Users, Briefcase, Zap, Star, Heart, Flag, Rocket, Layout
} from 'lucide-react';
import { getColorStyles, ICON_OPTIONS, COLOR_OPTIONS } from './constants';

import Sidebar from './components/Sidebar';
import TableView from './components/TableView';
import KanbanBoard from './components/KanbanBoard';
import GanttView from './components/GanttView';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import InboxView from './components/InboxView';
import HomeView from './components/HomeView';
import MeetingsView from './components/MeetingsView';
import DocModal from './components/DocModal';
import DocEditor from './components/DocEditor';
import ProfileModal from './components/ProfileModal';
import FilterBar from './components/FilterBar';
import BacklogView from './components/BacklogView';
import DocsView from './components/DocsView';
import { Role, ViewMode, TableCollection } from './types';

const App: React.FC = () => {
  // Use the Logic Hook
  const app = useAppLogic();

  // Dynamic Icon Helper (UI specific)
  const getDynamicIcon = (name: string, color = 'text-gray-600', size = 24) => {
      const props = { size, className: color };
      switch(name) {
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

  if (app.loading) return <div className="h-screen flex items-center justify-center dark:bg-notion-dark-bg"><Loader2 className="animate-spin dark:text-white" /></div>;

  if (!app.currentUser) {
      return (
          <div className="h-screen flex items-center justify-center bg-[#F7F7F5] dark:bg-notion-dark-bg">
              <div className="bg-white dark:bg-notion-dark-sidebar p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-notion-dark-border">
                  <div className="flex justify-center mb-6"><LogoIcon className="w-16 h-16" /></div>
                  <h2 className="text-xl font-bold text-center mb-6 dark:text-white">{app.changePasswordMode ? 'Смена пароля' : 'Вход в CFO Workspace'}</h2>
                  {app.authError && <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-sm">{app.authError}</div>}
                  {app.changePasswordMode ? (
                      <form onSubmit={app.handleFirstTimePasswordChange} className="space-y-4">
                          <div><label className="block text-xs font-bold text-gray-500 mb-1">Новый пароль</label><input type="password" value={app.newPassword} onChange={e => app.setNewPassword(e.target.value)} className="w-full border rounded p-2 bg-white dark:bg-[#2C2C2C] dark:border-gray-600 dark:text-white" /></div>
                          <div><label className="block text-xs font-bold text-gray-500 mb-1">Повторите</label><input type="password" value={app.confirmPassword} onChange={e => app.setConfirmPassword(e.target.value)} className="w-full border rounded p-2 bg-white dark:bg-[#2C2C2C] dark:border-gray-600 dark:text-white" /></div>
                          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Сохранить</button>
                      </form>
                  ) : (
                      <form onSubmit={app.handleLogin} className="space-y-4">
                          <div><label className="block text-xs font-bold text-gray-500 mb-1">Логин</label><input value={app.loginForm.login} onChange={e => app.setLoginForm({...app.loginForm, login: e.target.value})} className="w-full border rounded p-2 bg-white text-gray-900 dark:bg-[#2C2C2C] dark:border-gray-600 dark:text-white" /></div>
                          <div><label className="block text-xs font-bold text-gray-500 mb-1">Пароль</label><input type="password" value={app.loginForm.password} onChange={e => app.setLoginForm({...app.loginForm, password: e.target.value})} className="w-full border rounded p-2 bg-white text-gray-900 dark:bg-[#2C2C2C] dark:border-gray-600 dark:text-white" /></div>
                          <button type="submit" className="w-full bg-[#FA7313] text-white p-2 rounded font-bold hover:bg-[#e0650f]">Войти</button>
                      </form>
                  )}
              </div>
          </div>
      );
  }

  const activeTable = app.tables.find(t => t.id === app.activeTableId);

  if (app.activeDocId) {
      const doc = app.docs.find(d => d.id === app.activeDocId);
      if (doc) return <DocEditor doc={doc} onSave={app.handleSaveDocContent} onBack={() => app.setActiveDocId('')} />;
  }

  return (
    <div className={`flex h-screen w-full bg-white dark:bg-notion-dark-bg text-notion-text dark:text-notion-dark-text ${app.isDarkMode ? 'dark' : ''}`}>
       <Sidebar tables={app.tables} activeTableId={app.activeTableId} onSelectTable={app.handleSelectTable} onNavigate={app.handleNavigate} currentView={app.currentView} currentUser={app.currentUser} onCreateTable={app.openCreateTableModal} onOpenSettings={() => app.setIsSettingsOpen(true)} onDeleteTable={app.handleDeleteTable} unreadCount={app.activities.filter(a => !a.read).length} />

       <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-notion-dark-bg">
          <header className="h-14 border-b border-gray-200 dark:border-notion-dark-border flex items-center justify-between px-6 shrink-0 bg-white dark:bg-notion-dark-bg">
             <div className="flex items-center gap-3 flex-1 max-w-xl">
                 {app.currentView === 'home' && <h2 className="font-semibold text-lg">Главная</h2>}
                 {app.currentView === 'inbox' && <h2 className="font-semibold text-lg">Входящие</h2>}
                 {app.currentView === 'table' && activeTable && (
                     <div className="flex items-center gap-2">
                         <span className={`p-1 rounded bg-gray-100 dark:bg-notion-dark-sidebar ${activeTable.color?.replace('text-', 'text-') || 'text-gray-500'}`}>
                             {getDynamicIcon(activeTable.icon, 'w-4 h-4 text-current', 16)}
                         </span>
                         <h2 className="font-semibold text-lg truncate">{activeTable.name}</h2>
                         {app.currentUser.role === Role.ADMIN && <button onClick={() => app.openEditTableModal(activeTable)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-notion-dark-hover"><Settings size={14}/></button>}
                     </div>
                 )}
                 
                 {/* GLOBAL SEARCH */}
                 <div className="relative flex-1 mx-4 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Поиск..." 
                        value={app.searchQuery}
                        onChange={e => app.setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-notion-dark-sidebar border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                    />
                 </div>
             </div>
             <div className="flex items-center gap-4">
                 <button onClick={() => app.setIsDarkMode(!app.isDarkMode)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-notion-dark-hover">
                     {app.isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
                 </button>
                 <button className="relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-notion-dark-hover" onClick={() => app.handleNavigate('inbox')}><Bell size={20} />{app.activities.filter(a => !a.read).length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
                 <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-notion-dark-hover p-1 rounded-lg transition-colors" onClick={() => app.setIsProfileOpen(true)}><img src={app.currentUser.avatar} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600" /><span className="text-sm font-medium hidden sm:block">{app.currentUser.name}</span></div>
                 <button onClick={app.handleLogout} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-notion-dark-hover"><LogOut size={18} /></button>
             </div>
          </header>

          <div className="flex-1 overflow-hidden flex flex-col relative">
              {app.currentView === 'home' && <HomeView currentUser={app.currentUser} tasks={app.tasks} recentActivity={app.activities} onOpenTask={(t) => { app.setEditingTask(t); app.setIsTaskModalOpen(true); }} onNavigateToInbox={() => app.handleNavigate('inbox')} />}
              {app.currentView === 'inbox' && <InboxView activities={app.activities} onMarkAllRead={app.handleMarkAllRead} />}
              
              {/* TASK VIEW */}
              {app.currentView === 'table' && activeTable?.type === 'tasks' && (
                  <div className="flex flex-col h-full">
                      <div className="px-6 py-3 border-b border-gray-200 dark:border-notion-dark-border flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-notion-dark-bg shrink-0">
                          <div className="flex items-center bg-gray-100 dark:bg-notion-dark-sidebar p-1 rounded-lg shrink-0">
                             {activeTable.viewConfig?.showTable && <button onClick={() => app.setViewMode(ViewMode.TABLE)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${app.viewMode === ViewMode.TABLE ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>Таблица</button>}
                             {activeTable.viewConfig?.showKanban && <button onClick={() => app.setViewMode(ViewMode.KANBAN)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${app.viewMode === ViewMode.KANBAN ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>Канбан</button>}
                             {activeTable.viewConfig?.showGantt && <button onClick={() => app.setViewMode(ViewMode.GANTT)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${app.viewMode === ViewMode.GANTT ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}>Гант</button>}
                          </div>
                          <div className="flex items-center gap-3">
                              <FilterBar statuses={app.statuses} users={app.users} projects={app.projects} statusFilter={app.statusFilter} setStatusFilter={app.setStatusFilter} userFilter={app.userFilter} setUserFilter={app.setUserFilter} projectFilter={app.projectFilter} setProjectFilter={app.setProjectFilter} hideDone={app.hideDone} setHideDone={app.setHideDone} />
                              <button onClick={() => { app.setEditingTask(null); app.setIsTaskModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Новая</button>
                          </div>
                      </div>
                      
                      <div className="flex-1 relative bg-white dark:bg-notion-dark-bg">
                          {app.viewMode === ViewMode.TABLE && (
                              <div className="absolute inset-0 p-4 overflow-hidden">
                                 <TableView tasks={app.getFilteredTasks()} users={app.users} projects={app.projects} statuses={app.statuses} priorities={app.priorities} currentUser={app.currentUser} onUpdateTask={app.handleUpdateTask} onDeleteTask={app.handleDeleteTask} onOpenTask={(t) => { app.setEditingTask(t); app.setIsTaskModalOpen(true); }} />
                              </div>
                          )}
                          {app.viewMode === ViewMode.KANBAN && (
                            <div className="absolute inset-0 overflow-auto p-4">
                                <KanbanBoard tasks={app.getFilteredTasks()} users={app.users} projects={app.projects} statuses={app.statuses} currentUser={app.currentUser} onUpdateStatus={(tid, s) => app.handleUpdateTask(tid, { status: s })} onOpenTask={(t) => { app.setEditingTask(t); app.setIsTaskModalOpen(true); }} onAddClick={(s) => { app.setEditingTask(null); app.setIsTaskModalOpen(true); }} />
                            </div>
                          )}
                          {app.viewMode === ViewMode.GANTT && (
                            <div className="absolute inset-0 overflow-auto p-4">
                                <GanttView tasks={app.getFilteredTasks()} projects={app.projects} onOpenTask={(t) => { app.setEditingTask(t); app.setIsTaskModalOpen(true); }} />
                            </div>
                          )}
                      </div>
                  </div>
              )}

              {app.currentView === 'table' && activeTable?.type === 'backlog' && (
                  <div className="flex flex-col h-full bg-white dark:bg-notion-dark-bg">
                      <div className="px-6 py-3 border-b border-gray-200 dark:border-notion-dark-border flex justify-end">
                          <button onClick={() => { app.setEditingTask(null); app.setIsTaskModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Новая задача</button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-6">
                        <BacklogView tasks={app.getFilteredTasks().filter(t => t.tableId === app.activeTableId)} projects={app.projects} priorities={app.priorities} currentUser={app.currentUser} onTakeToWork={(t) => app.handleTakeToWork(t)} onDeleteTask={app.handleDeleteTask} onOpenTask={(t) => { app.setEditingTask(t); app.setIsTaskModalOpen(true); }} />
                      </div>
                  </div>
              )}

              {app.currentView === 'table' && activeTable?.type === 'meetings' && (
                  <MeetingsView meetings={app.meetings} users={app.users} tableId={app.activeTableId} onSaveMeeting={app.handleSaveMeeting} onUpdateSummary={app.handleUpdateSummary} />
              )}

              {app.currentView === 'table' && activeTable?.type === 'docs' && (
                  <DocsView 
                      docs={app.docs} 
                      folders={app.folders} 
                      currentUser={app.currentUser} 
                      tableId={app.activeTableId}
                      onOpenDoc={(doc) => { 
                          if (doc.type === 'internal') { app.setActiveDocId(doc.id); app.setCurrentView('doc-editor'); } 
                          else if (doc.url) window.open(doc.url, '_blank'); 
                      }}
                      onCreateDoc={(folderId) => { app.setNewDocFolderId(folderId || null); app.setIsDocModalOpen(true); }}
                      onDeleteDoc={app.handleDeleteDoc}
                      onCreateFolder={() => app.setIsFolderModalOpen(true)}
                      onDeleteFolder={app.handleDeleteFolder}
                  />
              )}
          </div>
          
          {app.notification && <div className="fixed bottom-6 right-6 bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-[99]">{app.notification}</div>}
       </main>

       {/* Modals */}
       {app.isTaskModalOpen && <TaskModal users={app.users} projects={app.projects} statuses={app.statuses} priorities={app.priorities} currentUser={app.currentUser} docs={app.docs} task={app.editingTask} onSave={app.editingTask ? (u) => app.handleUpdateTask(app.editingTask.id, u) : app.handleCreateTask} onClose={() => app.setIsTaskModalOpen(false)} onDelete={app.handleDeleteTask} onCreateProject={(name) => app.handleUpdateProjects([...app.projects, {id:`p-${Date.now()}`, name, color:'text-gray-500'}])} onAddComment={app.handleAddComment} onAddAttachment={app.handleAddAttachment} onDeleteAttachment={app.handleDeleteAttachment} />}
       {app.isSettingsOpen && <SettingsModal users={app.users} projects={app.projects} tasks={app.tasks} statuses={app.statuses} priorities={app.priorities} onUpdateUsers={app.handleUpdateUsers} onUpdateProjects={app.handleUpdateProjects} onUpdateStatuses={app.handleUpdateStatuses} onUpdatePriorities={app.handleUpdatePriorities} onRestoreTask={app.handleRestoreTask} onPermanentDelete={app.handlePermanentDelete} onClose={() => app.setIsSettingsOpen(false)} />}
       {app.isProfileOpen && <ProfileModal user={app.currentUser} onSave={(u) => { app.handleUpdateUsers(app.users.map(user => user.id === u.id ? u : user)); app.setCurrentUser(u); localStorage.setItem('cfo_current_user', JSON.stringify(u)); app.setIsProfileOpen(false); app.showNotification('Профиль обновлен'); }} onClose={() => app.setIsProfileOpen(false)} />}
       {app.isDocModalOpen && <DocModal folders={app.folders.filter(f => f.tableId === app.activeTableId)} activeFolderId={app.newDocFolderId} onSave={app.handleCreateDoc} onClose={() => app.setIsDocModalOpen(false)} />}
       
       {/* Folder Modal */}
       {app.isFolderModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[70]">
              <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-notion-dark-border">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4">Новая папка</h3>
                  <form onSubmit={app.handleCreateFolderSubmit}>
                      <input autoFocus required value={app.newFolderName} onChange={e => app.setNewFolderName(e.target.value)} className="w-full border rounded p-2 mb-4 bg-white dark:bg-notion-dark-bg" placeholder="Название" />
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => app.setIsFolderModalOpen(false)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white">Отмена</button>
                          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Создать</button>
                      </div>
                  </form>
              </div>
          </div>
       )}

       {/* Create Table Modal */}
       {app.isCreateTableModalOpen && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
             <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-notion-dark-border">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{app.editingTableId ? 'Настройки страницы' : 'Новая страница'}</h2>
                 <form onSubmit={app.handleCreateTableSubmit} className="space-y-4">
                     <div><label className="block text-xs font-bold text-gray-500 mb-1">Название</label><input value={app.newTableName} onChange={e => app.setNewTableName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white dark:bg-notion-dark-bg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: Маркетинг" autoFocus /></div>
                     
                     {!app.editingTableId && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Тип страницы</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[{id:'tasks',icon:<CheckSquare size={16}/>,l:'Задачи'},{id:'docs',icon:<FileText size={16}/>,l:'Документы'},{id:'meetings',icon:<Users size={16}/>,l:'Встречи'}, {id:'backlog',icon:<Layout size={16}/>,l:'Бэклог'}].map(t => (
                                    <div key={t.id} onClick={() => app.setNewTableType(t.id as any)} className={`cursor-pointer border rounded-lg p-2 text-center text-xs flex flex-col items-center gap-1 transition-all ${app.newTableType === t.id ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        {t.icon}{t.l}
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     {app.newTableType === 'tasks' && (
                         <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2">Отображение</label>
                             <div className="space-y-2 bg-gray-50 dark:bg-notion-dark-bg p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                 <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                                     <input type="checkbox" checked={app.newTableViewConfig.showTable} onChange={e => app.setNewTableViewConfig({...app.newTableViewConfig, showTable: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"/> 
                                     <span className="flex items-center gap-2"><LayoutList size={14}/> Таблица</span>
                                 </label>
                                 <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                                     <input type="checkbox" checked={app.newTableViewConfig.showKanban} onChange={e => app.setNewTableViewConfig({...app.newTableViewConfig, showKanban: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"/> 
                                     <span className="flex items-center gap-2"><KanbanIcon size={14}/> Канбан Доска</span>
                                 </label>
                                 <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                                     <input type="checkbox" checked={app.newTableViewConfig.showGantt} onChange={e => app.setNewTableViewConfig({...app.newTableViewConfig, showGantt: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"/> 
                                     <span className="flex items-center gap-2"><Calendar size={14}/> Таймлайн (Гант)</span>
                                 </label>
                             </div>
                         </div>
                     )}

                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-2">Иконка</label>
                         <div className="grid grid-cols-6 gap-2 bg-gray-50 dark:bg-notion-dark-bg p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                             {ICON_OPTIONS.map(icon => (
                                 <div key={icon} onClick={() => app.setNewTableIcon(icon)} className={`p-2 rounded-lg cursor-pointer flex justify-center transition-all ${app.newTableIcon === icon ? 'bg-white shadow-md text-blue-600 ring-1 ring-blue-500 scale-110' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}>
                                     {getDynamicIcon(icon, 'currentColor', 18)}
                                 </div>
                             ))}
                         </div>
                     </div>
                     
                     <div>
                         <label className="block text-xs font-bold text-gray-500 mb-2">Цвет</label>
                         <div className="grid grid-cols-9 gap-2">
                             {COLOR_OPTIONS.map(c => (
                                 <div key={c} onClick={() => app.setNewTableColor(c)} className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${app.newTableColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:border-gray-300'}`}>
                                     <div className={`w-full h-full rounded-full ${getColorStyles(c).solid}`}></div>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                         <button type="button" onClick={() => app.setIsCreateTableModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Отмена</button>
                         <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">Сохранить</button>
                     </div>
                 </form>
             </div>
         </div>
       )}
    </div>
  );
};

export default App;
