
import { Doc, Project, Role, TableCollection, Task, User, Meeting, ActivityLog, StatusOption, PriorityOption, Folder, NotificationSettings } from "../types";
import { FIREBASE_DB_URL, MOCK_PROJECTS, MOCK_TABLES, MOCK_USERS, DEFAULT_STATUSES, DEFAULT_PRIORITIES } from "../constants";

const STORAGE_KEYS = {
  USERS: 'cfo_users',
  TASKS: 'cfo_tasks',
  PROJECTS: 'cfo_projects',
  TABLES: 'cfo_tables',
  DOCS: 'cfo_docs',
  FOLDERS: 'cfo_folders',
  MEETINGS: 'cfo_meetings',
  ACTIVITY: 'cfo_activity',
  TELEGRAM_CHAT_ID: 'cfo_telegram_chat_id',
  STATUSES: 'cfo_statuses',
  PRIORITIES: 'cfo_priorities',
  NOTIFICATIONS: 'cfo_notifications',
};

const getLocal = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
        return JSON.parse(stored);
    } catch (e) {
        return seed;
    }
  }
  return seed;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  getDbUrl: () => FIREBASE_DB_URL,
  getTelegramChatId: (): string => localStorage.getItem(STORAGE_KEYS.TELEGRAM_CHAT_ID) || '',
  setTelegramChatId: (id: string) => localStorage.setItem(STORAGE_KEYS.TELEGRAM_CHAT_ID, id),

  loadFromCloud: async () => {
      const url = FIREBASE_DB_URL;
      if (!url) return false;

      try {
          const fetchUrl = url.endsWith('/') ? `${url}.json` : `${url}/.json`;
          const res = await fetch(fetchUrl);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          if (data) {
              console.log('[STORAGE] Data successfully loaded from Cloud');
              if (data.users) setLocal(STORAGE_KEYS.USERS, data.users);
              if (data.tasks) setLocal(STORAGE_KEYS.TASKS, data.tasks);
              if (data.projects) setLocal(STORAGE_KEYS.PROJECTS, data.projects);
              if (data.tables) setLocal(STORAGE_KEYS.TABLES, data.tables);
              if (data.docs) setLocal(STORAGE_KEYS.DOCS, data.docs);
              if (data.folders) setLocal(STORAGE_KEYS.FOLDERS, data.folders);
              if (data.meetings) setLocal(STORAGE_KEYS.MEETINGS, data.meetings);
              if (data.activity) setLocal(STORAGE_KEYS.ACTIVITY, data.activity);
              if (data.statuses) setLocal(STORAGE_KEYS.STATUSES, data.statuses);
              if (data.priorities) setLocal(STORAGE_KEYS.PRIORITIES, data.priorities);
              if (data.notifications) setLocal(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
              return true;
          }
      } catch (e) {
          console.error("Cloud Load Error:", e);
      }
      return false;
  },

  saveToCloud: async () => {
      const url = FIREBASE_DB_URL;
      if (!url) return;

      const fullState = {
          users: getLocal(STORAGE_KEYS.USERS, MOCK_USERS),
          tasks: getLocal(STORAGE_KEYS.TASKS, []),
          projects: getLocal(STORAGE_KEYS.PROJECTS, []),
          tables: getLocal(STORAGE_KEYS.TABLES, []),
          docs: getLocal(STORAGE_KEYS.DOCS, []),
          folders: getLocal(STORAGE_KEYS.FOLDERS, []),
          meetings: getLocal(STORAGE_KEYS.MEETINGS, []),
          activity: getLocal(STORAGE_KEYS.ACTIVITY, []),
          statuses: getLocal(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES),
          priorities: getLocal(STORAGE_KEYS.PRIORITIES, DEFAULT_PRIORITIES),
          notifications: getLocal(STORAGE_KEYS.NOTIFICATIONS, {}),
      };

      try {
          const fetchUrl = url.endsWith('/') ? `${url}.json` : `${url}/.json`;
          await fetch(fetchUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fullState)
          });
      } catch (e) {
          console.error("Cloud Save Error:", e);
      }
  },

  getUsers: (): User[] => getLocal(STORAGE_KEYS.USERS, MOCK_USERS),
  getTasks: (): Task[] => getLocal(STORAGE_KEYS.TASKS, []),
  getProjects: (): Project[] => getLocal(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS),
  getTables: (): TableCollection[] => getLocal(STORAGE_KEYS.TABLES, MOCK_TABLES),
  getDocs: (): Doc[] => getLocal(STORAGE_KEYS.DOCS, []),
  getFolders: (): Folder[] => getLocal(STORAGE_KEYS.FOLDERS, []),
  getMeetings: (): Meeting[] => getLocal(STORAGE_KEYS.MEETINGS, []),
  getActivities: (): ActivityLog[] => getLocal(STORAGE_KEYS.ACTIVITY, []),
  getStatuses: (): StatusOption[] => getLocal(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES),
  getPriorities: (): PriorityOption[] => getLocal(STORAGE_KEYS.PRIORITIES, DEFAULT_PRIORITIES),

  getNotificationSettings: (): NotificationSettings => {
    const defaults: NotificationSettings = {
        NEW_TASK: { system: true, telegram: true },
        STATUS_CHANGE: { system: true, telegram: true },
        NEW_COMMENT: { system: true, telegram: false },
        NEW_DOC: { system: true, telegram: false }
    };
    return getLocal<NotificationSettings>(STORAGE_KEYS.NOTIFICATIONS, defaults);
  },

  setUsers: (users: User[]) => { setLocal(STORAGE_KEYS.USERS, users); storageService.saveToCloud(); },
  setTasks: (tasks: Task[]) => { setLocal(STORAGE_KEYS.TASKS, tasks); storageService.saveToCloud(); },
  setProjects: (projects: Project[]) => { setLocal(STORAGE_KEYS.PROJECTS, projects); storageService.saveToCloud(); },
  setTables: (tables: TableCollection[]) => { setLocal(STORAGE_KEYS.TABLES, tables); storageService.saveToCloud(); },
  setDocs: (docs: Doc[]) => { setLocal(STORAGE_KEYS.DOCS, docs); storageService.saveToCloud(); },
  setFolders: (folders: Folder[]) => { setLocal(STORAGE_KEYS.FOLDERS, folders); storageService.saveToCloud(); },
  setMeetings: (meetings: Meeting[]) => { setLocal(STORAGE_KEYS.MEETINGS, meetings); storageService.saveToCloud(); },
  setActivities: (logs: ActivityLog[]) => { setLocal(STORAGE_KEYS.ACTIVITY, logs); storageService.saveToCloud(); },
  setStatuses: (statuses: StatusOption[]) => { setLocal(STORAGE_KEYS.STATUSES, statuses); storageService.saveToCloud(); },
  setPriorities: (priorities: PriorityOption[]) => { setLocal(STORAGE_KEYS.PRIORITIES, priorities); storageService.saveToCloud(); },
  
  addActivity: (log: ActivityLog) => {
      const logs = getLocal<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, []);
      const newLogs = [log, ...logs].slice(0, 100); 
      setLocal(STORAGE_KEYS.ACTIVITY, newLogs);
      storageService.saveToCloud();
      return newLogs;
  },
};
