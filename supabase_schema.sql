-- ========================================
-- MULTA EXPERT - SISTEMA DE INTELIGÊNCIA JURÍDICA
-- Schema completo para Supabase com multi-tenant
-- ========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE TABLES

-- 2.1 Empresas (Multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  address TEXT,
  plan VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
  max_users INTEGER DEFAULT 5,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Usuários (Perfil extendido)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user', -- admin, user, lawyer, assistant
  avatar_url TEXT,
  permissions JSONB DEFAULT '{}', -- Permissões específicas
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, email)
);

-- 2.3 Pipeline Stages
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  position INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- 2.4 Leads (Cards do Pipeline)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  
  -- Dados do Cliente
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  driver_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  
  -- Dados da Multa
  plate VARCHAR(20) NOT NULL,
  auto_number VARCHAR(50),
  infraction_date DATE,
  infraction_type VARCHAR(255),
  infraction_description TEXT,
  authority VARCHAR(255),
  legal_base TEXT,
  
  -- Dados do Processo
  priority VARCHAR(20) DEFAULT 'padrao', -- urgente, padrao, critica, media, alta
  status VARCHAR(50) DEFAULT 'novo',
  court VARCHAR(255),
  completion INTEGER DEFAULT 0,
  outcome VARCHAR(20), -- deferred, denied
  
  -- Análise IA
  analysis JSONB, -- Resultado da análise da IA
  
  -- Metadados
  source VARCHAR(50) DEFAULT 'manual', -- manual, import, api
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Observações
  observations TEXT,
  comments INTEGER DEFAULT 0,
  tags TEXT[]
);

-- 2.5 Processos (Casos Jurídicos)
CREATE TABLE processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  number VARCHAR(100), -- Número do processo
  type VARCHAR(100), -- Defesa, Recurso, etc.
  status VARCHAR(50) DEFAULT 'ativo', -- ativo, suspenso, concluido, arquivado
  
  -- Dados do Processo
  court VARCHAR(255),
  judge VARCHAR(255),
  start_date DATE,
  end_date DATE,
  estimated_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  
  -- Teses Aplicadas
  applied_thesis_id VARCHAR(100),
  applied_thesis_title TEXT,
  
  -- Resultados
  outcome VARCHAR(20), -- deferred, denied, partial
  outcome_date DATE,
  outcome_reason TEXT,
  
  -- Metadados
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, number)
);

-- 2.6 Documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- CNH, CRLV, Multa, Outros, Contrato, Procuração, Defesa
  category VARCHAR(50), -- personal, vehicle, legal, contract
  
  -- Arquivo
  file_name VARCHAR(255),
  file_path TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  url TEXT,
  
  -- Metadados
  uploaded_by UUID REFERENCES users(id),
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Serviços (Catálogo)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  
  -- Tipo de Cobrança
  billing_type VARCHAR(20) NOT NULL, -- unitario, pacote, recorrente
  target_audience VARCHAR(50), -- Motoboy, Motorista de App, Cliente Comum
  
  -- Detalhes
  priority VARCHAR(20),
  sla VARCHAR(100),
  color VARCHAR(20),
  duration VARCHAR(100),
  
  -- Inclusões
  includes_documents BOOLEAN DEFAULT false,
  includes_support VARCHAR(20), -- Email, WhatsApp, 24/7, Nenhum
  resources_quantity INTEGER DEFAULT 0,
  
  -- Upsell
  upsell_service_id UUID REFERENCES services(id),
  offer_trigger VARCHAR(255),
  
  -- Recorrência
  recurrence_monthly_value DECIMAL(10,2),
  recurrence_interval VARCHAR(50),
  package_quantity INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Contratos
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  
  number VARCHAR(100) UNIQUE,
  type VARCHAR(50), -- unitario, pacote, recorrente
  
  -- Dados do Contrato
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(10,2) NOT NULL,
  
  -- Pagamento
  payment_method VARCHAR(50), -- boleto, pix, cartao, transferencia
  payment_status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, cancelado, atrasado
  payment_date DATE,
  
  -- Renovação
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 30,
  
  -- Metadados
  signed_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, number)
);

-- 2.9 Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, cancelado, atrasado
  
  -- Método
  method VARCHAR(50), -- boleto, pix, cartao, transferencia, dinheiro
  gateway VARCHAR(50), -- stripe, paypal, manual
  gateway_transaction_id VARCHAR(255),
  
  -- Metadados
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 Nulidades (Base de Conhecimento)
CREATE TABLE nullities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  infraction_type VARCHAR(100) NOT NULL,
  legal_base TEXT,
  description TEXT,
  justification TEXT,
  
  -- Aplicação
  success_rate DECIMAL(5,2), -- Taxa de sucesso
  usage_count INTEGER DEFAULT 0,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 Análises IA
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Dados da Análise
  model VARCHAR(100) DEFAULT 'gpt-4o-mini',
  input_data JSONB,
  result_data JSONB NOT NULL,
  
  -- Métricas
  confidence_score DECIMAL(5,2),
  processing_time INTEGER, -- ms
  
  -- Metadados
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 Histórico (Logs)
CREATE TABLE history_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Entidade
  entity_type VARCHAR(50) NOT NULL, -- lead, process, contract, etc.
  entity_id UUID NOT NULL,
  
  -- Ação
  action VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Dados
  old_values JSONB,
  new_values JSONB,
  
  -- Metadados
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 Gerações (Documentos Gerados)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  type VARCHAR(100) NOT NULL, -- Defesa, Recurso, Contrato, etc.
  content TEXT NOT NULL,
  summary TEXT,
  
  -- Metadados
  template_used VARCHAR(255),
  variables_used JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 Aprendizado IA (Feedback)
CREATE TABLE ai_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Contexto
  case_type VARCHAR(100),
  organ VARCHAR(100),
  thesis TEXT,
  outcome VARCHAR(20), -- deferred, denied
  
  -- Dados
  success_probability DECIMAL(5,2),
  actual_success BOOLEAN,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_stage_id ON leads(stage_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_plate ON leads(plate);
CREATE INDEX idx_processes_company_id ON processes(company_id);
CREATE INDEX idx_processes_lead_id ON processes(lead_id);
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_process_id ON documents(process_id);
CREATE INDEX idx_documents_lead_id ON documents(lead_id);
CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_lead_id ON contracts(lead_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_history_logs_company_id ON history_logs(company_id);
CREATE INDEX idx_history_logs_entity ON history_logs(entity_type, entity_id);
CREATE INDEX idx_ai_analyses_company_id ON ai_analyses(company_id);
CREATE INDEX idx_ai_analyses_lead_id ON ai_analyses(lead_id);

-- 4. TRIGGERS E FUNCTIONS

-- 4.1 Atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processes_updated_at BEFORE UPDATE ON processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nullities_updated_at BEFORE UPDATE ON nullities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, company_id)
  SELECT 
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_metadata->>'name', NEW.email),
    (
      SELECT id FROM companies 
      WHERE slug = COALESCE(NEW.raw_user_metadata->>'company', 'default')
      LIMIT 1
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Função para criar lead
CREATE OR REPLACE FUNCTION create_lead(
  p_company_id UUID,
  p_name VARCHAR(255),
  p_phone VARCHAR(20),
  p_plate VARCHAR(20),
  p_infraction_type VARCHAR(255),
  p_infraction_description TEXT,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_lead_id UUID;
  v_stage_id UUID;
BEGIN
  -- Buscar stage inicial
  SELECT id INTO v_stage_id 
  FROM pipeline_stages 
  WHERE company_id = p_company_id AND slug = 'novo' 
  LIMIT 1;
  
  -- Criar lead
  INSERT INTO leads (
    company_id, stage_id, name, phone, plate, 
    infraction_type, infraction_description, created_by
  ) VALUES (
    p_company_id, v_stage_id, p_name, p_phone, p_plate,
    p_infraction_type, p_infraction_description, p_created_by
  ) RETURNING id INTO v_lead_id;
  
  -- Criar log
  INSERT INTO history_logs (
    company_id, entity_type, entity_id, action, 
    description, user_id
  ) VALUES (
    p_company_id, 'lead', v_lead_id, 'created',
    'Lead criado automaticamente', p_created_by
  );
  
  RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- 4.4 Função para mover lead no pipeline
CREATE OR REPLACE FUNCTION move_lead_pipeline(
  p_lead_id UUID,
  p_new_stage_slug VARCHAR(50),
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_company_id UUID;
  v_old_stage_id UUID;
  v_new_stage_id UUID;
BEGIN
  -- Buscar dados
  SELECT company_id, stage_id INTO v_company_id, v_old_stage_id
  FROM leads WHERE id = p_lead_id;
  
  SELECT id INTO v_new_stage_id
  FROM pipeline_stages 
  WHERE company_id = v_company_id AND slug = p_new_stage_slug;
  
  -- Validar
  IF v_new_stage_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar lead
  UPDATE leads 
  SET stage_id = v_new_stage_id, updated_at = NOW()
  WHERE id = p_lead_id;
  
  -- Criar log
  INSERT INTO history_logs (
    company_id, entity_type, entity_id, action,
    description, old_values, new_values, user_id
  ) VALUES (
    v_company_id, 'lead', p_lead_id, 'stage_changed',
    'Lead movido no pipeline', 
    jsonb_build_object('stage_id', v_old_stage_id),
    jsonb_build_object('stage_id', v_new_stage_id),
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4.5 Função para gerar processo a partir de lead
CREATE OR REPLACE FUNCTION create_process_from_lead(
  p_lead_id UUID,
  p_process_type VARCHAR(100),
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_process_id UUID;
  v_company_id UUID;
  v_lead_name VARCHAR(255);
BEGIN
  -- Buscar dados do lead
  SELECT company_id, name INTO v_company_id, v_lead_name
  FROM leads WHERE id = p_lead_id;
  
  -- Criar processo
  INSERT INTO processes (
    company_id, lead_id, type, status, start_date, created_by
  ) VALUES (
    v_company_id, p_lead_id, p_process_type, 'ativo', 
    CURRENT_DATE, p_user_id
  ) RETURNING id INTO v_process_id;
  
  -- Atualizar status do lead
  UPDATE leads 
  SET status = 'em_processo', updated_at = NOW()
  WHERE id = p_lead_id;
  
  -- Criar log
  INSERT INTO history_logs (
    company_id, entity_type, entity_id, action,
    description, user_id
  ) VALUES (
    v_company_id, 'process', v_process_id, 'created',
    'Processo criado a partir do lead: ' || v_lead_name, p_user_id
  );
  
  RETURN v_process_id;
END;
$$ LANGUAGE plpgsql;

-- 5. ROW LEVEL SECURITY (RLS)

-- 5.1 Ativar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nullities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;

-- 5.2 Políticas de Segurança

-- Companies (apenas super_admin pode ver todas)
CREATE POLICY "Companies view policy" ON companies
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'super_admin' OR
    id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Users (apenas da mesma empresa)
CREATE POLICY "Users view policy" ON users
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users insert policy" ON users
  FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users update policy" ON users
  FOR UPDATE USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid()) AND
    id = auth.uid()
  );

-- Pipeline Stages (apenas da mesma empresa)
CREATE POLICY "Pipeline stages view policy" ON pipeline_stages
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Pipeline stages all policy" ON pipeline_stages
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Leads (apenas da mesma empresa)
CREATE POLICY "Leads view policy" ON leads
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Leads all policy" ON leads
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Processes (apenas da mesma empresa)
CREATE POLICY "Processes view policy" ON processes
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Processes all policy" ON processes
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Documents (apenas da mesma empresa)
CREATE POLICY "Documents view policy" ON documents
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Documents all policy" ON documents
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Services (apenas da mesma empresa)
CREATE POLICY "Services view policy" ON services
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Services all policy" ON services
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Contracts (apenas da mesma empresa)
CREATE POLICY "Contracts view policy" ON contracts
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Contracts all policy" ON contracts
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Payments (apenas da mesma empresa)
CREATE POLICY "Payments view policy" ON payments
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Payments all policy" ON payments
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Nullities (apenas da mesma empresa)
CREATE POLICY "Nullities view policy" ON nullities
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Nullities all policy" ON nullities
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- AI Analyses (apenas da mesma empresa)
CREATE POLICY "AI analyses view policy" ON ai_analyses
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "AI analyses all policy" ON ai_analyses
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- History Logs (apenas da mesma empresa)
CREATE POLICY "History logs view policy" ON history_logs
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "History logs insert policy" ON history_logs
  FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Generations (apenas da mesma empresa)
CREATE POLICY "Generations view policy" ON generations
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Generations all policy" ON generations
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- AI Learning (apenas da mesma empresa)
CREATE POLICY "AI learning view policy" ON ai_learning
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "AI learning all policy" ON ai_learning
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- 6. DADOS INICIAIS

-- 6.1 Criar empresa default
INSERT INTO companies (id, name, slug, cnpj, email, plan, max_users) VALUES 
('00000000-0000-0000-0000-000000000001', 'Derruba Multas', 'default', '00.000.000/0001-00', 'contato@derrubamultas.com.br', 'enterprise', 100)
ON CONFLICT (id) DO NOTHING;

-- 6.2 Criar stages padrão
INSERT INTO pipeline_stages (company_id, name, slug, color, position, is_default) VALUES 
('00000000-0000-0000-0000-000000000001', 'Entrada', 'novo', 'bg-slate-500', 1, true),
('00000000-0000-0000-0000-000000000001', 'Em Análise', 'em_andamento', 'bg-blue-400', 2, true),
('00000000-0000-0000-0000-000000000001', 'Proposta Enviada', 'proposta_enviada', 'bg-indigo-400', 3, true),
('00000000-0000-0000-0000-000000000001', 'Aguardando Cliente', 'aguardando_cliente', 'bg-amber-400', 4, true),
('00000000-0000-0000-0000-000000000001', 'Concluído', 'concluido', 'bg-emerald-400', 5, true)
ON CONFLICT DO NOTHING;

-- 6.3 Criar serviços padrão
INSERT INTO services (company_id, title, category, description, price, billing_type, target_audience, priority, sla, color, includes_documents, includes_support, resources_quantity) VALUES 
('00000000-0000-0000-0000-000000000001', 'Defesa Prvia Administrativa', 'Defesa', 'Elaboração e envio de defesa prévia para JARI', 297.00, 'unitario', 'Cliente Comum', 'Média', '48 horas', '#3B82F6', true, 'WhatsApp', 3),
('00000000-0000-0000-0000-000000000001', 'Recurso em 1ª Instância', 'Recurso', 'Recurso administrativo contra decisão da JARI', 397.00, 'unitario', 'Cliente Comum', 'Alta', '72 horas', '#8B5CF6', true, 'WhatsApp', 5),
('00000000-0000-0000-0000-000000000001', 'Recurso Especial', 'Recurso', 'Recurso especial para CETRAN', 597.00, 'unitario', 'Cliente Comum', 'Crítica', '5 dias', '#EF4444', true, '24/7', 7),
('00000000-0000-0000-0000-000000000001', 'Pacote Completo', 'Pacote', 'Defesa + Recurso em 1ª Instância', 597.00, 'pacote', 'Cliente Comum', 'Alta', '7 dias', '#10B981', true, '24/7', 10)
ON CONFLICT DO NOTHING;

-- 6.4 Criar nulidades padrão
INSERT INTO nullities (company_id, title, infraction_type, legal_base, description, justification, success_rate) VALUES 
('00000000-0000-0000-0000-000000000001', 'Aferição do Medidor de Velocidade', 'Excesso de velocidade', 'Art. 281, parágrafo único, inciso I do CTB', 'O medidor de velocidade não foi aferido nos últimos 12 meses conforme exigência legal', 'A falta de aferição periódica torna o equipamento irregular e a medição inválida', 85.5),
('00000000-0000-0000-0000-000000000001', 'Sinalização Inexistente ou Irregular', 'Excesso de velocidade', 'Art. 90 do CTB', 'A via não possui sinalização de regulamentação de velocidade ou está em más condições', 'Sem sinalização visível, o condutor não pode ser penalizado por desconhecer o limite', 78.2),
('00000000-0000-0000-0000-000000000001', 'Local da Infração Incorreto', 'Todas', 'Art. 280 do CTB', 'O local descrito na notificação não corresponde ao local real da infração', 'Erro material na descrição do local torna o auto de infração nulo', 92.1),
('00000000-0000-0000-0000-000000000001', 'Equipamento sem Certificação', 'Excesso de velocidade', 'CONTRAN 396/2011', 'O radar não possui certificação do INMETRO', 'Equipamento sem certificação não pode ser utilizado para fiscalização', 88.7)
ON CONFLICT DO NOTHING;

-- 7. VIEWS (Para facilitar consultas)

-- 7.1 View de Leads com informações completas
CREATE VIEW lead_details AS
SELECT 
  l.*,
  s.name as stage_name,
  s.color as stage_color,
  u.name as assigned_to_name,
  c.name as company_name,
  COUNT(DISTINCT d.id) as document_count,
  COUNT(DISTINCT p.id) as process_count
FROM leads l
LEFT JOIN pipeline_stages s ON l.stage_id = s.id
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN companies c ON l.company_id = c.id
LEFT JOIN documents d ON l.id = d.lead_id
LEFT JOIN processes p ON l.id = p.lead_id
GROUP BY l.id, s.name, s.color, u.name, c.name;

-- 7.2 View de Processos com informações completas
CREATE VIEW process_details AS
SELECT 
  p.*,
  l.name as lead_name,
  l.plate as lead_plate,
  u.name as assigned_to_name,
  c.name as company_name,
  COUNT(DISTINCT d.id) as document_count
FROM processes p
LEFT JOIN leads l ON p.lead_id = l.id
LEFT JOIN users u ON p.assigned_to = u.id
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN documents d ON p.id = d.process_id
GROUP BY p.id, l.name, l.plate, u.name, c.name;

-- 8. COMENTÁRIOS FINAIS
-- Schema completo para o sistema Multa Expert
-- Multi-tenant com Row Level Security
-- Relacionamentos completos
-- Funções e triggers para automação
-- Índices otimizados
-- Views para consultas facilitadas
