
import React, { useState } from 'react';
import { User } from '../types';
import { X, Save, User as UserIcon, Mail, Phone, Lock, Send, Camera, UserCheck } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [login, setLogin] = useState(user.login || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [telegram, setTelegram] = useState(user.telegram || '');
  const [password, setPassword] = useState(user.password || '');
  const [avatar, setAvatar] = useState(user.avatar || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      login,
      email,
      phone,
      telegram,
      password,
      avatar
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-notion-dark-sidebar rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-notion-dark-border">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-notion-dark-border bg-white dark:bg-notion-dark-sidebar">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <UserIcon size={18} className="text-blue-500"/> 
            Настройки профиля
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-notion-dark-hover transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex justify-center mb-6">
             <div className="relative group cursor-pointer" onClick={() => {
                 const newUrl = prompt('Введите URL картинки для аватара:', avatar);
                 if(newUrl) setAvatar(newUrl);
             }}>
                 <img src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-700 shadow-sm object-cover" alt="avatar" />
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                     <Camera size={24} />
                 </div>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Имя и Фамилия</label>
            <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  placeholder="Иван Иванов"
                />
            </div>
          </div>

           <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Логин (для входа)</label>
            <div className="relative">
                <UserCheck size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  required
                  type="text" 
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  placeholder="ivan"
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email (справочно)</label>
            <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  placeholder="user@example.com"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Телефон</label>
                <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                    type="text" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    placeholder="+998..."
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Telegram</label>
                <div className="relative">
                    <Send size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                    type="text" 
                    value={telegram}
                    onChange={e => setTelegram(e.target.value)}
                    className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    placeholder="@username"
                    />
                </div>
              </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Пароль</label>
            <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-notion-dark-hover rounded-lg transition-colors">
                 Отмена
             </button>
             <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                 <Save size={16} /> Сохранить
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
