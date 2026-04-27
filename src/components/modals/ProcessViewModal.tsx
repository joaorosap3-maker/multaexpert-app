import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileText, 
  ClipboardList, 
  Hash, 
  Calendar, 
  Clock,
  MapPin, 
  Car, 
  ShieldCheck,
  DollarSign,
  Gavel,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useCases, Billing, HistoryItem, CaseDocument } from '@/contexts/CaseContext';
import PaymentModal from './PaymentModal';
import DocumentEditorModal from './DocumentEditorModal';

interface ProcessViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  processData: any;
}

export default function ProcessViewModal({ isOpen, onClose, processData }: ProcessViewModalProps) {
  const { updateCase } = useCases();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<'Contrato' | 'Procuração' | 'Defesa' | 'Recurso' | 'Pagamento'>('Contrato');

  const handleCreatePayment = (data: { value: number; description: string; method: string }) => {
    if (!processData) return;

    const newBilling: Billing = {
      id: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: 'manual',
      description: data.description,
      value: data.value,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente'
    };

    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR'),
      action: 'Cobrança Gerada',
      description: `Cobrança de R$ ${data.value.toFixed(2)} (${data.method}) gerada via modal de visualização.`
    };

    updateCase(processData.id, {
      status: 'Aguardando Pagamento',
      billings: [...(processData.billings || []), newBilling],
      history: [newHistoryItem, ...(processData.history || [])]
    });
    
    setIsPaymentModalOpen(false);
  };

  const handleGenerateDoc = (type: 'Contrato' | 'Procuração' | 'Recurso') => {
    setCurrentDocType(type);
    setIsDocEditorOpen(true);
  };

  const handleSaveDocument = (docName: string, content: string) => {
    if (!processData) return;

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

    updateCase(processData.id, {
      documents: [newDoc, ...(processData.documents || [])],
      history: [newHistoryItem, ...(processData.history || [])]
    });
  };

  return (
    <AnimatePresence>
      {isOpen && processData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-surface-container w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-surface-container-highest flex flex-col mx-4"
          >
            {/* Header Section */}
            <header className="px-10 py-8 bg-gradient-to-r from-primary-container/10 via-transparent to-transparent border-b border-surface-container-highest relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container opacity-[0.03] blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface/60">
                        #{processData.autoNumber || processData.id}
                      </h2>
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-md border backdrop-blur-md",
                        processData.status === 'Finalizado' || processData.status === 'Deferido'
                          ? "bg-green-400/20 text-green-400 border-green-400/30"
                          : "bg-primary-container/20 text-primary-container border-primary-container/30"
                      )}>
                        {processData.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface/90 flex items-center gap-2">
                      {processData.name}
                    </h3>
                  </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bloco 1: Informações do Cliente */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Info do Cliente</h4>
                </div>
                
                <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Proprietário</p>
                    <p className="text-sm font-bold text-on-surface leading-tight">{processData.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Placa</p>
                    <p className="text-sm font-mono font-bold text-primary-container tracking-widest uppercase">{processData.plate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Telefone</p>
                    <p className="text-sm font-bold text-on-surface">{processData.phone || 'Não informado'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Condutor</p>
                    <p className="text-sm font-bold text-on-surface">{processData.driverName || 'O Próprio'}</p>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Informações do Processo */}
              <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Dados da Multa</h4>
                </div>
                
                <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <Hash className="w-4 h-4 text-primary-container" />
                    <div>
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Auto de Infração</p>
                      <p className="text-sm font-bold text-on-surface">{processData.autoNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-primary-container" />
                    <div>
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Data do Evento</p>
                      <p className="text-sm font-bold text-on-surface">{processData.infractionDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-4 h-4 text-primary-container" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Localização</p>
                      <p className="text-sm font-bold text-on-surface truncate">{processData.address || 'Brasília - DF'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-surface-container-highest">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-2">Descrição</p>
                    <p className="text-xs font-medium text-on-surface-variant leading-relaxed line-clamp-3 italic">
                      "{processData.infractionDescription}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Ações do Processo */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Gestão & Ações</h4>
                </div>
                
                <div className="bg-surface/40 p-6 rounded-[32px] border border-surface-container-highest shadow-sm space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => handleGenerateDoc('Contrato')}
                      className="w-full py-3 px-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Gerar Contrato
                    </button>
                    <button 
                      onClick={() => handleGenerateDoc('Procuração')}
                      className="w-full py-3 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Gerar Procuração
                    </button>
                    <button 
                      onClick={() => handleGenerateDoc('Recurso')}
                      className="w-full py-4 px-6 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Gavel className="w-4 h-4" />
                      Gerar Recurso
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-4 px-6 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <DollarSign className="w-4 h-4" />
                    Gerar Pagamento
                  </button>
                  
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest text-center">Status Interno</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-surface-container-highest/20 p-3 rounded-xl border border-surface-container-highest/30 text-center">
                         <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase tracking-tighter">Prioridade</p>
                         <p className="text-[10px] font-bold text-on-surface">Urgente</p>
                       </div>
                       <div className="bg-surface-container-highest/20 p-3 rounded-xl border border-surface-container-highest/30 text-center">
                         <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase tracking-tighter">Tribunal</p>
                         <p className="text-[10px] font-bold text-on-surface">DETRAN/DF</p>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-400/5 p-6 rounded-[32px] border border-amber-400/10">
                  <div className="flex gap-4">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-400/80 leading-relaxed uppercase tracking-tight">
                      Atenção: Este processo possui prazos fatais em aberto junto ao órgão autuador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <footer className="px-10 py-6 border-t border-surface-container-highest bg-surface-container-highest/10 flex justify-between items-center shrink-0">
            <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] italic">Multa Expert AI • v2.0</p>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-widest border border-surface-container-highest rounded-2xl text-on-surface-variant hover:text-on-surface transition-all"
              >
                Sair da Visualização
              </button>
            </div>
          </footer>

          <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onConfirm={handleCreatePayment}
            caseName={processData.name}
          />

          <DocumentEditorModal 
            isOpen={isDocEditorOpen}
            onClose={() => setIsDocEditorOpen(false)}
            onSave={handleSaveDocument}
            caseData={processData}
            docType={currentDocType}
          />
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

