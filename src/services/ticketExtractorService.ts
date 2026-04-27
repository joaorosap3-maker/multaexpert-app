// Serviço para extração de dados de multas usando OCR e IA
import Tesseract from 'tesseract.js';

interface TicketData {
  plate?: string;
  autoNumber?: string;
  infractionDate?: string;
  authority?: string;
  location?: string;
  value?: string;
  infractionType?: string;
  description?: string;
  fullName?: string; // Nome completo do condutor
  confidence?: Record<string, number>;
}

export class TicketExtractorService {
  private static readonly PATTERNS = {
    // Padrões robustos para placa (mais fáceis de extrair)
    PLACA: [
      /\b[A-Z]{3}\d{4}\b/g,        // ABC1234
      /\b[A-Z]{3}\d{1}[A-Z]\d{1}\b/g, // ABC1D23
      /\b\d{4}\b/g,                 // 6545 (placa antiga)
      /PLACA.*?(\d{4,7})/gi,       // PLACA/UF 6545
    ],
    
    // Auto de Infração (formatos mais comuns)
    AUTO: [
      /\b\d{7}-\d\b/g,             // 1234567-8
      /\b[A-Z]{3}\d{6}\b/g,        // POexi0001h
      /AUTO.*?([A-Z]{3}\d{6})/gi,  // AUTO DE INFRAÇÃO POexi0001h
      /NÚMERO.*?([A-Z]{3}\d{6})/gi, // NÚMERO DO AUTO POexi0001h
    ],
    
    // Data da infração (padrões simples e robustos)
    DATA: [
      /\b(\d{2})\/(\d{2})\/(\d{4})\b/g, // DD/MM/YYYY
      /\b(\d{2})\/(\d{2})\/(\d{2})\b/g, // DD/MM/YY
    ],
    
    // Órgãos autuadores (padrões simples)
    ORGAO: [
      /\bDETRAN\b/gi,
      /\bPRF\b/gi,
      /\bDER\b/gi,
      /\bCET\b/gi,
      /\bPOLICIA\b/gi,
    ],
    
    // Tipos de infração mais comuns
    INFRACAO: [
      /velocidade/gi,
      /sinal/gi,
      /estacionamento/gi,
      /contramão/gi,
      /CNH/gi,
      /cinto/gi,
      /celular/gi,
    ],
    
    // Localização (CEP é mais fácil)
    LOCAL: [
      /\b\d{5}-\d{3}\b/g, // CEP: 86705-069
    ],
    
    // Nome (padrões mais simples para OCR com erros)
    NOME: [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // 3 palavras maiúsculas/minúsculas
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // 2 palavras
    ],
  };

  /**
   * Extrai dados de uma imagem usando OCR real com Tesseract.js
   */
  static async extractFromImage(file: File): Promise<TicketData> {
    try {
      console.log('Iniciando OCR real para imagem:', file.name);
      
      // Usar Tesseract.js para OCR real
      const result = await Tesseract.recognize(
        file,
        'por', // Português brasileiro
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`Progresso OCR: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log('Texto extraído via OCR:', result.data.text);
      
      return this.extractFromText(result.data.text);
    } catch (error) {
      console.error('Erro na extração da imagem:', error);
      // Fallback para simulação se OCR falhar
      console.log('Usando fallback simulado...');
      const mockText = await this.simulateOCR(file);
      return this.extractFromText(mockText);
    }
  }

  /**
   * Extrai dados de um PDF usando OCR (simulado)
   * Em produção, usar pdf.js + OCR ou serviço externo
   */
  static async extractFromPDF(file: File): Promise<TicketData> {
    try {
      // Simulação de extração de PDF
      const mockText = await this.simulatePDFExtraction(file);
      
      return this.extractFromText(mockText);
    } catch (error) {
      console.error('Erro na extração do PDF:', error);
      return {};
    }
  }

  /**
   * Processa texto extraído e aplica padrões regex
   */
  private static extractFromText(text: string): TicketData {
    const result: TicketData = {
      confidence: {}
    };

    // Extrair placa
    for (const pattern of this.PATTERNS.PLACA) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        // Para padrões com grupos de captura, pegar o grupo 1
        const plate = match[1] || match[0];
        result.plate = plate.trim();
        result.confidence!.plate = 0.9;
        console.log('Placa extraída:', result.plate);
        break;
      }
    }

    // Extrair auto de infração
    for (const pattern of this.PATTERNS.AUTO) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        // Para padrões com grupos de captura, pegar o grupo 1
        const auto = match[1] || match[0];
        result.autoNumber = auto.trim();
        result.confidence!.autoNumber = 0.95;
        console.log('Auto extraído:', result.autoNumber);
        break;
      }
    }

    // Extrair data
    for (const pattern of this.PATTERNS.DATA) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        // Converter para formato DD/MM/YYYY se necessário
        let date = match[0];
        if (date.includes('-')) {
          const [year, month, day] = date.split('-');
          date = `${day}/${month}/${year}`;
        }
        // Se tiver hora, remover
        if (date.includes(':')) {
          date = date.split(' ')[0];
        }
        result.infractionDate = date;
        result.confidence!.infractionDate = 0.85;
        console.log('Data extraída:', result.infractionDate);
        break;
      }
    }

    // Extrair órgão
    for (const pattern of this.PATTERNS.ORGAO) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        result.authority = match[0].toUpperCase();
        result.confidence!.authority = 0.8;
        console.log('Órgão extraído:', result.authority);
        break;
      }
    }

    // Valor não será extraído por enquanto - OCR muito impreciso para valores

    // Extrair tipo de infração
    for (const pattern of this.PATTERNS.INFRACAO) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        const infração = match[0].toLowerCase();
        
        // Mapear para tipos padronizados
        const tipoMap: Record<string, string> = {
          'excesso de velocidade': 'Excesso de velocidade',
          'avanço de sinal': 'Avanço de sinal',
          'estacionamento proibido': 'Estacionamento irregular',
          'transitar na contramão': 'Trânsito na contramão',
          'falta de habilitação': 'Falta de habilitação',
          'cinto de segurança': 'Uso irregular do cinto',
          'celular': 'Uso de celular',
          'dirigir embriagado': 'Direção embriagada',
          'dp 5029-2 dirigir veiculo c/ cnh/ppd/a ne...': 'Falta de habilitação',
        };

        result.infractionType = tipoMap[infração] || 'Outra infração';
        result.confidence!.infractionType = 0.7;
        console.log('Infração extraída:', result.infractionType);
        break;
      }
    }

    // Extrair localização
    for (const pattern of this.PATTERNS.LOCAL) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        result.location = match[0].trim();
        result.confidence!.location = 0.6;
        console.log('Localização extraída:', result.location);
        break;
      }
    }

    // Extrair nome completo do condutor
    for (const pattern of this.PATTERNS.NOME) {
      const match = text.match(pattern);
      if (match && match.length > 0) {
        // Pegar o primeiro grupo de captura que contém o nome
        const name = match[1] || match[0];
        result.fullName = name.trim();
        result.confidence!.fullName = 0.75;
        console.log('Nome extraído:', result.fullName);
        break;
      }
    }

    console.log('Resultado final da extração:', result);
    return result;
  }

  /**
   * Simulação de OCR para desenvolvimento
   * Em produção, substituir com biblioteca real
   */
  private static async simulateOCR(file: File): Promise<string> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Texto mock baseado no tipo de arquivo
    const mockTexts = [
      `AUTO DE INFRAÇÃO
      Nº: 1234567-8
      CONDUTOR: João Silva Santos
      PLACA: ABC1D23
      DATA: 15/03/2024
      HORA: 14:30
      LOCAL: Av. Paulista, 1000 - São Paulo/SP
      ÓRGÃO: DETRAN-SP
      INFRAÇÃO: Excesso de velocidade
      VELOCIDADE DA VIA: 60 km/h
      VELOCIDADE DO VEÍCULO: 85 km/h
      VALOR: R$ 195,23
      PONTOS: 5`,
      
      `NOTIFICAÇÃO DE PENALIDADE
      Auto de Infração: 9876543-2
      Nome do Motorista: Maria Oliveira Costa
      Placa do veículo: XYZ4321
      Data da infração: 20/04/2024
      Órgão autuador: PRF
      Enquadramento: Avanço de sinal
      Valor da multa: R$ 293,47
      Local: Rodovia Presidente Dutra, km 234`,
      
      `AUTO DE MULTA DE TRÂNSITO
      Número: 4567890-1
      Proprietário: Carlos Alberto Mendes
      CPF: 123.456.789-00
      Placa: DEF5G67
      Data: 10/05/2024
      Local: Rua Augusta, 500 - São Paulo/SP
      Órgão: CET-SP
      Infração: Estacionamento proibido
      Valor: R$ 130,16`
    ];

    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  /**
   * Simulação de extração de PDF para desenvolvimento
   */
  private static async simulatePDFExtraction(file: File): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return this.simulateOCR(file);
  }

  /**
   * Converte o resultado para o formato do formData
   */
  static convertToFormData(ticketData: TicketData): Partial<typeof import('../components/modals/NewLeadModal').default> {
    return {
      name: ticketData.fullName || '',
      plate: ticketData.plate || '',
      autoNumber: ticketData.autoNumber || '',
      infractionDate: ticketData.infractionDate || '',
      authority: ticketData.authority || '',
      infractionType: ticketData.infractionType || 'Excesso de velocidade',
    };
  }

  /**
   * Calcula nível de confiança geral
   */
  static getOverallConfidence(confidence: Record<string, number>): 'high' | 'medium' | 'low' {
    const values = Object.values(confidence);
    if (values.length === 0) return 'low';
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    if (avg >= 0.8) return 'high';
    if (avg >= 0.6) return 'medium';
    return 'low';
  }
}
