
import React, { useState } from 'react';
import { Meeting, User } from '../types';
import { Calendar, Users, Plus, Save, X, List, LayoutGrid, Clock, Repeat, Check } from 'lucide-react';

interface MeetingsViewProps {
  meetings: Meeting[];
  users: User[];
  tableId: string;
  onSaveMeeting: (meeting: Meeting) => void;
  onUpdateSummary: (meetingId: string, summary: string) => void;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, users, tableId, onSaveMeeting, onUpdateSummary }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const filteredMeetings = meetings.filter(m => m.tableId === tableId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      const newMeeting: Meeting = {
          id: `m-${Date.now()}`,
          tableId,
          title,
          date,
          time,
          recurrence,
          participantIds: selectedParticipants,
          summary: ''
      };
      onSaveMeeting(newMeeting);
      setIsModalOpen(false);
      setTitle('');
      setSelectedParticipants([]);
      setRecurrence('none');
  };

  const toggleParticipant = (userId: string) => {
      if (selectedParticipants.includes(userId)) {
          setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
      } else {
          setSelectedParticipants([...selectedParticipants, userId]);
      }
  };

  // Calendar Logic
  const renderCalendar = () => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDay = new Date(currentYear, currentMonth, 1).getDay(); 
      const startOffset = firstDay === 0 ? 6 : firstDay - 1; 

      const days = [];
      for (let i = 0; i < startOffset; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);

      return (
          <div className="bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-notion-dark-border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-notion-dark-bg border-b border-gray-200 dark:border-notion-dark-border p-4 font-semibold text-gray-700 dark:text-gray-200 flex justify-between">
                  <span>{today.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                  <div className="flex gap-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Встреча</span>
                  </div>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-notion-dark-border bg-gray-50 dark:bg-notion-dark-bg">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                      <div key={d} className="p-2 text-center text-xs font-bold text-gray-400">{d}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 bg-white dark:bg-notion-dark-sidebar">
                  {days.map((day, idx) => {
                      const dayMeetings = day ? filteredMeetings.filter(m => {
                          const mDate = new Date(m.date);
                          return mDate.getDate() === day && mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear;
                      }) : [];
                      
                      return (
                        <div key={idx} className={`min-h-[100px] border-r border-b border-gray-100 dark:border-gray-800 p-2 ${!day ? 'bg-gray-50/30 dark:bg-gray-900/30' : ''}`}>
                            {day && (
                                <>
                                    <div className="text-right text-xs text-gray-400 mb-1">{day}</div>
                                    <div className="space-y-1">
                                        {dayMeetings.map(m => (
                                            <div key={m.id} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-1 rounded border border-blue-100 dark:border-blue-800 truncate" title={m.title}>
                                                {m.time} {m.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-5xl mx-auto w-full pt-6">
      <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Планерки и Встречи</h2>
            <div className="flex bg-gray-100 dark:bg-notion-dark-sidebar p-1 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} title="Список"><List size={16}/></button>
                <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-notion-dark-bg shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} title="Календарь"><LayoutGrid size={16}/></button>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
              <Plus size={16} /> Новая встреча
          </button>
      </div>

      {viewMode === 'calendar' ? renderCalendar() : (
        <div className="grid gap-6">
            {filteredMeetings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-notion-dark-sidebar border border-dashed border-gray-200 dark:border-notion-dark-border rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">Пока нет запланированных встреч.</p>
                </div>
            ) : (
                filteredMeetings.map(meeting => (
                    <div key={meeting.id} className="bg-white dark:bg-notion-dark-sidebar border border-gray-200 dark:border-notion-dark-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                    {meeting.title}
                                    {meeting.recurrence && meeting.recurrence !== 'none' && (
                                        <span className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800 flex items-center gap-1 capitalize">
                                            <Repeat size={10}/> {meeting.recurrence === 'daily' ? 'Ежедневно' : meeting.recurrence === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-xs"><Calendar size={12}/> {meeting.date}</span>
                                    <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-xs"><Clock size={12}/> {meeting.time}</span>
                                </div>
                            </div>
                            <div className="flex -space-x-2">
                                {meeting.participantIds.map(uid => {
                                    const u = users.find(user => user.id === uid);
                                    if (!u) return null;
                                    return (
                                        <img key={uid} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" title={u.name} />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Резюме встречи / Итоги</label>
                            <textarea 
                                className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-200 outline-none min-h-[100px] resize-y placeholder-gray-400"
                                placeholder="Напишите здесь результаты встречи..."
                                defaultValue={meeting.summary}
                                onBlur={(e) => onUpdateSummary(meeting.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 text-gray-900 dark:text-white">
            <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-notion-dark-border flex justify-between items-center bg-white dark:bg-notion-dark-sidebar shrink-0">
                    <h3 className="font-bold text-gray-800 dark:text-white">Запланировать встречу</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Тема встречи</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" placeholder="Например: Еженедельная планерка"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Дата</label>
                            <input 
                                required 
                                type="date" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                onClick={(e) => { try{e.currentTarget.showPicker()}catch(e){} }}
                                className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer dark:[color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Время</label>
                            <input 
                                required 
                                type="time" 
                                value={time} 
                                onChange={e => setTime(e.target.value)} 
                                onClick={(e) => { try{e.currentTarget.showPicker()}catch(e){} }}
                                className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Повторение</label>
                        <select 
                            value={recurrence} 
                            onChange={(e: any) => setRecurrence(e.target.value)}
                            className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="none">Не повторять</option>
                            <option value="daily">Ежедневно</option>
                            <option value="weekly">Еженедельно</option>
                            <option value="monthly">Ежемесячно</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Участники</label>
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                            {users.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-400">Нет сотрудников</div>
                            ) : (
                                users.map(u => {
                                    const isSelected = selectedParticipants.includes(u.id);
                                    return (
                                        <div 
                                            key={u.id}
                                            onClick={() => toggleParticipant(u.id)}
                                            className={`flex items-center gap-3 p-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white dark:bg-[#2C2C2C] dark:border-gray-500'}`}>
                                                {isSelected && <Check size={10} className="text-white" />}
                                            </div>
                                            <img src={u.avatar} className="w-6 h-6 rounded-full border border-gray-100" />
                                            <span className={`text-sm ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>{u.name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 mt-2 shadow-sm transition-colors">Создать встречу</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsView;
