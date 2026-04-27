import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  Target, 
  AlertCircle,
  TrendingUp,
  Save,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisResult } from '@/services/aiAnalysisService';
import { useLearning } from '@/contexts/LearningContext';
import { WHITE_LABEL } from '@/constants';
import { toast } from 'sonner';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onSave?: (content: string) => void;
  result: AnalysisResult | string | null;
  caseName: string;
  caseType?: string;
  organ?: string;
}

export default function AIAnalysisModal({
  isOpen,
  onClose,
  onApply,
  onSave,
  result,
  caseName,
  caseType,
  organ
}: AIAnalysisModalProps) {
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { learnFromCase } = useLearning();

  const parsedResult =
    typeof result === 'string'
      ? (() => {
          try {
            return JSON.parse(result);
          } catch {
            return null;
          }
        })()
      : result;

  useEffect(() => {
    if (parsedResult) {
      const initialText = `ANÁLISE INTELIGENTE - ${(caseName || '').toUpperCase()}
Gerada em: ${new Date().toLocaleString('pt-BR')} por ${WHITE_LABEL.COMPANY_NAME || ''}

${parsedResult.summary || ''}

---
ESTIMATIVA DE ÊXITO FINAL: ${parsedResult.score || 0}%
Análise baseada em parâmetros estatísticos e jurisprudenciais.
Gerado por ${WHITE_LABEL.COMPANY_NAME || ''} • ${WHITE_LABEL.WEBSITE || ''}
`;
      setEditableContent(initialText);
    }
  }, [parsedResult, caseName]);

  if (!parsedResult) {
    return <div className="p-4 text-sm text-gray-400">Nenhuma análise disponível</div>;
  }

  const handleSave = () => {
    localStorage.setItem(`analysis_${caseName}`, editableContent);
    onSave?.(editableContent);

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
    toast.info('Abrindo WhatsApp...');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <header className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <Brain />
                <h2 className="font-bold">Análise IA - {caseName}</h2>
              </div>
              <button onClick={onClose}>
                <X />
              </button>
            </header>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STATS */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Target />
                  <p>{parsedResult.score || 0}%</p>
                </div>

                <div>
                  <TrendingUp />
                  <p>{parsedResult.recommendations?.length || 0}</p>
                </div>

                <div>
                  <AlertCircle />
                  <p>Média</p>
                </div>
              </div>

              {/* INSIGHTS */}
              {parsedResult.insights?.length > 0 && (
                <div>
                  <h4>Insights</h4>
                  {parsedResult.insights.map((i, idx) => (
                    <p key={idx}>{i}</p>
                  ))}
                </div>
              )}

              {/* EDITOR */}
              <div>
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  readOnly={!isEditing}
                  className="w-full h-64 border p-4"
                />
              </div>
            </div>

            {/* ⚠️ AQUI FOI O ERRO → DIV NÃO FECHAVA */}
            {/* agora está CORRETO */}

            {/* FOOTER */}
            <footer className="p-6 border-t flex justify-between">
              <button onClick={() => setIsEditing(!isEditing)}>
                <Edit3 />
                {isEditing ? 'Salvar edição' : 'Editar'}
              </button>

              <button onClick={handleWhatsApp}>
                <MessageSquare />
                WhatsApp
              </button>

              <button onClick={handleSave}>
                <Save />
                Salvar
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}