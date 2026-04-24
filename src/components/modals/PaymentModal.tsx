import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, DollarSign, FileText, CheckCircle2, Link, MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { WHITE_LABEL } from '@/src/constants';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { value: number; description: string; method: string }) => void;
  caseName: string;
}

export default function PaymentModal({ isOpen, onClose, onConfirm, caseName }: PaymentModalProps) {
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<'PIX' | 'Cartão' | 'Boleto'>('PIX');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleConfirm = () => {
    if (!value || !description) {
      toast.error('Preencha o valor e a descrição');
      return;
    }
    
    onConfirm({
      value: parseFloat(value),
      description,
      method
    });
    
    setStep('success');
    toast.success('Cobrança gerada com sucesso');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://pagar.${WHITE_LABEL.WEBSITE.toLowerCase()}/pay_123456`);
    toast.info('Link copiado para a área de transferência');
  };

  const shareWhatsApp = () => {
    const text = `Olá! Segue o link para pagamento do serviço de ${description}: https://pagar.${WHITE_LABEL.WEBSITE.toLowerCase()}/pay_123456`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container border border-surface-container-highest rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight italic">
                    {step === 'form' ? 'Gerar Pagamento' : 'Pagamento Gerado'}
                  </h2>
                  <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
                    {caseName}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 'form' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Valor (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-container" />
                      <input 
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-surface border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Descrição do Serviço</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
                      <input 
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Honorários Recurso 1ª Instância"
                        className="w-full bg-surface border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Forma de Pagamento</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['PIX', 'Cartão', 'Boleto'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMethod(m)}
                          className={cn(
                            "py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                            method === m 
                              ? "bg-primary-container text-on-primary-container border-primary-container shadow-lg" 
                              : "bg-surface border-surface-container-highest text-on-surface-variant/60 hover:border-primary-container/30"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirm}
                    className="w-full py-5 bg-on-surface text-surface rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                  >
                    Confirmar e Gerar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-8 py-4">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-on-surface uppercase italic">Link Gerado!</h3>
                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed px-8">
                        A cobrança de <span className="font-bold text-on-surface">R$ {parseFloat(value).toFixed(2)}</span> para <span className="font-bold text-on-surface">{description}</span> está pronta para envio.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={copyLink}
                      className="w-full py-4 bg-surface-container-highest border border-primary-container/20 text-on-surface rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-container/10 transition-all"
                    >
                      <Link className="w-4 h-4" />
                      Copiar Link de Pagamento
                    </button>
                    <button 
                      onClick={shareWhatsApp}
                      className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar via WhatsApp
                    </button>
                  </div>

                  <button 
                    onClick={onClose}
                    className="w-full text-xs font-black text-on-surface-variant hover:text-on-surface uppercase tracking-widest pt-2"
                  >
                    Voltar ao painel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
