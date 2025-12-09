
import { Project, Role, TableCollection, Task, User, Doc, StatusOption, PriorityOption } from "./types";

export const TELEGRAM_BOT_TOKEN = '8389452001:AAE_BpIFRa_WeutjUjFUjPbrL24YqgggkXE';
export const FIREBASE_DB_URL = 'https://cfo-task-manager-default-rtdb.asia-southeast1.firebasedatabase.app/';
export const TELEGRAM_CHAT_ID = '-1003245231059'; 

export const ICON_OPTIONS = ['Bug', 'CheckSquare', 'Target', 'FileText', 'Users', 'Briefcase', 'Zap', 'Star', 'Heart', 'Flag', 'Rocket', 'Layout'];
export const COLOR_OPTIONS = [ 'text-gray-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-600', 'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500' ];

// SAFE COLOR MAPPING FOR TAILWIND
// Using ! to force override global input styles.
// Dark Mode: Using Standard Tailwind colors (900 for bg, 200 for text) to guarantee visibility.
const SAFE_COLORS: Record<string, { badge: string, dot: string, text: string, border: string, selectBg: string, solid: string }> = {
    'text-gray-500': { 
        badge: 'bg-gray-100 text-gray-800 border-gray-300 border !dark:bg-gray-800 !dark:text-gray-300 !dark:border-gray-600', 
        dot: 'bg-gray-500 dark:bg-gray-400', 
        text: 'text-gray-700 dark:text-gray-300', 
        border: 'border-gray-300 dark:border-gray-600', 
        selectBg: 'bg-gray-100 dark:bg-gray-800',
        solid: 'bg-gray-500 dark:bg-gray-500'
    },
    'text-red-500': { 
        badge: 'bg-red-100 text-red-800 border-red-300 border !dark:bg-red-900 !dark:text-red-200 !dark:border-red-700', 
        dot: 'bg-red-500 dark:bg-red-500', 
        text: 'text-red-800 dark:text-red-300', 
        border: 'border-red-300 dark:border-red-800', 
        selectBg: 'bg-red-100 dark:bg-red-900',
        solid: 'bg-red-600 dark:bg-red-600'
    },
    'text-orange-500': { 
        badge: 'bg-orange-100 text-orange-800 border-orange-300 border !dark:bg-orange-900 !dark:text-orange-200 !dark:border-orange-700', 
        dot: 'bg-orange-500 dark:bg-orange-500', 
        text: 'text-orange-800 dark:text-orange-300', 
        border: 'border-orange-300 dark:border-orange-800', 
        selectBg: 'bg-orange-100 dark:bg-orange-900',
        solid: 'bg-orange-500 dark:bg-orange-500'
    },
    'text-yellow-500': { 
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300 border !dark:bg-yellow-900 !dark:text-yellow-200 !dark:border-yellow-700', 
        dot: 'bg-yellow-500 dark:bg-yellow-500', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        border: 'border-yellow-300 dark:border-yellow-800', 
        selectBg: 'bg-yellow-100 dark:bg-yellow-900',
        solid: 'bg-yellow-500 dark:bg-yellow-500'
    },
    'text-green-600': { 
        badge: 'bg-green-100 text-green-800 border-green-300 border !dark:bg-green-900 !dark:text-green-200 !dark:border-green-700', 
        dot: 'bg-green-600 dark:bg-green-500', 
        text: 'text-green-800 dark:text-green-300', 
        border: 'border-green-300 dark:border-green-800', 
        selectBg: 'bg-green-100 dark:bg-green-900',
        solid: 'bg-green-600 dark:bg-green-600'
    },
    'text-blue-500': { 
        badge: 'bg-blue-100 text-blue-800 border-blue-300 border !dark:bg-blue-900 !dark:text-blue-200 !dark:border-blue-700', 
        dot: 'bg-blue-500 dark:bg-blue-500', 
        text: 'text-blue-800 dark:text-blue-300', 
        border: 'border-blue-300 dark:border-blue-800', 
        selectBg: 'bg-blue-100 dark:bg-blue-900',
        solid: 'bg-blue-600 dark:bg-blue-600'
    },
    'text-purple-500': { 
        badge: 'bg-purple-100 text-purple-800 border-purple-300 border !dark:bg-purple-900 !dark:text-purple-200 !dark:border-purple-700', 
        dot: 'bg-purple-500 dark:bg-purple-500', 
        text: 'text-purple-800 dark:text-purple-300', 
        border: 'border-purple-300 dark:border-purple-800', 
        selectBg: 'bg-purple-100 dark:bg-purple-900',
        solid: 'bg-purple-600 dark:bg-purple-600'
    },
    'text-pink-500': { 
        badge: 'bg-pink-100 text-pink-800 border-pink-300 border !dark:bg-pink-900 !dark:text-pink-200 !dark:border-pink-700', 
        dot: 'bg-pink-500 dark:bg-pink-500', 
        text: 'text-pink-800 dark:text-pink-300', 
        border: 'border-pink-300 dark:border-pink-800', 
        selectBg: 'bg-pink-100 dark:bg-pink-900',
        solid: 'bg-pink-600 dark:bg-pink-600'
    },
    'text-indigo-500': { 
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300 border !dark:bg-indigo-900 !dark:text-indigo-200 !dark:border-indigo-700', 
        dot: 'bg-indigo-500 dark:bg-indigo-500', 
        text: 'text-indigo-800 dark:text-indigo-300', 
        border: 'border-indigo-200 dark:border-indigo-800', 
        selectBg: 'bg-indigo-100 dark:bg-indigo-900',
        solid: 'bg-indigo-600 dark:bg-indigo-600'
    },
};

// Helper to get styles safely with aggressive fallback
export const getColorStyles = (baseColorClass: string = 'text-gray-500') => {
    if (!baseColorClass) return SAFE_COLORS['text-gray-500'];

    // 1. Exact match (New system)
    if (SAFE_COLORS[baseColorClass]) {
        return SAFE_COLORS[baseColorClass];
    }

    // 2. Aggressive Fallback (Old system / Fuzzy match)
    const str = baseColorClass.toLowerCase();
    if (str.includes('red')) return SAFE_COLORS['text-red-500'];
    if (str.includes('blue')) return SAFE_COLORS['text-blue-500'];
    if (str.includes('green')) return SAFE_COLORS['text-green-600'];
    if (str.includes('orange')) return SAFE_COLORS['text-orange-500'];
    if (str.includes('yellow')) return SAFE_COLORS['text-yellow-500'];
    if (str.includes('purple')) return SAFE_COLORS['text-purple-500'];
    if (str.includes('pink')) return SAFE_COLORS['text-pink-500'];
    if (str.includes('indigo')) return SAFE_COLORS['text-indigo-500'];

    // Default
    return SAFE_COLORS['text-gray-500'];
};

export const DEFAULT_STATUSES: StatusOption[] = [
    { id: 's1', name: 'Не начато', color: 'text-gray-500' },
    { id: 's2', name: 'В работе', color: 'text-blue-500' },
    { id: 's3', name: 'На проверке', color: 'text-yellow-500' },
    { id: 's4', name: 'Выполнено', color: 'text-green-600' },
];

export const DEFAULT_PRIORITIES: PriorityOption[] = [
    { id: 'p1', name: 'Низкий', color: 'text-green-600' },
    { id: 'p2', name: 'Средний', color: 'text-orange-500' },
    { id: 'p3', name: 'Высокий', color: 'text-red-500' },
];

export const LABEL_COLORS = COLOR_OPTIONS; 
export const PRIORITY_COLORS = COLOR_OPTIONS;

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Александр Донских', login: 'admin', email: 'admin@cfo.uz', password: '123', role: Role.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Alexandr+Donskikh&background=0D8ABC&color=fff', mustChangePassword: false },
  { id: 'u2', name: 'Ruslan Nigmatulin', login: 'ruslan', email: 'ruslan@cfo.uz', password: '123', role: Role.EMPLOYEE, avatar: 'https://ui-avatars.com/api/?name=Ruslan&background=random', mustChangePassword: true },
  { id: 'u3', name: 'Anastasiya', login: 'ana', email: 'ana@cfo.uz', password: '123', role: Role.EMPLOYEE, avatar: 'https://ui-avatars.com/api/?name=Anastasiya&background=random', mustChangePassword: true },
  { id: 'u4', name: 'Ilya', login: 'ilya', email: 'ilya@cfo.uz', password: '123', role: Role.EMPLOYEE, avatar: 'https://ui-avatars.com/api/?name=Ilya&background=random', mustChangePassword: true },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Склад', icon: 'Briefcase', color: 'text-blue-500' },
  { id: 'p2', name: 'ЭДО', icon: 'FileText', color: 'text-green-600' },
  { id: 'p3', name: 'Главная страница', icon: 'Home', color: 'text-purple-500' },
  { id: 'p4', name: 'Логин и регистрация', icon: 'KeyRound', color: 'text-orange-500' },
];

const defaultViewConfig = { showTable: true, showKanban: true, showGantt: true };

export const MOCK_TABLES: TableCollection[] = [
  { id: 't1', name: 'Баги', type: 'tasks', icon: 'Bug', color: 'text-red-500', isSystem: true, viewConfig: defaultViewConfig },
  { id: 't2', name: 'Задачи', type: 'tasks', icon: 'CheckSquare', color: 'text-blue-500', isSystem: true, viewConfig: defaultViewConfig },
  { id: 't3', name: 'Функционал', type: 'tasks', icon: 'Target', color: 'text-green-600', isSystem: true, viewConfig: defaultViewConfig },
  { id: 't6', name: 'Бэклог', type: 'backlog', icon: 'Layout', color: 'text-gray-500', isSystem: true, viewConfig: { showTable: true, showKanban: false, showGantt: false } },
  { id: 't4', name: 'Документация', type: 'docs', icon: 'FileText', color: 'text-yellow-500', isSystem: true },
  { id: 't5', name: 'Планерки', type: 'meetings', icon: 'Users', color: 'text-purple-500', isSystem: true },
];

export const MOCK_TASKS: Task[] = [];
export const MOCK_DOCS: Doc[] = [];
