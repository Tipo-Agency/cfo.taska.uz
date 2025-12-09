
import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, User, StatusOption, PriorityOption, Doc, Attachment } from '../types';
import { X, Calendar as CalendarIcon, User as UserIcon, Tag, Plus, CheckCircle2, Archive, Send, FileText, Link as LinkIcon, Save, Trash2, FileSpreadsheet, Figma, Layout, Image as ImageIcon, ExternalLink, Paperclip } from 'lucide-react';
import { getColorStyles } from '../constants';

interface TaskModalProps {
  users: User[];
  projects: Project[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  currentUser: User;
  docs: Doc[];
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
  onCreateProject: (name: string) => void;
  onDelete?: (taskId: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
  onAddAttachment?: (taskId: string, attachment: Attachment) => void;
  onDeleteAttachment?: (taskId: string, attachmentId: string) => void;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
    users, projects, statuses, priorities, currentUser, docs,
    onSave, onClose, onCreateProject, onDelete, onAddComment, onAddAttachment, onDeleteAttachment, task 
}) => {
  const isEditing = !!(task && task.id);

  // Local state for form fields
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<string>('');
  const [description, setDescription] = useState('');
  
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState<'attachment' | 'comment' | null>(null);
  const [tempLinkUrl, setTempLinkUrl] = useState('');

  // Initialize state
  useEffect(() => {
    if (task) {
        setTitle(task.title || '');
        setPriority(task.priority || priorities[0]?.name || '');
        setProjectId(task.projectId || '');
        setAssigneeId(task.assigneeId || currentUser.id);
        setStartDate(task.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(task.endDate || new Date().toISOString().split('T')[0]);
        setStatus(task.status || statuses[0]?.name || '');
        setDescription(task.description || '');
    }
  }, [task, priorities, statuses, currentUser.id]);

  // Scroll to bottom of comments
  useEffect(() => {
      if (task?.comments?.length) {
          setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
  }, [task?.comments?.length]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave({
      id: task?.id,
      title,
      priority,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      status: status,
      startDate,
      endDate,
      description
    });
    onClose(); // ALWAYS CLOSE ON SAVE
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || !isEditing || !task || !onAddComment) return;
      onAddComment(task.id, commentText);
      setCommentText('');
  };

  // Link Input Handler
  const handleLinkInputSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tempLinkUrl.trim()) {
          setShowLinkInput(null);
          return;
      }

      if (showLinkInput === 'attachment') {
          if (!isEditing || !task || !onAddAttachment) return;
          let name = tempLinkUrl;
          try { name = new URL(tempLinkUrl).hostname; } catch(e) {}
          
          onAddAttachment(task.id, { 
              id: `att-${Date.now()}`, 
              type: 'link', 
              name: name, 
              url: tempLinkUrl 
          });
      } else if (showLinkInput === 'comment') {
          setCommentText(prev => prev + (prev ? ' ' : '') + tempLinkUrl);
      }

      setTempLinkUrl('');
      setShowLinkInput(null);
      setIsAttachMenuOpen(false);
  };

  const handleAddDoc = (docId: string) => {
      if (!isEditing || !task || !onAddAttachment) return;
      const doc = docs.find(d => d.id === docId);
      if (doc) {
          onAddAttachment(task.id, { 
              id: `att-${Date.now()}`, 
              type: 'doc', 
              name: doc.title, 
              docId: doc.id 
          });
          setIsAttachMenuOpen(false);
      }
  };

  const getLinkIcon = (url?: string) => {
      if (!url) return <LinkIcon size={18}/>;
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('figma.com')) return <Figma size={18}/>;
      if (lowerUrl.includes('miro.com')) return <Layout size={18}/>;
      if (lowerUrl.includes('docs.google.com')) {
          if (lowerUrl.includes('spreadsheets')) return <FileSpreadsheet size={18}/>;
          return <FileText size={18}/>;
      }
      if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) return <ImageIcon size={18}/>;
      return <LinkIcon size={18}/>;
  };

  // Colors Helpers
  const getStatusColor = (name: string) => {
      const c = statuses.find(s => s.name === name)?.color;
      return getColorStyles(c).badge; // Use badge style for background of select
  };
  
  const getPriorityColor = (name: string) => {
      const c = priorities.find(p => p.name === name)?.color;
      return getColorStyles(c).badge;
  };

  const getProjectColor = (id: string) => {
      const c = projects.find(p => p.id === id)?.color;
      if (c) return getColorStyles(c).badge;
      return 'bg-white border-gray-200 dark:bg-[#2C2C2C] dark:border-gray-600 text-gray-700 dark:text-gray-200';
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-notion-dark-sidebar w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-notion-dark-border relative text-gray-900 dark:text-gray-100">
        
        {/* Link Input Overlay */}
        {showLinkInput && (
            <div className="absolute inset-0 bg-black/20 z-[60] flex items-center justify-center">
                <div className="bg-white dark:bg-notion-dark-bg p-4 rounded-lg shadow-xl w-96 border border-gray-200 dark:border-gray-600 animate-in zoom-in-95 duration-200">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2 text-sm">
                        {showLinkInput === 'attachment' ? 'Добавить внешнюю ссылку' : 'Прикрепить ссылку к комментарию'}
                    </h4>
                    <form onSubmit={handleLinkInputSubmit}>
                        <input 
                            autoFocus
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3 bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white"
                            placeholder="https://example.com"
                            value={tempLinkUrl}
                            onChange={e => setTempLinkUrl(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowLinkInput(null)} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Отмена</button>
                            <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar shrink-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              {isEditing ? <CheckCircle2 size={18} className="text-blue-600"/> : null}
              {isEditing ? task?.title : 'Новая задача'}
          </h2>
          <div className="flex items-center gap-2">
              {isEditing && onDelete && task && (
                  <button type="button" onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700 p-1.5 rounded" title="В архив">
                      <Archive size={14} /> В АРХИВ
                  </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-1">
                  <X size={20} />
              </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-gray-100 dark:border-notion-dark-border custom-scrollbar bg-white dark:bg-notion-dark-bg">
                <div className="space-y-8 max-w-3xl mx-auto">
                    <input 
                        required
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-3xl font-bold placeholder-gray-300 dark:placeholder-gray-600 border-none focus:ring-0 p-0 text-gray-900 dark:text-white bg-transparent outline-none"
                        placeholder="Название задачи..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 bg-white dark:bg-notion-dark-bg p-1">
                        {/* Status */}
                        <div className="flex items-center">
                            <div className="text-xs font-semibold text-gray-400 uppercase w-32 flex items-center gap-2"><CheckCircle2 size={14}/> СТАТУС</div>
                            <div className="relative flex-1">
                                <select 
                                    value={status} 
                                    onChange={e => setStatus(e.target.value)} 
                                    className={`w-full rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer appearance-none truncate ${getStatusColor(status)}`}
                                >
                                    {statuses.map(s => <option key={s.id} value={s.name} className="bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white">{s.name}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">▼</div>
                            </div>
                        </div>

                        {/* Module */}
                        <div className="flex items-center">
                            <div className="text-xs font-semibold text-gray-400 uppercase w-32 flex items-center gap-2"><Tag size={14}/> МОДУЛЬ</div>
                            <div className="relative flex-1">
                                <select 
                                    value={projectId} 
                                    onChange={e => setProjectId(e.target.value)} 
                                    className={`w-full rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer appearance-none truncate ${getProjectColor(projectId)}`}
                                >
                                    <option value="" className="bg-white dark:bg-[#2C2C2C]">Без модуля</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white">{p.name}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">▼</div>
                            </div>
                        </div>

                        {/* Assignee */}
                        <div className="flex items-center">
                            <div className="text-xs font-semibold text-gray-400 uppercase w-32 flex items-center gap-2"><UserIcon size={14}/> ИСПОЛНИТЕЛЬ</div>
                            <div className="relative flex-1">
                                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded-md pl-3 pr-8 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer appearance-none truncate">
                                    <option value="">Не назначено</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center">
                            <div className="text-xs font-semibold text-gray-400 uppercase w-32 flex items-center gap-2"><Tag size={14}/> ПРИОРИТЕТ</div>
                            <div className="relative flex-1">
                                <select 
                                    value={priority} 
                                    onChange={e => setPriority(e.target.value)} 
                                    className={`w-full rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer appearance-none truncate ${getPriorityColor(priority)}`}
                                >
                                    {priorities.map(p => <option key={p.id} value={p.name} className="bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white">{p.name}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">▼</div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center md:col-span-2">
                            <div className="text-xs font-semibold text-gray-400 uppercase w-32 flex items-center gap-2"><CalendarIcon size={14}/> СРОКИ</div>
                            <div className="flex items-center gap-2 flex-1">
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)} 
                                    onClick={(e) => { try{e.currentTarget.showPicker()}catch(e){} }}
                                    className="bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer" 
                                />
                                <span className="text-gray-400">→</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)} 
                                    onClick={(e) => { try{e.currentTarget.showPicker()}catch(e){} }}
                                    className="bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ОПИСАНИЕ</label>
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none min-h-[150px] resize-y placeholder-gray-400 leading-relaxed"
                            placeholder="Добавьте детали..."
                        />
                    </div>

                    {/* Attachments */}
                    {isEditing && task && (
                        <div className="pt-4 border-t border-gray-100 dark:border-notion-dark-border">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase">ВЛОЖЕНИЯ</label>
                                <div className="relative">
                                    <button onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                        <Plus size={14}/> Добавить
                                    </button>
                                    {isAttachMenuOpen && (
                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-gray-600 shadow-xl rounded-lg w-56 z-20 py-1 overflow-hidden">
                                            <button onClick={() => { setShowLinkInput('attachment'); setIsAttachMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                                <LinkIcon size={16}/> Внешняя ссылка
                                            </button>
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                            <div className="px-4 py-1 text-[10px] text-gray-400 font-bold uppercase">База знаний</div>
                                            <div className="max-h-40 overflow-y-auto">
                                                {docs.length > 0 ? docs.map(d => (
                                                    <button key={d.id} onClick={() => handleAddDoc(d.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200 truncate">
                                                        <FileText size={14}/> {d.title}
                                                    </button>
                                                )) : <div className="px-4 py-2 text-sm text-gray-400 italic">Нет документов</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {task.attachments?.map(att => (
                                    <div key={att.id} className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-600 rounded hover:shadow-sm transition-all bg-white dark:bg-[#2C2C2C] group">
                                        <div className={`p-1.5 rounded ${att.type === 'link' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'}`}>
                                            {att.type === 'link' ? getLinkIcon(att.url) : <FileText size={16}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <a href={att.url || '#'} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 hover:underline truncate block">{att.name}</a>
                                        </div>
                                        {onDeleteAttachment && (
                                            <button 
                                                onClick={() => onDeleteAttachment(task.id, att.id)}
                                                className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(!task.attachments || task.attachments.length === 0) && <div className="text-sm text-gray-400 italic">Нет вложений</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Comments */}
            <div className="w-[380px] bg-[#F7F7F5] dark:bg-[#202020] border-l border-gray-200 dark:border-notion-dark-border flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar shadow-sm z-10 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Комментарии <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded text-xs">{task?.comments?.length || 0}</span></h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {!isEditing ? (
                        <div className="flex h-full items-center justify-center text-center text-sm text-gray-400 px-8">Сохраните задачу...</div>
                    ) : (
                        <>
                            {task?.comments?.map(comment => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <img src={comment.userAvatar} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600 mt-1" alt=""/>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.userName}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-[#2C2C2C] p-2.5 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-600 shadow-sm whitespace-pre-wrap break-words">
                                            {comment.text.split(' ').map((word, i) => (
                                                word.startsWith('http') ? <a key={i} href={word} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{word} </a> : word + ' '
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={commentsEndRef} />
                        </>
                    )}
                </div>

                {isEditing && (
                    <div className="p-3 bg-white dark:bg-notion-dark-sidebar border-t border-gray-200 dark:border-notion-dark-border">
                        <form onSubmit={handleCommentSubmit} className="relative bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <textarea 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 text-sm outline-none resize-none bg-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-400"
                                rows={1}
                                style={{ minHeight: '42px' }}
                                placeholder="Написать комментарий..."
                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(e as any); }}}
                            />
                            <div className="absolute right-1 bottom-1 flex items-center">
                                <button type="button" onClick={() => setShowLinkInput('comment')} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors">
                                    <Paperclip size={16} />
                                </button>
                                <button type="submit" disabled={!commentText.trim()} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md disabled:opacity-30 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar flex justify-end items-center shrink-0 gap-3">
             <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Отмена</button>
             <button onClick={(e) => handleSubmit(e)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"><Save size={16}/> {isEditing ? 'Сохранить изменения' : 'Создать задачу'}</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
