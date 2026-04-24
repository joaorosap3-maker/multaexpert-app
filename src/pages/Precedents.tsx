import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  PlusCircle, 
  Brain, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Target,
  Workflow,
  ArrowRight,
  X,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckSquare,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { Nulidade, initialNulidades } from '@/src/services/nulidadeData';
import { getAdjustedProbability, getUpdatedStats } from '@/src/services/learningService';

export default function Precedents() {
  const [nulidadesList, setNulidadesList] = useState<Nulidade[]>(initialNulidades);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNulidade, setSelectedNulidade] = useState<Nulidade | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Nulidade>>({
    tipo_infracao: 'Velocidade',
    titulo: '',
    tese_principal: '',
    descricao_juridica: '',
    base_legal: '',
    artigos_relacionados: '',
    exemplos_reais: [''],
    palavras_chave: [''],
    orgao_aplicavel: ['DETRAN'],
    probabilidade_sucesso: 85,
    nivel_dificuldade: 'medio',
    observacoes: '',
    ativa: true,
    color: 'blue'
  });

  const filteredNulidades = nulidadesList.filter(item => {
    const matchesSearch = 
      item.tipo_infracao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tese_principal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descricao_juridica.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.base_legal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.palavras_chave.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = !activeFilter || item.tipo_infracao === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(initialNulidades.map(n => n.tipo_infracao)));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const newNulidade: Nulidade = {
      id: crypto.randomUUID(), // Using real UUID format simulation
      titulo: formData.titulo || formData.tese_principal || 'Nova Nulidade',
      tipo_infracao: formData.tipo_infracao || 'Outros',
      tese_principal: formData.tese_principal || '',
      descricao_juridica: formData.descricao_juridica || '',
      base_legal: formData.base_legal || '',
      artigos_relacionados: formData.artigos_relacionados || '',
      palavras_chave: formData.palavras_chave || [],
      probabilidade_sucesso: formData.probabilidade_sucesso || 85,
      nivel_dificuldade: formData.nivel_dificuldade || 'medio',
      exemplos_reais: formData.exemplos_reais || [],
      orgao_aplicavel: formData.orgao_aplicavel || [],
      observacoes: formData.observacoes || '',
      ativa: true,
      color: formData.color || 'blue',
      score_uso: 0,
      taxa_sucesso_real: 0,
      created_at: now,
      updated_at: now,
      embedding: Array(1536).fill(0).map(() => Math.random()) // Mock embedding for AI
    };
    setNulidadesList([newNulidade, ...nulidadesList]);
    setIsNewModalOpen(false);
    setFormData({
      tipo_infracao: 'Velocidade',
      titulo: '',
      tese_principal: '',
      descricao_juridica: '',
      base_legal: '',
      artigos_relacionados: '',
      exemplos_reais: [''],
      palavras_chave: [''],
      orgao_aplicavel: ['DETRAN'],
      probabilidade_sucesso: 85,
      nivel_dificuldade: 'medio',
      observacoes: '',
      ativa: true,
      color: 'blue'
    });
    toast.success('Nova nulidade cadastrada');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNulidade) return;

    const updated = nulidadesList.map(item => 
      item.id === selectedNulidade.id 
        ? { ...item, ...formData as Nulidade, updated_at: new Date().toISOString() } 
        : item
    );
    
    setNulidadesList(updated);
    setIsEditModalOpen(false);
    toast.success('Nulidade atualizada com sucesso');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta nulidade?')) {
      setNulidadesList(nulidadesList.filter(n => n.id !== id));
      toast.error('Nulidade excluída');
    }
  };

  const handleEdit = (item: Nulidade) => {
    setSelectedNulidade(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleView = (item: Nulidade) => {
    setSelectedNulidade(item);
    setIsViewModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      <div className="relative overflow-hidden bg-surface-container rounded-2xl p-10 text-on-surface flex items-center justify-between border border-surface-container-highest shadow-2xl group">
        <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
          <img 
            className="w-full h-full object-cover grayscale" 
            src="https://images.unsplash.com/photo-1620712943543-bcc4628c9bb5?auto=format&fit=crop&q=80&w=1000" 
            alt="AI background" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary-container/30 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <Brain className="text-primary-container w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-on-surface uppercase italic tracking-tighter">Base Estratégica de Nulidades</h2>
            <p className="text-on-surface-variant text-sm max-w-xl mt-3 leading-relaxed font-medium opacity-80">
              Este banco reúne todas as nulidades cadastradas e utilizadas nas análises. Cada nova tese fortalece a base estratégica do sistema, permitindo análises mais consistentes, fundamentadas e alinhadas com casos reais.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-surface/80 backdrop-blur-xl p-4 rounded-xl border border-surface-container-highest shadow-xl">
            <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-60 mb-1">Teses Analisadas</p>
            <p className="text-2xl font-black text-on-surface tracking-tighter">4.2k</p>
          </div>
          <div className="bg-surface/80 backdrop-blur-xl p-4 rounded-xl border border-surface-container-highest shadow-xl">
            <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-60 mb-1">Acurácia IA</p>
            <p className="text-2xl font-black text-green-400 tracking-tighter">92.4%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end gap-6">
        <div className="flex-1">
          <h3 className="text-4xl font-black text-on-surface tracking-tight uppercase italic leading-none">Banco de Nulidades</h3>
          <p className="text-on-surface-variant mt-3 font-medium opacity-70 italic">Repositório centralizado de teses jurídicas e vícios processuais técnicos.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40 group-focus-within:text-primary-container group-focus-within:opacity-100 transition-all" />
            <input 
              type="text" 
              placeholder="Buscar tese ou base legal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-surface-container border border-surface-container-highest rounded-2xl text-xs font-bold uppercase tracking-tight text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary-container/50 w-64 shadow-xl transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "bg-surface-container border border-surface-container-highest px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95",
                activeFilter ? "text-primary-container border-primary-container/50" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Filter className="w-4 h-4" />
              {activeFilter || "Filtros Avançados"}
            </button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-surface-container border border-surface-container-highest rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    <p className="px-4 py-2 text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Categorias</p>
                    <button 
                      onClick={() => { setActiveFilter(null); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-highest transition-colors flex items-center justify-between"
                    >
                      Todas Nulidades
                      {!activeFilter && <Plus className="w-3 h-3 rotate-45 text-primary-container" />}
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { setActiveFilter(cat); setIsFilterOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between",
                          activeFilter === cat ? "bg-primary-container/10 text-primary-container" : "hover:bg-surface-container-highest text-on-surface-variant"
                        )}
                      >
                        {cat}
                        {activeFilter === cat && <Plus className="w-3 h-3 rotate-45" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-container/20 hover:opacity-90 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Nova Nulidade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNulidades.map((item) => {
          const adjustedProb = getAdjustedProbability(item);
          const stats = getUpdatedStats(item.id);
          
          return (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container rounded-3xl border border-surface-container-highest shadow-xl overflow-hidden group hover:border-primary-container/30 transition-all flex flex-col h-full"
            >
              <div className="p-6 space-y-4 flex-1">
                {/* Header Actions */}
                <div className="flex items-start justify-between gap-4">
                  <span className={cn(
                    "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border shrink-0 mt-1",
                    item.color === 'blue' && "bg-blue-400/10 text-blue-400 border-blue-400/20",
                    item.color === 'amber' && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                    item.color === 'purple' && "bg-purple-400/10 text-purple-400 border-purple-400/20",
                    item.color === 'rose' && "bg-rose-400/10 text-rose-400 border-rose-400/20"
                  )}>
                    {item.tipo_infracao}
                  </span>
                  
                  <div className="flex items-center gap-1.5 shrink-0 relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      title="Opções"
                      className="p-2 bg-surface-container-highest/30 border border-surface-container-highest rounded-xl text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all shadow-sm group/btn active:scale-90"
                    >
                      <MoreHorizontal className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === item.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-surface border border-surface-container-highest rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleView(item); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight hover:bg-surface-container-highest transition-colors flex items-center gap-3 text-on-surface-variant hover:text-primary-container"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Visualizar
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(item); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight hover:bg-surface-container-highest transition-colors flex items-center gap-3 text-on-surface-variant hover:text-amber-400"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <div className="h-px bg-surface-container-highest my-1 mx-2"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500 transition-colors flex items-center gap-3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h4 className="text-sm font-black text-on-surface uppercase tracking-tight italic group-hover:text-primary-container transition-colors line-clamp-2 min-h-[2.5rem] leading-tight">
                    {item.titulo || item.tese_principal}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-3 font-medium opacity-70 leading-relaxed line-clamp-3">
                    {item.descricao_juridica}
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap gap-1">
                  <div className="font-mono text-[8px] text-primary-container bg-primary-container/5 px-2 py-1 rounded border border-primary-container/10 truncate max-w-full">
                    {item.base_legal}
                  </div>
                  {item.palavras_chave.slice(0, 3).map(kw => (
                    <span key={kw} className="text-[8px] font-bold text-on-surface-variant/40 bg-surface-container-highest px-1.5 py-0.5 rounded">#{kw}</span>
                  ))}
                </div>
              </div>

              {/* Success Stats Footer */}
              <div className="px-6 py-4 bg-surface-container-highest/20 border-t border-surface-container-highest mt-auto">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest">Uso</span>
                        <span className="text-[10px] font-black text-on-surface">{stats.score_uso}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest">Real</span>
                        <span className="text-[10px] font-black text-green-400">{stats.taxa_sucesso_real}%</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest">Probabilidade IA</span>
                      <p className={cn("text-xs font-black italic", adjustedProb > 90 ? "text-green-400" : adjustedProb > 80 ? "text-primary-container" : "text-amber-400")}>
                        {adjustedProb}%
                      </p>
                   </div>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${adjustedProb}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn("h-full", adjustedProb > 90 ? "bg-green-400" : adjustedProb > 80 ? "bg-primary-container" : "bg-amber-400")}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-surface-container rounded-2xl shadow-2xl border border-surface-container-highest overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-highest/20 border-t border-surface-container-highest flex items-center justify-between">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">Exibindo {filteredNulidades.length} de {initialNulidades.length + (nulidadesList.length - initialNulidades.length)} nulidades técnicas</p>
          <div className="flex gap-3">
            <button className="p-2 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface-variant hover:text-on-surface transition-all disabled:opacity-20" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface-variant hover:text-on-surface transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        {[
          { title: 'Treinamento Contínuo', desc: 'A cada recurso vencido usando uma nulidade, a IA aumenta o peso dessa tese em recomendações automáticas para casos similares.', icon: TrendingUp, color: 'blue', action: 'Ver histórico de reforço' },
          { title: 'Análise de Órgão', desc: 'A IA detecta quais JARI ou CETRAN têm maior aceitação para cada tipo de nulidade técnica específica.', icon: Target, color: 'green', action: 'Mapa de calor de aceitação' },
          { title: 'Feedback de Sentenças', desc: 'O processamento de linguagem natural lê as decisões e identifica palavras-chave que convencem os julgadores.', icon: Workflow, color: 'purple', action: 'Extração de Keywords' }
        ].map((feat, i) => (
          <div key={i} className="bg-surface-container p-8 rounded-2xl border border-surface-container-highest shadow-xl flex flex-col gap-5 group relative overflow-hidden active:scale-[0.98] transition-transform">
            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity", `bg-${feat.color}-400`)}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-2.5 rounded-xl border flex items-center justify-center shadow-lg", `bg-${feat.color}-400/10 text-${feat.color}-400 border-${feat.color}-400/20`)}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-on-surface uppercase tracking-tight italic leading-none">{feat.title}</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium opacity-70 relative z-10">{feat.desc}</p>
            <button className="mt-8 pt-6 border-t border-surface-container-highest/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-primary-container transition-all relative z-10">
              {feat.action}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </button>
          </div>
        ))}
      </div>

      {/* New Nulity Modal */}
      <AnimatePresence>
        {isNewModalOpen && (
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
                     <PlusCircle className="w-6 h-6 text-primary-container" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Cadastrar Nova Nulidade</h2>
                     <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Adicionar tese ao banco de dados</p>
                   </div>
                 </div>
                 <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                   <X className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </header>

              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tipo de Infração</label>
                    <select 
                      value={formData.tipo_infracao}
                      onChange={(e) => setFormData({...formData, tipo_infracao: e.target.value})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container appearance-none"
                    >
                      <option>Velocidade</option>
                      <option>Lei Seca</option>
                      <option>Estacionamento</option>
                      <option>Sinalização</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Órgãos Aplicáveis</label>
                    <input 
                      type="text" 
                      placeholder="Ex: DETRAN, PRF (separados por vírgula)"
                      required
                      value={formData.orgao_aplicavel?.join(', ')}
                      onChange={(e) => setFormData({...formData, orgao_aplicavel: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Título da Nulidade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Ausência de Aferição INMETRO (Radar)"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tese Principal (Resumo)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Ausência de Aferição INMETRO"
                    required
                    value={formData.tese_principal}
                    onChange={(e) => setFormData({...formData, tese_principal: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Descrição Jurídica Detalhada</label>
                  <textarea 
                    placeholder="Explique a fundamentação jurídica da nulidade..."
                    rows={3}
                    required
                    value={formData.descricao_juridica}
                    onChange={(e) => setFormData({...formData, descricao_juridica: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Base Legal Completa</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Res. CONTRAN 798/20, Art. 3º"
                      required
                      value={formData.base_legal}
                      onChange={(e) => setFormData({...formData, base_legal: e.target.value})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Palavras-Chave</label>
                    <input 
                      type="text" 
                      placeholder="metrologia, aferição..."
                      required
                      value={formData.palavras_chave?.join(', ')}
                      onChange={(e) => setFormData({...formData, palavras_chave: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Exemplo Real de Aplicação</label>
                  <input 
                    type="text" 
                    placeholder="Descreva um caso onde essa tese funcionou..."
                    required
                    value={formData.exemplos_reais?.[0]}
                    onChange={(e) => setFormData({...formData, exemplos_reais: [e.target.value]})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                  />
                </div>

                <div className="p-4 bg-primary-container/5 rounded-2xl border border-primary-container/10">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-primary-container uppercase tracking-widest">Probabilidade de Sucesso (IA)</label>
                    <span className="text-sm font-black text-primary-container italic">{formData.probabilidade_sucesso}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="99" 
                    value={formData.probabilidade_sucesso}
                    onChange={(e) => setFormData({...formData, probabilidade_sucesso: parseInt(e.target.value)})}
                    className="w-full accent-primary-container" 
                  />
                </div>

                <div className="flex items-center gap-2 text-[8px] font-black text-primary-container uppercase tracking-widest bg-primary-container/5 p-3 rounded-xl border border-primary-container/10">
                  <Brain className="w-3 h-3" />
                  Embeddings de 1536 dimensões serão gerados automaticamente para busca semântica.
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary-container text-on-primary-container rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Sincronizar com Core-IA
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Nulity Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedNulidade && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest flex flex-col"
            >
              <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-highest/10 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                     <Pencil className="w-6 h-6 text-amber-400" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">Editar Nulidade</h2>
                     <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">#ID: {selectedNulidade.id.slice(0, 8)}</p>
                   </div>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                   <X className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </header>

              <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tipo de Infração</label>
                    <select 
                      value={formData.tipo_infracao}
                      onChange={(e) => setFormData({...formData, tipo_infracao: e.target.value})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container appearance-none"
                    >
                      <option>Velocidade</option>
                      <option>Lei Seca</option>
                      <option>Estacionamento</option>
                      <option>Sinalização</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Órgãos Aplicáveis</label>
                    <input 
                      type="text" 
                      placeholder="Ex: DETRAN, PRF"
                      required
                      value={formData.orgao_aplicavel?.join(', ')}
                      onChange={(e) => setFormData({...formData, orgao_aplicavel: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Título da Nulidade</label>
                  <input 
                    type="text" 
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Tese Principal</label>
                  <input 
                    type="text" 
                    required
                    value={formData.tese_principal}
                    onChange={(e) => setFormData({...formData, tese_principal: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Descrição Jurídica</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.descricao_juridica}
                    onChange={(e) => setFormData({...formData, descricao_juridica: e.target.value})}
                    className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Base Legal</label>
                    <input 
                      type="text" 
                      required
                      value={formData.base_legal}
                      onChange={(e) => setFormData({...formData, base_legal: e.target.value})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 ml-1">Palavras-Chave</label>
                    <input 
                      type="text" 
                      required
                      value={formData.palavras_chave?.join(', ')}
                      onChange={(e) => setFormData({...formData, palavras_chave: e.target.value.split(',').map(s => s.trim())})}
                      className="w-full bg-surface border border-surface-container-highest rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary-container" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-amber-400 text-on-surface rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
                >
                  Salvar Alterações
                  <CheckSquare className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Nulity Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedNulidade && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl border border-surface-container-highest flex flex-col"
            >
              <header className="px-8 py-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-highest/10 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center border",
                     selectedNulidade.color === 'blue' && "bg-blue-400/10 text-blue-400 border-blue-400/20",
                     selectedNulidade.color === 'amber' && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                     selectedNulidade.color === 'purple' && "bg-purple-400/10 text-purple-400 border-purple-400/20",
                     selectedNulidade.color === 'rose' && "bg-rose-400/10 text-rose-400 border-rose-400/20"
                   )}>
                     <Database className="w-6 h-6" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter leading-none">{selectedNulidade.tipo_infracao}</h2>
                     <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-50">Exploração Técnica Detalhada</p>
                   </div>
                 </div>
                 <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-xl transition-all">
                   <X className="w-5 h-5 text-on-surface-variant" />
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter leading-tight">
                    {selectedNulidade.titulo || selectedNulidade.tese_principal}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedNulidade.orgao_aplicavel.map(o => (
                      <span key={o} className="text-[8px] font-black text-primary-container bg-primary-container/10 px-2 py-1 rounded-lg border border-primary-container/20 uppercase tracking-widest">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface p-4 rounded-2xl border border-surface-container-highest">
                    <p className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 mb-1">Taxa de Sucesso</p>
                    <p className="text-xl font-black text-green-400">{getAdjustedProbability(selectedNulidade)}%</p>
                  </div>
                  <div className="bg-surface p-4 rounded-2xl border border-surface-container-highest">
                    <p className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 mb-1">Total de Usos</p>
                    <p className="text-xl font-black text-on-surface">{selectedNulidade.score_uso}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-2xl border border-surface-container-highest">
                    <p className="text-[8px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 mb-1">Dificuldade</p>
                    <p className="text-xl font-black text-primary-container uppercase italic tracking-tighter">{selectedNulidade.nivel_dificuldade}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-on-surface uppercase tracking-widest opacity-40">Fundamentação Jurídica</p>
                     <div className="bg-surface p-6 rounded-2xl border border-surface-container-highest text-sm text-on-surface-variant leading-relaxed font-medium">
                       {selectedNulidade.descricao_juridica}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-on-surface uppercase tracking-widest opacity-40">Base Legal</p>
                        <div className="bg-primary-container/5 p-4 rounded-2xl border border-primary-container/10 font-mono text-[11px] text-primary-container font-black">
                          {selectedNulidade.base_legal}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-on-surface uppercase tracking-widest opacity-40">Tags Técnicas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNulidade.palavras_chave.map(kw => (
                            <span key={kw} className="bg-surface-container-highest px-3 py-1.5 rounded-lg text-[9px] font-black text-on-surface-variant uppercase tracking-widest">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                   </div>

                   {selectedNulidade.exemplos_reais.length > 0 && (
                     <div className="space-y-2">
                       <p className="text-[10px] font-black text-on-surface uppercase tracking-widest opacity-40">Caso Exemplar</p>
                       <div className="bg-amber-400/5 p-6 rounded-2xl border border-amber-400/10 text-xs italic text-on-surface-variant/80 leading-relaxed font-medium">
                         "{selectedNulidade.exemplos_reais[0]}"
                       </div>
                     </div>
                   )}
                </div>
              </div>

              <footer className="p-8 border-t border-surface-container-highest bg-surface-container-highest/10 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-8 py-3 bg-surface border border-surface-container-highest text-on-surface-variant rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-container transition-all active:scale-95"
                >
                  Fechar Visualização
                </button>
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedNulidade);
                  }}
                  className="px-8 py-3 bg-primary-container text-on-primary-container rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-container/20 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar tese
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
