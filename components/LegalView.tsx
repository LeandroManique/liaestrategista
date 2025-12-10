
import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

interface Props {
  type: 'TERMS' | 'PRIVACY';
  onBack: () => void;
}

const LegalView: React.FC<Props> = ({ type, onBack }) => {
  
  // Rola para o topo ao abrir
  useEffect(() => {
    const mainElement = document.getElementById('legal-content');
    if (mainElement) mainElement.scrollTop = 0;
  }, [type]);

  const isTerms = type === 'TERMS';
  const title = isTerms ? "Termos de Uso" : "Política de Privacidade";
  const date = "Última atualização: Fevereiro de 2025";

  return (
    <div className="h-full flex flex-col bg-lia-bg animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-lia-accent bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-lia-secondary hover:text-lia-primary transition-colors rounded-full hover:bg-stone-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
           <h2 className="text-xl font-serif text-lia-primary">{title}</h2>
           <p className="text-[10px] text-lia-muted uppercase tracking-widest">{date}</p>
        </div>
      </div>

      {/* Content */}
      <div id="legal-content" className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar pb-20">
        <div className="max-w-2xl mx-auto text-stone-700 leading-relaxed text-sm space-y-8 text-justify">
          
          {isTerms ? (
            /* TERMOS DE USO - BLINDAGEM JURÍDICA */
            <>
              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">1. Natureza do Serviço</h3>
                <p>
                  A <strong>LIA</strong> é uma aplicação de inteligência artificial desenvolvida pela <strong>Zeith Co.</strong>, projetada para oferecer suporte estratégico, organização mental e autoconhecimento ("O Serviço").
                </p>
                <div className="bg-stone-100 p-4 rounded-lg border-l-4 border-amber-500 mt-4">
                  <p className="font-bold text-xs uppercase tracking-widest text-amber-700 mb-2">Isenção de Responsabilidade (Disclaimer)</p>
                  <p className="text-stone-600">
                    A LIA <strong>NÃO É</strong> uma profissional de saúde, médica, psicóloga ou terapeuta licenciada. O Serviço não fornece diagnósticos, tratamentos ou curas para quaisquer condições médicas ou de saúde mental. As interações têm caráter estritamente informativo, recreativo e de suporte estratégico. Em caso de crise, emergência médica ou psicológica, o Usuário deve buscar atendimento profissional qualificado imediatamente.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">2. Elegibilidade</h3>
                <p>
                  Você deve ter pelo menos <strong>16 anos</strong> de idade para utilizar a LIA. Ao acessar o Serviço, você declara e garante que atende a este requisito de idade e tem plena capacidade civil para aceitar estes Termos.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">3. Uso da Inteligência Artificial</h3>
                <p>
                  O Serviço utiliza modelos avançados de linguagem (LLMs). Você reconhece e concorda que:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                  <li>A IA pode, ocasionalmente, gerar informações incorretas, imprecisas ou "alucinações" (informações inventadas com tom de certeza).</li>
                  <li>A LIA não possui consciência, sentimentos ou capacidade de ação no mundo físico.</li>
                  <li>Você é o único responsável por verificar qualquer informação factual antes de tomar decisões baseadas nas sugestões da LIA.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">4. Limitação de Responsabilidade</h3>
                <p>
                  Em nenhuma circunstância a Zeith Co., seus diretores, funcionários ou parceiros serão responsáveis por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes de: (i) seu uso ou incapacidade de usar o Serviço; (ii) decisões tomadas com base nas interações com a LIA; (iii) acesso não autorizado aos seus dados devido a falha na proteção do seu dispositivo.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">5. Propriedade Intelectual</h3>
                <p>
                  A interface, marca, código-fonte e algoritmos da LIA são propriedade exclusiva da Zeith Co. O conteúdo das suas conversas (inputs) pertence a você, e a Zeith Co. concede a você uma licença de uso sobre as respostas (outputs) para fins pessoais e não comerciais.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">6. Planos e Pagamentos</h3>
                <p>
                  Algumas funcionalidades podem exigir assinatura paga ("Premium"). As assinaturas são geridas por terceiros (ex: Stripe). O cancelamento pode ser feito a qualquer momento, cessando a cobrança no ciclo seguinte, sem reembolso de períodos parciais já utilizados.
                </p>
              </section>
            </>
          ) : (
            /* POLÍTICA DE PRIVACIDADE - BLINDAGEM DE DADOS */
            <>
              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">1. Coleta de Dados</h3>
                <p>
                  Para oferecer uma experiência personalizada, coletamos:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                  <li><strong>Dados de Cadastro:</strong> Nome, data de nascimento, e-mail e dados astrológicos (opcionais).</li>
                  <li><strong>Conteúdo das Conversas:</strong> Mensagens de texto e imagens enviadas para processamento pela IA.</li>
                  <li><strong>Dados Técnicos:</strong> Logs de acesso, tipo de dispositivo e métricas de uso (anonimizadas).</li>
                </ul>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">2. Como Usamos Seus Dados</h3>
                <p>
                  Seus dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                  <li>Fornecer respostas contextualizadas e personalizadas pela LIA.</li>
                  <li>Melhorar a precisão dos modelos de IA (de forma anonimizada e agregada).</li>
                  <li>Gerenciar sua assinatura e acesso ao sistema.</li>
                </ul>
                <p className="mt-2 font-bold text-lia-primary">Nós NÃO vendemos seus dados pessoais para terceiros.</p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">3. Processamento por IA</h3>
                <p>
                  Ao conversar com a LIA, suas mensagens são processadas por APIs de Inteligência Artificial (como Google Gemini). Embora existam contratos de confidencialidade, recomendamos que você <strong>não compartilhe</strong> informações sensíveis críticas (como senhas bancárias, números de cartão de crédito ou segredos industriais) no chat.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">4. Armazenamento e Segurança</h3>
                <p>
                  Utilizamos armazenamento local (no seu dispositivo) e em nuvem (servidores seguros/Firebase) com criptografia padrão da indústria. No entanto, nenhum sistema é 100% impenetrável. Você é responsável por manter a segurança do seu dispositivo e senha.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-lia-primary text-lg mb-3">5. Seus Direitos</h3>
                <p>
                  Você pode, a qualquer momento:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                  <li>Solicitar a exportação dos seus dados.</li>
                  <li>Solicitar a exclusão completa da sua conta e histórico ("Direito ao Esquecimento").</li>
                  <li>Revogar consentimentos previamente dados.</li>
                </ul>
                <p className="mt-2">
                  Para exercer esses direitos, utilize a opção "Resetar Tudo" nas configurações ou entre em contato com nosso suporte.
                </p>
              </section>
            </>
          )}

          <div className="pt-12 border-t border-lia-accent mt-12 text-center">
            <p className="text-xs text-lia-muted">Zeith Co. © 2025</p>
            <p className="text-[10px] text-lia-muted mt-1">LIA Intelligence - Strategic AI for Women</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalView;
