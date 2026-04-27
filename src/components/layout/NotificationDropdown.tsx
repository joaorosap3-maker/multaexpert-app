import React from 'react';
import { motion } from 'motion/react';
import { Bell, Check, Clock, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Análise de IA Concluída',
    message: 'A tese defensiva para o lead Roberto Ferreira Jr. foi gerada com sucesso.',
    time: '2m atrás',
    type: 'success',
    isRead: false
  },
  {
    id: '2',
    title: 'Prazo Vencendo',
    message: 'O processo #LE-9042 possui um prazo que vence em 48 horas.',
    time: '45m atrás',
    type: 'warning',
    isRead: false
  },
  {
    id: '3',
    title: 'Novo Lead Capturado',
    message: 'Um novo lead de "Lei Seca" foi capturado via integração Web.',
    time: '2h atrás',
    type: 'info',
    isRead: true
  }
];

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute right-0 mt-2 w-96 bg-surface-container border border-surface-container-highest rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-50"
    >
      <div className="p-6 border-b border-surface-container-highest flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-on-surface uppercase tracking-widest italic">Notificações</h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter opacity-50 mt-0.5">Você tem 2 alertas não lidos</p>
        </div>
        <button className="text-[10px] font-black text-primary-container uppercase tracking-widest hover:underline">Limpar tudo</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={cn(
              "p-5 hover:bg-surface-container-highest/30 transition-all cursor-pointer border-b border-surface-container-highest/50 last:border-0 relative group",
              !notif.isRead && "bg-primary-container/5"
            )}
          >
            {!notif.isRead && (
              <span className="absolute top-6 left-2 w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
            )}
            <div className="flex gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                notif.type === 'success' && "bg-green-400/10 border-green-400/20 text-green-400",
                notif.type === 'warning' && "bg-orange-400/10 border-orange-400/20 text-orange-400",
                notif.type === 'info' && "bg-primary-container/10 border-primary-container/20 text-primary-container",
                notif.type === 'error' && "bg-red-400/10 border-red-400/20 text-red-400"
              )}>
                {notif.type === 'success' && <Check className="w-5 h-5" />}
                {notif.type === 'warning' && <ShieldAlert className="w-5 h-5" />}
                {notif.type === 'info' && <Info className="w-5 h-5" />}
                {notif.type === 'error' && <ShieldAlert className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-on-surface uppercase truncate tracking-tight uppercase italic">{notif.title}</h4>
                  <span className="text-[9px] font-black text-on-surface-variant opacity-40 uppercase tracking-tighter whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-surface-container-highest text-center">
        <button className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors flex items-center justify-center gap-2 w-full">
          <Clock className="w-3.5 h-3.5" />
          Ver todo o histórico
        </button>
      </div>
    </motion.div>
  );
}
