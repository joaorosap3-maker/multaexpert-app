// Supabase Service - Integração completa com o backend
import { supabase } from '@/src/lib/supabaseClient';

// Types baseados no schema
export interface Company {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  address?: string;
  plan: string;
  max_users: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  permissions: Record<string, any>;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  color: string;
  position: number;
  is_default: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  company_id: string;
  stage_id: string;
  name: string;
  owner_name?: string;
  driver_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  plate: string;
  auto_number?: string;
  infraction_date?: string;
  infraction_type?: string;
  infraction_description?: string;
  authority?: string;
  legal_base?: string;
  priority: string;
  status: string;
  court?: string;
  completion: number;
  outcome?: string;
  analysis?: any;
  source: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  observations?: string;
  comments: number;
  tags: string[];
}

export interface Process {
  id: string;
  company_id: string;
  lead_id: string;
  number?: string;
  type?: string;
  status: string;
  court?: string;
  judge?: string;
  start_date?: string;
  end_date?: string;
  estimated_value?: number;
  actual_value?: number;
  applied_thesis_id?: string;
  applied_thesis_title?: string;
  outcome?: string;
  outcome_date?: string;
  outcome_reason?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  process_id?: string;
  lead_id?: string;
  name: string;
  type: string;
  category?: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  url?: string;
  uploaded_by?: string;
  upload_date: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  company_id: string;
  title: string;
  category?: string;
  description?: string;
  price: number;
  billing_type: string;
  target_audience?: string;
  priority?: string;
  sla?: string;
  color?: string;
  duration?: string;
  includes_documents: boolean;
  includes_support: string;
  resources_quantity: number;
  upsell_service_id?: string;
  offer_trigger?: string;
  recurrence_monthly_value?: number;
  recurrence_interval?: string;
  package_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  company_id: string;
  lead_id?: string;
  service_id?: string;
  number?: string;
  type?: string;
  start_date: string;
  end_date?: string;
  value: number;
  payment_method?: string;
  payment_status: string;
  payment_date?: string;
  auto_renew: boolean;
  renewal_notice_days: number;
  signed_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  company_id: string;
  contract_id?: string;
  lead_id?: string;
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  method?: string;
  gateway?: string;
  gateway_transaction_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Nullity {
  id: string;
  company_id: string;
  title: string;
  infraction_type: string;
  legal_base?: string;
  description?: string;
  justification?: string;
  success_rate?: number;
  usage_count: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: string;
  company_id: string;
  lead_id?: string;
  model: string;
  input_data: any;
  result_data: any;
  confidence_score?: number;
  processing_time?: number;
  created_by?: string;
  created_at: string;
}

export interface HistoryLog {
  id: string;
  company_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  created_at: string;
}

export interface Generation {
  id: string;
  company_id: string;
  process_id?: string;
  lead_id?: string;
  type: string;
  content: string;
  summary?: string;
  template_used?: string;
  variables_used?: any;
  created_by?: string;
  created_at: string;
}

export interface AILearning {
  id: string;
  company_id: string;
  case_type?: string;
  organ?: string;
  thesis?: string;
  outcome?: string;
  success_probability?: number;
  actual_success?: boolean;
  created_at: string;
}

// Service principal
export class SupabaseService {
  // Auth
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Companies
  static async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    return { data, error };
  }

  static async getCompany(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Users
  static async getUsers(companyId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    return { data, error };
  }

  static async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Pipeline Stages
  static async getPipelineStages(companyId: string) {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('company_id', companyId)
      .order('position');
    return { data, error };
  }

  static async createPipelineStage(stage: Omit<PipelineStage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert(stage)
      .select()
      .single();
    return { data, error };
  }

  // Leads
  static async getLeads(companyId: string, filters?: any) {
    let query = supabase
      .from('leads')
      .select(`
        *,
        pipeline_stages (
          id,
          name,
          slug,
          color,
          position
        ),
        assigned_user:users (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId);

    if (filters?.stage_id) {
      query = query.eq('stage_id', filters.stage_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,plate.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async getLead(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        pipeline_stages (
          id,
          name,
          slug,
          color,
          position
        ),
        assigned_user:users (
          id,
          name,
          email
        ),
        documents (
          id,
          name,
          type,
          file_name,
          upload_date
        ),
        processes (
          id,
          number,
          type,
          status,
          start_date
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  }

  static async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    return { data, error };
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  static async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    return { error };
  }

  static async moveLeadStage(leadId: string, newStageSlug: string, userId: string) {
    const { data, error } = await supabase.rpc('move_lead_pipeline', {
      p_lead_id: leadId,
      p_new_stage_slug: newStageSlug,
      p_user_id: userId
    });
    return { data, error };
  }

  // Processes
  static async getProcesses(companyId: string, filters?: any) {
    let query = supabase
      .from('processes')
      .select(`
        *,
        leads (
          id,
          name,
          plate,
          infraction_type
        ),
        assigned_user:users (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.search) {
      query = query.or(`number.ilike.%${filters.search}%,leads.name.ilike.%${filters.search}%,leads.plate.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async getProcess(id: string) {
    const { data, error } = await supabase
      .from('processes')
      .select(`
        *,
        leads (
          id,
          name,
          plate,
          infraction_type,
          infraction_description
        ),
        assigned_user:users (
          id,
          name,
          email
        ),
        documents (
          id,
          name,
          type,
          file_name,
          upload_date
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  }

  static async createProcess(process: Omit<Process, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('processes')
      .insert(process)
      .select()
      .single();
    return { data, error };
  }

  static async updateProcess(id: string, updates: Partial<Process>) {
    const { data, error } = await supabase
      .from('processes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  static async createProcessFromLead(leadId: string, processType: string, userId: string) {
    const { data, error } = await supabase.rpc('create_process_from_lead', {
      p_lead_id: leadId,
      p_process_type: processType,
      p_user_id: userId
    });
    return { data, error };
  }

  // Documents
  static async getDocuments(companyId: string, filters?: any) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId);

    if (filters?.process_id) {
      query = query.eq('process_id', filters.process_id);
    }

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    query = query.order('upload_date', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    return { data, error };
  }

  static async deleteDocument(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    return { error };
  }

  // Services
  static async getServices(companyId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('title');
    return { data, error };
  }

  static async getService(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  static async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    return { data, error };
  }

  static async updateService(id: string, updates: Partial<Service>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Contracts
  static async getContracts(companyId: string, filters?: any) {
    let query = supabase
      .from('contracts')
      .select(`
        *,
        leads (
          id,
          name,
          plate
        ),
        services (
          id,
          title,
          price
        )
      `)
      .eq('company_id', companyId);

    if (filters?.status) {
      query = query.eq('payment_status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`number.ilike.%${filters.search}%,leads.name.ilike.%${filters.search}%,leads.plate.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single();
    return { data, error };
  }

  static async updateContract(id: string, updates: Partial<Contract>) {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Payments
  static async getPayments(companyId: string, filters?: any) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        contracts (
          id,
          number,
          leads (
            id,
            name,
            plate
          )
        )
      `)
      .eq('company_id', companyId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,contracts.number.ilike.%${filters.search}%,contracts.leads.name.ilike.%${filters.search}%`);
    }

    query = query.order('due_date', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    return { data, error };
  }

  static async updatePayment(id: string, updates: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Nullities
  static async getNullities(companyId: string, filters?: any) {
    let query = supabase
      .from('nullities')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (filters?.infraction_type) {
      query = query.eq('infraction_type', filters.infraction_type);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    query = query.order('success_rate', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createNullity(nullity: Omit<Nullity, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('nullities')
      .insert(nullity)
      .select()
      .single();
    return { data, error };
  }

  static async updateNullity(id: string, updates: Partial<Nullity>) {
    const { data, error } = await supabase
      .from('nullities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // AI Analyses
  static async getAIAnalyses(companyId: string, filters?: any) {
    let query = supabase
      .from('ai_analyses')
      .select(`
        *,
        leads (
          id,
          name,
          plate
        )
      `)
      .eq('company_id', companyId);

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters?.model) {
      query = query.eq('model', filters.model);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert(analysis)
      .select()
      .single();
    return { data, error };
  }

  // History Logs
  static async getHistoryLogs(companyId: string, filters?: any) {
    let query = supabase
      .from('history_logs')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId);

    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createHistoryLog(log: Omit<HistoryLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('history_logs')
      .insert(log)
      .select()
      .single();
    return { data, error };
  }

  // Generations
  static async getGenerations(companyId: string, filters?: any) {
    let query = supabase
      .from('generations')
      .select(`
        *,
        leads (
          id,
          name,
          plate
        ),
        processes (
          id,
          number,
          type
        )
      `)
      .eq('company_id', companyId);

    if (filters?.process_id) {
      query = query.eq('process_id', filters.process_id);
    }

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createGeneration(generation: Omit<Generation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('generations')
      .insert(generation)
      .select()
      .single();
    return { data, error };
  }

  // AI Learning
  static async getAILearning(companyId: string, filters?: any) {
    let query = supabase
      .from('ai_learning')
      .select('*')
      .eq('company_id', companyId);

    if (filters?.case_type) {
      query = query.eq('case_type', filters.case_type);
    }

    if (filters?.organ) {
      query = query.eq('organ', filters.organ);
    }

    if (filters?.outcome) {
      query = query.eq('outcome', filters.outcome);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  static async createAILearning(learning: Omit<AILearning, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ai_learning')
      .insert(learning)
      .select()
      .single();
    return { data, error };
  }

  // File Upload
  static async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    return { data, error };
  }

  static async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { error };
  }

  // Realtime subscriptions
  static subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`table-db-changes-${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table 
        }, 
        callback
      )
      .subscribe();
  }

  static unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
}

export default SupabaseService;
