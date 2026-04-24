import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Phone, 
  Hash, 
  Activity, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCases, Case } from '@/src/contexts/CaseContext';
import { cn } from '@/src/lib/utils';

interface ProcessEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case | null;
}

const STATUS_OPTIONS = [
  'Entrada',
  'Em Análise',
  'Proposta Enviada',
  'Aguardando Confirmação',
  'Aguardando Pagamento',
  'Recurso – 1ª Instância',
  'Recurso – JARI',
  'Recurso – CETRAN',
  'Deferido',
  'Indeferido',
  'Finalizado'
];

export default function ProcessEditModal({ isOpen, onClose, caseData }: ProcessEditModalProps) {
  const { updateCase } = useCases();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    autoNumber: '',
    status: '',
    observations: ''
  });

  useEffect(() => {
    if (caseData) {
      setFormData({
        name: caseData.name || '',
        phone: caseData.phone || '',
        autoNumber: caseData.autoNumber || '',
        status: caseData.status || 'Entrada',
        observations: caseData.observations || ''
      });
    }
  }, [caseData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCase(caseData!.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && caseData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface-container w-full max-w-sm overflow-hidden rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border border-surface-container-highest flex flex-col"
          >
            {/* Header */}
            <header className="px-6 py-4 border-b border-surface-container-highest flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                  <Activity className="w-4 h-4 text-primary-container" />
                </div>
                <h2 className="text-lg font-black text-on-surface uppercase italic tracking-tighter">Editar Processo</h2>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-3.5">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Nome do Cliente
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary-container/50 transition-all shadow-inner"
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Telefone
                </label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary-container/50 transition-all shadow-inner"
                />
              </div>

              {/* Número do Processo (Auto de Infração) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Número do Processo (AIN)
                </label>
                <input 
                  type="text" 
                  value={formData.autoNumber}
                  onChange={(e) => setFormData({...formData, autoNumber: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-xl px-3 py-2.5 font-mono text-sm text-primary-container focus:outline-none focus:border-primary-container/50 transition-all shadow-inner"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Status Atual
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary-container/50 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Observações Internas
                </label>
                <textarea 
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-xl px-3 py-2.5 text-xs font-medium text-on-surface-variant focus:outline-none focus:border-primary-container/50 transition-all shadow-inner min-h-[80px] resize-none"
                  placeholder="Notas sobre o andamento do caso..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-surface-container-highest rounded-2xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container rounded-2xl shadow-xl shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
