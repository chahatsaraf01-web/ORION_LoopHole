
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'feed' | 'lost' | 'found' | 'messages';
  setActiveTab: (tab: 'dashboard' | 'feed' | 'lost' | 'found' | 'messages') => void;
  user: User;
  setUser: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, setUser }) => {
  const navItems = [
    { id: 'dashboard', label: 'My Reports', icon: 'fa-user-circle' },
    { id: 'feed', label: 'Shirpur Feed', icon: 'fa-globe' },
    { id: 'lost', label: 'Report Lost', icon: 'fa-search-minus' },
    { id: 'found', label: 'Report Found', icon: 'fa-plus-circle' },
    { id: 'messages', label: 'Active Chats', icon: 'fa-comments' },
  ] as const;

  const toggleMute = () => {
    setUser({ ...user, muteGlobalNotifications: !user.muteGlobalNotifications });
  };

  return (
    <aside className="w-20 md:w-64 bg-white border-r flex flex-col z-10">
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'
            }`}
          >
            <i className={`fas ${item.icon} text-lg w-6`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t space-y-4">
        <div className="hidden md:block bg-indigo-900 rounded-xl p-4 text-white">
          <p className="text-xs font-bold opacity-75 mb-1 uppercase">Shirpur Safety</p>
          <p className="text-xs">Never share OTPs. Meet only at secure campus spots like the Canteen or Library.</p>
        </div>

        <button 
          onClick={toggleMute}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border border-slate-100 text-slate-500 hover:bg-slate-50"
        >
          <div className="flex items-center space-x-2">
            <i className={`fas ${user.muteGlobalNotifications ? 'fa-bell-slash' : 'fa-bell'}`}></i>
            <span className="hidden md:inline">Campus Alerts</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${user.muteGlobalNotifications ? 'bg-slate-200' : 'bg-emerald-500'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user.muteGlobalNotifications ? 'left-0.5' : 'left-4.5'}`}></div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
