import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  Target, 
  Gavel, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  Save,
  Send,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AnalysisResult } from '@/src/services/aiAnalyseService';
import { useLearning } from '@/src/contexts/LearningContext';
import { WHITE_LABEL } from '@/src/constants';
import { toast } from 'sonner';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onSave?: (content: string) => void;
  result: AnalysisResult | null;
  caseName: string;
  caseType?: string;
  organ?: string;
}

export default function AIAnalysisModal({ isOpen, onClose, onApply, onSave, result, caseName, caseType, organ }: AIAnalysisModalProps) {
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { learnFromCase } = useLearning();

  useEffect(() => {
    if (result) {
      const initialText = `ANÁLISE INTELIGENTE - ${(caseName || '').toUpperCase()}
Gerada em: ${new Date().toLocaleString('pt-BR')} por ${(WHITE_LABEL.COMPANY_NAME || '')}

${result?.summary || ''}

---
ESTIMATIVA DE ÉXITO FINAL: ${result?.score || 0}%
Análise baseada em parâmetros estatísticos e jurisprudenciais do órgão autuador.
Gerado por ${(WHITE_LABEL.COMPANY_NAME || '')} • ${(WHITE_LABEL.WEBSITE || '')}
`;
      setEditableContent(initialText);
    }
  }, [result, caseName]);

  if (!result) {
  return <div className="p-4 text-sm text-gray-400">Sem análise disponível</div>;
}

  const handleSave = () => {
    localStorage.setItem(`analysis_${caseName}`, editableContent);
    onSave?.(editableContent);
    
    // Save to learning base
    if (caseType && organ) {
      learnFromCase({
        caseType,
        organ,
        finalContent: editableContent,
        keywords: [caseType]
      });
    }

    toast.success('Análise salva com sucesso!');
    setIsEditing(false);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(editableContent);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.info('Integrando com WhatsApp...');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container flex flex-col shadow-[0_50px_200px_rgba(0,0,0,0.5)] border border-surface-container-highest rounded-[40px] overflow-hidden"
          >
            {/* Header */}
            <header className="px-8 py-6 bg-gradient-to-r from-indigo-500/10 to-primary-container/10 border-b border-surface-container-highest flex items-center justify-between shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Análise Inteligente IA</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-1 opacity-50">Caso: {caseName}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-surface-container-highest/50 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-on-surface-variant" />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-6 rounded-3xl border border-surface-container-highest shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-400 opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:opacity-[0.08] transition-opacity" />
                  <Target className="w-5 h-5 text-green-400 mb-3" />
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Taxa de Êxito</p>
                  <p className="text-3xl font-black text-on-surface tracking-tighter mt-1">{result?.score || 0}%</p>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-surface-container-highest shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400 opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:opacity-[0.08] transition-opacity" />
                  <TrendingUp className="w-5 h-5 text-indigo-400 mb-3" />
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Teses Encontradas</p>
                  <p className="text-3xl font-black text-on-surface tracking-tighter mt-1">{(result?.recommendations || []).length}</p>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-surface-container-highest shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400 opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:opacity-[0.08] transition-opacity" />
                  <AlertCircle className="w-5 h-5 text-amber-400 mb-3" />
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Complexidade</p>
                  <p className="text-3xl font-black text-on-surface tracking-tighter mt-1">Média</p>
                </div>
              </div>

              {/* Editable Analysis Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-50">Editor de Análise</h3>
                  {isEditing ? (
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Modo de Edição Ativo</span>
                  ) : (
                    <span className="text-[9px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Visualização</span>
                  )}
                </div>
                
                <div className="relative group">
                  <textarea
                    readOnly={!isEditing}
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className={cn(
                      "w-full h-[400px] bg-surface rounded-[32px] border p-8 text-sm text-on-surface-variant font-medium leading-relaxed custom-scrollbar transition-all font-mono",
                      isEditing 
                        ? "border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)] focus:ring-4 focus:ring-indigo-500/10 focus:outline-none bg-indigo-500/[0.02]" 
                        : "border-surface-container-highest shadow-sm"
                    )}
                    placeholder="Gerando análise inteligente..."
                  />
                  {!isEditing && (
                    <div className="absolute inset-0 bg-transparent cursor-pointer rounded-[32px]" onClick={() => setIsEditing(true)} />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-8 py-6 bg-surface-container-highest/20 border-t border-surface-container-highest flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
                 </div>
                 <p className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">IA treinada com base em decisões de 15.4k processos</p>
               </div>
               <div className="flex gap-4">
                 <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    isEditing 
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                      : "bg-surface border-surface-container-highest text-on-surface hover:border-indigo-500"
                  )}
                 >
                   <Edit3 className="w-4 h-4" />
                   {isEditing ? "Concluir Edição" : "Editar Análise"}
                 </button>
                 
                 <button 
                   onClick={handleWhatsApp}
                   className="flex items-center gap-2 px-6 py-3 bg-surface border border-surface-container-highest text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-green-500 hover:text-green-500 transition-all"
                 >
                   <MessageSquare className="w-4 h-4" />
                   Enviar por WhatsApp
                 </button>

                 <button 
                   onClick={handleSave}
                   className="flex items-center gap-2 px-8 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
                 >
                   <Save className="w-4 h-4" />
                   Salvar Análise
                 </button>
               </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
