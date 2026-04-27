import React, { useState } from 'react';
import { 
  Users, 
  Gavel, 
  Sparkles, 
  Wallet, 
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
  Brain,
  ChevronDown,
  X,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const stats = [
  { name: 'Total de Leads', value: '142', change: '+12.5%', color: 'blue', icon: Users },
  { name: 'Processos Ativos', value: '58', change: 'Estável', color: 'orange', icon: Gavel },
  { name: 'Taxa de Sucesso IA', value: '94%', change: '+2.4%', color: 'emerald', icon: Sparkles },
  { name: 'Petições Elaboradas', value: '284', change: '+18%', color: 'indigo', icon: FileText },
];

const data = [
  { name: 'WhatsApp', total: 100, conv: 65 },
  { name: 'Instagram', total: 80, conv: 32 },
  { name: 'Facebook', total: 60, conv: 15 },
  { name: 'Site Direto', total: 40, conv: 8 },
  { name: 'Indicação', total: 70, conv: 55 },
];

const initialActivities = [
  { id: 1, title: 'Novo lead capturado via WhatsApp', user: 'Ricardo Oliveira', time: 'Há 2 min', icon: MessageSquare, color: 'blue' },
  { id: 2, title: 'Análise de IA concluída para o caso #452', user: '98% de chance de reversão', time: 'Há 45 min', icon: Sparkles, color: 'emerald' },
  { id: 3, title: 'Documento anexado para o processo #128', user: 'CNH_Ricardo.pdf', time: 'Há 2 horas', icon: FileText, color: 'slate' },
  { id: 4, title: 'Prazo vencendo amanhã: Processo #89', user: 'Ação requerida imediata', time: 'Há 4 horas', icon: AlertCircle, color: 'orange' },
];

const moreActivities = [
  ...initialActivities,
  { id: 5, title: 'Serviço "Recurso JARI" contratado', user: 'Maria Silva', time: 'Há 5 horas', icon: Gavel, color: 'indigo' },
  { id: 6, title: 'Pagamento confirmado: LE-8911', user: 'R$ 1.200,00', time: 'Há 8 horas', icon: Wallet, color: 'emerald' },
  { id: 7, title: 'Novo comentário no caso #442', user: "Dra. Ana: 'Petição enviada'", time: 'Há 12 horas', icon: MessageSquare, color: 'blue' },
  { id: 8, title: 'Lead perdido por falta de resposta', user: 'Origem: Instagram', time: 'Há 1 dia', icon: X, color: 'rose' },
];

export default function Dashboard() {
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTriageSuccess, setIsTriageSuccess] = useState(false);
  const [goalPercentage, setGoalPercentage] = useState(72);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const periods = ['Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias', 'Todo o período'];

  const handleTriageActivation = () => {
    setIsTriageSuccess(true);
    setTimeout(() => setIsTriageSuccess(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight uppercase italic leading-none">Painel</h2>
          <p className="text-on-surface-variant mt-3 font-medium opacity-70 italic">Gerenciamento inteligente de ativos jurídicos.</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
            className="flex items-center gap-3 px-5 py-3 bg-surface-container border border-surface-container-highest rounded-2xl text-[10px] font-black text-on-surface-variant hover:text-on-surface transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
          >
            <Calendar className="w-4 h-4 text-primary-container" />
            {period}
            <ChevronDown className={cn("w-3 h-3 transition-transform", isPeriodDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isPeriodDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPeriodDropdownOpen(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-surface-container border border-surface-container-highest rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                >
                  {periods.map(p => (
                    <button 
                      key={p}
                      onClick={() => { setPeriod(p); setIsPeriodDropdownOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors",
                        period === p ? "bg-primary-container/10 text-primary-container" : "hover:bg-surface-container-highest text-on-surface-variant"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-surface-container p-6 rounded-2xl border border-surface-container-highest shadow-lg flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `bg-${stat.color}-500/10 text-${stat.color}-400`)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={cn("text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter", stat.change.includes('+') ? 'text-green-400 bg-green-400/10' : 'text-on-surface-variant bg-surface-container-highest')}>
                {stat.change}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-2">{stat.name}</p>
              <h3 className="text-4xl font-black text-on-surface tracking-tighter leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-surface-container rounded-2xl border border-surface-container-highest shadow-lg overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-surface-container-highest/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight italic">Leads por Origem</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span> Conv.
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span> Total
              </span>
            </div>
          </div>
          <div className="p-8 flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#1E293B' }}
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                    color: '#F1F5F9'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" fill="#334155" radius={[6, 6, 0, 0]} barSize={48} />
                <Bar dataKey="conv" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-surface-container rounded-2xl border border-surface-container-highest shadow-lg flex flex-col">
          <div className="px-8 py-6 border-b border-surface-container-highest/50">
            <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight italic">Atividades Recentes</h3>
          </div>
          <div className="p-8 flex flex-col gap-8 overflow-y-auto max-h-[400px] custom-scrollbar">
            {initialActivities.map((activity, idx) => (
              <div key={activity.id} className="flex gap-5 relative group">
                {idx !== initialActivities.length - 1 && (
                  <div className="absolute left-[13px] top-8 w-[1px] h-[calc(100%+32px)] bg-surface-container-highest group-last:hidden opacity-30"></div>
                )}
                <div className={cn("z-10 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg", `bg-${activity.color}-500/10 text-${activity.color}-400 border border-${activity.color}-400/20`)}>
                  <activity.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface leading-tight transition-colors group-hover:text-primary-container">{activity.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1.5 font-medium opacity-60 uppercase tracking-tighter">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto p-6 border-t border-surface-container-highest/30">
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary-container hover:bg-primary-container/10 rounded-xl transition-all border border-primary-container/20"
            >
              Ver todo o histórico
            </button>
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container rounded-2xl border border-surface-container-highest shadow-lg p-8 flex gap-8 items-center group overflow-hidden relative">
          <div className="absolute inset-0 bg-primary-container/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-28 h-28 rounded-2xl border-[10px] border-primary-container border-t-surface-container-highest rotate-45 flex items-center justify-center relative shadow-2xl transition-transform group-hover:scale-110">
            <span className="text-2xl font-black text-on-surface -rotate-45">{goalPercentage}%</span>
          </div>
          <div className="relative z-10 flex-1">
            <h4 className="text-xl font-bold text-on-surface uppercase tracking-tight italic leading-none mb-4">Meta de Conversão</h4>
            <p className="text-sm text-on-surface-variant mb-6 font-medium opacity-70">Você está <span className="text-green-400 font-bold">8% acima</span> da meta mensal estabelecida.</p>
            <button 
              onClick={() => setIsGoalModalOpen(true)}
              className="px-6 py-2.5 bg-surface-container-highest text-on-surface rounded-xl text-xs font-black uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-all border border-surface-container-highest group-hover:border-primary-container/50 shadow-lg active:scale-95"
            >
              Ajustar Metas
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-surface-container to-surface rounded-2xl border border-surface-container-highest shadow-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container opacity-10 blur-3xl rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150 group-hover:opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-primary-container/10 rounded-lg">
                <Brain className="w-4 h-4 text-primary-container" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-container">Dica da IA Multa Expert</span>
            </div>
            <h4 className="text-xl font-bold text-on-surface italic mb-3">Aumente sua conversão em até 15%</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-medium opacity-80">
              Identificamos que responder leads do Instagram em menos de <span className="text-primary-container font-bold">10 minutos</span> aumenta drasticamente a taxa de fechamento.
            </p>
            <button 
              onClick={handleTriageActivation}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-3",
                isTriageSuccess 
                  ? "bg-green-400 text-surface shadow-green-400/30" 
                  : "bg-primary-container text-on-primary-container shadow-primary-container/30 hover:shadow-primary-container/40"
              )}
            >
              {isTriageSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Triagem Ativada
                </>
              ) : (
                'Ativar Triagem IA'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Goal Adjustment Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-md overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest p-8"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Ajustar Metas</h2>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Defina seus objetivos mensais</p>
                  </div>
                </div>
                <button onClick={() => setIsGoalModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-surface rounded-2xl border border-surface-container-highest">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Taxa de Conversão Alvo</span>
                    <span className="text-3xl font-black text-primary-container italic">{goalPercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="100" 
                    value={goalPercentage}
                    onChange={(e) => setGoalPercentage(parseInt(e.target.value))}
                    className="w-full accent-primary-container" 
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    <span>Mínima (10%)</span>
                    <span>Máxima (100%)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setIsGoalModalOpen(false)}
                    className="w-full py-4 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all active:scale-95"
                  >
                    Salvar Alterações
                  </button>
                  <button 
                    onClick={() => setIsGoalModalOpen(false)}
                    className="w-full py-4 text-on-surface-variant font-black text-xs uppercase tracking-[0.2em] hover:text-on-surface transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-xl max-h-[80vh] overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest flex flex-col"
            >
              <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-highest/10 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                     <Clock className="w-6 h-6 text-primary-container" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Histórico de Atividades</h2>
                     <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Log completo de operações do sistema</p>
                   </div>
                 </div>
                 <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                   <X className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                {moreActivities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-5 relative group">
                    {idx !== moreActivities.length - 1 && (
                      <div className="absolute left-[13px] top-8 w-[1px] h-[calc(100%+32px)] bg-surface-container-highest group-last:hidden opacity-30"></div>
                    )}
                    <div className={cn("z-10 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg", `bg-${activity.color}-500/10 text-${activity.color}-400 border border-${activity.color}-400/20`)}>
                      <activity.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface leading-tight transition-colors group-hover:text-primary-container">{activity.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1.5 font-medium opacity-60 uppercase tracking-tighter">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <footer className="p-6 border-t border-surface-container-highest text-center bg-surface-container-highest/5">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Fim do histórico recente • Sincronizado agora</p>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
