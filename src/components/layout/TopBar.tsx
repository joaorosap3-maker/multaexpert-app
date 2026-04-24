import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import NotificationDropdown from './NotificationDropdown';

interface TopBarProps {
  onOpenNewLead: () => void;
}

export default function TopBar({ onOpenNewLead }: TopBarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialize theme from document class
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setIsDarkMode(!isLight);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-8 h-20 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 transition-colors group-focus-within:text-primary-container" />
          <input 
            type="text" 
            className="w-full pl-11 pr-4 py-2.5 bg-surface-container border border-surface-container-highest rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all outline-none"
            placeholder="Buscar leads, processos ou documentos..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenNewLead}
          className="bg-primary-container text-on-primary-container px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary-container/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
        <div className="h-8 w-px bg-surface-container-highest mx-2"></div>
        
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant bg-surface-container border border-surface-container-highest hover:text-on-surface hover:border-primary-container/30 transition-all relative active:scale-95 group overflow-hidden"
          title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          <motion.div
            initial={false}
            animate={{ y: isDarkMode ? 0 : 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ y: isDarkMode ? -40 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant bg-surface-container border border-surface-container-highest hover:text-on-surface hover:border-primary-container/30 transition-all relative active:scale-95"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-container rounded-full ring-2 ring-surface"></span>
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
