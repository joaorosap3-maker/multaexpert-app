import React, { useState } from 'react';
import { 
  Gavel, 
  Search, 
  ChevronDown, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Archive,
  CheckSquare,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ProcessViewModal from '../components/modals/ProcessViewModal';
import ProcessEditModal from '../components/modals/ProcessEditModal';
import { useCases } from '../contexts/CaseContext';

export default function Processes() {
  const { cases, deleteCase, updateCase } = useCases();
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'defesa' | 'recurso'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    // Tab filtering
    if (activeTab === 'defesa') {
      // Logic for Defesa Prévia: Detran at initial stages
      if (!(c.court?.includes('DETRAN') && !c.infractionType?.includes('Suspensão'))) return false;
    }
    if (activeTab === 'recurso') {
      // Logic for Recursos: JARI, CETRAN or Suspension cases at DETRAN
      if (!(c.court?.includes('CETRAN') || c.court?.includes('JARI') || c.infractionType?.includes('Suspensão'))) return false;
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.autoNumber?.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.plate.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const completedCount = cases.filter(c => c.status === 'Finalizado').length;
  const pendingDocsCount = cases.filter(c => c.status === 'Aguardando Documentos').length;
  const urgentCount = cases.filter(c => c.priority === 'Crítica' || c.priority === 'Urgente').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-16"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight uppercase italic leading-none">Processos Jurídicos</h2>
          <p className="text-on-surface-variant mt-4 font-medium opacity-70 italic">Gestão de infrações, defesas e recursos administrativos.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar processo ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3.5 bg-surface-container border border-surface-container-highest rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container/50 w-full md:w-80 shadow-2xl transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-surface-container border border-surface-container-highest p-3.5 rounded-2xl text-on-surface-variant hover:text-on-surface transition-all active:scale-95 shadow-xl">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-surface-container rounded-[32px] border border-surface-container-highest overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
        <div className="px-10 py-6 border-b border-surface-container-highest/50 flex justify-between items-center bg-surface-container-highest/10">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('all')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all",
                activeTab === 'all' ? "text-primary-container border-b-2 border-primary-container" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Todos Processos
            </button>
            <button 
              onClick={() => setActiveTab('defesa')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all",
                activeTab === 'defesa' ? "text-primary-container border-b-2 border-primary-container" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Defesa Prévia
            </button>
            <button 
              onClick={() => setActiveTab('recurso')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all",
                activeTab === 'recurso' ? "text-primary-container border-b-2 border-primary-container" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Recursos
            </button>
          </div>
          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{filteredCases.length} Casos em Gestão</p>
        </div>

        <div className="w-full overflow-hidden px-4">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-surface-container-highest/20 border-b border-surface-container-highest">
                <th className="w-[23%] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">Cliente</th>
                <th className="w-[18%] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">Processo</th>
                <th className="w-[13%] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">Status</th>
                <th className="w-[10%] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">Financeiro</th>
                <th className="w-[12%] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">Data</th>
                <th className="w-[130px] px-3 py-5 text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] text-center shrink-0">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/30">
              {filteredCases.map((proc) => (
                <tr 
                  key={proc.id} 
                  className="group hover:bg-primary-container/5 transition-all cursor-pointer"
                >
                  <td className="px-3 py-6" onClick={() => { setSelectedCase(proc); setIsViewModalOpen(true); }}>
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-1.5 shrink-0">
                        {proc.avatar ? (
                          <img src={proc.avatar} className="w-7 h-7 rounded-lg border border-surface shadow-lg object-cover" alt={proc.name} />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-surface-container-highest border border-surface flex items-center justify-center text-[9px] text-on-surface-variant font-black shadow-lg uppercase">
                            {proc.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-on-surface uppercase tracking-tight italic leading-tight truncate group-hover:text-primary-container transition-colors">{proc.name}</p>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter opacity-50 mt-1 truncate">Placa: <span className="text-primary-container font-black">{proc.plate}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-6" onClick={() => { setSelectedCase(proc); setIsViewModalOpen(true); }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-black text-[11px] text-on-surface tracking-tighter italic uppercase truncate">#{proc.autoNumber || proc.id}</span>
                      <p className="text-[8px] text-on-surface-variant font-medium opacity-60 truncate">{proc.infractionDescription}</p>
                    </div>
                  </td>
                  <td className="px-3 py-6" onClick={() => { setSelectedCase(proc); setIsViewModalOpen(true); }}>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap",
                        proc.status === 'Finalizado' || proc.status === 'Deferido' ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-primary-container/10 text-primary-container border border-primary-container/20"
                      )}>
                        {proc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-6" onClick={() => { setSelectedCase(proc); setIsViewModalOpen(true); }}>
                    <div className="flex gap-1 flex-wrap">
                      {proc.billings && proc.billings.length > 0 ? (
                        proc.billings.map((bill: any) => (
                          <div 
                            key={bill.id}
                            className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                              bill.status === 'Pago' && "bg-green-400/10 text-green-400 border-green-400/20",
                              bill.status === 'Pendente' && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                              bill.status === 'Atrasado' && "bg-rose-400/10 text-rose-400 border-rose-400/20",
                              bill.status === 'Cancelado' && "bg-slate-400/10 text-slate-400 border-slate-400/20"
                            )}
                            title={`${bill.description}: ${bill.status}`}
                          >
                            <DollarSign className="w-2.5 h-2.5" />
                          </div>
                        ))
                      ) : (
                        <span className="text-[9px] font-bold text-on-surface-variant/20 uppercase italic tracking-widest">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-6" onClick={() => { setSelectedCase(proc); setIsViewModalOpen(true); }}>
                    <span className="text-[9px] font-black text-on-surface uppercase tracking-widest block whitespace-nowrap">{proc.infractionDate}</span>
                  </td>
                   <td className="px-3 py-6">
                    <div className="flex items-center justify-center gap-1">
                        <button 
                         title="Visualizar" 
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedCase(proc);
                           setIsViewModalOpen(true);
                         }}
                        className="p-1.5 bg-surface-container-highest/30 border border-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all active:scale-90 shadow-sm"
                       >
                         <Eye className="w-3.5 h-3.5" />
                       </button>
                        <button 
                         title="Editar" 
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedCase(proc);
                           setIsEditModalOpen(true);
                         }}
                        className="p-1.5 bg-surface-container-highest/30 border border-surface-container-highest rounded-lg text-on-surface-variant hover:text-amber-400 hover:bg-amber-400/10 transition-all active:scale-90 shadow-sm"
                       >
                         <Pencil className="w-3.5 h-3.5" />
                       </button>
                        <button 
                         title="Finalizar" 
                         onClick={(e) => {
                           e.stopPropagation();
                           updateCase(proc.id, { status: 'Finalizado', completion: 100, column: 'finalized' });
                         }}
                        className="p-1.5 bg-surface-container-highest/30 border border-surface-container-highest rounded-lg text-on-surface-variant hover:text-green-400 hover:bg-green-400/10 transition-all active:scale-90 shadow-sm"
                       >
                         <CheckSquare className="w-3.5 h-3.5" />
                       </button>
                        <button 
                         title="Excluir" 
                         onClick={(e) => {
                           e.stopPropagation();
                           deleteCase(proc.id);
                         }}
                        className="p-1.5 bg-surface-container-highest/30 border border-surface-container-highest rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90 shadow-sm"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Clock, label: 'Prazos Fatais', val: urgentCount.toString().padStart(2, '0'), color: 'red', desc: 'Recursos em data limite' },
          { icon: FileText, label: 'Notificações Extraídas', val: cases.length.toString().padStart(2, '0'), color: 'primary', desc: 'Processamento IA concluído' },
          { icon: CheckCircle, label: 'Encerrados', val: completedCount.toString().padStart(2, '0'), color: 'green', desc: 'Vencidos no mérito' }
        ].map((card, i) => (
          <div key={i} className="bg-surface-container p-8 rounded-[24px] border border-surface-container-highest shadow-xl group relative overflow-hidden transition-all hover:shadow-primary-container/5">
            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 blur-3xl -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-150", card.color === 'primary' ? 'bg-primary-container' : `bg-${card.color}-400`)}></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg", card.color === 'primary' ? 'bg-primary-container/10 text-primary-container border-primary-container/20' : `bg-${card.color}-400/10 text-${card.color}-400 border-${card.color}-400/20`)}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-on-surface tracking-tighter italic">{card.val}</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-xs font-black text-on-surface uppercase tracking-[0.2em] mb-1.5">{card.label}</h4>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider opacity-50">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <ProcessViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        processData={selectedCase} 
      />

      <ProcessEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        caseData={selectedCase} 
      />
    </motion.div>
  );
}
