import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gavel, 
  User,
  Phone,
  Hash,
  Activity,
  FileText,
  Brain,
  ShieldCheck,
  CreditCard,
  Sparkles,
  MapPin,
  Calendar,
  MessageSquare,
  Save,
  Loader2,
  Check,
  History,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useCases, HistoryItem } from '@/src/contexts/CaseContext';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
}

export default function CaseDetailModal({ isOpen, onClose, caseData: initialCaseData }: CaseDetailModalProps) {
  const { cases, services, updateCase, linkServiceToCase } = useCases();
  
  // Always get the freshest data from context
  const caseData = cases.find(c => c.id === initialCaseData?.id) || initialCaseData;

  const [obs, setObs] = useState(caseData?.observations || '');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<string | null>(null);

  useEffect(() => {
    if (caseData) {
      setObs(caseData.observations || '');
    }
  }, [caseData?.id, caseData?.observations]);

  if (!isOpen || !caseData) return null;

  const handleSaveObs = async () => {
    setIsSaving(true);
    // integração futura com API
    await new Promise(resolve => setTimeout(resolve, 800));
    updateCase(caseData.id, { observations: obs });
    setIsSaving(false);
  };

  const wrapAction = async (id: string, actionName: string, update: any, delay: number = 1000, customDesc?: string) => {
    setLoadingAction(id);
    
    // integração futura com API
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Create new history item
    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      action: actionName,
      description: customDesc || (update?.status ? `Status alterado para: ${update.status}` : 'Ação executada com sucesso')
    };

    const updatedHistory = [newHistoryItem, ...(caseData.history || [])];

    if (update) {
      updateCase(caseData.id, { ...update, history: updatedHistory });
    } else {
      updateCase(caseData.id, { history: updatedHistory });
    }
    
    setLoadingAction(null);
    setSuccessAction(id);
    setTimeout(() => setSuccessAction(null), 2000);
  };

  // Action Handlers
  const handleAnalyzeIA = () => {
    // integração futura com API
    wrapAction('ai', 'Análise com IA', { status: 'Em Análise', column: 'analysis' }, 1500);
  };
  
  const handleGenerateContract = () => {
    // integração futura com API
    wrapAction('contract', 'Geração de Contrato', { status: 'Aguardando Confirmação', column: 'awaiting_conf' }, 1200);
  };
  
  const handleGenerateProcuration = () => {
    // integração futura com API
    wrapAction('terms', 'Geração de Procuração', null, 1000);
  };
  
  const handleGeneratePayment = () => {
    if (window.confirm("Deseja utilizar o serviço 'Análise de Prontuário' e gerar cobrança?")) {
      // Usando o serviço ID 4 (Exemplo de Consultoria)
      linkServiceToCase(caseData.id, 4);
      wrapAction('payment', 'Geração de Pagamento', null, 1000, "Cobrança gerada via Catálogo de Serviços");
    }
  };
  
  const handleGenerateAppeal = () => {
    if (window.confirm("Deseja gerar o 'Recurso JARI' (ID #1) para este processo?")) {
      // Usando o serviço ID 1
      linkServiceToCase(caseData.id, 1);
      wrapAction('resource', 'Geração de Recurso', { status: 'Recurso – 1ª Instância', column: 'resource_1' }, 1800, "Recurso peticionado e cobrança gerada");
    }
  };

  const getActionHandler = (id: string) => {
    switch(id) {
      case 'ai': return handleAnalyzeIA;
      case 'contract': return handleGenerateContract;
      case 'terms': return handleGenerateProcuration;
      case 'payment': return handleGeneratePayment;
      case 'resource': return handleGenerateAppeal;
      default: return () => {};
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/90 backdrop-blur-xl overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="bg-surface-container w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-surface-container-highest flex flex-col mx-4"
        >
          {/* Header Section */}
          <header className="px-10 py-8 bg-gradient-to-r from-primary-container/10 via-transparent to-transparent border-b border-surface-container-highest relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container opacity-[0.03] blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase italic leading-none">
                    #{caseData.autoNumber || caseData.id}
                  </h2>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-md border",
                    caseData.status === 'Finalizado' || caseData.status === 'Deferido'
                      ? "bg-green-400/20 text-green-400 border-green-400/30"
                      : "bg-primary-container/20 text-primary-container border-primary-container/30"
                  )}>
                    {caseData.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-on-surface/90 flex items-center gap-2 italic">
                  {caseData.name}
                </h3>
              </div>
              
              <button 
                onClick={onClose}
                className="p-3 bg-surface border border-surface-container-highest rounded-2xl text-on-surface-variant hover:text-on-surface transition-all active:scale-90 shadow-xl group"
              >
                <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>
          </header>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Bloco 1: Dados do Cliente */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Dados do Cliente</h4>
                </div>

                <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm space-y-5">
                  {[
                    { icon: User, label: 'Nome Completo', value: caseData.name },
                    { icon: Phone, label: 'Telefone', value: caseData.phone || 'Não informado' },
                    { icon: Hash, label: 'Placa', value: caseData.plate, mono: true },
                    { icon: ShieldCheck, label: 'Condutor', value: caseData.driverName || 'O Próprio' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <item.icon className="w-3 h-3 opacity-50" /> {item.label}
                      </p>
                      <p className={cn(
                        "text-sm font-bold text-on-surface truncate px-1",
                        item.mono && "font-mono tracking-[0.2em] text-primary-container"
                      )}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Observações rápidas no card lateral */}
                <div className="bg-surface-container-highest/20 rounded-[32px] p-6 border border-surface-container-highest shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Observações
                    </p>
                    {obs !== caseData.observations && (
                      <button onClick={handleSaveObs} disabled={isSaving} className="text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    className="w-full text-xs bg-transparent border-none focus:ring-0 text-on-surface-variant resize-none min-h-[80px]"
                    placeholder="Adicione notas..."
                  />
                </div>
              </div>

              {/* Bloco 2: Dados do Processo */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Dados do Processo</h4>
                </div>

                <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-surface-container-highest/50">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Auto (AIN)</p>
                      <p className="text-sm font-black text-on-surface italic">#{caseData.autoNumber}</p>
                    </div>
                    <div className="space-y-1.5 text-right">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Data</p>
                      <p className="text-sm font-bold text-on-surface">{caseData.infractionDate || '---'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Localização
                      </p>
                      <p className="text-xs font-bold text-on-surface opacity-70 leading-relaxed italic">{caseData.address || 'Não informado'}</p>
                    </div>
                    
                    <div className="p-4 bg-surface-container-highest/30 rounded-2xl border border-surface-container-highest">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Infração Relatada
                      </p>
                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed line-clamp-4">
                        "{caseData.infractionDescription || 'Sem detalhes extraídos'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloco 4: Histórico de Atividade (Novo) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                      <History className="w-4 h-4 text-slate-400" />
                    </div>
                    <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Histórico do Caso</h4>
                  </div>
                  
                  <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                      {caseData.history && caseData.history.length > 0 ? (
                        caseData.history.map((item: HistoryItem, i: number) => (
                          <div key={item.id} className="relative pl-6 group">
                            {/* Linha vertical da timeline */}
                            {i !== caseData.history.length - 1 && (
                              <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-surface-container-highest group-hover:bg-primary-container/30 transition-colors" />
                            )}
                            {/* Ponto na timeline */}
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-surface-container-highest bg-surface-container group-hover:border-primary-container transition-colors flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant group-hover:bg-primary-container transition-colors" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-on-surface uppercase tracking-tight">{item.action}</p>
                                <div className="flex items-center gap-1.5 opacity-40">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-[8px] font-bold">{item.date}</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-on-surface-variant font-medium leading-tight opacity-70">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center space-y-3 opacity-20">
                          <History className="w-8 h-8 mx-auto" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Sem movimentações registradas</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Ações do Processo */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Ações Disponíveis</h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'ai', icon: Brain, label: 'Analisar com IA', color: 'bg-indigo-500', desc: 'Cruzamento de teses e julgados' },
                    { id: 'contract', icon: FileText, label: 'Gerar Contrato', color: 'bg-blue-500', desc: 'Minuta personalizada para o cliente' },
                    { id: 'terms', icon: ShieldCheck, label: 'Gerar Procuração', color: 'bg-emerald-500', desc: 'Representação legal pronta' },
                    { id: 'payment', icon: CreditCard, label: 'Gerar Pagamento', color: 'bg-amber-500', desc: 'Link ou boleto de honorários' },
                    { id: 'resource', icon: Gavel, label: 'Gerar Recurso', color: 'bg-rose-500', desc: 'Petição automática via OCR' },
                  ].map((action) => (
                    <button 
                      key={action.id}
                      onClick={getActionHandler(action.id)}
                      disabled={loadingAction !== null || successAction !== null}
                      className={cn(
                        "group flex items-center gap-4 p-4 bg-surface/60 border border-surface-container-highest rounded-2xl hover:bg-surface-container hover:shadow-xl transition-all text-left active:scale-[0.98]",
                        loadingAction === action.id && "ring-2 ring-primary-container ring-offset-2 ring-offset-surface-container shadow-inner bg-surface-container",
                        successAction === action.id && "bg-green-400/10 border-green-400/30",
                        (loadingAction !== null && loadingAction !== action.id) || (successAction !== null && successAction !== action.id) ? "opacity-40 grayscale-[0.5]" : ""
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform",
                        successAction === action.id ? "bg-green-400 scale-110" : action.color
                      )}>
                        {loadingAction === action.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : successAction === action.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <action.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-[11px] font-black uppercase tracking-tight leading-none mb-1 transition-colors",
                          successAction === action.id ? "text-green-400" : "text-on-surface"
                        )}>
                          {successAction === action.id ? "Ação Concluída" : action.label}
                        </p>
                        <p className={cn(
                          "text-[9px] font-medium opacity-60 truncate transition-colors",
                          successAction === action.id ? "text-green-400/60" : "text-on-surface-variant"
                        )}>
                          {successAction === action.id ? "Processo atualizado com sucesso" : action.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <footer className="px-10 py-6 border-t border-surface-container-highest bg-surface-container-highest/10 flex justify-between items-center shrink-0">
             <div className="flex gap-6">
              <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors">Histórico de Alterações</button>
              <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors">Logs de Auditoria</button>
            </div>
            <button 
              onClick={onClose}
              className="px-10 py-3 text-[10px] font-black uppercase tracking-widest bg-on-surface text-surface rounded-2xl shadow-xl hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              Concluído
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
