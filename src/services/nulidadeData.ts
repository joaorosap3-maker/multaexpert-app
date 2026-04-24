export interface Nulidade {
  id: string; // uuid
  titulo: string;
  tipo_infracao: string; // velocidade, lei seca, etc
  descricao_juridica: string;
  tese_principal: string;
  base_legal: string;
  artigos_relacionados: string;
  palavras_chave: string[];
  orgao_aplicavel: string[]; // DETRAN, PRF, etc (plural as requested before, keeping array for flexibility or string if preferred, user said DETRAN, PRF, etc implying multiple)
  probabilidade_sucesso: number; // 0 a 100
  nivel_dificuldade: 'baixo' | 'medio' | 'alto';
  exemplos_reais: string[];
  observacoes: string;
  ativa: boolean;
  
  // Campos para IA
  embedding: number[]; // vector
  score_uso: number; // contador de uso
  taxa_sucesso_real: number; // calculado (vitorias / total_usos)
  
  // Auditoria
  created_at: string;
  updated_at: string;

  // Legacy/UI Compatibility
  color?: string;
  vitorias?: number;
  derrotas?: number;
}

export const initialNulidades: Nulidade[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440000',
    titulo: 'Ausência de Aferição INMETRO (Radar)',
    tipo_infracao: 'Velocidade', 
    tese_principal: 'Ausência de Aferição INMETRO', 
    descricao_juridica: 'Nulidade absoluta por falta de verificação metrológica anual obrigatória do equipamento pelo INMETRO ou entidade delegada.',
    base_legal: 'Res. CONTRAN 798/20, Art. 3º, inciso II',
    artigos_relacionados: 'Art. 280, CTB; Res. CONTRAN 798/20',
    palavras_chave: ['metrologia', 'Aferição', 'INMETRO', 'radar', 'velocidade'],
    orgao_aplicavel: ['DETRAN', 'PRF', 'DER'],
    probabilidade_sucesso: 95,
    nivel_dificuldade: 'baixo',
    exemplos_reais: ['Auto de infração sem data de última verificação ou verificação vencida há mais de 12 meses.'],
    observacoes: 'Tese com altíssimo índice de deferimento em instâncias administrativas.',
    ativa: true,
    embedding: Array(1536).fill(0).map(() => Math.random()),
    score_uso: 150,
    taxa_sucesso_real: 94.6,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2026-04-23T13:25:04Z',
    color: 'blue',
    vitorias: 142,
    derrotas: 8
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440001',
    titulo: 'Omissão de Margem de Erro (Bafômetro)',
    tipo_infracao: 'Lei Seca', 
    tese_principal: 'Falta de Margem de Erro', 
    descricao_juridica: 'Omissão do desconto da margem de erro técnica do bafômetro no preenchimento do auto, conforme portaria técnica.',
    base_legal: 'Portaria INMETRO 369/21, Tabela de Erros Máximos',
    artigos_relacionados: 'Art. 165, CTB; Portaria INMETRO 369/21',
    palavras_chave: ['etilômetro', 'bafômetro', 'margem de erro', 'tolerância', 'álcool', 'lei seca'],
    orgao_aplicavel: ['DETRAN', 'PRF', 'PM'],
    probabilidade_sucesso: 82,
    nivel_dificuldade: 'medio',
    exemplos_reais: ['Condutor com 0,33mg/L sem aplicação do desconto, resultando em crime de trânsito indevido.'],
    observacoes: 'Requer análise precisa do extrato do bafômetro.',
    ativa: true,
    embedding: Array(1536).fill(0).map(() => Math.random()),
    score_uso: 104,
    taxa_sucesso_real: 81.7,
    created_at: '2024-02-15T14:30:00Z',
    updated_at: '2026-04-23T13:25:04Z',
    color: 'amber',
    vitorias: 85,
    derrotas: 19
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440002',
    titulo: 'Vício de Notificação Prévia (Estacionamento/Zona Azul)',
    tipo_infracao: 'Estacionamento', 
    tese_principal: 'Vício de Notificação Prévia', 
    descricao_juridica: 'Ausência de oportunidade de regularização no local antes da emissão da multa direta em sistemas de zona azul.',
    base_legal: 'Súmula 311 STJ',
    artigos_relacionados: 'Art. 181, CTB; Súmula 311 STJ',
    palavras_chave: ['zona azul', 'notificação', 'regularização', 'stj', 'estacionamento'],
    orgao_aplicavel: ['Prefeituras', 'Transcom'],
    probabilidade_sucesso: 89,
    nivel_dificuldade: 'baixo',
    exemplos_reais: ['Multa lavrada por agente sem o comprovante de aviso de irregularidade prévio anexado ao processo.'],
    observacoes: 'Pacificado pelo STJ.',
    ativa: true,
    embedding: Array(1536).fill(0).map(() => Math.random()),
    score_uso: 75,
    taxa_sucesso_real: 89.3,
    created_at: '2024-03-20T09:15:00Z',
    updated_at: '2026-04-23T13:25:04Z',
    color: 'purple',
    vitorias: 67,
    derrotas: 8
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440003',
    titulo: 'Obstrução de Sinalização Vertical',
    tipo_infracao: 'Sinalização', 
    tese_principal: 'Visibilidade Comprometida', 
    descricao_juridica: 'Sinalização vertical encoberta por vegetação ou fora dos padrões de altura e visibilidade do manual brasileiro de sinalização de trânsito.',
    base_legal: 'Art. 80, § 1º CTB',
    artigos_relacionados: 'Art. 80, CTB; Res. CONTRAN 160/04',
    palavras_chave: ['visibilidade', 'sinalização', 'placa', 'obstrução', 'pare'],
    orgao_aplicavel: ['DETRAN', 'Prefeituras'],
    probabilidade_sucesso: 65,
    nivel_dificuldade: 'alto',
    exemplos_reais: ['Foto do local demonstrando placa de pare escondida por galhos de árvore em cruzamento.'],
    observacoes: 'Depende fortemente de provas fotográficas robustas.',
    ativa: true,
    embedding: Array(1536).fill(0).map(() => Math.random()),
    score_uso: 65,
    taxa_sucesso_real: 64.6,
    created_at: '2024-04-05T16:45:00Z',
    updated_at: '2026-04-23T13:25:04Z',
    color: 'rose',
    vitorias: 42,
    derrotas: 23
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440004',
    titulo: 'Divergência de Localização de Radar',
    tipo_infracao: 'Velocidade', 
    tese_principal: 'Localização Imprecisa', 
    descricao_juridica: 'Inconsistência entre o local descrito no auto de infração e a localização real do equipamento medidor.',
    base_legal: 'Art. 280, inciso II do CTB',
    artigos_relacionados: 'Art. 280, CTB; Res. CONTRAN 798/20',
    palavras_chave: ['localização', 'endereço', 'km', 'via', 'radar'],
    orgao_aplicavel: ['DETRAN', 'PRF', 'DER'],
    probabilidade_sucesso: 78,
    nivel_dificuldade: 'medio',
    exemplos_reais: ['Auto indica KM 20 mas o radar está fixado no KM 22 da via.'],
    observacoes: 'Verificar georreferenciamento do radar no portal do INMETRO.',
    ativa: true,
    embedding: Array(1536).fill(0).map(() => Math.random()),
    score_uso: 71,
    taxa_sucesso_real: 78.8,
    created_at: '2024-05-12T11:20:00Z',
    updated_at: '2026-04-23T13:25:04Z',
    color: 'blue',
    vitorias: 56,
    derrotas: 15
  }
];
