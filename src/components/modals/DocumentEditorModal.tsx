import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Download, 
  MessageCircle, 
  Printer, 
  Type, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  Loader2,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { WHITE_LABEL } from '@/constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docName: string, content: string) => void;
  caseData: any;
  docType: 'Contrato' | 'Procuração' | 'Defesa' | 'Recurso' | 'Pagamento';
  initialContent?: string;
}

export default function DocumentEditorModal({ isOpen, onClose, onSave, caseData, docType, initialContent }: DocumentEditorModalProps) {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caseData && isOpen) {
      if (initialContent) {
        setContent(initialContent);
        return;
      }
      
      const date = new Date().toLocaleDateString('pt-BR');
      let template = '';

      if (docType === 'Contrato') {
        template = `
          <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: black; font-size: 11pt;">
            <h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 30px; text-transform: uppercase;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS ADMINISTRATIVOS</h1>
            
            <p style="text-align: justify;">Pelo presente instrumento particular, de um lado <strong>${caseData.name.toUpperCase()}</strong>, doravante denominado <strong>CONTRATANTE</strong>, e de outro lado <strong>${WHITE_LABEL.COMPANY_NAME.toUpperCase()}</strong>, doravante denominada <strong>CONTRATADA</strong>, têm entre si justo e contratado o que segue:</p>
            
            <p style="margin-top: 15px; text-align: justify;"><strong>CLÁUSULA PRIMEIRA - DO OBJETO:</strong> O objeto do presente contrato é a prestação de serviços de consultoria técnica para a elaboração de defesa administrativa referente ao <strong>Auto de Infração nº ${caseData.autoNumber}</strong>, placa <strong>${caseData.plate}</strong>.</p>
            
            <p style="margin-top: 15px; text-align: justify;"><strong>CLÁUSULA SEGUNDA - DAS OBRIGAÇÕES:</strong> A CONTRATADA obriga-se a utilizar todos os meios técnicos e legais para a defesa dos interesses do CONTRATANTE. O CONTRATANTE obriga-se a fornecer toda a documentação solicitada em tempo hábil.</p>
            
            <p style="margin-top: 15px; text-align: justify;"><strong>CLÁUSULA TERCEIRA - DOS HONORÁRIOS:</strong> Pelos serviços prestados, o CONTRATANTE pagará o valor estipulado na plataforma de atendimento, conforme as condições de pagamento selecionadas.</p>
            
            <p style="margin-top: 15px; text-align: justify;"><strong>CLÁUSULA QUARTA - DO FORO:</strong> As partes elegem o foro de Brasília/DF para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            
            <p style="text-align: right; margin-top: 40px;">Brasília, ${date}.</p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 80px;">
              <div style="border-top: 1px solid black; width: 250px; text-align: center; padding-top: 5px;">
                <strong>CONTRATANTE</strong><br/>
                <span style="font-size: 9pt; opacity: 0.7;">${caseData.name}</span>
              </div>
              <div style="border-top: 1px solid black; width: 250px; text-align: center; padding-top: 5px;">
                <strong>CONTRATADA</strong><br/>
                <span style="font-size: 9pt; opacity: 0.7;">${WHITE_LABEL.COMPANY_NAME}</span>
              </div>
            </div>

            <div style="margin-top: 100px; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
              Documento gerado por ${WHITE_LABEL.COMPANY_NAME} • ${WHITE_LABEL.WEBSITE}
            </div>
          </div>
        `;
      } else if (docType === 'Procuração') {
        template = `
          <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: black; font-size: 12pt;">
            <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 40px; text-transform: uppercase;">PROCURAÇÃO PARA FINS ADMINISTRATIVOS</h1>
            
            <p style="text-align: justify;"><strong>OUTORGANTE:</strong> ${caseData.name.toUpperCase()}, portador(a) do RG nº ____________ e CPF nº ____________, residente em ${caseData.address || 'Brasília/DF'}.</p>
            
            <p style="text-align: justify; margin-top: 20px;"><strong>OUTORGADO:</strong> ${WHITE_LABEL.COMPANY_NAME.toUpperCase()}, com sede em Brasília/DF, neste ato representada por seus consultores técnicos.</p>
            
            <p style="text-align: justify; margin-top: 20px;"><strong>PODERES:</strong> Pelo presente instrumento, o outorgante confere ao outorgado poderes para representá-lo(a) perante órgãos de trânsito (DETRAN, PRF, DNIT, DER) e órgãos colegiados (JARI, CETRAN, CONTRANDIFE), exclusivamente para tratar da defesa e recursos relativos ao <strong>Auto de Infração nº ${caseData.autoNumber}</strong>, placa <strong>${caseData.plate}</strong>, podendo assinar petições, interpor recursos, requerer cópias de processos e praticar todos os demais atos necessários ao bom e fiel cumprimento do mandato.</p>
            
            <p style="text-align: center; margin-top: 60px;">Brasília, ${date}.</p>
            
            <div style="margin-top: 100px; text-align: center;">
              <div style="border-top: 1px solid black; width: 350px; margin: 0 auto; padding-top: 5px;">
                <strong>${caseData.name.toUpperCase()}</strong><br/>
                <span style="font-size: 10pt; opacity: 0.7;">Outorgante</span>
              </div>
            </div>

            <div style="margin-top: 120px; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
              Documento gerado por ${WHITE_LABEL.COMPANY_NAME} • ${WHITE_LABEL.WEBSITE}
            </div>
          </div>
        `;
      } else if (docType === 'Recurso') {
        template = `
          <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: black; font-size: 12pt;">
            <p style="text-align: right;"><strong>ILUSTRÍSSIMO SENHOR PRESIDENTE DA JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES – JARI DO ${caseData.organ || 'DETRAN'}.</strong></p>
            
            <p style="margin-top: 40px; text-indent: 1.5cm; text-align: justify;">
              <strong>${caseData.name.toUpperCase()}</strong>, brasileiro(a), portador(a) do RG nº ____________ e CPF nº ____________, residente e domiciliado(a) em ${caseData.address || 'Brasília/DF'}, proprietário(a)/condutor(a) do veículo de marca/modelo ____________, placa <strong>${caseData.plate}</strong>, RENAVAM ____________, vem, tempestivamente, à presença de Vossa Senhoria, com fulcro na Lei nº 9.503/97 (Código de Trânsito Brasileiro), interpor o presente
            </p>

            <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin: 30px 0; text-transform: uppercase;">RECURSO ADMINISTRATIVO</h1>
            
            <p style="text-align: justify;">em face do <strong>Auto de Infração nº ${caseData.autoNumber}</strong>, lavrado em ${caseData.infractionDate}, por suposta infração ao <strong>Art. ${caseData.infractionArt || '___'}</strong> do CTB, pelos fatos e fundamentos a seguir expostos:</p>
            
            <h3 style="font-weight: bold; margin-top: 25px; text-transform: uppercase;">1. DOS FATOS</h3>
            <p style="text-indent: 1.5cm; text-align: justify;">O recorrente foi autuado na data de ${caseData.infractionDate}, no local ${caseData.address || 'indicado no AIT'}, sob a alegação de estar ${caseData.infractionDescription || caseData.infractionType}. Todavia, tal autuação não deve prosperar, conforme restará demonstrado.</p>
            
            <h3 style="font-weight: bold; margin-top: 25px; text-transform: uppercase;">2. DO DIREITO E DAS NULIDADES</h3>
            <p style="text-indent: 1.5cm; text-align: justify;">Preliminarmente, observa-se que o referido Auto de Infração padece de vícios formais insanáveis que comprometem sua validade jurídica, nos termos do Art. 281, parágrafo único, inciso I, do CTB.</p>
            <p style="text-indent: 1.5cm; text-align: justify;">[INSERIR FUNDAMENTAÇÃO TÉCNICA ESPECÍFICA AQUI COM BASE NA ANÁLISE DE IA]</p>
            
            <h3 style="font-weight: bold; margin-top: 25px; text-transform: uppercase;">3. DOS PEDIDOS</h3>
            <p style="text-indent: 1.5cm; text-align: justify;">Diante de todo o exposto, requer-se:</p>
            <ol style="margin-left: 2cm;">
              <li>O recebimento do presente recurso em seu efeito suspensivo;</li>
              <li>No mérito, o seu total <strong>PROVIMENTO</strong>, com o consequente <strong>CANCELAMENTO</strong> do Auto de Infração e a baixa de toda e qualquer pontuação ou penalidade dele decorrente.</li>
            </ol>
            
            <p style="text-align: left; margin-top: 40px;">Pede Deferimento.</p>
            <p style="text-align: left;">Brasília, ${date}.</p>
            
            <div style="margin-top: 80px; text-align: center;">
              <div style="border-top: 1px solid black; width: 350px; margin: 0 auto; padding-top: 5px; font-weight: bold;">${caseData.name.toUpperCase()}</div>
              <p style="font-size: 10pt; opacity: 0.7;">Recorrente</p>
            </div>

            <div style="margin-top: 100px; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
              Documento gerado por ${WHITE_LABEL.COMPANY_NAME} • ${WHITE_LABEL.WEBSITE}
            </div>
          </div>
        `;
      } else if (docType === 'Pagamento') {
        template = `
          <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: black; font-size: 12pt;">
            <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 40px; text-transform: uppercase;">AVISO DE COBRANÇA E TERMOS DE PAGAMENTO</h1>
            
            <p style="text-indent: 1.5cm;"><strong>CLIENTE:</strong> ${caseData.name}</p>
            <p style="text-indent: 1.5cm;"><strong>REFERÊNCIA:</strong> Assessoria Jurídica - Processo #${caseData.autoNumber}</p>
            
            <p style="text-indent: 1.5cm; text-align: justify; margin-top: 30px;">Prezado(a) cliente, confirmamos a geração da cobrança referente aos serviços contratados. Abaixo seguem as informações para quitação:</p>
            
            <div style="border: 1px solid #ccc; padding: 20px; margin: 30px 0; background: #f9f9f9;">
              <p><strong>VALOR TOTAL:</strong> R$ ${initialContent || '0,00'}</p>
              <p><strong>VENCIMENTO:</strong> ${date}</p>
              <p><strong>MÉTODO:</strong> PIX / Cartão de Crédito</p>
            </div>
            
            <p style="text-indent: 1.5cm; text-align: justify;">A execução das próximas etapas do processo está condicionada à confirmação do recebimento deste valor. Em caso de dúvidas, nossa equipe está à disposição via WhatsApp.</p>
            
            <p style="text-align: center; margin-top: 50px;">Atenciosamente,</p>
            <p style="text-align: center; font-weight: bold;">${WHITE_LABEL.COMPANY_NAME.toUpperCase()}</p>

            <div style="margin-top: 80px; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
              ${WHITE_LABEL.COMPANY_NAME} • ${WHITE_LABEL.WEBSITE}
            </div>
          </div>
        `;
      }
      setContent(template);
    }
  }, [caseData, isOpen, docType, initialContent]);

  const handleDownloadPDF = async () => {
    if (!editorRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(editorRef.current, {
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${docType}_${caseData.id}.pdf`);
      toast.success('PDF gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave(`${docType}_${caseData.id}.html`, content);
    setIsSaving(false);
    toast.success('Documento salvo no histórico');
    onClose();
  };

  const handleWhatsApp = () => {
    const phone = caseData.phone?.replace(/\D/g, '') || '';
    
    // Extract plain text from HTML content for a cleaner preview if possible
    // but WhatsApp message has a limit. Better to send a summary and the content if it's a short one,
    // or just the full text if it's a "Defesa" or "Recurso".
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.innerText || tempDiv.textContent || '';
    
    // Limit to avoid breaking the URL length limit (approx 2000 chars safely)
    const teaser = plainText.length > 1500 ? plainText.substring(0, 1500) + '...' : plainText;

    const message = `Olá ${caseData.name}, segue o documento (${docType}) referente ao processo #${caseData.autoNumber || caseData.id}:\n\n${teaser}\n\nLink do Documento: https://${WHITE_LABEL.WEBSITE.toLowerCase()}/docs/${docType.toLowerCase()}_${caseData.id}.pdf`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDoc = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full h-full max-w-5xl bg-surface-container flex flex-col shadow-[0_50px_150px_rgba(0,0,0,0.8)] border border-surface-container-highest md:rounded-[40px] overflow-hidden"
          >
            {/* Header / Toolbar */}
            <header className="px-6 py-4 bg-surface-container-highest/20 border-b border-surface-container-highest flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <FileCheck className="w-6 h-6 text-primary-container" />
                <div>
                  <h2 className="text-sm font-black text-on-surface uppercase tracking-tight">{docType} - {caseData.name}</h2>
                  <p className="text-[10px] text-on-surface-variant opacity-40 font-bold uppercase tracking-widest">Editor de Documentos Jurídicos</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 p-1 bg-surface rounded-xl border border-surface-container-highest mr-4">
                  <button onClick={() => formatDoc('bold')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all" title="Negrito"><Bold className="w-4 h-4" /></button>
                  <button onClick={() => formatDoc('italic')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all" title="Itálico"><Italic className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-surface-container-highest mx-1" />
                  <button onClick={() => formatDoc('justifyLeft')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all"><AlignLeft className="w-4 h-4" /></button>
                  <button onClick={() => formatDoc('justifyCenter')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all"><AlignCenter className="w-4 h-4" /></button>
                  <button onClick={() => formatDoc('justifyRight')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all"><AlignRight className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-surface-container-highest mx-1" />
                  <button onClick={() => formatDoc('insertUnorderedList')} className="p-2 hover:bg-surface-container-highest rounded-lg transition-all"><List className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-4 py-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all active:scale-95 border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar WhatsApp
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-3 bg-surface border border-surface-container-highest text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-container transition-all active:scale-95 shadow-sm"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isGenerating ? 'Gerando...' : 'Baixar PDF'}
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary-container/20 transition-all active:scale-95"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button onClick={onClose} className="p-3 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </header>

            {/* Editor Area */}
            <div className="flex-1 bg-surface-container-highest/30 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center">
              {/* Document Page */}
              <div 
                className="w-full max-w-[800px] min-h-[1100px] bg-white shadow-[0_10px_50px_rgba(0,0,0,0.1)] p-[80px] rounded-sm text-black font-serif prose prose-slate"
              >
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setContent(e.currentTarget.innerHTML)}
                  className="outline-none min-h-full transition-all focus:ring-0"
                  dangerouslySetInnerHTML={{ __html: content }}
                  style={{ fontSize: '14px', lineHeight: '1.6' }}
                />
              </div>
            </div>

            {/* Footer / Info */}
            <footer className="px-8 py-3 bg-surface border-t border-surface-container-highest flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">
              <div className="flex gap-4">
                <span>Páginas: 1</span>
                <span>Palavras: {content.split(' ').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-3 h-3" />
                Dica: O documento será salvo automaticamente no repositório do caso.
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
