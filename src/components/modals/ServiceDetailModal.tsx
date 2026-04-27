import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  Users, 
  Tag, 
  Calendar, 
  Box, 
  Clock, 
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Service, Case, useCases } from '@/contexts/CaseContext';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export default function ServiceDetailModal({ isOpen, onClose, service }: ServiceDetailModalProps) {
  const { cases, linkServiceToCase } = useCases();
  const [step, setStep] = useState<'details' | 'select_process' | 'success'>('details');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLink = () => {
    if (selectedCaseId) {
      linkServiceToCase(selectedCaseId, service.id);
      setStep('success');
    }
  };

  const handleClose = () => {
    setStep('details');
    setSearchTerm('');
    setSelectedCaseId(null);
    onClose();
  };

  const priceLabel = service.billingType === 'recorrente' 
    ? `R$ ${service.recurrenceInfo?.monthlyValue?.toFixed(2) || '0.00'} / ${service.recurrenceInfo?.interval || ''}`
    : `R$ ${service.price?.toFixed(2) || '0.00'}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border border-surface-container-highest flex flex-col"
        >
          {/* Header */}
          <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-highest/10 relative">
             <div className="flex items-center gap-4">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", `bg-${service.color}-400/10 text-${service.color}-400`)}>
                 <Tag className="w-6 h-6" />
               </div>
               <div>
                 <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">{service.title}</h2>
                 <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">{service.category}</p>
               </div>
             </div>
             <button onClick={handleClose} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
               <X className="w-5 h-5" />
             </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {step === 'details' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-5 rounded-2xl border border-surface-container-highest">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Valor do Serviço</p>
                    <p className="text-2xl font-black text-on-surface tracking-tighter italic">{priceLabel}</p>
                    <span className="text-[9px] font-black text-primary-container uppercase tracking-widest">{service.billingType}</span>
                  </div>
                  <div className="bg-surface p-5 rounded-2xl border border-surface-container-highest">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Público-Alvo</p>
                    <p className="text-lg font-black text-on-surface tracking-tight uppercase italic flex items-center gap-2">
                       <Users className="w-4 h-4 text-on-surface-variant" />
                       {service.targetAudience}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-widest italic">Descrição Detalhada</h4>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed opacity-70">
                    {service.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 p-4 bg-surface-container-highest/20 rounded-2xl border border-surface-container-highest/50">
                     <Clock className="w-5 h-5 text-primary-container" />
                     <div>
                       <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">SLA de Entrega</p>
                       <p className="text-xs font-bold text-on-surface uppercase">{service.sla}</p>
                     </div>
                   </div>
                   {service.duration && (
                     <div className="flex items-center gap-3 p-4 bg-surface-container-highest/20 rounded-2xl border border-surface-container-highest/50">
                       <Calendar className="w-5 h-5 text-indigo-400" />
                       <div>
                         <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">Duração Contratual</p>
                         <p className="text-xs font-bold text-on-surface uppercase">{service.duration}</p>
                       </div>
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-widest italic">O que está incluso:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-surface border border-surface-container-highest rounded-xl flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", service?.includes?.documents ? "bg-green-500/10 text-green-500" : "bg-on-surface-variant/10 text-on-surface-variant opacity-30")}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">Documentos</span>
                    </div>
                    <div className="p-3 bg-surface border border-surface-container-highest rounded-xl flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-primary-container/10 text-primary-container flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">Suporte {service?.includes?.support || 'Nenhum'}</span>
                    </div>
                    <div className="p-3 bg-surface border border-surface-container-highest rounded-xl flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Box className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{service?.includes?.resourcesQuantity || 0} Recursos</span>
                    </div>
                  </div>
                </div>

                {service.upsellServiceId && (
                  <div className="bg-primary-container/5 p-6 rounded-3xl border border-primary-container/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary-container" />
                      <h4 className="text-[10px] font-black text-primary-container uppercase tracking-[0.2em]">Oferta Complementar</h4>
                    </div>
                    <p className="text-xs font-bold text-on-surface uppercase tracking-tight">Gatilho: {service.offerTrigger}</p>
                    <div className="p-4 bg-surface rounded-2xl border border-primary-container/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                            <Plus className="w-4 h-4 text-primary-container" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-on-surface uppercase">Próximo Passo Recomendado</p>
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase opacity-60">Potencialize as chances de sucesso</p>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {service.billingType === 'pacote' && (
                  <div className="bg-primary-container/10 p-5 rounded-2xl border border-primary-container/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Box className="w-5 h-5 text-primary-container" />
                      <div>
                        <p className="text-[9px] font-black text-primary-container uppercase tracking-widest">Configuração de Pacote</p>
                        <p className="text-xs font-bold text-on-surface uppercase">Incluído no plano: {service.packageInfo?.quantity} recursos</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'select_process' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-on-surface uppercase italic italic tracking-tighter">Vincular a um Processo</h3>
                  <p className="text-xs text-on-surface-variant font-medium opacity-60">Selecione para qual cliente/processo deseja ativar este serviço.</p>
                </div>

                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
                   <input 
                    type="text" 
                    placeholder="Buscar por nome ou placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-surface border border-surface-container-highest rounded-2xl text-sm focus:outline-none focus:border-primary-container transition-all"
                   />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredCases.map((c) => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left",
                        selectedCaseId === c.id 
                          ? "bg-primary-container border-primary-container shadow-xl shadow-primary-container/20" 
                          : "bg-surface border-surface-container-highest hover:bg-surface-container-highest/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase",
                          selectedCaseId === c.id ? "bg-on-primary-container text-primary-container" : "bg-surface-container-highest text-on-surface-variant"
                        )}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-tight", selectedCaseId === c.id ? "text-on-primary-container" : "text-on-surface")}>{c.name}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedCaseId === c.id ? "text-on-primary-container/70" : "text-on-surface-variant/60")}>Placa: {c.plate} • #{c.id}</p>
                        </div>
                      </div>
                      {selectedCaseId === c.id && <Check className="w-5 h-5 text-on-primary-container" />}
                    </button>
                  ))}
                  {filteredCases.length === 0 && (
                    <div className="py-12 text-center opacity-30">
                      <p className="text-sm font-black uppercase tracking-widest">Nenhum processo encontrado</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter mb-4">Serviço Vinculado!</h3>
                <p className="text-sm text-on-surface-variant font-medium max-w-sm mx-auto leading-relaxed opacity-70">
                  O serviço <span className="text-on-surface font-bold">"{service.title}"</span> foi vinculado com sucesso. Uma cobrança de <span className="text-emerald-400 font-bold">R$ {service.price?.toFixed(2) || '0.00'}</span> foi gerada e está pendente no sistema.
                </p>
              </motion.div>
            )}
          </div>

          <footer className="px-8 py-6 border-t border-surface-container-highest bg-surface-container-highest/10 shrink-0">
             {step === 'details' && (
               <button 
                onClick={() => setStep('select_process')}
                className="w-full py-4 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-container/30 hover:shadow-primary-container/50 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
               >
                 <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                 Usar este serviço
                 <ChevronRight className="w-4 h-4" />
               </button>
             )}
             {step === 'select_process' && (
               <div className="flex gap-4">
                 <button 
                  onClick={() => setStep('details')}
                  className="flex-1 py-4 border border-surface-container-highest rounded-2xl font-black text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-all"
                 >
                   Voltar
                 </button>
                 <button 
                  onClick={handleLink}
                  disabled={!selectedCaseId}
                  className="flex-[2] py-4 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-container/30 disabled:opacity-50 disabled:shadow-none"
                 >
                   Confirmar Vínculo
                 </button>
               </div>
             )}
             {step === 'success' && (
                <button 
                 onClick={handleClose}
                 className="w-full py-4 bg-on-surface text-surface rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  Concluído
                </button>
             )}
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
