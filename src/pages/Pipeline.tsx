import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import ProcessDetailsDrawer from '../components/modals/ProcessDetailsDrawer';

// colunas FIXAS
const columns = [
  { id: 'novo', title: 'Entrada' },
  { id: 'em_analise', title: 'Em Análise' },
  { id: 'em_andamento', title: 'Em Andamento' },
  { id: 'proposta_enviada', title: 'Proposta Enviada' },
  { id: 'aguardando_cliente', title: 'Aguardando Cliente' },
  { id: 'concluido', title: 'Concluído' },
];

export default function Pipeline() {
  const { user } = useAuth();

  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const companyId = userData?.company_id;

      const { data: stagesData } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('company_id', companyId)
        .order('position', { ascending: true });

      setStages(stagesData || []);

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);

      setLoading(false);
    };

    loadData();
  }, [user]);

  // DRAG
  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const stage = stages.find(s => s.slug === destination.droppableId);
    if (!stage) return;

    await supabase
      .from('leads')
      .update({ stage_id: stage.id })
      .eq('id', draggableId);

    setLeads(prev =>
      prev.map(l =>
        String(l.id) === String(draggableId)
          ? { ...l, stage_id: stage.id }
          : l
      )
    );
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-premium text-white/60">
        Carregando...
      </div>
    );
  }

  return (
    <motion.div className="p-6 bg-premium min-h-screen">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map(column => {
              const columnLeads = leads.filter(lead => {
                const stage = stages.find(
                  s => String(s.id) === String(lead.stage_id)
                );
                return stage?.slug === column.id;
              });

              return (
                <div key={column.id} className="w-[260px] flex-shrink-0">
                  {/* TÍTULO */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white whitespace-nowrap">
                      {column.title}
                    </h3>

                    <span className="badge-glass px-3 py-1.5 text-xs font-medium">
                      {columnLeads.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-5 min-h-[400px]"
                      >
                        {columnLeads.map((lead, index) => (
                          <Draggable
                            key={String(lead.id)}
                            draggableId={String(lead.id)}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const stage = stages.find(s => s.id === lead.stage_id);

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedLead(lead)}
                                  className={`
                                    card-glass p-5 cursor-pointer min-h-[120px]
                                    transition-all duration-200
                                    ${
                                      snapshot.isDragging
                                        ? 'scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                                        : 'shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:ring-1 hover:ring-white/10'
                                    }
                                  `}
                                >
                                  {/* ETAPA */}
                                  <div className="flex justify-between items-center mb-4">
                                    <span className="badge-glass px-3 py-1.5 text-xs font-medium">
                                      {stage?.name || 'Sem etapa'}
                                    </span>
                                  </div>

                                  {/* NOME */}
                                  <p className="text-[14px] font-bold text-white mb-2">
                                    {lead.name || lead.full_name || 'Sem nome'}
                                  </p>

                                  {/* PLACA */}
                                  <p className="text-xs text-white/60 mb-4">
                                    {lead.plate || 'Sem placa'}
                                  </p>

                                  {/* FOOTER */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-white/40">
                                      ID: {lead.id?.slice(0, 6)}
                                    </span>

                                    <span className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                      Abrir →
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        ))}

                        {provided.placeholder}
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
        isOpen={!!selectedLead}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </motion.div>
  );
}