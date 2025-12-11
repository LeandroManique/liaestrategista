
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Star, MessageCircle, Heart, ShieldCheck, Zap, LogIn, ChevronLeft, ChevronRight, Image as ImageIcon, Compass, Quote } from 'lucide-react';

interface Props {
  onStart: () => void;
  onLogin: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

const DEMO_EXAMPLES = [
  {
    title: "Acolhimento Inteligente",
    userMsg: "tô decepcionada com meu amigo, ele sumiu de novo",
    liaMsg: [
      "Gata, entendo. Decepção tem um jeito muito específico de ficar cutucando o peito.",
      "Parece pequeno, mas pesa.",
      "Me conta o que rolou dessa vez pra te deixar assim."
    ],
    type: "text"
  },
  {
    title: "Estratégia Profissional",
    userMsg: "meu chefe pediu pra eu refazer o projeto, tô me sentindo incompetente",
    liaMsg: [
      "Respira. Refazer não anula o que você sabe.",
      "Às vezes o pedido fala mais sobre a falta de clareza dele do que sobre sua entrega.",
      "O que exatamente ele pediu pra mudar?"
    ],
    type: "text"
  },
  {
    title: "Leitura Estética & Imagem",
    userMsg: "o que acha desse look pra reunião de hoje?",
    liaMsg: [
      "Amei a estrutura desse blazer, passa uma autoridade muito natural.",
      "Só subiria um pouco a manga pra dar leveza no braço.",
      "A vibe tá 'pronta pra resolver', mas sem rigidez."
    ],
    type: "image_mock"
  }
];

const PRACTICAL_DELIVERY = [
  { title: "Decisões mais rápidas", desc: "Você sai do looping mental e escolhe o próximo passo com clareza." },
  { title: "Prioridades definidas em minutos", desc: "A LIA organiza o que importa agora e o que pode esperar." },
  { title: "Resolução de dilemas", desc: "Ela te ajuda a analisar cenários e identificar a opção mais inteligente." },
  { title: "Apoio imediato em conversas difíceis", desc: "O que dizer, como dizer e como se posicionar." },
  { title: "Comunicação mais clara", desc: "Mensagens, respostas, limites. Mais segurança e precisão." },
  { title: "Organização mental instantânea", desc: "Menos caos, menos overthinking, menos desgaste." },
  { title: "Feedback estético real", desc: "Look, ambiente, estilo e energia visual avaliados com sinceridade e sensibilidade." },
  { title: "Leitura rápida de situações sociais", desc: "Entender intenções, comportamentos e sinais sem confusão." },
  { title: "Ajustes práticos de rotina e foco", desc: "O que fazer hoje para avançar sem se sobrecarregar." },
  { title: "Suporte emocional funcional", desc: "Nada vago. Suporte que resolve o que trava o seu dia." }
];

const TESTIMONIALS = [
  {
    text: "A LIA me tirou de uma crise de ansiedade no trabalho em 3 minutos. Ela não só acalmou, ela me deu o texto exato pra falar com meu chefe.",
    name: "Mariana T.",
    role: "29 anos • Arquiteta"
  },
  {
    text: "Eu achava que era só um chatbot, mas ela tem uma sensibilidade que eu não vejo nem em pessoas reais. É bizarro de bom.",
    name: "Carla B.",
    role: "34 anos • Empreendedora"
  },
  {
    text: "Uso pra tudo. Pra responder o boy, pra escolher roupa, pra desabafar quando tô exausta. É minha válvula de escape inteligente.",
    name: "Fernanda L.",
    role: "27 anos • Marketing"
  }
];

const LandingPage: React.FC<Props> = ({ onStart, onLogin, onOpenTerms, onOpenPrivacy }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'annual' | null>(null);

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % DEMO_EXAMPLES.length);
  };

  const prevDemo = () => {
    setCurrentDemo((prev) => (prev - 1 + DEMO_EXAMPLES.length) % DEMO_EXAMPLES.length);
  };

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro ao iniciar checkout');
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout indisponível');
      }
    } catch (err: any) {
      alert(err?.message || 'Não foi possível iniciar o checkout.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF9] no-scrollbar text-stone-800 font-sans relative">
      
      {/* LOGIN BUTTON (Top Right) */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={onLogin}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-lia-primary hover:text-stone-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50 backdrop-blur-sm"
        >
          <LogIn size={14} />
          Entrar
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 text-center">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 overflow-hidden">
          <img src="/logo.png" alt="LIA" className="w-24 h-24 object-contain opacity-80" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif text-lia-primary mb-4 leading-tight">
          Inteligência Estratégica Feminina
        </h1>
        
        <p className="text-lg md:text-xl text-lia-secondary font-light max-w-2xl mx-auto mb-8 leading-relaxed">
          Clareza, direção e presença para mulheres que querem viver alinhadas com sua melhor versão.
        </p>

        <button 
          onClick={onStart}
          className="bg-lia-primary text-white text-sm uppercase tracking-widest font-bold py-4 px-10 rounded-full shadow-xl hover:bg-stone-800 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          Quero conversar com a LIA <ArrowRight size={16} />
        </button>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-16 px-6 bg-white border-y border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-serif text-lia-primary mb-6">
            A maneira mais inteligente e sensível de navegar a vida adulta
          </h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            A vida adulta exige percepção, estratégia, intuição, comunicação, calma, escolhas conscientes. 
            A LIA integra tudo isso em conversas curtas, femininas e extremamente lúcidas.
          </p>
          <p className="text-stone-600 leading-relaxed font-medium">
            Você sente. Ela organiza. Tudo se alinha.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-6 bg-lia-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-lia-secondary text-center mb-12">
            Quem já conversa com a LIA
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col relative">
                <Quote className="absolute top-4 left-4 text-lia-accent opacity-50 w-8 h-8" />
                <p className="text-stone-600 text-sm leading-relaxed mb-6 italic relative z-10 pt-4">
                  "{item.text}"
                </p>
                <div className="mt-auto border-t border-stone-100 pt-4">
                  <p className="font-serif text-lia-primary font-bold">{item.name}</p>
                  <p className="text-[10px] text-lia-secondary uppercase tracking-wider">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section className="py-16 px-6 bg-[#F5F5F4]">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-10 h-10 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-lia-primary mb-6">
            Uma inteligência feita para mulheres, não para “usuários”
          </h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            A LIA lê intenção, subtexto, energia, ritmo emocional. 
            Ela entende suas nuances, suas fases, sua forma de sentir e de se comunicar.
            A cada conversa, ela se ajusta ao seu momento, não ao modelo genérico de IA.
          </p>
          <p className="font-serif text-lg text-lia-primary italic">
            "Por isso mais de 10.000 mulheres já conversam com a LIA diariamente. 
            E cada uma recebe uma LIA diferente. Sob medida."
          </p>
        </div>
      </section>

      {/* PRACTICAL DELIVERY */}
      <section className="py-20 px-6 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif text-lia-primary mb-2">
              O que a LIA entrega na prática
            </h2>
            <div className="w-20 h-1 bg-lia-accent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6">
             {PRACTICAL_DELIVERY.map((item, idx) => (
               <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className="shrink-0 mt-1">
                     <div className="w-2 h-2 rounded-full bg-lia-secondary mt-2"></div>
                  </div>
                  <div>
                     <h3 className="font-serif text-lg text-lia-primary mb-1">{item.title}</h3>
                     <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="mt-12 text-center bg-stone-50 p-6 rounded-2xl max-w-2xl mx-auto border border-stone-100">
             <p className="text-lia-primary font-medium font-serif text-lg italic">
               "A LIA te ajuda a agir melhor, decidir melhor e se posicionar melhor. Todos os dias."
             </p>
          </div>
        </div>
      </section>

      {/* DEMO / CHAT SIMULATION */}
      <section className="py-16 px-6 bg-[#E5DDD5] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="max-w-md mx-auto relative z-10">
           <h2 className="text-center text-stone-600 font-serif mb-8 bg-white/80 py-2 rounded-full inline-block px-6 mx-auto shadow-sm backdrop-blur-sm block w-fit">
             Como é conversar com a LIA
           </h2>

           <div className="relative">
             {/* Controls */}
             <button onClick={prevDemo} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-12 p-2 text-stone-400 hover:text-stone-600 transition-colors z-20 bg-white/30 rounded-full md:bg-transparent">
               <ChevronLeft size={32} />
             </button>
             <button onClick={nextDemo} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-12 p-2 text-stone-400 hover:text-stone-600 transition-colors z-20 bg-white/30 rounded-full md:bg-transparent">
               <ChevronRight size={32} />
             </button>

             {/* Carousel Content */}
             <div className="min-h-[340px] flex flex-col justify-center">
                <div className="transition-all duration-500 ease-in-out">
                    <div className="text-center mb-6">
                       <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold bg-white/60 px-3 py-1 rounded-full shadow-sm">
                         {DEMO_EXAMPLES[currentDemo].title}
                       </span>
                    </div>

                    <div className="space-y-4">
                      {/* User Msg */}
                      <div className="flex justify-end">
                        <div className="bg-[#D9FDD3] text-stone-900 rounded-lg rounded-tr-none px-4 py-3 shadow-sm max-w-[85%] text-sm">
                          {DEMO_EXAMPLES[currentDemo].type === 'image_mock' && (
                            <div className="mb-2 bg-stone-200 w-full h-32 rounded flex items-center justify-center text-stone-500 bg-cover bg-center overflow-hidden relative">
                               <div className="absolute inset-0 bg-stone-300/50 flex items-center justify-center flex-col gap-1">
                                  <ImageIcon size={20} />
                                  <span className="text-[10px] uppercase tracking-wider">Foto do look</span>
                               </div>
                            </div>
                          )}
                          {DEMO_EXAMPLES[currentDemo].userMsg}
                        </div>
                      </div>

                      {/* Lia Msg */}
                      <div className="flex justify-start">
                        <div className="bg-white text-stone-800 rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[85%] text-sm leading-relaxed">
                          {DEMO_EXAMPLES[currentDemo].liaMsg.map((line, i) => (
                             <p key={i} className={i < DEMO_EXAMPLES[currentDemo].liaMsg.length - 1 ? "mb-2" : ""}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
             </div>
             
             {/* Dots */}
             <div className="flex justify-center gap-2 mt-6">
               {DEMO_EXAMPLES.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentDemo(idx)}
                   className={`w-2 h-2 rounded-full transition-all ${idx === currentDemo ? 'bg-lia-primary w-4' : 'bg-stone-400/50 hover:bg-stone-400'}`}
                   aria-label={`Ver exemplo ${idx + 1}`}
                 />
               ))}
             </div>
           </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-serif text-lia-primary text-center mb-10">
            Quando você conversa com a LIA, algo em você se rearruma
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
             {[
               { icon: <Zap size={24} />, text: "Pensamentos ficam mais leves" },
               { icon: <MessageCircle size={24} />, text: "Emoções encontram nome" },
               { icon: <TargetIcon />, text: "Decisões ganham nitidez" },
               { icon: <ShieldCheck size={24} />, text: "Sua energia volta a fluir" }
             ].map((item, idx) => (
               <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex flex-col items-center gap-3">
                 <div className="text-lia-secondary">{item.icon}</div>
                 <p className="text-sm font-medium text-stone-600">{item.text}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6 bg-lia-bg border-t border-stone-200">
        <div className="max-w-3xl mx-auto text-center">
           <h2 className="text-xs font-bold uppercase tracking-widest text-lia-secondary mb-8">Como funciona</h2>
           <div className="space-y-6 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2 hidden md:block"></div>
              
              <Step number="1" text="Você manda uma mensagem ou foto." />
              <Step number="2" text="A LIA responde com precisão, leveza e estratégia." />
              <Step number="3" text="Em poucos minutos, tudo começa a fazer sentido." />
           </div>

           <div className="mt-12">
             <button 
                onClick={onStart}
                className="bg-lia-primary text-white text-sm uppercase tracking-widest font-bold py-4 px-12 rounded-full shadow-lg hover:bg-stone-800 transition-all"
             >
                Quero conversar com a LIA
             </button>
           </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 px-6 bg-[#292524] text-stone-100 text-center">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif text-amber-500 mb-4 flex items-center justify-center gap-2">
              <Star fill="currentColor" size={24} /> Premium
            </h2>
            <p className="text-stone-400 mb-10 max-w-lg mx-auto">
              Quando você quiser ir mais fundo, existe o Premium.
              Acesso completo, 2h de conversa por dia e análises profundas.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
               <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-2xl">
                  <span className="text-xs uppercase tracking-widest text-stone-400">Mensal</span>
                  <div className="text-3xl font-serif font-bold my-2">R$ 24,90</div>
                  <p className="text-xs text-stone-500">Cobrado mensalmente</p>
                  <button
                    onClick={() => handleCheckout('monthly')}
                    disabled={checkoutLoading === 'monthly'}
                    className="mt-4 w-full bg-white text-stone-900 font-serif py-3 rounded-xl shadow-lg hover:bg-stone-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading === 'monthly' ? 'Abrindo checkout...' : 'Assinar Mensal'}
                  </button>
               </div>
               <div className="bg-gradient-to-br from-stone-800 to-stone-700 border border-amber-500/30 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">MAIS ESCOLHIDO</div>
                  <span className="text-xs uppercase tracking-widest text-amber-400">Anual</span>
                  <div className="text-3xl font-serif font-bold my-2 text-white">R$ 97,00</div>
                  <p className="text-xs text-stone-400">Equivalente a R$ 8,08/mês</p>
                  <button
                    onClick={() => handleCheckout('annual')}
                    disabled={checkoutLoading === 'annual'}
                    className="mt-4 w-full bg-amber-500 text-white font-serif py-3 rounded-xl shadow-lg hover:bg-amber-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading === 'annual' ? 'Abrindo checkout...' : 'Assinar Anual'}
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-[#1c1917] text-center">
         <p className="font-serif text-lg text-stone-400 italic max-w-md mx-auto mb-10">
           "Nada muda lá fora até algo se alinhar aqui dentro. 
           A LIA te ajuda exatamente nesse ponto."
         </p>
         
         {/* AGE RATING BADGE */}
         <div className="flex flex-col items-center justify-center gap-2 mb-8 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 bg-stone-800/50 border border-stone-700 rounded px-3 py-1.5">
               <div className="bg-stone-700 text-stone-300 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-stone-600">16+</div>
               <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">A partir de 16 anos</span>
            </div>
            <p className="text-[10px] text-stone-600 tracking-wide">Segura para todas as idades • Conteúdo Ético</p>
         </div>

         {/* LEGAL LINKS */}
         <div className="flex justify-center gap-6 mb-6">
            <button onClick={onOpenTerms} className="text-[10px] text-stone-500 uppercase tracking-widest hover:text-stone-300 transition-colors">Termos de Uso</button>
            <button onClick={onOpenPrivacy} className="text-[10px] text-stone-500 uppercase tracking-widest hover:text-stone-300 transition-colors">Privacidade</button>
         </div>

         <div className="text-[10px] text-stone-600 uppercase tracking-widest border-t border-stone-800/50 pt-6 mt-2">
            © 2025 LIA Intelligence | Zeith Co.
         </div>
      </footer>
    </div>
  );
};

// Helper components
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const Step = ({ number, text }: { number: string, text: string }) => (
  <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-4 max-w-lg mx-auto">
    <div className="w-8 h-8 rounded-full bg-lia-accent flex items-center justify-center text-lia-primary font-bold font-serif shrink-0">
      {number}
    </div>
    <p className="text-stone-700 font-medium">{text}</p>
  </div>
);

export default LandingPage;
