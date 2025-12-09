
import React, { useState } from 'react';
import { Doc, Folder, Role, User } from '../types';
import { 
  Folder as FolderIcon, 
  FolderOpen, 
  Plus, 
  Trash2, 
  FileText, 
  ExternalLink, 
  LayoutGrid, 
  List
} from 'lucide-react';

interface DocsViewProps {
  docs: Doc[];
  folders: Folder[];
  currentUser: User;
  tableId: string;
  onOpenDoc: (doc: Doc) => void;
  onCreateDoc: (folderId: string | undefined) => void;
  onDeleteDoc: (docId: string) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (folderId: string) => void;
}

const DocsView: React.FC<DocsViewProps> = ({
  docs,
  folders,
  currentUser,
  tableId,
  onOpenDoc,
  onCreateDoc,
  onDeleteDoc,
  onCreateFolder,
  onDeleteFolder
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentDocs = docs.filter(d => d.tableId === tableId);
  const currentFolders = folders.filter(f => f.tableId === tableId);

  const filteredDocs = currentDocs.filter(d => {
      if (activeFolderId === null) return true;
      if (activeFolderId === 'uncategorized') return !d.folderId;
      return d.folderId === activeFolderId;
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-50 dark:bg-notion-dark-sidebar border-r border-gray-200 dark:border-notion-dark-border flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-notion-dark-border flex justify-between items-center bg-gray-50 dark:bg-notion-dark-sidebar">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Папки</span>
            {currentUser.role === Role.ADMIN && (
                <button 
                    onClick={onCreateFolder} 
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-gray-200 dark:hover:bg-notion-dark-hover transition-colors"
                    title="Создать папку"
                >
                    <Plus size={16}/>
                </button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <div 
                onClick={() => setActiveFolderId(null)}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${activeFolderId === null ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-notion-dark-hover'}`}
            >
                <div className="flex items-center gap-2">
                    <FolderIcon size={16} className={activeFolderId === null ? 'text-blue-500' : 'text-gray-400'} />
                    <span>Все документы</span>
                </div>
                <span className="text-xs text-gray-400">{currentDocs.length}</span>
            </div>
            
            <div 
                onClick={() => setActiveFolderId('uncategorized')}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${activeFolderId === 'uncategorized' ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-notion-dark-hover'}`}
            >
                <div className="flex items-center gap-2">
                    <FolderIcon size={16} className={activeFolderId === 'uncategorized' ? 'text-blue-500' : 'text-gray-400'} />
                    <span>Общее</span>
                </div>
                <span className="text-xs text-gray-400">{currentDocs.filter(d => !d.folderId).length}</span>
            </div>

            {currentFolders.map(folder => (
                <div 
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm group transition-colors ${activeFolderId === folder.id ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-notion-dark-hover'}`}
                >
                    <div className="flex items-center gap-2 truncate">
                        <FolderOpen size={16} className={activeFolderId === folder.id ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="truncate">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{currentDocs.filter(d => d.folderId === folder.id).length}</span>
                        {currentUser.role === Role.ADMIN && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-notion-dark-bg">
          {/* Toolbar */}
          <div className="h-14 border-b border-gray-200 dark:border-notion-dark-border flex items-center justify-between px-6 shrink-0 bg-white dark:bg-notion-dark-bg">
              <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                      {activeFolderId ? (activeFolderId === 'uncategorized' ? 'Общее' : folders.find(f => f.id === activeFolderId)?.name) : 'Все документы'}
                  </h2>
                  <div className="flex bg-gray-100 dark:bg-notion-dark-sidebar p-1 rounded-lg">
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} title="Карточки"><LayoutGrid size={16}/></button>
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} title="Список"><List size={16}/></button>
                  </div>
              </div>
              <button 
                  onClick={() => onCreateDoc(activeFolderId === 'uncategorized' ? undefined : (activeFolderId || undefined))} 
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
              >
                  <Plus size={16} /> Новый документ
              </button>
          </div>

          {/* Grid/List View */}
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-notion-dark-bg">
              {filteredDocs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-notion-dark-border rounded-xl bg-gray-50/50 dark:bg-notion-dark-bg-subtle/10">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p>В этой папке пока пусто</p>
                      <button onClick={() => onCreateDoc(activeFolderId === 'uncategorized' ? undefined : (activeFolderId || undefined))} className="mt-4 text-blue-600 hover:underline text-sm">Создать первый документ</button>
                  </div>
              ) : (
                  <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} onClick={() => onOpenDoc(doc)} className="bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-notion-dark-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group relative flex flex-col h-40">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-lg ${doc.type === 'internal' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                            {doc.type === 'internal' ? <FileText size={20}/> : <ExternalLink size={20}/>}
                                        </div>
                                        {currentUser.role === Role.ADMIN && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-auto group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.title}</h3>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex gap-1 overflow-hidden">
                                            {doc.tags.slice(0, 2).map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 truncate">{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-notion-dark-border rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-notion-dark-bg border-b border-gray-200 dark:border-notion-dark-border">
                                    <tr>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 w-12"></th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Название</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Теги</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 w-32">Тип</th>
                                        <th className="py-3 px-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredDocs.map(doc => (
                                        <tr key={doc.id} onClick={() => onOpenDoc(doc)} className="hover:bg-gray-50 dark:hover:bg-notion-dark-hover cursor-pointer group">
                                            <td className="py-3 px-4 text-gray-400">
                                                {doc.type === 'internal' ? <FileText size={16}/> : <ExternalLink size={16}/>}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{doc.title}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {doc.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">{tag}</span>)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">
                                                {doc.type === 'internal' ? 'Статья' : 'Ссылка'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {currentUser.role === Role.ADMIN && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}
                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                  </>
              )}
          </div>
      </div>
    </div>
  );
};

export default DocsView;
