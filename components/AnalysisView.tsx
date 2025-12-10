
import React from 'react';
import { AnalysisData } from '../types';
import { Sparkles, Target, AlertCircle } from 'lucide-react';
import { WHEEL_LABELS } from '../constants';

interface Props {
  data: AnalysisData | null;
  onClose: () => void;
  messagesCount: number;
}

const AnalysisView: React.FC<Props> = ({ data, onClose, messagesCount }) => {
  if (!data && messagesCount < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in bg-lia-bg">
        <Sparkles className="w-10 h-10 text-lia-secondary mb-4 opacity-50" />
        <h2 className="text-xl font-serif text-lia-primary mb-2">Conhecendo você</h2>
        <p className="text-lia-secondary text-sm leading-relaxed">
          Ainda preciso de um pouco mais de contexto para desenhar seu mapa estratégico.
          Continue conversando naturalmente.
        </p>
        <button onClick={onClose} className="mt-8 text-lia-primary border-b border-lia-primary pb-0.5 text-xs tracking-widest uppercase hover:opacity-70 transition-opacity">
          Voltar à conversa
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-lia-bg">
        <div className="animate-pulse rounded-full h-16 w-16 bg-lia-accent mb-4 blur-sm"></div>
        <p className="text-lia-secondary text-sm tracking-wide">Desenhando seu momento...</p>
      </div>
    );
  }

  const confidenceValue = data.confidence || 0;
  
  // Confiança Color Logic (Aura)
  const getAuraColor = (val: number) => {
    if (val < 40) return 'from-stone-200 to-stone-300';
    if (val < 70) return 'from-[#D6D3D1] to-[#A8A29E]'; 
    return 'from-[#E7E5E4] to-[#d4d1cf]'; 
  };

  // Helper function to render Bar Chart
  const renderBar = (key: string, value: number | null) => {
    const label = WHEEL_LABELS[key] || key;
    
    // Logic for color based on value
    // 0-3: Low/Alert (Reddish)
    // 4-6: Neutral (Stone)
    // 7-10: Good/Flow (Greenish/Dark Stone)
    // NOTE: StressOverload is inverted logically for color? 
    // Usually high stress (8-10) is BAD. Let's keep it simple: 
    // Visual logic: 0 is empty, 10 is full. Color indicates "Status".
    
    let barColor = 'bg-lia-secondary'; // Default stone
    
    if (value !== null) {
        if (key === 'stressOverload') {
            // Inverted logic for Stress: High is Red
            if (value >= 7) barColor = 'bg-red-300';
            else if (value >= 4) barColor = 'bg-stone-400';
            else barColor = 'bg-emerald-200'; // Low stress is green
        } else {
            // Standard logic
            if (value <= 3) barColor = 'bg-red-200'; // Low is alert
            else if (value <= 6) barColor = 'bg-stone-300'; // Mid is neutral
            else barColor = 'bg-emerald-300'; // High is good/flow
        }
    }

    return (
      <div key={key} className="flex flex-col mb-4 last:mb-0">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-sans text-lia-secondary uppercase tracking-wide">{label}</span>
          <span className={`text-xs font-bold ${value === null ? 'text-lia-muted font-light italic' : 'text-lia-primary'}`}>
            {value === null ? '-' : value}
          </span>
        </div>
        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
          {value !== null && (
             <div 
               className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
               style={{ width: `${value * 10}%` }}
             ></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-lia-bg no-scrollbar pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end px-6 pt-6 mb-8 border-b border-lia-accent/30 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-lia-primary">Seu Momento</h2>
          <p className="text-[10px] uppercase tracking-widest text-lia-secondary mt-1">Retrato Estratégico</p>
        </div>
        <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-lia-secondary hover:text-lia-primary transition-colors">
          Fechar
        </button>
      </div>

      <div className="px-6 space-y-8">
        
        {/* 1. Confidence Aura */}
        <section className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center w-48 h-48">
             {/* Animated Aura Blob */}
             <div className={`absolute inset-0 bg-gradient-to-tr ${getAuraColor(confidenceValue)} opacity-60 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_8s_linear_infinite] blur-xl transition-all duration-1000`}></div>
             <div className={`absolute inset-2 bg-gradient-to-bl ${getAuraColor(confidenceValue)} opacity-40 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-[spin_12s_linear_infinite_reverse] blur-lg transition-all duration-1000`}></div>
             
             {/* Text Content */}
             <div className="relative z-10 text-center">
               <span className="block text-4xl font-serif text-lia-primary tracking-tight">
                 {data.confidence !== null ? data.confidence : '-'}
               </span>
               <span className="block text-xs uppercase tracking-widest text-lia-secondary mt-1">
                 Confiança
               </span>
             </div>
          </div>
          <div className="mt-2 text-center">
             <p className="text-lia-primary font-medium font-serif italic text-lg">
               "{data.confidenceText}"
             </p>
          </div>
        </section>

        {/* 2. Wheel of Life (Horizontal Bars) */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-lia-accent/40">
           <h3 className="text-xs font-sans text-lia-muted uppercase tracking-widest mb-6">Mapeamento de Áreas</h3>
           
           <div className="space-y-1">
             {data.wheel ? (
                <>
                  {renderBar('careerPurpose', data.wheel.careerPurpose)}
                  {renderBar('routineEnergy', data.wheel.routineEnergy)}
                  {renderBar('relationships', data.wheel.relationships)}
                  {renderBar('love', data.wheel.love)}
                  {renderBar('sexualEnergy', data.wheel.sexualEnergy)}
                  {renderBar('healthBody', data.wheel.healthBody)}
                  {renderBar('emotionalWellbeing', data.wheel.emotionalWellbeing)}
                  {renderBar('stressOverload', data.wheel.stressOverload)}
                </>
             ) : (
                <div className="text-center py-8 text-lia-muted text-sm italic">
                   Dados insuficientes para gerar o gráfico.
                </div>
             )}
           </div>
        </section>

        {/* 3. Focus Areas */}
        <section className="bg-stone-100 rounded-2xl p-6 border-l-4 border-lia-primary">
          <div className="flex items-center gap-2 mb-3">
             <Target className="w-4 h-4 text-lia-primary" />
             <h3 className="text-xs font-sans text-lia-primary uppercase tracking-widest font-bold">Focos Principais</h3>
          </div>
          <div className="space-y-2">
            {data.focusAreas.length > 0 ? (
              data.focusAreas.map((focus, idx) => (
                <p key={idx} className="text-lia-text font-serif text-lg leading-snug">
                  {focus}
                </p>
              ))
            ) : (
              <p className="text-lia-secondary italic text-sm">Manutenção de Rotina</p>
            )}
          </div>
        </section>

        {/* 4. Dilemmas */}
        <section>
           <h3 className="text-xs font-sans text-lia-muted uppercase tracking-widest mb-3 pl-1">Dilemas em Pauta</h3>
           <div className="space-y-3">
             {data.dilemmas.length > 0 ? (
               data.dilemmas.map((dilemma, idx) => (
                 <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-lia-accent/50">
                   <AlertCircle className="w-4 h-4 text-lia-secondary mt-0.5 shrink-0" />
                   <p className="text-sm text-lia-text leading-relaxed">{dilemma}</p>
                 </div>
               ))
             ) : (
               <div className="p-4 border border-dashed border-lia-secondary/30 rounded-xl text-center">
                 <p className="text-lia-muted text-sm italic">Sem dilemas conflitantes detectados.</p>
               </div>
             )}
           </div>
        </section>

      </div>
    </div>
  );
};

export default AnalysisView;
