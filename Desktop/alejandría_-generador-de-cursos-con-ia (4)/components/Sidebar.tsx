
import React from 'react';
import { User, View } from '../types';
import { PlusIcon, BookOpenIcon, LogoutIcon, SunIcon, MoonIcon } from './icons';
import { useTheme } from '../hooks/useTheme';
import { googleLogout } from '@react-oauth/google';

interface SidebarProps {
  user: User;
  currentView: View;
  onSetView: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
}

const ThemeToggleButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { theme, toggleTheme } = useTheme();
  const label = `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`;
  const displayLabel = theme === 'light' ? 'Modo Oscuro' : 'Modo Claro';

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium transition-colors duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 ${isCollapsed ? 'justify-center' : ''}`}
        aria-label={label}
      >
        {theme === 'light' ? <MoonIcon className="w-5 h-5 flex-shrink-0" /> : <SunIcon className="w-5 h-5 flex-shrink-0" />}
        {!isCollapsed && <span>{displayLabel}</span>}
      </button>
      {isCollapsed && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
          {displayLabel}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onSetView, onLogout, isCollapsed }) => {
  const navItems = [
    { view: 'new' as View, icon: <PlusIcon />, label: 'Nuevo Curso' },
    { view: 'list' as View, icon: <BookOpenIcon />, label: 'Mis Cursos' },
  ];

  const handleLogoutClick = () => {
    if (process.env.GOOGLE_CLIENT_ID) {
      googleLogout();
    }
    onLogout();
  };

  return (
    <div className={`flex flex-col p-4 bg-white/80 dark:bg-slate-950/70 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center gap-3 mb-10 p-2">
        <BookOpenIcon className="w-8 h-8 text-sky-500 dark:text-sky-400 flex-shrink-0" />
        {!isCollapsed && <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alejandría</h1>}
      </div>

      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.view} className="relative group">
              <button
                onClick={() => onSetView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {React.cloneElement(item.icon, { className: 'w-5 h-5 flex-shrink-0' })}
                {!isCollapsed && <span>{item.label}</span>}
              </button>
              {isCollapsed && (
                 <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {item.label}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
         <div className="mb-2">
          <ThemeToggleButton isCollapsed={isCollapsed} />
        </div>
        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-3 mt-2">
            <div className="relative group">
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
              {isCollapsed && (
                <div className="absolute left-full ml-2 bottom-0 mb-1 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-slate-300">{user.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogoutClick} 
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  aria-label="Cerrar sesión"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
              </>
            )}
           </div>
           {isCollapsed && (
              <button 
                onClick={handleLogoutClick}
                className="w-full flex justify-center mt-2 p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                aria-label="Cerrar sesión"
              >
                  <LogoutIcon className="w-5 h-5" />
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
