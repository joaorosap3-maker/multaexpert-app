import React, { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Car, 
  Clock, 
  MessageSquare, 
  Calendar,
  History,
  Filter,
  LayoutGrid,
  List as ListIcon,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ProcessDetailsDrawer from '../components/modals/ProcessDetailsDrawer';
import { supabase } from '@/src/lib/supabaseClient';
import { useAuth } from '@/src/context/AuthContext';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from '@hello-pangea/dnd';

const columns = [
  { id: 'start', title: 'Entrada', color: 'bg-slate-500' },
  { id: 'analysis', title: 'Em Análise', color: 'bg-blue-400' },
  { id: 'proposal', title: 'Proposta Enviada', color: 'bg-indigo-400' },
  { id: 'awaiting_client', title: 'Aguardando Cliente', color: 'bg-amber-400' },
  { id: 'finalized', title: 'Concluído', color: 'bg-emerald-400' },
];

interface LeadCardProps {
  lead: any;
  onClick: () => void;
  isGrid: boolean;
  innerRef?: any;
  draggableProps?: any;
  dragHandleProps?: any;
}

function LeadCard({ lead, onClick, isGrid, innerRef, draggableProps, dragHandleProps }: LeadCardProps) {
  const priorityColors: Record<string, string> = {
    'Urgente': 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    'Crítica': 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    'Alta': 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    'Média': 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    'Padrão': 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  };

  const statusBorderColors: Record<string, string> = {
    'start': 'border-l-slate-400',
    'analysis': 'border-l-blue-400',
    'proposal': 'border-l-indigo-400',
    'awaiting_client': 'border-l-amber-400',
    'finalized': 'border-l-emerald-400',
  };

  return (
    <motion.div 
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-surface-container border-l-[6px] rounded-[28px] shadow-xl hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group relative overflow-hidden",
        isGrid ? "p-5" : "p-4 flex items-center gap-8 w-full",
        statusBorderColors[lead.column] || 'border-l-primary-container',
        "border-t border-r border-b border-surface-container-highest"
      )}
    >
      <div className={cn("flex flex-col", isGrid ? "w-full" : "flex-1")}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
             <span className={cn(
              "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-[0.1em] w-fit border",
              priorityColors[lead.priority] || "bg-surface-container-highest text-on-surface-variant border-surface-container-highest"
            )}>
              {lead.priority}
            </span>
            <span className="text-[9px] text-on-surface-variant font-black opacity-30 group-hover:opacity-100 transition-opacity uppercase tracking-widest mt-1">
              #{lead.id}
            </span>
          </div>
          
          <div className="flex -space-x-1.5 shrink-0">
            {lead.billings && lead.billings.length > 0 && (
              <div className={cn(
                "w-8 h-8 rounded-xl border-2 border-surface-container shadow-2xl flex items-center justify-center mr-2",
                lead.billings[lead.billings.length - 1].status === 'Pago' && "bg-green-400 text-white",
                lead.billings[lead.billings.length - 1].status === 'Pendente' && "bg-amber-400 text-white",
                lead.billings[lead.billings.length - 1].status === 'Atrasado' && "bg-rose-400 text-white",
                lead.billings[lead.billings.length - 1].status === 'Cancelado' && "bg-slate-400 text-white",
              )} title={`Pagamento: ${lead.billings[lead.billings.length - 1].status}`}>
                <DollarSign className="w-4 h-4" />
              </div>
            )}
            {lead.avatar ? (
              <img src={lead.avatar} className="w-8 h-8 rounded-xl border-2 border-surface-container shadow-2xl object-cover" alt={lead.name} />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[10px] text-on-surface-variant font-black shadow-2xl uppercase">
                {lead.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        <div className={cn("flex flex-col gap-3", !isGrid && "md:flex-row md:items-center md:gap-8")}>
          <div className="flex flex-col">
            <h4 className={cn(
              "text-xs font-black text-on-surface group-hover:text-primary-container transition-colors uppercase tracking-tight italic leading-none truncate",
              isGrid ? "max-w-[180px]" : "max-w-[250px]"
            )}>
              {lead.name}
            </h4>
            
            <div className="flex items-center gap-2 text-on-surface-variant opacity-60 mt-1.5">
              <Car className="w-3 h-3" />
              <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase">{lead.plate}</span>
            </div>
          </div>
        </div>
        
        {isGrid && lead.observations && (
          <div className="mt-3 p-3 bg-surface-container-highest/20 rounded-xl text-[9px] text-on-surface-variant italic leading-relaxed line-clamp-1 border border-surface-container-highest/30">
            {lead.observations}
          </div>
        )}

        <div className={cn("flex items-center justify-between pt-3 mt-3 border-t border-surface-container-highest/50", !isGrid && "mt-0")}>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-on-surface-variant uppercase opacity-30 tracking-widest">Auto:</span>
            <span className="text-[10px] font-bold text-on-surface/80 font-mono italic">#{lead.autoNumber}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-on-surface-variant opacity-30" />
            <span className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">
              {lead.time || 'Agora'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Pipeline() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('Todos');

  // Carregar leads do Supabase
  useEffect(() => {
    const loadLeads = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar leads:', error);
          throw error;
        }

        console.log('Leads carregados:', data);
        setLeads(data || []);
      } catch (error) {
        console.error('Erro ao buscar leads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [user]);

  const handleLeadClick = (lead: any) => {
    setSelectedCaseId(String(lead.id));
    setIsDrawerOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      // Update the lead status in Supabase based on column ID
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: destination.droppableId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
      }

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === draggableId 
          ? { ...lead, status: destination.droppableId }
          : lead
      ));

      console.log('Lead atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao mover lead:', error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (priorityFilter !== 'Todos' && lead.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-140px)]"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex text-[10px] text-on-surface-variant gap-2 mb-2 uppercase font-black tracking-widest opacity-60">
            <span>Multa Expert</span>
            <span>/</span>
            <span className="text-primary-container">Pipeline</span>
          </nav>
          <h2 className="text-3xl font-bold text-on-surface uppercase tracking-tight italic">Fluxo de Ativos</h2>
        </div>
        <div className="flex gap-3 relative">
          <div className="flex bg-surface-container p-1 rounded-xl border border-surface-container-highest shadow-sm">
            <button 
              onClick={() => setViewType('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewType === 'grid' ? "bg-surface-container-highest shadow-lg text-primary-container" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewType === 'list' ? "bg-surface-container-highest shadow-lg text-primary-container" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-surface-container border border-surface-container-highest rounded-xl text-xs font-bold transition-all uppercase tracking-widest shadow-sm",
                showFilters ? "text-primary-container border-primary-container/30" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {priorityFilter !== 'Todos' && (
                <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse ml-1" />
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container border border-surface-container-highest rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 opacity-50">Prioridade</p>
                <div className="space-y-2">
                  {['Todos', 'Urgente', 'Alta', 'Média', 'Padrão'].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPriorityFilter(p);
                        setShowFilters(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                        priorityFilter === p ? "bg-primary-container/10 text-primary-container" : "text-on-surface-variant hover:bg-surface-container-highest"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className={cn(
            "flex h-full min-w-max px-1",
            viewType === 'grid' ? "gap-8" : "flex-col gap-10"
          )}>
            {columns.map((column) => {
              const columnLeads = filteredLeads.filter((lead) => lead.status === column.id);
              
              if (viewType === 'list') {
                return (
                  <div key={column.id} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-4">
                      <span className={cn("w-3 h-3 rounded-full", column.color)}></span>
                      <h3 className="text-xs font-black text-on-surface uppercase tracking-widest">{column.title}</h3>
                      <span className="text-[10px] text-on-surface-variant font-bold opacity-50 px-2 bg-surface-container rounded-lg border border-surface-container-highest">
                        {columnLeads.length}
                      </span>
                    </div>
                    <Droppable droppableId={column.id} direction="horizontal">
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 min-h-[50px]"
                        >
                          {columnLeads.map((lead, index) => (
                            // @ts-ignore
                            <Draggable key={String(lead.id)} draggableId={String(lead.id)} index={index}>
                              {(provided) => (
                                <LeadCard 
                                  lead={lead} 
                                  onClick={() => handleLeadClick(lead)} 
                                  isGrid={false}
                                  innerRef={provided.innerRef}
                                  draggableProps={provided.draggableProps}
                                  dragHandleProps={provided.dragHandleProps}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              }

              return (
                <div key={column.id} className="w-[300px] flex flex-col gap-6">
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] relative", column.color)}>
                        <div className={cn("absolute inset-0 rounded-full blur-md opacity-40 animate-pulse", column.color)}></div>
                      </div>
                      <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">{column.title}</h3>
                      <div className="bg-surface-container-highest/50 text-on-surface-variant text-[10px] px-2 py-0.5 rounded-lg font-black border border-white/5 backdrop-blur-sm">
                        {columnLeads.length}
                      </div>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex flex-col gap-3 h-full p-1 transition-colors rounded-2xl",
                          snapshot.isDraggingOver ? "bg-primary-container/5" : ""
                        )}
                      >
                        {columnLeads.map((lead, index) => (
                          // @ts-ignore
                          <Draggable key={String(lead.id)} draggableId={String(lead.id)} index={index}>
                            {(provided) => (
                              <LeadCard 
                                lead={lead} 
                                onClick={() => handleLeadClick(lead)} 
                                isGrid={true}
                                innerRef={provided.innerRef}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {column.id === 'finalized' && columnLeads.length === 0 && (
                          <div className="h-40 border-2 border-dashed border-surface-container-highest/20 rounded-2xl flex items-center justify-center p-8 opacity-10">
                            <History className="w-10 h-10 text-on-surface-variant" />
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      <ProcessDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        caseId={selectedCaseId} 
      />
    </motion.div>
  );
}
