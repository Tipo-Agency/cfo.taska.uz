
import React, { useState, useEffect } from 'react';
import { 
  User, Task, Project, TableCollection, Doc, Folder, Meeting, ActivityLog, 
  Role, StatusOption, PriorityOption, ViewMode, Attachment, Comment, NotificationSettings 
} from '../types';
import { storageService } from '../services/storageService';
import { sendTelegramNotification, formatStatusChangeMessage, formatNewTaskMessage } from '../services/telegramService';
import { MOCK_USERS, MOCK_TABLES, DEFAULT_STATUSES, DEFAULT_PRIORITIES } from '../constants';

export const useAppLogic = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem('cfo_theme') === 'dark';
  });

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tables, setTables] = useState<TableCollection[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [priorities, setPriorities] = useState<PriorityOption[]>([]);

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'inbox' | 'search' | 'table' | 'doc-editor'>('home');
  const [activeTableId, setActiveTableId] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [hideDone, setHideDone] = useState(false);

  // UI State (Modals, Notifications)
  const [notification, setNotification] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Folder Modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocFolderId, setNewDocFolderId] = useState<string | null>(null);

  // Table Create/Edit Modal
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableType, setNewTableType] = useState<'tasks' | 'docs' | 'meetings' | 'backlog'>('tasks');
  const [newTableIcon, setNewTableIcon] = useState('CheckSquare');
  const [newTableColor, setNewTableColor] = useState('text-gray-500');
  const [newTableViewConfig, setNewTableViewConfig] = useState({ showTable: true, showKanban: true, showGantt: true });

  // Auth Form State
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Initialization ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await storageService.loadFromCloud();
      
      // Load Data
      setUsers(storageService.getUsers());
      setTasks(storageService.getTasks());
      setProjects(storageService.getProjects());
      
      // Deduplicate Tables
      let loadedTables = storageService.getTables();
      let uniqueTables = loadedTables.filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);
      // Ensure Backlog exists
      const backlogTables = uniqueTables.filter(t => t.type === 'backlog');
      if (backlogTables.length > 1) {
          const keep = backlogTables.find(t => t.isSystem) || backlogTables[0];
          uniqueTables = uniqueTables.filter(t => t.type !== 'backlog' || t.id === keep.id);
      } else if (backlogTables.length === 0) {
          const backlogMock = MOCK_TABLES.find(t => t.type === 'backlog');
          if (backlogMock) uniqueTables.push(backlogMock);
      }
      setTables(uniqueTables);

      setDocs(storageService.getDocs());
      setFolders(storageService.getFolders());
      setMeetings(storageService.getMeetings());
      setActivities(storageService.getActivities());
      setStatuses(storageService.getStatuses());
      setPriorities(storageService.getPriorities());

      // Restore Session
      const sessionUid = localStorage.getItem('cfo_session_uid');
      if (sessionUid) {
          const user = storageService.getUsers().find(u => u.id === sessionUid);
          if (user) setCurrentUser(user);
      }
      
      // Apply Theme
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');

      setLoading(false);
    };
    init();
  }, []); 

  // --- Effects ---

  // Theme Toggle
  useEffect(() => {
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('cfo_theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('cfo_theme', 'light');
      }
  }, [isDarkMode]);

  // Auto-select first table
  useEffect(() => {
      if (!loading && tables.length > 0 && !activeTableId) {
          const first = tables.find(t => t.type === 'tasks') || tables[0];
          if (first) setActiveTableId(first.id);
      }
  }, [tables, loading, activeTableId]);

  // View Config & Polling
  useEffect(() => {
      // View Config Logic
      const table = tables.find(t => t.id === activeTableId);
      if (table) {
          if (table.type === 'tasks') {
              setHideDone(true); 
              const config = table.viewConfig || { showTable: true, showKanban: true, showGantt: true };
              if (viewMode === ViewMode.TABLE && !config.showTable) {
                  if (config.showKanban) setViewMode(ViewMode.KANBAN);
                  else if (config.showGantt) setViewMode(ViewMode.GANTT);
              }
          } else {
              setHideDone(false);
          }
      }

      // Polling Logic
      if (!currentUser) return;
      const interval = setInterval(async () => {
          const success = await storageService.loadFromCloud();
          if (success) {
              const cloudTasks = storageService.getTasks();
              const cloudActivities = storageService.getActivities();
              const cloudDocs = storageService.getDocs();
              setTasks(cloudTasks);
              setActivities(cloudActivities);
              setDocs(cloudDocs);
              
              // Update editing task in real-time (comments/attachments only)
              if (editingTask) {
                  const updatedEditingTask = cloudTasks.find(t => t.id === editingTask.id);
                  if (updatedEditingTask) {
                       setEditingTask(prev => prev ? { ...prev, comments: updatedEditingTask.comments, attachments: updatedEditingTask.attachments, status: updatedEditingTask.status } : null);
                  }
              }
          }
      }, 4000);
      return () => clearInterval(interval);

  }, [activeTableId, tables, currentUser, editingTask?.id]);


  // --- Actions ---

  const showNotification = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  
  const handleNavigate = (view: 'home' | 'inbox' | 'search' | 'table' | 'doc-editor') => {
      setCurrentView(view);
  };

  const handleSelectTable = (id: string) => {
      setActiveTableId(id);
      setCurrentView('table');
  };

  const handleMarkAllRead = () => {
      const updatedActivities = activities.map(a => ({...a, read: true}));
      setActivities(updatedActivities);
      storageService.setActivities(updatedActivities);
  };

  const handleNotify = (type: keyof NotificationSettings, title: string, details: string) => {
      const settings = storageService.getNotificationSettings();
      const setting = settings[type];
      if (!setting || setting.system) {
          if (currentUser) {
            const log: ActivityLog = { id: `act-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar || '', action: title, details, timestamp: new Date().toISOString(), read: false };
            setActivities(storageService.addActivity(log));
          }
      }
  };

  // Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => (u.login?.toLowerCase() === loginForm.login.toLowerCase()) && u.password === loginForm.password);
    if (user) {
        if (user.mustChangePassword) { setChangePasswordMode(true); return; }
        setCurrentUser(user);
        localStorage.setItem('cfo_session_uid', user.id);
        setAuthError('');
    } else {
        setAuthError('Неверный логин или пароль');
    }
  };

  const handleFirstTimePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) return setAuthError('Пароли не совпадают');
      const tempUser = users.find(u => u.login?.toLowerCase() === loginForm.login.toLowerCase());
      if (tempUser) {
          const updatedUser = { ...tempUser, password: newPassword, mustChangePassword: false };
          const uList = users.map(u => u.id === tempUser.id ? updatedUser : u);
          setUsers(uList); storageService.setUsers(uList); setCurrentUser(updatedUser); localStorage.setItem('cfo_session_uid', updatedUser.id); setChangePasswordMode(false);
      }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('cfo_session_uid'); setChangePasswordMode(false); };

  // Data Updates (Settings)
  const handleUpdateUsers = (u: User[]) => { setUsers(u); storageService.setUsers(u); };
  const handleUpdateProjects = (p: Project[]) => { setProjects(p); storageService.setProjects(p); };
  const handleUpdateStatuses = (s: StatusOption[]) => { setStatuses(s); storageService.setStatuses(s); };
  const handleUpdatePriorities = (p: PriorityOption[]) => { setPriorities(p); storageService.setPriorities(p); };

  // Tasks
  const handleCreateTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
        id: `task-${Date.now()}`, tableId: activeTableId,
        title: taskData.title || 'Новая задача', status: taskData.status || statuses[0]?.name || 'Не начато',
        priority: taskData.priority || priorities[0]?.name || 'Низкий', assigneeId: taskData.assigneeId || null,
        projectId: taskData.projectId || null, startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        endDate: taskData.endDate || new Date().toISOString().split('T')[0], description: taskData.description || '',
        isArchived: false, comments: [], attachments: []
    };
    
    // Optimistic + Cloud
    const u = [...tasks, newTask]; setTasks(u); 
    await storageService.loadFromCloud(); // Sync before save to avoid overwrite
    const freshTasks = storageService.getTasks();
    const safeNewTasks = [...freshTasks, newTask];
    setTasks(safeNewTasks);
    storageService.setTasks(safeNewTasks);

    handleNotify('NEW_TASK', 'создал задачу', newTask.title);
    setIsTaskModalOpen(false); 
    showNotification('Задача создана');

    const assignee = users.find(u => u.id === newTask.assigneeId);
    if (assignee && assignee.id !== currentUser?.id) {
        const project = projects.find(p => p.id === newTask.projectId)?.name || null;
        const settings = storageService.getNotificationSettings();
        if (settings.NEW_TASK?.telegram) {
            sendTelegramNotification(formatNewTaskMessage(newTask.title, newTask.priority, newTask.endDate, assignee.name, project));
        }
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await storageService.loadFromCloud();
    const freshTasks = storageService.getTasks();
    const oldTask = freshTasks.find(t => t.id === taskId);
    if (!oldTask) return;

    const updatedTasks = freshTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    setTasks(updatedTasks);
    storageService.setTasks(updatedTasks);

    if (editingTask && editingTask.id === taskId) {
        setEditingTask(prev => prev ? { ...prev, ...updates } : null);
    }

    if (updates.status && updates.status !== oldTask.status) {
        handleNotify('STATUS_CHANGE', 'обновил статус', `${oldTask.title}: ${oldTask.status} -> ${updates.status}`);
        const settings = storageService.getNotificationSettings();
        if (settings.STATUS_CHANGE?.telegram) {
             sendTelegramNotification(formatStatusChangeMessage(oldTask.title, oldTask.status, updates.status!, currentUser?.name || 'User'));
        }
    }
    if (updates.isArchived) { showNotification('Задача в архиве'); setIsTaskModalOpen(false); }
  };

  const handleDeleteTask = (id: string) => handleUpdateTask(id, { isArchived: true });
  const handlePermanentDelete = (id: string) => { const u = tasks.filter(t => t.id !== id); setTasks(u); storageService.setTasks(u); };
  const handleRestoreTask = (id: string) => { handleUpdateTask(id, { isArchived: false }); showNotification('Восстановлено'); };
  
  const handleAddComment = async (taskId: string, text: string) => {
      if (!currentUser) return;
      await storageService.loadFromCloud();
      const freshTasks = storageService.getTasks();
      const task = freshTasks.find(t => t.id === taskId);
      
      if (task) {
          const c: Comment = { id: `c-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar || '', text, createdAt: new Date().toISOString() };
          const updatedComments = [...(task.comments || []), c];
          const updatedTasks = freshTasks.map(t => t.id === taskId ? { ...t, comments: updatedComments } : t);
          setTasks(updatedTasks); storageService.setTasks(updatedTasks);
          if (editingTask && editingTask.id === taskId) setEditingTask(prev => prev ? { ...prev, comments: updatedComments } : null);
          
          handleNotify('NEW_COMMENT', 'комментарий', `"${text.substring(0, 20)}..." к задаче ${task.title}`);
      }
  };
  
  const handleAddAttachment = async (taskId: string, att: Attachment) => {
      await storageService.loadFromCloud();
      const freshTasks = storageService.getTasks();
      const task = freshTasks.find(t => t.id === taskId);
      if (task) {
          const updatedAttachments = [...(task.attachments || []), att];
          const updatedTasks = freshTasks.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t);
          setTasks(updatedTasks); storageService.setTasks(updatedTasks);
          if (editingTask && editingTask.id === taskId) setEditingTask(prev => prev ? { ...prev, attachments: updatedAttachments } : null);

          if (att.type === 'link' && att.url) {
              const docsTable = tables.find(t => t.type === 'docs');
              if (docsTable) {
                  const newDoc: Doc = { id: `doc-${Date.now()}`, tableId: docsTable.id, title: att.name, type: 'link', url: att.url, tags: ['Из задач'], content: '' };
                  const updatedDocs = [...docs, newDoc]; setDocs(updatedDocs); storageService.setDocs(updatedDocs);
                  handleNotify('NEW_DOC', 'создал документ', att.name);
              }
          }
      }
  };

  const handleDeleteAttachment = async (taskId: string, attachmentId: string) => {
      await storageService.loadFromCloud();
      const freshTasks = storageService.getTasks();
      const task = freshTasks.find(t => t.id === taskId);
      if (task && task.attachments) {
          const updatedAttachments = task.attachments.filter(a => a.id !== attachmentId);
          const updatedTasks = freshTasks.map(t => t.id === taskId ? { ...t, attachments: updatedAttachments } : t);
          setTasks(updatedTasks); storageService.setTasks(updatedTasks);
           if (editingTask && editingTask.id === taskId) setEditingTask(prev => prev ? { ...prev, attachments: updatedAttachments } : null);
      }
  };

  const handleTakeToWork = (task: Task) => {
      if (!currentUser) return;
      const targetTable = tables.find(t => t.type === 'tasks' && t.id !== task.tableId) || tables.find(t => t.type === 'tasks');
      if (targetTable) {
          handleUpdateTask(task.id, { tableId: targetTable.id, assigneeId: currentUser.id, status: statuses.find(s => s.name !== 'Не начато')?.name || 'В работе' });
          showNotification('Задача перенесена в ' + targetTable.name);
      }
  };

  // Docs & Folders
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFolderName.trim()) return;
      setFolders(prev => {
          const updated = [...prev, { id: `f-${Date.now()}`, name: newFolderName, tableId: activeTableId }];
          storageService.setFolders(updated);
          return updated;
      });
      setIsFolderModalOpen(false); setNewFolderName(''); showNotification('Папка создана');
  };

  const handleDeleteFolder = (id: string) => {
      if (confirm('Удалить папку?')) {
          setFolders(prev => {
              const updated = prev.filter(f => f.id !== id);
              storageService.setFolders(updated);
              return updated;
          });
      }
  };

  const handleCreateDoc = (data: any) => {
      const d: Doc = { id: `d-${Date.now()}`, tableId: activeTableId, ...data };
      const u = [...docs, d]; setDocs(u); storageService.setDocs(u);
      setIsDocModalOpen(false); showNotification('Документ создан');
      handleNotify('NEW_DOC', 'создал документ', d.title);
      if (data.type === 'internal') { setActiveDocId(d.id); setCurrentView('doc-editor'); }
  };
  const handleSaveDocContent = (id: string, content: string, title: string) => {
      const u = docs.map(d => d.id === id ? { ...d, content, title } : d); setDocs(u); storageService.setDocs(u); showNotification('Сохранено');
  };
  const handleDeleteDoc = (id: string) => { if (confirm('Удалить?')) { const u = docs.filter(d => d.id !== id); setDocs(u); storageService.setDocs(u); } };

  // Meetings
  const handleSaveMeeting = (m: Meeting) => { const u = [...meetings, m]; setMeetings(u); storageService.setMeetings(u); showNotification('Встреча создана'); };
  const handleUpdateSummary = (id: string, s: string) => { const u = meetings.map(m => m.id === id ? { ...m, summary: s } : m); setMeetings(u); storageService.setMeetings(u); };

  // Table Management
  const openCreateTableModal = () => { setEditingTableId(null); setNewTableName(''); setIsCreateTableModalOpen(true); };
  const openEditTableModal = (t: TableCollection) => { setEditingTableId(t.id); setNewTableName(t.name); setNewTableType(t.type); setNewTableIcon(t.icon); setNewTableColor(t.color || 'text-gray-500'); setIsCreateTableModalOpen(true); };
  
  const handleCreateTableSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTableName.trim()) return;
      const newTableData = { 
          name: newTableName, type: newTableType, icon: newTableIcon, color: newTableColor, 
          viewConfig: newTableType === 'tasks' ? newTableViewConfig : undefined 
      };
      let updatedTables;
      if (editingTableId) {
          updatedTables = tables.map(t => t.id === editingTableId ? { ...t, ...newTableData } : t);
      } else {
          const newTable = { id: `t-${Date.now()}`, isSystem: false, ...newTableData } as TableCollection;
          updatedTables = [...tables, newTable];
          setActiveTableId(newTable.id); setCurrentView('table');
      }
      setTables(updatedTables); storageService.setTables(updatedTables); setIsCreateTableModalOpen(false);
  };
  const handleDeleteTable = (id: string) => { if(confirm('Удалить?')) { const u = tables.filter(t => t.id !== id); setTables(u); storageService.setTables(u); if(activeTableId === id) handleNavigate('home'); } };

  // View Mode Helpers
  const getFilteredTasks = () => {
      return tasks.filter(t => {
          if (t.isArchived) return false;
          if (activeTableId && t.tableId !== activeTableId) return false;
          if (hideDone && t.status === 'Выполнено') return false;
          if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          if (statusFilter && t.status !== statusFilter) return false;
          if (userFilter && t.assigneeId !== userFilter) return false;
          if (projectFilter && t.projectId !== projectFilter) return false;
          return true;
      });
  };

  return {
      loading, currentUser, setCurrentUser, isDarkMode, setIsDarkMode,
      users, tasks, projects, tables, docs, folders, meetings, activities, statuses, priorities,
      currentView, setCurrentView, activeTableId, setActiveTableId, activeDocId, setActiveDocId, viewMode, setViewMode,
      notification, showNotification, isTaskModalOpen, setIsTaskModalOpen, editingTask, setEditingTask, isSettingsOpen, setIsSettingsOpen, isProfileOpen, setIsProfileOpen, isDocModalOpen, setIsDocModalOpen,
      isFolderModalOpen, setIsFolderModalOpen, newFolderName, setNewFolderName, newDocFolderId, setNewDocFolderId,
      isCreateTableModalOpen, setIsCreateTableModalOpen, editingTableId, newTableName, setNewTableName, newTableType, setNewTableType, newTableIcon, setNewTableIcon, newTableColor, setNewTableColor, newTableViewConfig, setNewTableViewConfig,
      searchQuery, setSearchQuery, statusFilter, setStatusFilter, userFilter, setUserFilter, projectFilter, setProjectFilter, hideDone, setHideDone,
      loginForm, setLoginForm, authError, changePasswordMode, setChangePasswordMode, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
      
      handleLogin, handleFirstTimePasswordChange, handleLogout, handleNavigate, handleSelectTable, handleMarkAllRead,
      handleUpdateUsers, handleUpdateProjects, handleUpdateStatuses, handleUpdatePriorities,
      handleCreateTask, handleUpdateTask, handleDeleteTask, handlePermanentDelete, handleRestoreTask, handleAddComment, handleAddAttachment, handleDeleteAttachment, handleTakeToWork,
      handleCreateFolderSubmit, handleDeleteFolder, handleCreateDoc, handleSaveDocContent, handleDeleteDoc,
      handleSaveMeeting, handleUpdateSummary,
      openCreateTableModal, openEditTableModal, handleCreateTableSubmit, handleDeleteTable,
      getFilteredTasks
  };
};
