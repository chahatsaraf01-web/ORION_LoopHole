
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-20">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <i className="fas fa-search-location text-lg"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">NMIMS <span className="text-indigo-600">Shirpur</span></h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Exclusive Shirpur Campus Portal</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-semibold text-slate-700">{user.name}</span>
          <span className="text-xs text-slate-500">Shirpur Campus</span>
        </div>
        <div className="relative group">
          <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 border border-slate-200">
            <i className="fas fa-user"></i>
          </button>
          <div className="absolute right-0 top-12 w-48 bg-white border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-3 border-b">
              <p className="text-xs font-bold text-slate-400 uppercase">My Profile</p>
              <p className="text-sm truncate font-medium">{user.email}</p>
            </div>
            <button 
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
