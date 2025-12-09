
export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ViewMode {
  TABLE = 'table',
  KANBAN = 'kanban',
  GANTT = 'gantt',
}

export interface StatusOption {
    id: string;
    name: string;
    color: string; // Tailwind class
}

export interface PriorityOption {
    id: string;
    name: string;
    color: string; // Tailwind class
}

export interface User {
  id: string;
  name: string;
  login: string; // Used for authentication
  role: Role;
  avatar?: string;
  email?: string; // Info only
  phone?: string;
  telegram?: string;
  password?: string;
  mustChangePassword?: boolean;
}

export interface Project {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  type: 'link' | 'file' | 'doc';
  name: string;
  url?: string; // For links or file placeholders
  docId?: string; // For internal system docs
}

export interface Task {
  id: string;
  tableId: string;
  title: string;
  status: string; // Dynamic string
  priority: string; // Dynamic string
  assigneeId: string | null;
  projectId: string | null;
  startDate: string;
  endDate: string;
  description?: string;
  isArchived?: boolean;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Meeting {
  id: string;
  tableId: string;
  title: string;
  date: string;
  time: string;
  participantIds: string[];
  summary: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface ViewConfig {
    showTable: boolean;
    showKanban: boolean;
    showGantt: boolean;
}

export interface TableCollection {
  id: string;
  name: string;
  type: 'tasks' | 'docs' | 'meetings' | 'backlog';
  icon: string;
  color?: string;
  isSystem?: boolean;
  viewConfig?: ViewConfig;
}

export interface Folder {
  id: string;
  tableId: string;
  name: string;
}

export interface Doc {
  id: string;
  tableId: string;
  folderId?: string; // Optional link to a folder
  title: string;
  type: 'link' | 'internal';
  url?: string;
  content?: string;
  tags: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  details: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationSetting {
    system: boolean;
    telegram: boolean;
}

export interface NotificationSettings {
    NEW_TASK: NotificationSetting;
    STATUS_CHANGE: NotificationSetting;
    NEW_COMMENT: NotificationSetting;
    NEW_DOC: NotificationSetting;
}
