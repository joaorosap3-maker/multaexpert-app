import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Phone, 
  FileText, 
  Plus, 
  Upload,
  Brain,
  Zap,
  CheckCircle2,
  Loader2,
  Hash,
  MapPin,
  Calendar,
  ShieldCheck,
  Scale,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Info,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabaseClient';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewLeadModal({ isOpen, onClose }: NewLeadModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: AI, 2: Confirm
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plate: '',
    infractionType: 'Excesso de velocidade',
    autoNumber: '',
    infractionDate: '',
    authority: '',
  });
  
  // Níveis de confiança: high (verde), medium (amarelo), low (vermelho)
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, 'high' | 'medium' | 'low'>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInsights = (type: string) => {
    switch (type) {
      case 'Excesso de velocidade':
        return {
          severity: 'Média a Gravíssima',
          points: '4 a 7 pontos',
          appeal: 'Alta: Aferição do radar costuma ter falhas técnicas.',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10'
        };
      case 'Avanço de sinal':
        return {
          severity: 'Gravíssima',
          points: '7 pontos',
          appeal: 'Média: Requer provar falha no semáforo ou emergência.',
          color: 'text-red-500',
          bg: 'bg-red-500/10'
        };
      case 'Lei seca':
        return {
          severity: 'Gravíssima (Multiplicada)',
          points: 'Suspensão 12 meses',
          appeal: 'Técnica: Focar em vícios do bafômetro ou abordagem.',
          color: 'text-purple-500',
          bg: 'bg-purple-500/10'
        };
      case 'Estacionamento irregular':
        return {
          severity: 'Leve a Grave',
          points: '3 a 5 pontos',
          appeal: 'Muito Alta: Erros comuns na sinalização de solo.',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10'
        };
      default:
        return {
          severity: 'A consultar',
          points: 'Depende do CTB',
          appeal: 'Necessária análise técnica detalhada.',
          color: 'text-on-surface-variant',
          bg: 'bg-surface-container-highest/20'
        };
    }
  };

  const insights = getInsights(formData.infractionType);

  const resetModal = () => {
    setIsSuccess(false);
    setCurrentStep(0);
    setFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setFieldConfidence({});
    setFormData({ 
      name: '', 
      phone: '', 
      plate: '', 
      infractionType: 'Excesso de velocidade',
      autoNumber: '',
      infractionDate: '',
      authority: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Reset after animation finishes or immediately if preferred
    // To ensure a smooth exit, we can delay the reset or do it on exit
    setTimeout(resetModal, 300);
  };

  const steps = [
    { label: 'Upload', desc: 'Anexar Multa' },
    { label: 'Extração', desc: 'Análise IA' },
    { label: 'Revisão', desc: 'Dados do Lead' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Criar preview se for imagem
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      startExtraction();
    }
  };

  const startExtraction = async () => {
    setCurrentStep(1);
    setIsExtracting(true);
    // Simulação de extração IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setFormData({
      name: 'MARCOS RODRIGO DE ALMEIDA',
      phone: '(11) 98877-6655',
      plate: 'RGX-9C44',
      infractionType: 'Excesso de velocidade',
      autoNumber: 'Y39821-X',
      infractionDate: '22/04/2026',
      authority: 'DETRAN/SP',
    });

    // Simular diferentes níveis de confiança
    setFieldConfidence({
      name: 'high',
      phone: 'high',
      plate: 'high',
      infractionType: 'high',
      autoNumber: 'medium',
      infractionDate: 'low',
      authority: 'medium'
    });
    
    setIsExtracting(false);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Inserir lead na tabela 'leads' do Supabase
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: formData.name,
          phone: formData.phone,
          status: 'novo', // Status inicial
          user_id: user.id,
          // Campos adicionais para referência
          plate: formData.plate.toUpperCase(),
          infraction_type: formData.infractionType,
          auto_number: formData.autoNumber,
          infraction_date: formData.infractionDate,
          authority: formData.authority,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar lead:', error);
        throw error;
      }

      console.log('Lead salvo com sucesso:', data);

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Lead criado com sucesso', {
        description: `${formData.name} foi salvo no banco de dados.`,
      });
      
      // Fechar automaticamente após sucesso
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      setIsSubmitting(false);
      toast.error('Erro ao criar lead', {
        description: 'Não foi possível salvar o lead. Tente novamente.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-surface/90 backdrop-blur-md overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={cn(
                "bg-surface-container w-full rounded-[40px] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.7)] border border-surface-container-highest flex flex-col relative transition-all duration-500",
                (currentStep === 2 && previewUrl) ? "max-w-6xl h-[85vh]" : "max-w-2xl max-h-[90vh]"
              )}
            >
            {/* Header */}
            <header className="px-10 py-8 border-b border-surface-container-highest shrink-0 flex items-center justify-between bg-gradient-to-r from-primary-container/5 to-transparent sticky top-0 bg-surface-container/80 backdrop-blur-md z-20">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                  {isSuccess ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Plus className="w-6 h-6 text-primary-container" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">
                    {isSuccess ? 'Lead Cadastrado!' : 'Fluxo de Novo Lead'}
                  </h2>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1.5 opacity-40 italic">
                    {isSuccess ? 'Processo em andamento' : `Etapa ${currentStep + 1}: ${steps[currentStep].label}`}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-3 bg-surface border border-surface-container-highest rounded-2xl text-on-surface-variant hover:text-on-surface transition-all active:scale-95 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </header>


          {/* Stepper Progress */}
          {!isSuccess && (
            <div className="px-10 pt-8 flex items-center justify-between gap-4">
              {steps.map((s, idx) => (
                <div key={idx} className="flex-1 flex flex-col gap-2">
                  <div className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    idx <= currentStep ? "bg-primary-container" : "bg-surface-container-highest opacity-30"
                  )} />
                  <div className="flex flex-col">
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      idx <= currentStep ? "text-primary-container" : "text-on-surface-variant opacity-30"
                    )}>{s.label}</p>
                    <p className={cn(
                      "text-[8px] font-bold uppercase tracking-tighter opacity-40",
                      idx <= currentStep ? "text-on-surface" : "text-on-surface-variant"
                    )}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className={cn("p-10", (currentStep === 2 && previewUrl) ? "flex-1 overflow-hidden h-full flex flex-col" : "space-y-8")} onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-24 h-24 rounded-[32px] bg-green-400/10 flex items-center justify-center text-green-400 border border-green-400/20 shadow-2xl relative">
                    <CheckCircle2 className="w-12 h-12 animate-in zoom-in-50 duration-500" />
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-10 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tight">Sucesso!</h3>
                    <p className="text-sm font-medium text-on-surface-variant opacity-60">O lead foi inserido na coluna de entrada.</p>
                  </div>
                </motion.div>
              ) : currentStep === 0 ? (
                <motion.div 
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section className="space-y-6">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-surface-container-highest rounded-[32px] p-20 flex flex-col items-center justify-center bg-surface/40 hover:bg-primary-container/5 hover:border-primary-container/40 transition-all cursor-pointer group"
                    >
                      <div className="w-20 h-20 rounded-[28px] bg-surface-container-highest/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-container/10 group-hover:text-primary-container transition-all shadow-xl">
                        <Upload className="w-10 h-10" />
                      </div>
                      <h4 className="text-lg font-black text-on-surface uppercase italic tracking-tight">Anexe sua Multa</h4>
                      <p className="text-xs font-medium text-on-surface-variant opacity-60 mt-2 text-center max-w-xs">
                        Arraste ou clique para selecionar a notificação. Formatos aceitos: PDF, JPG, PNG.
                      </p>
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-surface-container-highest opacity-30"></div>
                      </div>
                      <div className="relative px-4 bg-surface-container">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">OU</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setFieldConfidence({});
                        setCurrentStep(2);
                      }}
                      className="w-full py-5 bg-surface-container-highest/20 border border-surface-container-highest rounded-2xl flex flex-col items-center gap-1 group hover:bg-primary-container/5 hover:border-primary-container/40 transition-all active:scale-[0.98]"
                    >
                      <span className="text-[11px] font-black text-on-surface uppercase tracking-widest group-hover:text-primary-container transition-colors">Prefere preencher manualmente?</span>
                      <span className="text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-tighter">Iniciar cadastro sem anexo</span>
                    </button>
                  </section>
                </motion.div>
              ) : currentStep === 1 ? (
                <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-20 flex flex-col items-center justify-center space-y-8"
                >
                  <div className="relative">
                    <Loader2 className="w-20 h-20 text-primary-container animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary-container animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-on-surface uppercase italic tracking-tight">Extraindo Dados com IA</h4>
                    <p className="text-xs font-medium text-on-surface-variant opacity-60 max-w-xs mx-auto">
                      Estamos processando a imagem para identificar proprietário, placa e o tipo de infração automaticamente.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex flex-col h-full", previewUrl ? "" : "space-y-6")}
                >
                  <div className={cn("flex flex-1 gap-10 items-start", previewUrl ? "h-full" : "flex-col")}>
                    {/* Preview da Imagem (Lado Esquerdo) */}
                    {previewUrl && (
                      <div className="flex-1 h-full bg-surface/40 rounded-[32px] border border-surface-container-highest relative overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-surface-container-highest flex items-center justify-between shrink-0">
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Documento Anexado</p>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                            >
                              <ZoomOut className="w-4 h-4 text-on-surface-variant" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                            >
                              <ZoomIn className="w-4 h-4 text-on-surface-variant" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setZoom(1)}
                              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors font-mono text-[10px] text-on-surface-variant"
                            >
                              100%
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-surface-container-highest/20 cursor-grab active:cursor-grabbing custom-scrollbar relative">
                          <div 
                            className="transition-transform duration-200 origin-top-left p-10 flex items-center justify-center min-h-full"
                            style={{ transform: `scale(${zoom})` }}
                          >
                            <img src={previewUrl} alt="Multa" className="max-w-full h-auto rounded-xl shadow-2xl" />
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setPreviewUrl(null);
                              setFieldConfidence({});
                              setCurrentStep(0);
                            }}
                            className="absolute bottom-6 right-6 px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-colors flex items-center gap-2 group"
                          >
                            <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                            Remover e Trocar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dados Extraídos (Lado Direito) */}
                    <div className={cn("space-y-6 shrink-0", previewUrl ? "w-[400px] h-full overflow-y-auto pr-2 custom-scrollbar" : "w-full")}>
                      <div className="bg-primary-container/5 border border-primary-container/10 p-5 rounded-3xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary-container uppercase tracking-widest">Extração Concluída</p>
                          <p className="text-xs font-bold text-on-surface opacity-60">Confirme os dados extraídos da imagem.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Componente auxiliar para campos com confiança */}
                        {(() => {
                          const renderField = (
                            label: string, 
                            icon: React.ReactNode, 
                            value: string, 
                            field: keyof typeof formData, 
                            placeholder: string,
                            type: string = "text",
                            className: string = ""
                          ) => {
                            const confidence = fieldConfidence[field] || 'high';
                            const colors = {
                              high: 'border-surface-container-highest bg-surface/50 text-on-surface',
                              medium: 'border-amber-500/40 bg-amber-500/5 text-on-surface',
                              low: 'border-red-500/40 bg-red-500/5 text-on-surface'
                            };
                            const badge = {
                              high: null,
                              medium: { color: 'text-amber-500', text: 'Confiança Média' },
                              low: { color: 'text-red-500', text: 'Confiança Baixa' }
                            };

                            return (
                              <div className={cn("space-y-2", className)}>
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 ml-1 flex items-center justify-between group/label relative">
                                  {label}
                                  {badge[confidence] && (
                                    <div className="flex items-center gap-1.5 peer">
                                      <span className={cn("text-[8px] px-1.5 rounded animate-pulse bg-current/10 font-black", badge[confidence]?.color)}>
                                        {badge[confidence]?.text}
                                      </span>
                                      <div className="w-3 h-3 bg-on-surface-variant/10 rounded-full flex items-center justify-center cursor-help">
                                        <span className="text-[7px]">?</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Tooltip Simulado */}
                                  <div className="absolute right-0 -top-8 px-3 py-2 bg-on-surface text-surface text-[9px] font-bold rounded-lg opacity-0 invisible group-hover/label:opacity-100 group-hover/label:visible transition-all pointer-events-none whitespace-nowrap z-50">
                                    Este dado foi extraído automaticamente e pode conter erros
                                    <div className="absolute -bottom-1 right-2 w-2 h-2 bg-on-surface rotate-45"></div>
                                  </div>
                                </label>
                                <div className="relative group">
                                  <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors">
                                    {React.cloneElement(icon as React.ReactElement, { 
                                      className: cn("w-4 h-4", confidence === 'high' ? "text-on-surface-variant group-focus-within:text-primary-container" : badge[confidence]?.color) 
                                    })}
                                  </div>
                                  <input 
                                    type={type} required 
                                    value={value}
                                    placeholder={placeholder}
                                    onChange={(e) => {
                                      setFormData({ ...formData, [field]: e.target.value });
                                      // Ao editar manualmente, assume-se confiança alta
                                      setFieldConfidence({ ...fieldConfidence, [field]: 'high' });
                                    }}
                                    className={cn(
                                      "w-full border-2 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary-container transition-all shadow-inner",
                                      colors[confidence],
                                      field === 'plate' && "uppercase"
                                    )}
                                  />
                                </div>
                              </div>
                            );
                          };

                          return (
                            <>
                              {renderField("Nome do Cliente", <User />, formData.name, "name", "Nome completo")}
                              {renderField("Telefone / WhatsApp", <Phone />, formData.phone, "phone", "(00) 00000-0000", "tel")}
                              
                              <div className="grid grid-cols-2 gap-6">
                                {renderField("Placa", <Hash />, formData.plate, "plate", "AAA-0000")}
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 ml-1 flex items-center justify-between group/label relative">
                                    Infração
                                    {fieldConfidence['infractionType'] && fieldConfidence['infractionType'] !== 'high' && (
                                      <span className={cn(
                                        "text-[8px] px-1.5 rounded animate-pulse bg-current/10 font-black",
                                        fieldConfidence['infractionType'] === 'medium' ? "text-amber-500" : "text-red-500"
                                      )}>
                                        {fieldConfidence['infractionType'] === 'medium' ? 'Análise Média' : 'Análise Baixa'}
                                      </span>
                                    )}
                                    {/* Tooltip Simulado */}
                                    <div className="absolute right-0 -top-8 px-3 py-2 bg-on-surface text-surface text-[9px] font-bold rounded-lg opacity-0 invisible group-hover/label:opacity-100 group-hover/label:visible transition-all pointer-events-none whitespace-nowrap z-50">
                                      Este dado foi identificado automaticamente com base no texto da multa
                                      <div className="absolute -bottom-1 right-2 w-2 h-2 bg-on-surface rotate-45"></div>
                                    </div>
                                  </label>
                                  <div className="relative group">
                                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors" />
                                    <select 
                                      value={formData.infractionType}
                                      onChange={(e) => {
                                        setFormData({ ...formData, infractionType: e.target.value });
                                        setFieldConfidence({ ...fieldConfidence, infractionType: 'high' });
                                      }}
                                      className="w-full bg-surface/50 border-2 border-surface-container-highest rounded-2xl py-4 pl-14 pr-10 text-sm font-bold text-on-surface focus:outline-none focus:border-primary-container transition-all shadow-inner appearance-none cursor-pointer"
                                    >
                                      <option value="Excesso de velocidade">Excesso de velocidade</option>
                                      <option value="Avanço de sinal">Avanço de sinal</option>
                                      <option value="Lei seca">Lei seca</option>
                                      <option value="Estacionamento irregular">Estacionamento irregular</option>
                                      <option value="Outros">Outros</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                {renderField("Auto (AIN)", <Hash />, formData.autoNumber, "autoNumber", "000000-0")}
                                {renderField("Data da Infração", <Calendar />, formData.infractionDate, "infractionDate", "DD/MM/AAAA")}
                              </div>

                              {renderField("Órgão Autuador", <ShieldCheck />, formData.authority, "authority", "Ex: DETRAN")}

                              {/* Insights Automatizados */}
                              <div className="pt-4 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="w-4 h-4 text-primary-container" />
                                  <p className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">Insights da Defesa IA</p>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                  <div className={cn("p-4 rounded-2xl border border-white/5 flex gap-4 transition-all hover:scale-[1.02] cursor-default", insights.bg)}>
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg", insights.bg, insights.color)}>
                                      <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Gravidade & Pontuação</p>
                                      <p className="text-xs font-black text-on-surface uppercase italic tracking-tight">
                                        {insights.severity} • <span className={insights.color}>{insights.points}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-2xl border border-surface-container-highest bg-surface/30 flex gap-4 transition-all hover:scale-[1.02] cursor-default">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 shadow-lg border border-green-500/20">
                                      <Gavel className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Potencial de Recurso</p>
                                      <p className="text-xs font-bold text-on-surface leading-tight opacity-80">
                                        {insights.appeal}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                          <button 
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setPreviewUrl(null);
                              setFieldConfidence({});
                              setCurrentStep(0);
                            }}
                            className="flex-1 py-5 bg-surface-container-highest/20 border border-surface-container-highest rounded-3xl text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant hover:text-on-surface transition-all"
                          >
                            Reiniciar
                          </button>
                          <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-5 bg-on-surface text-surface rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all disabled:opacity-30"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Zap className="w-5 h-5 fill-current" />
                                Confirmar e Criar Lead
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
