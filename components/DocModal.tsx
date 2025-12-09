
import React, { useState } from 'react';
import { X, FileText, Link, Tag, FileType, Folder } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface DocModalProps {
  folders: FolderType[];
  activeFolderId: string | null;
  onSave: (doc: { title: string; url?: string; tags: string[]; type: 'link' | 'internal'; folderId?: string }) => void;
  onClose: () => void;
}

const DocModal: React.FC<DocModalProps> = ({ folders, activeFolderId, onSave, onClose }) => {
  const [type, setType] = useState<'link' | 'internal'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(activeFolderId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);
    onSave({ 
        title, 
        url: type === 'link' ? url : undefined, 
        tags: tags.length > 0 ? tags : ['Общее'],
        type,
        folderId: selectedFolderId || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[70] animate-in fade-in duration-200 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-notion-dark-border">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-blue-500"/> 
            Новый документ
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-notion-dark-hover transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Switcher */}
          <div className="flex bg-gray-100 dark:bg-notion-dark-bg p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'link' ? 'bg-white dark:bg-notion-dark-sidebar text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
              >
                  <Link size={14} /> Внешняя ссылка
              </button>
              <button
                type="button"
                onClick={() => setType('internal')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'internal' ? 'bg-white dark:bg-notion-dark-sidebar text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'}`}
              >
                  <FileType size={14} /> Статья / Вики
              </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Название документа</label>
            <input 
              required
              autoFocus
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow placeholder-gray-400 text-gray-900 dark:text-white"
              placeholder="Например: Техническое задание"
            />
          </div>

          {type === 'link' && (
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                    <Link size={12}/> Ссылка
                </label>
                <input 
                required
                type="url" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow placeholder-gray-400 text-gray-900 dark:text-white"
                placeholder="https://google.com/..."
                />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Folder size={12}/> Папка
            </label>
            <select
                value={selectedFolderId}
                onChange={e => setSelectedFolderId(e.target.value)}
                className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-gray-900 dark:text-white"
            >
                <option value="">Без папки (Общее)</option>
                {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>
          </div>

          {type === 'internal' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  Вы сможете отредактировать содержание статьи сразу после создания в редакторе.
              </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Tag size={12}/> Теги (через запятую)
            </label>
            <input 
              type="text" 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow placeholder-gray-400 text-gray-900 dark:text-white"
              placeholder="ТЗ, Важное, Финансы"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-notion-dark-hover rounded-lg transition-colors">
                 Отмена
             </button>
             <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                 {type === 'internal' ? 'Создать и открыть' : 'Добавить'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocModal;
