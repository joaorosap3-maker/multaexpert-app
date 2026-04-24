import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Plus, 
  X, 
  Trash2, 
  Eye, 
  Brain,
  FileSearch,
  Database,
  ShieldCheck,
  FileStack
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useKnowledge, KnowledgeDocument } from '@/src/contexts/KnowledgeContext';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const { documents, addDocument, deleteDocument } = useKnowledge();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  
  const [formData, setFormData] = useState<Partial<KnowledgeDocument>>({
    title: '',
    type: 'lei',
    content: '',
    category: 'Geral',
    tags: []
  });

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = !activeFilter || doc.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    addDocument({
      title: formData.title,
      type: formData.type as any,
      content: formData.content,
      category: formData.category || 'Geral',
      tags: formData.tags || []
    });

    setIsUploadModalOpen(false);
    setFormData({ title: '', type: 'lei', content: '', category: 'Geral', tags: [] });
    toast.success('Documento adicionado à base de conhecimento');
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'lei': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: ShieldCheck };
      case 'processo': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: FileStack };
      case 'edital': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: FileSearch };
      case 'nulidade': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: Brain };
      default: return { bg: 'bg-surface-container-highest/20', text: 'text-on-surface-variant', border: 'border-surface-container-highest/30', icon: FileText };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-surface-container rounded-2xl p-10 text-on-surface flex items-center justify-between border border-surface-container-highest shadow-2xl group">
        <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
          <img 
            className="w-full h-full object-cover grayscale" 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
            alt="AI context background" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <BookOpen className="text-indigo-400 w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-on-surface uppercase italic tracking-tighter">Base de Conhecimento IA</h2>
            <p className="text-on-surface-variant text-sm max-w-xl mt-3 font-medium opacity-80 leading-relaxed">
              Expanda o cérebro da nossa IA. Carregue leis, editais e precedentes para que as análises automáticas utilizem dados reais e atualizados como contexto.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-3 text-right">
          <div className="bg-surface/80 backdrop-blur-xl p-4 rounded-xl border border-surface-container-highest shadow-xl">
            <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-60 mb-1">Total de Contextos</p>
            <p className="text-2xl font-black text-on-surface tracking-tighter">{documents.length}</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-on-surface tracking-tight uppercase italic leading-none">Repositório de Inteligência</h3>
          <p className="text-on-surface-variant mt-2 text-xs font-bold uppercase tracking-widest opacity-40">Documentação e Contexto Semanticamente Indexados</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40 group-focus-within:text-indigo-400 group-focus-within:opacity-100 transition-all" />
            <input 
              type="text" 
              placeholder="Pesquisar na base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-surface-container border border-surface-container-highest rounded-2xl text-xs font-bold uppercase tracking-tight text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-indigo-500/50 w-full md:w-64 shadow-xl transition-all"
            />
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/20 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            Alimentar IA
          </button>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Todos', value: null },
          { label: 'Leis/Resoluções', value: 'lei' },
          { label: 'Editais', value: 'edital' },
          { label: 'Sentenças/Processos', value: 'processo' },
          { label: 'Nulidades Técnicas', value: 'nulidade' }
        ].map((btn) => (
          <button 
            key={btn.label}
            onClick={() => setActiveFilter(btn.value)}
            className={cn(
              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
              activeFilter === btn.value
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-surface-container border-surface-container-highest text-on-surface-variant hover:text-on-surface"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.map((doc) => {
          const st = getTypeStyles(doc.type);
          const Icon = st.icon;
          return (
            <motion.div 
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container rounded-3xl border border-surface-container-highest shadow-lg overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col h-full"
            >
              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest", st.bg, st.text, st.border)}>
                    <Icon className="w-3 h-3" />
                    {doc.type}
                  </div>
                  <button 
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-sm font-black text-on-surface uppercase tracking-tight italic leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-3 font-medium opacity-70 leading-relaxed line-clamp-4">
                    {doc.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {doc.tags.map(t => (
                    <span key={t} className="text-[8px] font-bold text-indigo-400/60 bg-indigo-400/5 px-2 py-0.5 rounded border border-indigo-400/10">#{t}</span>
                  ))}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-surface-container-highest/20 border-t border-surface-container-highest mt-auto flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{doc.date}</span>
                <button 
                  onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Visualizar Conteúdo
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Empty State / Add New Card */}
        <motion.button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-surface-container-highest/10 border-2 border-dashed border-surface-container-highest rounded-3xl flex flex-col items-center justify-center p-12 group hover:border-indigo-500/50 transition-all gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-indigo-400 transition-all">
            <Plus className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-on-surface uppercase tracking-widest">Novo Documento</p>
            <p className="text-[10px] text-on-surface-variant mt-1 font-bold">Adicione contexto para a IA</p>
          </div>
        </motion.button>
      </div>

      {/* Upload/Creation Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest flex flex-col"
            >
              <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-indigo-500/5 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                     <Upload className="w-6 h-6" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Alimentar Base de Conhecimento</h2>
                     <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Upload de documentos e extração de contexto</p>
                   </div>
                 </div>
                 <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                   <X className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </header>

              <form onSubmit={handleUpload} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tipo de Documento</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 appearance-none"
                    >
                      <option value="lei">Lei / Resolução</option>
                      <option value="edital">Edital / Notificação</option>
                      <option value="processo">Sentença / Processo</option>
                      <option value="nulidade">Nulidade Técnica</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Categoria Técnica</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Lei Seca, Velocidade..."
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Título do Documento</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Resolução CONTRAN nº 918/2022"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">Conteúdo / Texto Extraído</label>
                    <button type="button" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Simular OCR</button>
                  </div>
                  <textarea 
                    placeholder="Cole aqui o texto completo ou extraído do documento..."
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-3xl px-6 py-5 text-sm font-medium leading-relaxed focus:outline-none focus:border-indigo-500 resize-none shadow-inner" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Palavras-Chave (Tags)</label>
                  <input 
                    type="text" 
                    placeholder="Separe por vírgulas: radar, inmetro, prescrição..."
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500" 
                  />
                </div>

                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant italic leading-tight">
                    Ao salvar, nossa IA processará este texto para criar uma memória semântica, facilitando a recuperação em futuras análises de casos.
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
                >
                  Indexar Documento
                  <BookOpen className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl border border-surface-container-highest flex flex-col"
            >
              <header className="px-10 py-8 border-b border-surface-container-highest flex justify-between items-center bg-indigo-500/5 shrink-0">
                 <div className="flex items-center gap-6">
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", getTypeStyles(selectedDoc.type).bg, getTypeStyles(selectedDoc.type).text)}>
                     <Database className="w-7 h-7" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter leading-none">{selectedDoc.title}</h2>
                     <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{selectedDoc.category}</span>
                       <span className="w-1 h-1 rounded-full bg-on-surface-variant opacity-20"></span>
                       <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">{selectedDoc.date}</span>
                     </div>
                   </div>
                 </div>
                 <button onClick={() => setIsViewModalOpen(false)} className="p-3 hover:bg-surface-container-highest rounded-2xl transition-all">
                   <X className="w-6 h-6 text-on-surface-variant" />
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="bg-surface p-8 rounded-3xl border border-surface-container-highest shadow-inner">
                   <pre className="whitespace-pre-wrap font-sans text-sm text-on-surface-variant leading-relaxed font-medium">
                     {selectedDoc.content}
                   </pre>
                </div>
              </div>

              <footer className="px-10 py-6 border-t border-surface-container-highest flex items-center justify-between gap-4 bg-surface-container-highest/10">
                <div className="flex items-center gap-2">
                  {selectedDoc.tags.map(t => (
                    <span key={t} className="bg-indigo-500/10 px-3 py-1.5 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      #{t}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-10 py-3 bg-surface-container-highest text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all"
                >
                  Fechar Visualização
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
