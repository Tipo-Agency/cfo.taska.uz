
import React, { useState, useEffect } from 'react';
import { Project, Role, Task, User, StatusOption, PriorityOption } from '../types';
import { X, Trash2, Plus, User as UserIcon, Briefcase, Bot, Save, Archive, RefreshCw, KeyRound, List, BarChart2, Pencil, Check, Ban, Mail, UserCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import { sendTelegramNotification } from '../services/telegramService';
import { ICON_OPTIONS, COLOR_OPTIONS, getColorStyles } from '../constants';

interface SettingsModalProps {
  users: User[];
  projects: Project[];
  tasks?: Task[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateStatuses: (statuses: StatusOption[]) => void;
  onUpdatePriorities: (priorities: PriorityOption[]) => void;
  onRestoreTask?: (taskId: string) => void;
  onPermanentDelete?: (taskId: string) => void; 
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  users, 
  projects, 
  tasks = [], 
  statuses,
  priorities,
  onUpdateUsers, 
  onUpdateProjects,
  onUpdateStatuses,
  onUpdatePriorities,
  onRestoreTask,
  onPermanentDelete,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'statuses' | 'priorities' | 'integrations' | 'archive'>('users');
  
  const [editingId, setEditingId] = useState<string | null>(null);

  // User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserRole, setNewUserRole] = useState<Role>(Role.EMPLOYEE);
  
  // Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('Briefcase');
  const [newProjectColor, setNewProjectColor] = useState('text-blue-500');

  // Status Form
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('text-gray-500');
  
  // Priority Form
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('text-gray-500');

  const [chatId, setChatId] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
      setChatId(storageService.getTelegramChatId());
  }, []);

  const archivedTasks = tasks.filter(t => t.isArchived);

  // --- Users ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserLogin.trim()) return;
    const newUser: User = {
        id: `u-${Date.now()}`,
        name: newUserName,
        login: newUserLogin,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUserName)}&background=random`,
        mustChangePassword: true
    };
    onUpdateUsers([...users, newUser]);
    setNewUserName('');
    setNewUserLogin('');
    setNewUserEmail('');
    setNewUserPassword('123456');
    alert(`Пользователь создан. Логин: ${newUserLogin}, Пароль: ${newUserPassword}`);
  };

  const handleDeleteUser = (id: string) => onUpdateUsers(users.filter(u => u.id !== id));
  const handleResetPassword = (id: string) => {
      if(confirm('Сбросить пароль?')) {
          onUpdateUsers(users.map(u => u.id === id ? { ...u, password: '123456', mustChangePassword: true } : u));
          alert('Пароль сброшен на 123456');
      }
  };

  // --- Projects (Modules) ---
  const handleEditProject = (project: Project) => {
      setEditingId(project.id);
      setNewProjectName(project.name);
      setNewProjectIcon(project.icon || 'Briefcase');
      setNewProjectColor(project.color || 'text-gray-500');
  };

  const handleSaveProject = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProjectName.trim()) return;

      if (editingId) {
          onUpdateProjects(projects.map(p => p.id === editingId ? { ...p, name: newProjectName, icon: newProjectIcon, color: newProjectColor } : p));
          setEditingId(null);
      } else {
          onUpdateProjects([...projects, { id: `p-${Date.now()}`, name: newProjectName, icon: newProjectIcon, color: newProjectColor }]);
      }
      setNewProjectName('');
      setNewProjectIcon('Briefcase');
      setNewProjectColor('text-blue-500');
  };
  const handleDeleteProject = (id: string) => onUpdateProjects(projects.filter(p => p.id !== id));
  const handleCancelProject = () => {
      setEditingId(null);
      setNewProjectName('');
      setNewProjectIcon('Briefcase');
  };

  // --- Statuses ---
  const handleEditStatus = (status: StatusOption) => {
      setEditingId(status.id);
      setNewStatusName(status.name);
      setNewStatusColor(status.color);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStatusName.trim()) return;

      if (editingId) {
          onUpdateStatuses(statuses.map(s => s.id === editingId ? { ...s, name: newStatusName, color: newStatusColor } : s));
          setEditingId(null);
      } else {
          onUpdateStatuses([...statuses, { id: `s-${Date.now()}`, name: newStatusName, color: newStatusColor }]);
      }
      setNewStatusName('');
  };
  const handleDeleteStatus = (id: string) => {
      if (statuses.length <= 1) return alert('Должен быть хотя бы один статус');
      onUpdateStatuses(statuses.filter(s => s.id !== id));
  };
  const handleCancelStatus = () => {
      setEditingId(null);
      setNewStatusName('');
  };


  // --- Priorities ---
  const handleEditPriority = (priority: PriorityOption) => {
      setEditingId(priority.id);
      setNewPriorityName(priority.name);
      setNewPriorityColor(priority.color);
  };

  const handleSavePriority = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPriorityName.trim()) return;

      if (editingId) {
          onUpdatePriorities(priorities.map(p => p.id === editingId ? { ...p, name: newPriorityName, color: newPriorityColor } : p));
          setEditingId(null);
      } else {
          onUpdatePriorities([...priorities, { id: `pr-${Date.now()}`, name: newPriorityName, color: newPriorityColor }]);
      }
      setNewPriorityName('');
  };
  const handleDeletePriority = (id: string) => {
      if (priorities.length <= 1) return alert('Должен быть хотя бы один приоритет');
      onUpdatePriorities(priorities.filter(p => p.id !== id));
  };
   const handleCancelPriority = () => {
      setEditingId(null);
      setNewPriorityName('');
  };

  // Integrations
  const handleSaveChatId = () => { storageService.setTelegramChatId(chatId); alert('Chat ID сохранен!'); };
  const handleTestTelegram = async () => {
      if (!chatId) return alert('Введите ID');
      setTestStatus('sending');
      await sendTelegramNotification('Тест');
      setTestStatus('success');
  };

  const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
    <button 
        onClick={() => { setActiveTab(id); setEditingId(null); }}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${activeTab === id ? 'bg-white dark:bg-notion-dark-bg text-blue-600 shadow-sm border border-gray-200 dark:border-notion-dark-border' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-notion-dark-hover'}`}
    >
        {icon} {label}
    </button>
  );

  // Reusable Color Picker
  const ColorPicker = ({ selected, onChange }: { selected: string, onChange: (c: string) => void }) => (
      <div className="grid grid-cols-9 gap-2">
          {COLOR_OPTIONS.map(c => {
              const styles = getColorStyles(c);
              return (
                <div 
                    key={c} 
                    onClick={() => onChange(c)} 
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${selected === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                    <div className={`w-full h-full rounded-full ${styles.solid}`}></div>
                </div>
              );
          })}
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-notion-dark-sidebar w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden h-[650px] flex flex-col border border-gray-200 dark:border-notion-dark-border">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar shrink-0">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Настройки пространства</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white bg-white dark:bg-transparent rounded-full p-1 hover:bg-gray-100 dark:hover:bg-notion-dark-hover"><X size={18} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-56 bg-gray-50 dark:bg-notion-dark-bg-subtle/50 border-r border-gray-100 dark:border-notion-dark-border p-3 flex flex-col gap-1 shrink-0">
                <TabButton id="users" label="Пользователи" icon={<UserIcon size={16}/>} />
                <TabButton id="projects" label="Модули (Проекты)" icon={<Briefcase size={16}/>} />
                <TabButton id="statuses" label="Статусы" icon={<List size={16}/>} />
                <TabButton id="priorities" label="Приоритеты" icon={<BarChart2 size={16}/>} />
                <TabButton id="integrations" label="Интеграции" icon={<Bot size={16}/>} />
                <TabButton id="archive" label="Архив" icon={<Archive size={16}/>} />
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-notion-dark-sidebar custom-scrollbar">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <form onSubmit={handleAddUser} className="bg-white dark:bg-notion-dark-bg p-4 rounded-lg border border-gray-200 dark:border-notion-dark-border shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">Новый сотрудник</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Имя</label>
                                    <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="Имя Фамилия" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Логин</label>
                                    <input required value={newUserLogin} onChange={e => setNewUserLogin(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="user" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                                    <input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="user@cfo.uz" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Роль</label>
                                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as Role)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] cursor-pointer text-gray-900 dark:text-white">
                                        <option value={Role.EMPLOYEE}>Сотрудник</option>
                                        <option value={Role.ADMIN}>Админ</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Пароль (по умолчанию)</label>
                                <input type="text" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                                <Plus size={16}/> Создать
                            </button>
                        </form>
                        <div className="border border-gray-200 dark:border-notion-dark-border rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-notion-dark-hover">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600" alt=""/>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <UserCheck size={10} /> {u.login}
                                                {u.email && <><span className="mx-1">•</span> <Mail size={10}/> {u.email}</>} 
                                                <span className="mx-1">•</span> {u.role}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleResetPassword(u.id)} className="text-gray-400 hover:text-orange-500 p-1" title="Сбросить пароль"><KeyRound size={16}/></button>
                                        <button type="button" onClick={() => onPermanentDelete && onPermanentDelete(u.id)} className="text-gray-400 hover:text-red-500 p-1" title="Удалить"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROJECTS (MODULES) TAB */}
                {activeTab === 'projects' && (
                    <div className="space-y-6">
                        <form onSubmit={handleSaveProject} className="bg-white dark:bg-notion-dark-bg p-4 rounded-lg border border-gray-200 dark:border-notion-dark-border shadow-sm space-y-4">
                             <h3 className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                                 {editingId ? 'Редактировать модуль' : 'Новый модуль'}
                                 {editingId && <button type="button" onClick={handleCancelProject} className="text-red-500 flex items-center gap-1 hover:underline"><Ban size={12}/> Отмена</button>}
                             </h3>
                             
                             <div>
                                <label className="block text-xs text-gray-500 mb-1">Название Модуля</label>
                                <input required value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="Например: Склад" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Цвет</label>
                                <ColorPicker selected={newProjectColor} onChange={setNewProjectColor} />
                            </div>

                            <button type="submit" className={`w-full text-white px-3 py-2 rounded text-sm hover:opacity-90 flex items-center justify-center gap-2 ${editingId ? 'bg-green-600' : 'bg-blue-600'}`}>
                                {editingId ? <><Save size={16}/> Сохранить изменения</> : <><Plus size={16}/> Добавить модуль</>}
                            </button>
                        </form>

                        <div className="border border-gray-200 dark:border-notion-dark-border rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                            {projects.map(p => {
                                const styles = getColorStyles(p.color);
                                return (
                                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-notion-dark-hover group">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${styles.badge}`}>
                                                {p.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditProject(p)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteProject(p.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STATUSES TAB */}
                {activeTab === 'statuses' && (
                    <div className="space-y-6">
                        <form onSubmit={handleSaveStatus} className="bg-white dark:bg-notion-dark-bg p-4 rounded-lg border border-gray-200 dark:border-notion-dark-border shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                                {editingId ? 'Редактировать статус' : 'Новый статус'}
                                {editingId && <button type="button" onClick={handleCancelStatus} className="text-red-500 flex items-center gap-1 hover:underline"><Ban size={12}/> Отмена</button>}
                            </h3>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Название</label>
                                <input value={newStatusName} onChange={e => setNewStatusName(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="Например: Отложено" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Цвет</label>
                                <ColorPicker selected={newStatusColor} onChange={setNewStatusColor} />
                            </div>
                            <button type="submit" className={`w-full text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 ${editingId ? 'bg-green-600' : 'bg-blue-600'}`}>
                                {editingId ? <><Save size={14}/> Сохранить</> : <><Plus size={14}/> Добавить</>}
                            </button>
                        </form>
                         <div className="border border-gray-200 dark:border-notion-dark-border rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                            {statuses.map(s => {
                                const styles = getColorStyles(s.color);
                                return (
                                    <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-notion-dark-hover">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${styles.badge}`}>
                                                {s.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditStatus(s)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteStatus(s.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                 {/* PRIORITIES TAB */}
                 {activeTab === 'priorities' && (
                    <div className="space-y-6">
                        <form onSubmit={handleSavePriority} className="bg-white dark:bg-notion-dark-bg p-4 rounded-lg border border-gray-200 dark:border-notion-dark-border shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                                {editingId ? 'Редактировать приоритет' : 'Новый приоритет'}
                                {editingId && <button type="button" onClick={handleCancelPriority} className="text-red-500 flex items-center gap-1 hover:underline"><Ban size={12}/> Отмена</button>}
                            </h3>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Название</label>
                                <input value={newPriorityName} onChange={e => setNewPriorityName(e.target.value)} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" placeholder="Например: Критический" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">Цвет</label>
                                <ColorPicker selected={newPriorityColor} onChange={setNewPriorityColor} />
                            </div>
                            <button type="submit" className={`w-full text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 ${editingId ? 'bg-green-600' : 'bg-blue-600'}`}>
                                {editingId ? <><Save size={14}/> Сохранить</> : <><Plus size={14}/> Добавить</>}
                            </button>
                        </form>
                         <div className="border border-gray-200 dark:border-notion-dark-border rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                            {priorities.map(p => {
                                const styles = getColorStyles(p.color);
                                return (
                                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-notion-dark-hover">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${styles.badge}`}>
                                                {p.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditPriority(p)} className="text-gray-400 hover:text-blue-500 p-1"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeletePriority(p.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* INTEGRATIONS */}
                {activeTab === 'integrations' && (
                     <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                            <h3 className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100 mb-2"><Bot size={18} /> Telegram Бот</h3>
                            <div>
                                <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 uppercase mb-1">ID Чата</label>
                                <div className="flex gap-2">
                                    <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-100xxxxxxxxxx" className="flex-1 border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-sm bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white" />
                                    <button onClick={handleSaveChatId} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center gap-1"><Save size={16}/> Сохранить</button>
                                </div>
                            </div>
                        </div>
                         <button onClick={handleTestTelegram} disabled={testStatus === 'sending'} className="bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium">
                            {testStatus === 'sending' ? 'Отправка...' : 'Отправить тест'}
                        </button>
                     </div>
                )}
                
                {/* ARCHIVE */}
                {activeTab === 'archive' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase">Архив</h3>
                            <span className="text-xs text-gray-500">{archivedTasks.length} задач</span>
                        </div>
                        {archivedTasks.length === 0 ? <div className="p-8 text-center text-gray-400 bg-gray-50 dark:bg-notion-dark-bg rounded-lg border border-dashed border-gray-200 dark:border-notion-dark-border">Пусто</div> : (
                            <div className="border border-gray-200 dark:border-notion-dark-border rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                                {archivedTasks.map(t => (
                                    <div key={t.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-notion-dark-hover">
                                        <div><div className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.title}</div><div className="text-xs text-gray-500">Удалено</div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onRestoreTask && onRestoreTask(t.id)} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"><RefreshCw size={12} /> Восстановить</button>
                                            {onPermanentDelete && <button type="button" onClick={() => onPermanentDelete(t.id)} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
