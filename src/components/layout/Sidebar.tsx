import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  Gavel, 
  Layers, 
  Database, 
  LogOut,
  HelpCircle,
  Briefcase,
  User,
  BookOpen,
  Car,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Painel', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Processos', href: '/processes', icon: Gavel },
  { name: 'Base de Conhecimento', href: '/knowledge-base', icon: BookOpen },
  { name: 'Banco de Nulidades', href: '/precedents', icon: Database },
  { name: 'Serviços', href: '/services', icon: Briefcase },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      toast.success('Logout realizado', {
        description: 'Você saiu do sistema com sucesso.'
      });
    } catch (error) {
      toast.error('Erro ao sair', {
        description: 'Ocorreu um erro ao tentar fazer logout.'
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-surface-container-highest bg-surface flex flex-col py-6 z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Car className="text-on-primary-container w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-container leading-none italic uppercase">Multa Expert</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mt-1.5 opacity-60">Recursos de Multas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-300 relative group uppercase italic tracking-tight",
              isActive 
                ? "text-primary-container" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary-container/10 border border-primary-container/20 rounded-2xl shadow-[0_0_20px_rgba(var(--primary-container-rgb),0.1)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", isActive ? "text-primary-container" : "text-on-surface-variant")} />
                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pt-6 border-t border-surface-container-highest">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-2xl border border-surface-container-highest mb-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
            <User className="w-5 h-5 text-on-surface-variant opacity-60" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">
              {user?.email || 'Usuário'}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
              Online
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-sm font-bold group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
              Sair
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
