import { Nulidade, initialNulidades } from './nulidadeData';

// Persistence simulation using localStorage
const STORAGE_KEY = 'multa_expert_ai_learning';

export interface OrganStats {
  vitorias: number;
  derrotas: number;
}

export interface LearningData {
  stats: Record<string, { 
    vitorias: number; 
    derrotas: number; 
    total_usos: number;
    organ_stats: Record<string, OrganStats>;
  }>;
}

export function getLearningData(): LearningData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initial stats from our data
  const initialStats: LearningData['stats'] = {};
  initialNulidades.forEach(n => {
    initialStats[n.id] = {
      vitorias: n.vitorias || 0,
      derrotas: n.derrotas || 0,
      total_usos: n.score_uso || 0,
      organ_stats: {}
    };
  });
  
  return { stats: initialStats };
}

export function saveLearningData(data: LearningData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordOutcome(thesisId: string, outcome: 'deferred' | 'denied', organ?: string) {
  const data = getLearningData();
  
  if (!data.stats[thesisId]) {
    data.stats[thesisId] = { vitorias: 0, derrotas: 0, total_usos: 0, organ_stats: {} };
  }
  
  const stats = data.stats[thesisId];
  stats.total_usos += 1;
  
  if (outcome === 'deferred') {
    stats.vitorias += 1;
  } else {
    stats.derrotas += 1;
  }

  // Update organ specific stats
  if (organ) {
    const organKey = organ.toUpperCase();
    if (!stats.organ_stats[organKey]) {
      stats.organ_stats[organKey] = { vitorias: 0, derrotas: 0 };
    }
    if (outcome === 'deferred') {
      stats.organ_stats[organKey].vitorias += 1;
    } else {
      stats.organ_stats[organKey].derrotas += 1;
    }
  }
  
  saveLearningData(data);
  console.log(`[AI LEARNING] Thesis ${thesisId} updated for organ ${organ || 'General'}: ${outcome}`);
}

export function getAdjustedProbability(thesis: Nulidade, organ?: string): number {
  const data = getLearningData();
  const stats = data.stats[thesis.id];
  
  if (!stats || stats.total_usos === 0) return thesis.probabilidade_sucesso;
  
  // 1. Calculate General Success Rate
  const generalRate = (stats.vitorias / stats.total_usos) * 100;
  
  // 2. Factor in Organ Specificity if provided
  let localizedWeight = 0;
  let localizedRate = generalRate;

  if (organ) {
    const organKey = organ.toUpperCase();
    const organData = stats.organ_stats[organKey];
    if (organData && (organData.vitorias + organData.derrotas) > 0) {
      localizedRate = (organData.vitorias / (organData.vitorias + organData.derrotas)) * 100;
      localizedWeight = Math.min((organData.vitorias + organData.derrotas) / 10, 0.5); // Up to 50% weight to specific organ if sample is >= 10
    }
  }

  // 3. Final weighted calculation
  const compositeActualRate = (localizedRate * localizedWeight) + (generalRate * (1 - localizedWeight));
  
  // Confidence factor based on total sample size
  const confidence = Math.min(stats.total_usos / 20, 0.8); 
  
  const adjusted = (thesis.probabilidade_sucesso * (1 - confidence)) + (compositeActualRate * confidence);
  
  return Math.round(adjusted);
}

export function getUpdatedStats(thesisId: string): { score_uso: number, taxa_sucesso_real: number } {
  const data = getLearningData();
  const stats = data.stats[thesisId];
  
  if (!stats) return { score_uso: 0, taxa_sucesso_real: 0 };
  
  const successRate = stats.total_usos > 0 ? (stats.vitorias / stats.total_usos) * 100 : 0;
  
  return {
    score_uso: stats.total_usos,
    taxa_sucesso_real: Math.round(successRate)
  };
}
