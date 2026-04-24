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
  XCircle,
  History,
  Clock,
  ArrowRight,
  Download,
  Receipt,
  Trash2,
  Eye,
  Plus,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useCases, HistoryItem, Case, CaseDocument, Billing, GenerationEntry } from '@/src/contexts/CaseContext';
import { useKnowledge } from '@/src/contexts/KnowledgeContext';
import { useLearning } from '@/src/contexts/LearningContext';
import { WHITE_LABEL } from '@/src/constants';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import DocumentEditorModal from './DocumentEditorModal';
import AIAnalysisModal from './AIAnalysisModal';
import { analyzeInfraction, AnalysisResult } from '@/src/services/aiAnalyseService';
import { generateDefenseTemplate } from '@/src/services/defenseGenerator';
import { recordOutcome } from '@/src/services/learningService';
import { initialNulidades } from '@/src/services/nulidadeData';

interface ProcessDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
}

export default function ProcessDetailsDrawer({ isOpen, onClose, caseId }: ProcessDetailsDrawerProps) {
  const { cases, updateCase, linkServiceToCase } = useCases();
  const { documents: knowledgeDocs } = useKnowledge();
  const { getRelevantLearnings } = useLearning();
  
  const caseData = cases.find(c => c.id === caseId);

  const [obs, setObs] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<'changes' | 'audit' | 'docs'>('changes');
  const [isUploading, setIsUploading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<'Contrato' | 'Procuração' | 'Defesa' | 'Recurso' | 'Pagamento'>('Contrato');
  const [isConclusionMode, setIsConclusionMode] = useState(false);
  const [conclusionOutcome, setConclusionOutcome] = useState<'deferred' | 'denied'>('deferred');
  const [selectedConclusionThesis, setSelectedConclusionThesis] = useState<string>('');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedDefenseContent, setGeneratedDefenseContent] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationEntry | null>(null);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isResourceSelectOpen, setIsResourceSelectOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (caseData) {
      setObs(caseData.observations || '');
    }
  }, [caseData?.id, caseData?.observations]);

  useEffect(() => {
    if (caseData?.appliedThesisId) {
      setSelectedConclusionThesis(caseData.appliedThesisId);
    }
  }, [caseData?.id, caseData?.appliedThesisId]);

  if (!caseData && isOpen) return null;

  const handleSaveObs = async () => {
    if (!caseId) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateCase(caseId, { observations: obs });
    setIsSaving(false);
  };

  const addGeneration = (type: string, content: string, summary?: string) => {
    if (!caseId || !caseData) return;
    const date = new Date().toLocaleString('pt-BR');
    const newGeneration: GenerationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      date,
      content,
      summary: summary || content.substring(0, 150) + '...'
    };

    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      action: `${type} Salva`,
      description: `O conteúdo gerado (${type}) foi revisado e salvo no histórico do cliente.`
    };

    updateCase(caseId, {
      generations: [newGeneration, ...(caseData.generations || [])],
      history: [newHistoryItem, ...(caseData.history || [])]
    });
  };

  const wrapAction = async (id: string, actionName: string, update: any, delay: number = 1000, customDesc?: string) => {
    if (!caseId || !caseData) return;
    setLoadingAction(id);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      action: actionName,
      description: customDesc || (update?.status ? `Status alterado para: ${update.status}` : 'Ação executada com sucesso')
    };

    const updatedHistory = [newHistoryItem, ...(caseData.history || [])];

    if (update) {
      updateCase(caseId, { ...update, history: updatedHistory });
    } else {
      updateCase(caseId, { history: updatedHistory });
    }
    
    setLoadingAction(null);
    setSuccessAction(id);
    setTimeout(() => setSuccessAction(null), 2000);
  };

  const actions = [
    { id: 'ai', icon: Brain, label: 'Analisar com IA', color: 'bg-indigo-500', desc: 'Cruzamento de teses e julgados' },
    { id: 'contract', icon: FileText, label: 'Gerar Contrato', color: 'bg-blue-500', desc: 'Minuta personalizada para o cliente' },
    { id: 'payment', icon: DollarSign, label: 'Gerar Pagamento', color: 'bg-amber-500', desc: 'Cobrança PIX/Cartão/Boleto' },
    { id: 'terms', icon: ShieldCheck, label: 'Gerar Procuração', color: 'bg-emerald-500', desc: 'Representação legal pronta' },
    { id: 'resource', icon: Gavel, label: 'Gerar Recurso', color: 'bg-rose-500', desc: 'Petição automática' },
  ];

  const handleAction = async (id: string) => {
    switch(id) {
      case 'ai': 
        if (!caseData) return;
        setLoadingAction('ai');
        
        try {
          const learnings = getRelevantLearnings(caseData.infractionType, 'DETRAN');
          
          const result = await analyzeInfraction({
            plate: caseData.plate,
            organ: 'DETRAN', 
            infraction: caseData.infractionDescription || caseData.infractionType,
            date: caseData.infractionDate,
            location: caseData.address || 'Brasília-DF',
            type: caseData.infractionType,
            knowledgeDocs: knowledgeDocs,
            learnings: learnings
          });
          
          setAnalysisResult(result);
          
          const newHistoryItem: HistoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toLocaleString('pt-BR'),
            action: 'Análise de IA concluída',
            description: `A IA identificou ${result.recommendations.length} teses com até ${result.score}% de probabilidade de deferimento.`
          };

          updateCase(caseId!, { 
            status: 'Em Análise', 
            column: 'analysis',
            history: [newHistoryItem, ...(caseData.history || [])]
          });

          setLoadingAction(null);
          setSuccessAction('ai');
          setTimeout(() => {
            setSuccessAction(null);
            setIsAnalysisModalOpen(true);
          }, 800);
        } catch (error) {
          toast.error('Erro na análise de IA');
          setLoadingAction(null);
        }
        break;
      case 'contract':
        setCurrentDocType('Contrato');
        setIsDocEditorOpen(true);
        break;
      case 'payment':
        setIsPaymentModalOpen(true);
        break;
      case 'terms':
        setCurrentDocType('Procuração');
        setIsDocEditorOpen(true);
        break;
      case 'resource':
        setIsResourceSelectOpen(true);
        break;
    }
  };

  const handleCreateResource = (resourceType: string) => {
    if (!caseId || !caseData) return;
    setIsResourceSelectOpen(false);
    setCurrentDocType('Recurso');
    setIsDocEditorOpen(true);
  };

  const handleSaveDocument = (docName: string, content: string) => {
    if (!caseId || !caseData) return;

    const newDoc: CaseDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: docName,
      type: currentDocType,
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      size: (new Blob([content]).size / 1024).toFixed(1) + ' KB',
      url: '#' // Simulation
    };

    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR'),
      action: `Gerou ${currentDocType}`,
      description: `${currentDocType} gerado e editado manualmente pelo consultor.`
    };

    updateCase(caseId, {
      documents: [newDoc, ...(caseData.documents || [])],
      history: [newHistoryItem, ...(caseData.history || [])],
      column: 'awaiting_client',
      status: 'Aguardando Confirmação'
    });
    addGeneration(currentDocType, content);
  };

  const handleApplyDefense = () => {
    if (!caseData || !analysisResult || analysisResult.recommendations.length === 0) return;
    
    // Use the top recommendation as the primary thesis for learning
    const primaryThesis = analysisResult.recommendations[0];
    
    // Generate template using results
    const defenseHtml = generateDefenseTemplate(caseData, analysisResult.recommendations);
    
    setGeneratedDefenseContent(defenseHtml);
    setCurrentDocType('Defesa');
    setIsAnalysisModalOpen(false);
    
    // Store thesis in case
    updateCase(caseId!, {
      appliedThesisId: primaryThesis.id,
      appliedThesisTitle: primaryThesis.tese
    });
    
    // Wait for analysis modal to close
    setTimeout(() => {
      setIsDocEditorOpen(true);
    }, 500);
  };

  const handleSetOutcome = (outcome: 'deferred' | 'denied') => {
    if (!caseId || !caseData) return;
    
    // Record in learning service if a thesis was applied
    if (caseData.appliedThesisId) {
      import('@/src/services/learningService').then(service => {
        service.recordOutcome(caseData.appliedThesisId!, outcome);
      });
    }
    
    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR'),
      action: outcome === 'deferred' ? 'PROCESSO DEFERIDO' : 'PROCESSO INDEFERIDO',
      description: `Resultado final registrado pelo consultor. O sistema de IA absorveu este desfecho.`
    };

    updateCase(caseId, {
      outcome,
      status: outcome === 'deferred' ? 'Finalizado (Vença)' : 'Finalizado (Derrota)',
      column: 'done',
      completion: 100,
      history: [newHistoryItem, ...(caseData.history || [])]
    });
    
    toast.success('Resultado registrado', {
      description: 'A IA aprendeu com o desfecho deste caso.'
    });
  };

  const handleCreatePayment = (data: { value: number; description: string; method: string }) => {
    if (!caseId || !caseData) return;

    const newBilling: Billing = {
      id: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: 'manual',
      description: data.description,
      value: data.value,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente'
    };

    updateCase(caseId, {
      billings: [...(caseData.billings || []), newBilling],
    });

    setGeneratedDefenseContent(data.value.toFixed(2));
    setCurrentDocType('Pagamento');
    setIsPaymentModalOpen(false);
    
    setTimeout(() => {
      setIsDocEditorOpen(true);
    }, 500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !caseId || !caseData) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDoc: CaseDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'Outros', // Default
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: URL.createObjectURL(file)
    };
    
    const updatedDocs = [newDoc, ...(caseData.documents || [])];
    updateCase(caseId, { documents: updatedDocs });
    
    toast.success('Documento enviado', {
      description: `O arquivo ${file.name} foi anexado ao processo.`,
    });
    
    setIsUploading(false);
  };

  const handleDeleteDoc = (docId: string) => {
    if (!caseId || !caseData) return;
    const updatedDocs = (caseData.documents || []).filter(d => d.id !== docId);
    updateCase(caseId, { documents: updatedDocs });
    toast.error('Documento excluído');
  };

  const handleShareWhatsApp = (doc: CaseDocument) => {
    if (!caseData) return;
    const phone = caseData.phone?.replace(/\D/g, '') || '';
    const message = `Olá ${caseData.name}, segue seu documento (${doc.name}) referente ao processo #${caseData.autoNumber || caseData.id}.
Link: https://${WHITE_LABEL.WEBSITE.toLowerCase()}/docs/${doc.id}.pdf`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && caseData && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-surface/60 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.3 }
            }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[1000px] bg-surface-container z-[120] shadow-[-20px_0_100px_rgba(0,0,0,0.8)] border-l border-surface-container-highest flex flex-col"
          >
            {/* Header */}
            <header className="px-10 py-10 border-b border-surface-container-highest flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-surface-container-highest/10 to-transparent relative overflow-hidden shrink-0 gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container opacity-[0.02] blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-4xl font-black text-on-surface tracking-tighter uppercase italic leading-none flex items-center gap-2">
                    <span className="text-primary-container opacity-30 group-hover:opacity-100 transition-opacity">#</span>
                    {caseData.id}
                  </h2>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border backdrop-blur-md",
                    caseData.status === 'Finalizado' || caseData.status === 'Deferido'
                      ? "bg-green-400/20 text-green-400 border-green-400/30 shadow-green-400/10"
                      : "bg-primary-container/20 text-primary-container border-primary-container/30 shadow-primary-container/10"
                  )}>
                    {caseData.status}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-on-surface/90 italic tracking-tight uppercase leading-none opacity-80">
                  {caseData.name}
                </h3>
              </div>

              <div className="relative z-10 flex items-center gap-4 shrink-0 self-end md:self-auto">
                <div className="hidden lg:flex flex-col items-end mr-4">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Criado em</p>
                  <p className="text-xs font-bold text-on-surface">{caseData.date || 'Atualizado agora'}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-surface border border-surface-container-highest rounded-[24px] text-on-surface-variant hover:text-on-surface hover:border-primary-container hover:shadow-2xl transition-all active:scale-95 group shadow-xl"
                >
                  <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1ª Coluna: Dados do Cliente */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Dados do Cliente</h3>
                  </div>

                  <div className="bg-surface/40 rounded-[32px] border border-surface-container-highest p-6 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3 opacity-50" /> Nome
                      </p>
                      <p className="text-sm font-bold text-on-surface truncate">{caseData.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-3 h-3 opacity-50" /> Telefone
                      </p>
                      <p className="text-sm font-bold text-on-surface">{caseData.phone || '(00) 00000-0000'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <Hash className="w-3 h-3 opacity-50" /> Placa
                      </p>
                      <p className="text-sm font-black text-primary-container font-mono tracking-[0.2em]">{caseData.plate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 opacity-50" /> Condutor
                      </p>
                      <p className="text-sm font-bold text-on-surface">{caseData.driverName || 'O Próprio'}</p>
                    </div>
                  </div>
                </section>

                {/* 2ª Coluna: Dados do Processo */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <FileText className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Dados do Processo</h3>
                  </div>

                  <div className="bg-surface/40 rounded-[32px] border border-surface-container-highest p-6 shadow-sm space-y-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Auto (AIN)</p>
                        <p className="text-sm font-black text-on-surface italic">#{caseData.autoNumber}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Data</p>
                        <p className="text-sm font-bold text-on-surface">{caseData.infractionDate}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3 opacity-40" /> Localização
                      </p>
                      <p className="text-xs font-bold text-on-surface italic opacity-80 leading-relaxed truncate">{caseData.address}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Infração</p>
                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed line-clamp-2 italic">"{caseData.infractionDescription}"</p>
                    </div>

                    <div className="pt-2">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1.5">Financeiro</p>
                      <div className="flex gap-2">
                        {caseData.billings && caseData.billings.length > 0 ? (
                          caseData.billings.map((bill) => (
                            <span 
                              key={bill.id}
                              className={cn(
                                "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                                bill.status === 'Pago' && "bg-green-400/10 text-green-400 border-green-400/20",
                                bill.status === 'Pendente' && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                                bill.status === 'Atrasado' && "bg-rose-400/10 text-rose-400 border-rose-400/20",
                                bill.status === 'Cancelado' && "bg-slate-400/10 text-slate-400 border-slate-400/20"
                              )}
                              title={bill.description}
                            >
                              {bill.status}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 bg-surface-container-highest/30 text-on-surface-variant/40 rounded-lg text-[8px] font-black uppercase tracking-widest border border-surface-container-highest/20 italic">
                            Sem Cobranças
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Learning Feedback Section */}
                  {caseData.appliedThesisId && !caseData.outcome && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 rounded-[32px] bg-indigo-500/5 border border-indigo-500/20 shadow-xl shadow-indigo-500/5 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Aprendizado IA</h4>
                          <p className="text-[9px] text-indigo-500 opacity-60 font-bold uppercase mt-1">Registre o desfecho deste caso</p>
                        </div>
                      </div>
                      
                      <div className="bg-surface/60 p-4 rounded-2xl border border-indigo-500/10 mb-2">
                        <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">Tese Utilizada</p>
                        <p className="text-xs font-bold text-on-surface italic line-clamp-1">"{caseData.appliedThesisTitle}"</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSetOutcome('deferred')}
                          className="flex-1 bg-green-500 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all active:scale-95"
                        >
                          Deferido
                        </button>
                        <button 
                          onClick={() => handleSetOutcome('denied')}
                          className="flex-1 bg-rose-500 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all active:scale-95"
                        >
                          Indeferido
                        </button>
                      </div>
                      
                      <p className="text-[7px] font-bold text-on-surface-variant opacity-40 uppercase text-center tracking-[0.2em]">O resultado calibrará futuras probabilidades</p>
                    </motion.div>
                  )}

                  {caseData.outcome && (
                    <div className={cn(
                      "mt-6 p-6 rounded-[32px] border flex items-center gap-4",
                      caseData.outcome === 'deferred' ? "bg-green-400/5 border-green-400/20" : "bg-rose-400/5 border-rose-400/20"
                    )}>
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                        caseData.outcome === 'deferred' ? "bg-green-400 text-white shadow-green-400/20" : "bg-rose-400 text-white shadow-rose-400/20"
                      )}>
                        {caseData.outcome === 'deferred' ? <Check className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={cn("text-[10px] font-black uppercase tracking-widest leading-none", caseData.outcome === 'deferred' ? "text-green-400" : "text-rose-400")}>
                          Resultado Final
                        </h4>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tight mt-1">
                          {caseData.outcome === 'deferred' ? 'PROCESSO VITORIOSO' : 'PROCESSO DERROTADO'}
                        </p>
                        <p className="text-[9px] text-on-surface-variant font-bold opacity-40 uppercase tracking-widest mt-1">IA Alimentada com sucesso</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* 3ª Coluna: Ações Disponíveis */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <Sparkles className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Ações Disponíveis</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {actions.map((action) => (
                      <button 
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        disabled={loadingAction !== null || successAction !== null}
                        className={cn(
                          "group w-full flex items-center gap-5 p-6 bg-surface/60 border border-surface-container-highest rounded-[32px] hover:bg-surface-container-highest/60 hover:shadow-2xl hover:shadow-primary-container/[0.05] hover:-translate-y-1 transition-all text-left active:scale-[0.98] shadow-sm relative overflow-hidden",
                          loadingAction === action.id && "ring-2 ring-primary-container shadow-inner bg-surface-container-highest",
                          successAction === action.id && "bg-green-400/10 border-green-400/30",
                          (loadingAction !== null && loadingAction !== action.id) || (successAction !== null && successAction !== action.id) ? "opacity-40 grayscale-[0.5]" : ""
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl transition-all shrink-0 z-10",
                          successAction === action.id ? "bg-green-400 scale-110" : action.color
                        )}>
                           {loadingAction === action.id ? <Loader2 className="w-8 h-8 animate-spin" /> : successAction === action.id ? <Check className="w-8 h-8" /> : <action.icon className="w-8 h-8" />}
                        </div>
                        <div className="min-w-0 z-10">
                          <p className="text-base font-black uppercase tracking-tight leading-none mb-2 text-on-surface italic">{action.label}</p>
                          <p className="text-xs font-bold opacity-40 text-on-surface-variant truncate uppercase tracking-widest leading-none">{action.desc}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Notas Rápidas e Histórico em linha cheia */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Bloco de Notas */}
                 <section className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Notas Internas</h3>
                  </div>

                  <div className="bg-surface/60 rounded-[32px] p-6 border border-surface-container-highest shadow-sm min-h-[200px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Anotações do consultor</p>
                      {obs !== caseData.observations && (
                        <button onClick={handleSaveObs} disabled={isSaving} className="text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <textarea 
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      className="w-full flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface-variant font-medium leading-relaxed resize-none p-0 custom-scrollbar"
                      placeholder="Relate aqui as particularidades do caso..."
                    />
                  </div>
                </section>

                {/* Histórico Simplificado ao lado das Notas */}
                <section className="space-y-4 text-left">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                        <History className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Fluxo do Processo</h3>
                    </div>
                  </div>
                  <div className="bg-surface/40 rounded-[32px] border border-surface-container-highest p-6 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      {caseData.history?.map((item, i) => (
                        <div key={item.id} className="flex gap-4 items-start group">
                          <div className="w-2 h-2 rounded-full bg-primary-container/40 group-hover:bg-primary-container mt-1.5 transition-colors shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-on-surface uppercase">{item.action}</span>
                              <span className="text-[8px] text-on-surface-variant/40 font-mono">{item.date}</span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant/70 italic leading-tight">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Novas Abas: Histórico de Alterações, Documentos e Logs de Auditoria */}
              <section className="space-y-6 pt-4">
                <div className="flex gap-8 border-b border-surface-container-highest/50 px-4">
                  {[
                    { id: 'changes', label: 'Histórico' },
                    { id: 'docs', label: 'Documentos' },
                    { id: 'generations', label: 'Gerações' },
                    { id: 'audit', label: 'Auditoria' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBottomTab(tab.id as any)}
                      className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                        bottomTab === tab.id ? "text-primary-container" : "text-on-surface-variant/40 hover:text-on-surface-variant"
                      )}
                    >
                      {tab.label}
                      {bottomTab === tab.id && (
                        <motion.div layoutId="bottomTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-surface/20 rounded-[32px] border border-surface-container-highest p-8 h-80 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {bottomTab === 'changes' ? (
                      <motion.div
                        key="changes"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        {caseData.history?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-container-highest/30 last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-container/40" />
                              <p className="text-[10px] font-bold text-on-surface uppercase tracking-tight">{item.action}</p>
                            </div>
                            <span className="text-[9px] font-mono text-on-surface-variant/40">{item.date}</span>
                          </div>
                        )) || (
                          <p className="text-center text-[10px] uppercase font-black opacity-20 py-10">Nenhuma alteração registrada</p>
                        )}
                      </motion.div>
                    ) : bottomTab === 'docs' ? (
                      <motion.div
                        key="docs"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center bg-surface-container-highest/10 p-4 rounded-2xl border border-surface-container-highest/30">
                          <div>
                            <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">Gerenciar Processo</p>
                            <p className="text-[9px] text-on-surface-variant opacity-60 uppercase">Anexe CNH, CRLV ou multas recebidas</p>
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Adicionar Documento
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>

                        <div className="space-y-2">
                          {(caseData.documents && caseData.documents.length > 0) ? (
                            caseData.documents.map((doc) => (
                              <div key={doc.id} className="group p-4 bg-surface/40 hover:bg-surface-container-highest/20 border border-surface-container-highest/30 rounded-2xl flex items-center justify-between transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-on-surface group-hover:text-primary-container transition-colors">{doc.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-[9px] font-black text-on-surface-variant opacity-40 uppercase tracking-widest">{doc.type}</span>
                                      <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                                      <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-tighter">{doc.uploadDate}</span>
                                      <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                                      <span className="text-[9px] font-mono text-on-surface-variant/40">{doc.size}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary-container/10 text-on-surface-variant hover:text-primary-container rounded-lg transition-all" title="Visualizar">
                                    <Eye className="w-4 h-4" />
                                  </a>
                                  <a href={doc.url} download={doc.name} className="p-2 hover:bg-primary-container/10 text-on-surface-variant hover:text-primary-container rounded-lg transition-all" title="Baixar">
                                    <Download className="w-4 h-4" />
                                  </a>
                                  <button onClick={() => handleShareWhatsApp(doc)} className="p-2 hover:bg-green-500/10 text-on-surface-variant hover:text-green-500 rounded-lg transition-all" title="Enviar WhatsApp">
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 rounded-lg transition-all" title="Excluir">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 opacity-20 gap-3">
                              <FileText className="w-10 h-10" />
                              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum documento anexado</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : bottomTab === 'generations' ? (
                      <motion.div
                        key="generations"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between mb-8 px-2">
                          <p className="text-[10px] font-black text-on-surface uppercase tracking-widest flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-primary-container" />
                             Linha do Tempo de Produção
                          </p>
                          <p className="text-[9px] text-on-surface-variant opacity-60 uppercase font-bold tracking-tighter">Histórico de Automações</p>
                        </div>
                        
                        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest/30 before:rounded-full">
                          {caseData.generations && caseData.generations.length > 0 ? (
                            caseData.generations.map((gen, idx) => {
                              const getStyles = (type: string) => {
                                const t = type.toLowerCase();
                                if (t.includes('análise')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', icon: Brain };
                                if (t.includes('contrato')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: FileText };
                                if (t.includes('pagamento')) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Receipt };
                                if (t.includes('recurso')) return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: Gavel };
                                if (t.includes('procuração')) return { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', icon: ShieldCheck };
                                return { bg: 'bg-primary-container/10', text: 'text-primary-container', border: 'border-primary-container/20', icon: Sparkles };
                              };

                              const st = getStyles(gen.type);
                              const Icon = st.icon;

                              return (
                                <motion.div 
                                  key={gen.id} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="relative group pb-2"
                                >
                                  {/* Timeline Node */}
                                  <div className={cn(
                                    "absolute -left-[31px] top-1 w-6 h-6 rounded-full border-4 border-surface-container flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-sm",
                                    st.bg.replace('/10', ''),
                                  )}>
                                    <Icon className="w-2.5 h-2.5 text-white" />
                                  </div>

                                  <div className={cn(
                                    "p-6 bg-surface/40 border border-surface-container-highest/30 rounded-[32px] hover:bg-surface-container-highest/10 transition-all shadow-sm group-hover:shadow-md",
                                    "relative overflow-hidden"
                                  )}>
                                    <div className="flex items-start justify-between gap-6">
                                      <div className="space-y-3 min-w-0">
                                        <div className="flex items-center gap-3">
                                          <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            st.bg, st.text, st.border
                                          )}>
                                            {gen.type}
                                          </span>
                                          <span className="text-[9px] font-mono font-bold text-on-surface-variant opacity-30">{gen.date}</span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2 italic pr-4">
                                            "{gen.summary}"
                                          </p>
                                        </div>
                                      </div>

                                      <button 
                                        onClick={() => {
                                          setSelectedGeneration(gen);
                                          setIsGenModalOpen(true);
                                        }}
                                        className={cn(
                                          "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap shrink-0",
                                          "bg-surface border border-surface-container-highest hover:border-primary-container text-on-surface-variant hover:text-on-surface"
                                        )}
                                      >
                                        Visualizar Conteúdo
                                      </button>
                                    </div>

                                    {/* Subtle vertical accent */}
                                    <div className={cn("absolute left-0 top-6 bottom-6 w-1 rounded-full opacity-20", st.bg.replace('/10', ''))} />
                                  </div>
                                </motion.div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-16 opacity-20 gap-4">
                              <div className="p-6 rounded-full bg-surface-container-highest">
                                <Sparkles className="w-12 h-12" />
                              </div>
                              <div className="text-center">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1">Timeline Vazia</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest">Gere documentos para popular o histórico</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="audit"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col items-center justify-center h-full gap-4 opacity-20"
                      >
                        <ShieldCheck className="w-8 h-8" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ambiente Seguro - Rastreabilidade Ativa</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="p-8 border-t border-surface-container-highest bg-surface-container-highest/10 flex flex-col gap-6 shrink-0">
               {isConclusionMode ? (
                 <div className="bg-surface p-6 rounded-[24px] border border-primary-container/20 shadow-2xl space-y-6">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary-container/10 rounded-xl text-primary-container">
                       <Brain className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-sm font-black text-on-surface uppercase tracking-tight">Otimização de Inteligência</h4>
                       <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">Registre o desfecho para treinar a IA</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => setConclusionOutcome('deferred')}
                       className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        conclusionOutcome === 'deferred' 
                          ? "bg-green-500/10 border-green-500 text-green-400" 
                          : "bg-surface-container border-surface-container-highest text-on-surface-variant opacity-50"
                       )}
                     >
                       <Check className="w-6 h-6" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Deferido</span>
                     </button>
                     <button 
                       onClick={() => setConclusionOutcome('denied')}
                       className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        conclusionOutcome === 'denied' 
                          ? "bg-rose-500/10 border-rose-500 text-rose-400" 
                          : "bg-surface-container border-surface-container-highest text-on-surface-variant opacity-50"
                       )}
                     >
                       <XCircle className="w-6 h-6" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Indeferido</span>
                     </button>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tese que gerou o resultado</label>
                     <select 
                       value={selectedConclusionThesis}
                       onChange={(e) => setSelectedConclusionThesis(e.target.value)}
                       className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary-container"
                     >
                       <option value="">Nenhuma tese específica</option>
                       {initialNulidades.map(n => (
                         <option key={n.id} value={n.id}>{n.tese_principal}</option>
                       ))}
                     </select>
                   </div>

                   <div className="flex gap-3">
                     <button 
                        onClick={() => setIsConclusionMode(false)}
                        className="flex-1 py-3 bg-surface border border-surface-container-highest text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest"
                     >
                       Cancelar
                     </button>
                     <button 
                        onClick={() => {
                          if (caseId) {
                            // 1. Update Case
                            updateCase(caseId, { 
                              status: 'Concluído', 
                              completion: 100,
                              outcome: conclusionOutcome,
                              appliedThesisId: selectedConclusionThesis
                            });

                            // 2. Train AI
                            if (selectedConclusionThesis) {
                              recordOutcome(selectedConclusionThesis, conclusionOutcome, caseData.court);
                            }

                            toast.success('Processo Concluído + IA Treinada', {
                              description: `Resultado registrado. O ranking de ${caseData.court || 'teses'} foi recalibrado.`,
                            });
                            onClose();
                          }
                        }}
                        className="flex-[2] py-3 bg-primary-container text-on-primary-container rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-container/20"
                     >
                       Finalizar e Treinar IA
                     </button>
                   </div>
                 </div>
               ) : (
                <div className="flex justify-end gap-4 w-full">
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-surface border border-surface-container-highest text-on-surface-variant rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-on-surface hover:bg-surface-container transition-all active:scale-95"
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={() => setIsConclusionMode(true)}
                    className="px-12 py-4 bg-surface-container-highest text-on-surface rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-green-500/10 hover:text-green-400 border border-transparent hover:border-green-500/20 transition-all active:scale-95 flex items-center gap-3"
                  >
                    Concluir Processo
                    <Check className="w-4 h-4" />
                  </button>
                </div>
               )}
            </footer>

            <PaymentModal 
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              onConfirm={handleCreatePayment}
              caseName={caseData.name}
            />

            <DocumentEditorModal 
              isOpen={isDocEditorOpen}
              onClose={() => {
                setIsDocEditorOpen(false);
                setGeneratedDefenseContent('');
              }}
              onSave={handleSaveDocument}
              caseData={caseData}
              docType={currentDocType}
              initialContent={generatedDefenseContent}
            />

            <AIAnalysisModal 
              isOpen={isAnalysisModalOpen}
              onClose={() => setIsAnalysisModalOpen(false)}
              onApply={handleApplyDefense}
              onSave={(content) => addGeneration('Análise IA', content)}
              result={analysisResult}
              caseName={caseData.name}
              caseType={caseData.infractionType}
              organ="DETRAN"
            />

            {/* Resource Type Selector Modal */}
            <AnimatePresence>
              {isResourceSelectOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsResourceSelectOpen(false)}
                    className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
                  />
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-surface-container border border-surface-container-highest rounded-[40px] shadow-[0_50px_200px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                          <Gavel className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Tipo de Recurso</h3>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1 opacity-50">Selecione o órgão de destino</p>
                        </div>
                      </div>
                      <button onClick={() => setIsResourceSelectOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {['Detran', 'Jari', 'Cetran'].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleCreateResource(type)}
                          className="group w-full flex items-center justify-between p-6 bg-surface border border-surface-container-highest rounded-3xl hover:border-rose-500/50 hover:bg-rose-500/[0.02] transition-all text-left active:scale-[0.98]"
                        >
                          <span className="text-lg font-black text-on-surface uppercase italic tracking-tight">{type}</span>
                          <ArrowRight className="w-5 h-5 text-on-surface-variant opacity-20 group-hover:opacity-100 group-hover:text-rose-500 transition-all" />
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setIsResourceSelectOpen(false)}
                      className="mt-8 w-full py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors"
                    >
                      Cancelar
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Generation View Modal */}
            <AnimatePresence>
              {isGenModalOpen && selectedGeneration && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsGenModalOpen(false)}
                    className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
                  />
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[80vh] bg-surface-container border border-surface-container-highest rounded-[40px] shadow-[0_50px_200px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                  >
                    <header className="px-8 py-6 border-b border-surface-container-highest flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-on-surface uppercase italic tracking-tighter leading-none">{selectedGeneration.type}</h3>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1 opacity-50">Gerado em {selectedGeneration.date}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsGenModalOpen(false)} className="p-3 hover:bg-surface-container-highest rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                      </button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-on-surface-variant leading-relaxed bg-surface/50 p-6 rounded-3xl border border-surface-container-highest shadow-inner">
                        {selectedGeneration.content}
                      </pre>
                    </div>
                    <footer className="px-8 py-6 border-t border-surface-container-highest flex justify-end">
                      <button 
                        onClick={() => setIsGenModalOpen(false)}
                        className="px-10 py-3 bg-surface-container-highest text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all active:scale-95"
                      >
                        Fechar
                      </button>
                    </footer>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
