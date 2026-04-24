import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await login(email, password);
      
      if (error) {
        toast.error('Erro no login', {
          description: error.message || 'Por favor, verifique seu e-mail e senha.'
        });
      } else {
        toast.success('Bem-vindo ao Multa Expert!', {
          description: 'Acesso autorizado com sucesso.'
        });
        
        // Redirecionar para o app após login bem-sucedido
        setTimeout(() => {
          navigate('/app');
        }, 1000);
      }
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao tentar fazer login.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-container rounded-[40px] p-8 md:p-12 border border-surface-container-highest shadow-2xl relative overflow-hidden group">
          {/* Background Gradient Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/10 rounded-full blur-[80px] group-hover:bg-primary-container/20 transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 bg-primary-container/10 rounded-3xl flex items-center justify-center mb-6 border border-primary-container/20 shadow-xl shadow-primary-container/10">
                <ShieldCheck className="w-8 h-8 text-primary-container" />
              </div>
              <h1 className="text-2xl font-black text-on-surface uppercase tracking-tight mb-2">Multa Expert AI</h1>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-50">Plataforma de Gestão Jurídica</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 opacity-50">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
                  <input 
                    type="email" 
                    required
                    placeholder="admin@admin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary-container transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1 opacity-50">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary-container transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-container/20 hover:shadow-2xl hover:shadow-primary-container/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-surface-container-highest text-center">
              <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-30">© 2024 MULTA EXPERT AI - SISTEMA RESTRITO</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
