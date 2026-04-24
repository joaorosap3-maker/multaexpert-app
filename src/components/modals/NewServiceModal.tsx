import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Clock, 
  Users,
  Box,
  Calendar,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Service, useCases } from '@/src/contexts/CaseContext';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewServiceModal({ isOpen, onClose }: NewServiceModalProps) {
  const { addService } = useCases();
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    title: '',
    category: 'Administrativo',
    desc: '',
    price: 0,
    billingType: 'unitário',
    targetAudience: 'Cliente Comum',
    priority: 'Média',
    sla: '',
    color: 'blue',
    includes: {
      documents: false,
      support: 'WhatsApp',
      resourcesQuantity: 0
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addService(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      category: 'Administrativo',
      desc: '',
      price: 0,
      billingType: 'unitário',
      targetAudience: 'Cliente Comum',
      priority: 'Média',
      sla: '',
      color: 'blue',
      includes: {
        documents: false,
        support: 'WhatsApp',
        resourcesQuantity: 0
      }
    });
  };

  const colors = ['blue', 'amber', 'emerald', 'indigo', 'rose', 'purple'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-container w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest flex flex-col"
        >
          <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-highest/10 shrink-0">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                 <Tag className="w-6 h-6 text-primary-container" />
               </div>
               <div>
                 <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Novo Serviço</h2>
                 <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Adicionar ao catálogo operacional</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
               <X className="w-5 h-5 text-on-surface-variant" />
             </button>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Nome do Serviço</label>
              <input 
                type="text" 
                placeholder="Ex: Recurso JARI - Especial"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Categoria</label>
                <input 
                  type="text" 
                  placeholder="Ex: Administrativo"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Público-Alvo</label>
                <select 
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                  className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container appearance-none"
                >
                  <option>Cliente Comum</option>
                  <option>Motoboy</option>
                  <option>Motorista de App</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Descrição</label>
              <textarea 
                placeholder="Descreva o que está incluído neste serviço..."
                rows={3}
                required
                value={formData.desc}
                onChange={(e) => setFormData({...formData, desc: e.target.value})}
                className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container resize-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tipo de Cobrança</label>
                <select 
                  value={formData.billingType}
                  onChange={(e) => setFormData({...formData, billingType: e.target.value as any})}
                  className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container appearance-none"
                >
                  <option value="unitário">Unitário</option>
                  <option value="pacote">Pacote</option>
                  <option value="recorrente">Recorrente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">SLA de Entrega</label>
                <input 
                  type="text" 
                  placeholder="Ex: 5 dias úteis"
                  required
                  value={formData.sla}
                  onChange={(e) => setFormData({...formData, sla: e.target.value})}
                  className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Cor de Destaque</label>
                <div className="flex gap-2 p-1 bg-surface border border-surface-container-highest rounded-2xl h-[46px] items-center px-4">
                   {colors.map(c => (
                     <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({...formData, color: c})}
                        className={cn(
                          "w-6 h-6 rounded-full transition-all border-2",
                          formData.color === c ? "border-on-surface scale-110" : "border-transparent opacity-50 hover:opacity-100",
                          `bg-${c}-400`
                        )}
                     />
                   ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
            >
              Criar Serviço
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
