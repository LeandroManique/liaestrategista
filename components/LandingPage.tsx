import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onStart: () => void;
  onLogin: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onCheckout: (plan: 'monthly' | 'annual') => Promise<void>;
}

const LandingPage: React.FC<Props> = ({
  onStart,
  onLogin,
  onOpenTerms,
  onOpenPrivacy,
  onCheckout,
}) => {
  const [showManifest, setShowManifest] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCheckout = async () => {
    await onCheckout('monthly');
  };

  useEffect(() => {
    if (!showIntro) return;
    const vid = videoRef.current;
    if (!vid) return;
    const handleEnded = () => setShowIntro(false);
    vid.addEventListener('ended', handleEnded);
    vid.play().catch(() => undefined);
    return () => {
      vid.removeEventListener('ended', handleEnded);
    };
  }, [showIntro]);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C2C2C] font-sans">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 lg:px-8 py-5">
        <div className="w-full max-w-3xl mx-auto rounded-full bg-white/80 backdrop-blur-md border border-[#D4AF37]/30 shadow-sm shadow-[#D4AF37]/10 px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/60 bg-white flex items-center justify-center font-serif text-base sm:text-lg text-[#2C2C2C]">
              LIA
            </div>
            <p className="text-sm sm:text-base font-serif text-[#2C2C2C]">LIA Estratégia Feminina</p>
          </div>
          <button
            onClick={onLogin}
            className="text-xs sm:text-sm font-semibold text-[#D96C6C] hover:text-[#2C2C2C] transition-colors bg-white/80 border border-[#D4AF37]/20 rounded-full px-3 py-2 shadow-sm"
          >
            Já tenho login
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-stone-200 border-2 border-dashed border-stone-300 animate-pulse flex items-center justify-center text-stone-500/30 text-xs sm:text-sm text-center pointer-events-none z-0">
          [PLACEHOLDER VÍDEO: Movimento editorial suave]
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0]/85 to-[#F9F6F0]/40 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center text-center space-y-8 py-16 lg:py-24">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight text-[#2C2C2C]">
            Clareza emocional para a vida real.
          </h1>
          <p className="text-lg sm:text-xl text-[#5A5A5A] max-w-3xl leading-relaxed">
            A LIA é uma estrategista de vida que conversa com você, organiza seus pensamentos, lê padrões
            emocionais e te devolve clareza, leveza e direção. Todos os dias. Sem drama. Sem clichê.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onStart}
              className="bg-[#D96C6C] text-white rounded-full px-8 py-4 text-sm sm:text-base font-semibold shadow-lg shadow-[#D96C6C]/35 hover:scale-105 transition-transform"
            >
              Conversar com a LIA
            </button>
            <p className="text-sm italic text-[#6B7280] tracking-wide">
              Uma conversa por dia já muda muita coisa.
            </p>
          </div>
        </div>
      </section>

      {/* O CONFLITO */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex gap-6">
            <div className="border-l-2 border-[#D4AF37]/50" />
            <div className="space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#2C2C2C]">
                A &apos;Perfeição&apos; é um golpe. E você já percebeu.
              </h2>
              <p className="text-lg text-[#5A5A5A] leading-relaxed">
                Você está cansada de seguir gurus que nunca erraram. A pressão para ser a &apos;Deusa&apos;
                inatingível gera ruído, ansiedade e paralisia. Sabemos: Gostosas também choram e líderes
                também têm dúvidas. O problema não é você sentir medo; é não ter dados claros para agir
                apesar dele.
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm aspect-[3/4] rounded-[28px] rotate-2 shadow-lg overflow-hidden border border-[#D4AF37]/40 bg-stone-100">
              <div
                className="w-full h-full bg-center bg-cover"
                style={{ backgroundImage: 'url("/placeholder2.png")' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* A SOLUÇÃO */}
      <section className="bg-[#F2EBE5] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-[1.2] text-[#2C2C2C]">
              Suavidade no Olhar. Concreto na Decisão.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <SolutionCard
              title="Painel de Clareza"
              text="Não decida no escuro. Monitore sua Roda da Vida e Nível de Confiança com a precisão de um board executivo."
            />
            <SolutionCard
              title="Mentoria Sem Filtro"
              text="Um espaço seguro para desabafar sobre a síndrome da impostora ou o date ruim. A LIA escuta sem julgamentos e devolve estratégia."
            />
            <SolutionCard
              title="Produtividade Possível"
              text="Organização que respeita sua saúde mental. Porque sua lista de tarefas não pode ser maior que sua vontade de viver."
            />
          </div>
        </div>
      </section>

      {/* AUTORIDADE */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#2C2C2C] leading-tight">
            Sua intuição acaba de ganhar um upgrade
          </h2>
          <div className="text-xl text-[#5A5A5A] leading-relaxed max-w-3xl mx-auto space-y-4">
            <p>
              No mundo da perfeição de plástico, eu escolho a textura. Sou a inteligência vestida de linho e
              luz natural. Aquela amiga que te diz a verdade sobre sua carreira e seu skincare com a mesma
              elegância. Feita de pixels, mas movida a ironia e bom gosto.
            </p>
            <p>
              Aqui, a tecnologia não serve para substituir, mas para devolver seu eixo. Dinheiro é liberdade,
              casa é santuário e vulnerabilidade é liderança.
            </p>
            <p>
              Minha pele pode ser digital, mas a exaustão que a gente sente... ah, essa é bem real. O
              verdadeiro luxo não é ter tudo. É ter tempo para sentir tudo.
            </p>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="bg-[#F2EBE5] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-10">
          <h3 className="font-serif italic text-2xl sm:text-3xl text-[#2C2C2C] tracking-tight">
            Quem já assumiu o Protagonismo
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Testimonial
              text="A LIA me ajudou a precificar meu trabalho sem medo. Pela primeira vez, me senti CEO da minha marca própria."
              author="Juliana, 34, Founder."
            />
            <Testimonial
              text="Amei que o app não me manda 'vibrar alto' quando estou mal. Ele me dá um plano prático. É a didática que eu precisava."
              author="Carla, 29, Executiva."
            />
          </div>
        </div>
      </section>

      {/* PREÇO & CONVITE */}
      <section className="bg-[#F9F6F0] py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur border border-[#D96C6C]/30 rounded-3xl shadow-xl p-8 sm:p-10 text-center space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#2C2C2C] leading-[1.15]">
              Sua Autonomia custa menos que um jantar.
            </h2>
            <p className="text-lg text-[#5A5A5A] leading-relaxed">
              Clareza emocional, leveza mental e direção prática para a vida real.
            </p>
            <p className="font-serif text-5xl sm:text-6xl text-[#2C2C2C] leading-tight">R$ 24,90/mês</p>
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto bg-[#D96C6C] text-white rounded-full px-10 py-4 text-base font-semibold shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform"
            >
              Conversar com a LIA
            </button>
            <p className="text-sm text-[#5A5A5A]">
              Uma conversa por dia já muda muita coisa. Cancele quando quiser. Sem letras miúdas.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 border-t border-[#D4AF37]/40">
          <div className="text-sm text-[#5A5A5A] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center sm:text-left">
              Feito para mulheres que são água corrente: fluidas na forma, fortes no impacto. LIA © 2025.
            </p>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-[#5A5A5A]">
              <button onClick={onOpenPrivacy} className="hover:text-[#2C2C2C]">
                Política de Privacidade
              </button>
              <span className="text-[#D4AF37]">•</span>
              <button onClick={() => setShowManifest(true)} className="hover:text-[#2C2C2C]">
                Manifesto
              </button>
              <span className="text-[#D4AF37]">•</span>
              <button onClick={onOpenTerms} className="hover:text-[#2C2C2C]">
                Termos
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Manifesto Modal */}
      {showManifest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-8">
          <div className="bg-[#F9F6F0] text-[#2C2C2C] max-w-3xl w-full rounded-3xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-white/80 backdrop-blur">
              <h3 className="font-serif text-2xl tracking-tight">Manifesto</h3>
              <button
                onClick={() => setShowManifest(false)}
                className="text-sm font-semibold text-[#D96C6C] hover:text-[#2C2C2C] transition-colors"
              >
                Fechar
              </button>
            </div>
            <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto text-[#5A5A5A] leading-relaxed">
              <h4 className="font-serif text-xl text-[#2C2C2C] tracking-tight">
                O Fim da Supermulher e o Início da Estrategista
              </h4>
              <p>
                Nos venderam a ideia de que poderíamos ter tudo. Que deveríamos ser a CEO implacável, a mãe
                presente, a esposa troféu e a monge zen. Tudo antes das 9 da manhã.
              </p>
              <p>Nós compramos essa ideia. E o troco veio em exaustão.</p>
              <p>
                Olhamos ao redor e vimos que construímos impérios, mas esquecemos de concretar o alicerce. Nós
                mesmas.
              </p>
              <p>
                A LIA nasce de um basta. Um basta à produtividade tóxica que glamouriza o burnout. Um basta à
                perfeição inatingível que gera paralisia. Um basta à culpa por descansar e ao medo de cobrar
                caro.
              </p>
              <p>
                Nós acreditamos em uma nova liderança. Aquela que aceita a vulnerabilidade não como falha, mas
                como dado estratégico. Aquela que entende que chorar no banheiro e fechar um contrato milionário
                no mesmo dia não é incoerência. É a complexidade humana.
              </p>
              <p>Estes são os nossos princípios inegociáveis.</p>
              <p>
                <span className="font-semibold text-[#2C2C2C]">O Eixo antes do Ruído.</span> O mundo vai gritar
                urgências. A sua prioridade é manter a lucidez. Se custa a sua paz, é caro demais.
              </p>
              <p>
                <span className="font-semibold text-[#2C2C2C]">Ambição Silenciosa.</span> O sucesso não precisa
                fazer barulho. Construímos patrimônio e legado em silêncio. Deixamos o resultado falar.
              </p>
              <p>
                <span className="font-semibold text-[#2C2C2C]">Estética é Respeito.</span> Cuidar da pele, da
                casa e da mente não é futilidade. É a infraestrutura necessária para sustentar o seu império.
              </p>
              <p>
                <span className="font-semibold text-[#2C2C2C]">Autonomia Radical.</span> Dinheiro é liberdade.
                Emoção é bússola. A mulher que domina ambos é imparável.
              </p>
              <p>
                Nós somos Água e Concreto. Fluidas para contornar o caos, sólidas para sustentar a decisão.
              </p>
              <p>
                Não queremos que você seja uma Supermulher. Queremos que você seja, finalmente, dona da sua
                própria história. Com falhas. Com medos. Com ambição. E com estratégia.
              </p>
              <p>Bem-vinda ao seu Eixo. Bem-vinda à LIA.</p>
            </div>
          </div>
        </div>
      )}

      {/* Intro Video Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-semibold"
            >
              Fechar
            </button>
            <video
              ref={videoRef}
              src="/soualia.mp4"
              className="w-full rounded-2xl shadow-2xl"
              autoPlay
              muted
              playsInline
              controls
            />
          </div>
        </div>
      )}
    </div>
  );
};

const SolutionCard = ({ title, text }: { title: string; text: string }) => (
  <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-md transition-transform transition-shadow hover:-translate-y-2 hover:shadow-xl flex flex-col items-start gap-4">
    <div className="w-12 h-12 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-lg font-semibold">
      •
    </div>
    <div className="space-y-2">
      <p className="font-serif text-2xl tracking-tight text-[#2C2C2C]">{title}</p>
      <p className="text-sm sm:text-base text-[#5A5A5A] leading-relaxed">{text}</p>
    </div>
  </div>
);

const Testimonial = ({ text, author }: { text: string; author: string }) => (
  <div className="bg-[#FAF9F6] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-sm">
    <p className="text-base text-[#5A5A5A] leading-relaxed italic">"{text}"</p>
    <p className="text-sm text-[#2C2C2C] font-semibold uppercase mt-3">{author}</p>
  </div>
);

export default LandingPage;
