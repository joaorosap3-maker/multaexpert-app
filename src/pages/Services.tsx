import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Edit3, 
  Copy, 
  ChevronDown,
  Users,
  Box,
  Calendar,
  Filter as FilterIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useCases, Service } from '../contexts/CaseContext';
import ServiceDetailModal from '../components/modals/ServiceDetailModal';
import NewServiceModal from '../components/modals/NewServiceModal';

export default function Services() {
  const { services } = useCases();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeAudience, setActiveAudience] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(services.map(s => s.category)))];
  const audiences = ['Todos', 'Motoboy', 'Motorista de App', 'Cliente Comum'];

  const filteredServices = services.filter(s => {
    const catMatch = activeCategory === 'Todos' || s.category === activeCategory;
    const audienceMatch = activeAudience === 'Todos' || s.targetAudience === activeAudience;
    return catMatch && audienceMatch;
  });

  const handleCardClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight uppercase italic leading-none">Catálogo</h2>
          <p className="text-on-surface-variant mt-3 font-medium opacity-70 italic">Gerencie seu portfólio de serviços e soluções jurídicas.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-container/20 hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mr-2">Público-Alvo:</span>
          {audiences.map(aud => (
            <button 
              key={aud} 
              onClick={() => setActiveAudience(aud)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                activeAudience === aud 
                  ? "bg-primary-container text-on-primary-container border-primary-container shadow-lg" 
                  : "bg-surface-container border-surface-container-highest text-on-surface-variant hover:text-on-surface"
              )}
            >
              {aud}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mr-2">Categoria:</span>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                activeCategory === cat 
                  ? "bg-on-surface text-surface border-on-surface shadow-lg" 
                  : "bg-surface border-surface-container-highest text-on-surface-variant hover:text-on-surface"
              )}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border border-surface-container-highest rounded-xl text-[10px] text-on-surface font-black uppercase tracking-widest shadow-sm">
              Mais Filtros
              <FilterIcon className="w-3 h-3 text-primary-container" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div 
            key={service.id} 
            onClick={() => handleCardClick(service)}
            className="bg-surface-container rounded-[24px] border border-surface-container-highest shadow-xl hover:shadow-primary-container/10 transition-all group relative overflow-hidden flex flex-col active:scale-[0.98] cursor-pointer"
          >
            <div className={cn("h-1.5 w-full", `bg-${service.color}-400`)}></div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1.5">
                  <span className={cn(
                    "w-fit text-[9px] uppercase font-black px-2.5 py-1 rounded-full tracking-widest border",
                    `bg-${service.color}-400/10 text-${service.color}-400 border-${service.color}-400/20`
                  )}>
                    {service.category}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-on-surface-variant/40 flex items-center gap-1.5">
                    <Users className="w-2.5 h-2.5" />
                    {service.targetAudience}
                  </span>
                </div>
                {service.billingType !== 'unitário' && (
                  <div className="px-2.5 py-1 bg-on-surface text-surface rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    {service.billingType === 'recorrente' ? <Calendar className="w-2.5 h-2.5" /> : <Box className="w-2.5 h-2.5" />}
                    {service.billingType}
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-on-surface mb-3 uppercase italic tracking-tighter leading-tight group-hover:text-primary-container transition-colors">{service.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed opacity-60 line-clamp-2 mb-8">
                {service.desc}
              </p>

              <div className="grid grid-cols-2 gap-6 mt-auto pt-8 border-t border-surface-container-highest/50">
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 mb-2">Investimento</p>
                  <p className="text-xl font-black text-on-surface tracking-tighter leading-none flex items-baseline gap-1">
                    <span className="text-xs">R$</span>
                    {service.billingType === 'recorrente' ? service.recurrenceInfo?.monthlyValue?.toFixed(2) || '0.00' : service.price?.toFixed(2) || '0.00'}
                    {service.billingType === 'recorrente' && <span className="text-[10px] opacity-40 font-bold uppercase">/mês</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 mb-2">SLA Médio</p>
                  <div className="flex items-center justify-end gap-2 text-on-surface font-black text-xs uppercase tracking-tighter">
                    <Clock className="w-3 h-3 text-primary-container" />
                    {service.sla}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="border-2 border-dashed border-surface-container-highest rounded-[24px] flex flex-col items-center justify-center p-10 hover:border-primary-container hover:bg-primary-container/5 transition-all group active:scale-95 bg-surface/50"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface-container border border-surface-container-highest group-hover:bg-primary-container/10 group-hover:border-primary-container/50 flex items-center justify-center mb-6 transition-all shadow-xl group-hover:shadow-primary-container/20">
            <Plus className="w-8 h-8 text-on-surface-variant group-hover:text-primary-container" />
          </div>
          <span className="text-on-surface font-black uppercase tracking-widest text-xs italic">Novo Serviço</span>
          <span className="text-[10px] text-on-surface-variant mt-2 text-center font-bold opacity-50 uppercase tracking-tighter">Expanda seu leque operacional</span>
        </button>
      </div>

      <ServiceDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />

      <NewServiceModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </motion.div>
  );
}
