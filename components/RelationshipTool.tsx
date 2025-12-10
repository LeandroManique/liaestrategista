
import React, { useState, useEffect } from 'react';
import { RelationshipData, UserProfile } from '../types';
import { ZODIAC_SIGNS, RELATIONSHIP_TYPES } from '../constants';

interface Props {
  userProfile: UserProfile;
  onAnalyze: (userStats: UserProfile, relData: RelationshipData) => void;
  onClose: () => void;
  isLoading: boolean;
}

const RelationshipTool: React.FC<Props> = ({ userProfile, onAnalyze, onClose, isLoading }) => {
  // Local state for user's own deep data in case they want to fill it just for this reading
  const [myStats, setMyStats] = useState<UserProfile>(userProfile);

  const [partnerData, setPartnerData] = useState<RelationshipData>({
    name: '',
    type: 'Amoroso',
    sign: '',
    ascendant: '',
    moon: '',
    venus: '',
    mars: ''
  });

  // Keep local state in sync if props update (unlikely while open, but good practice)
  useEffect(() => {
    setMyStats(userProfile);
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerData.sign) {
      alert("Por favor, selecione pelo menos o Signo Solar da outra pessoa.");
      return;
    }
    onAnalyze(myStats, partnerData);
  };

  return (
    <div className="h-full overflow-y-auto bg-lia-bg p-6 pb-20 animate-fade-in no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-lia-primary">Potencial Relacional</h2>
          <p className="text-[10px] text-lia-secondary tracking-widest uppercase mt-1">Leitura de Dinâmica</p>
        </div>
        <button onClick={onClose} className="text-sm uppercase tracking-widest text-lia-secondary hover:text-lia-primary">
          Fechar
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-lia-accent/50 mb-6">
        <p className="text-sm text-lia-secondary font-serif italic mb-2">
          "Entenda a energia entre vocês, sem certo ou errado, apenas como funciona."
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: USER DATA */}
        <div className="bg-stone-50 rounded-xl p-4 border border-lia-accent/30">
           <h3 className="text-xs font-sans text-lia-primary mb-4 uppercase tracking-wide font-bold border-b border-lia-accent pb-2">Seus Dados</h3>
           
           <div className="grid grid-cols-2 gap-4 mb-3">
             <div>
                <span className="block text-[10px] text-lia-muted mb-1 uppercase">Signo Solar</span>
                <div className="text-sm font-medium text-lia-primary">{myStats.sign}</div>
             </div>
             <div>
                <span className="block text-[10px] text-lia-muted mb-1 uppercase">Ascendente</span>
                <div className="text-sm font-medium text-lia-primary">{myStats.ascendant}</div>
             </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Sua Lua</label>
               <select
                 value={myStats.moon || ''}
                 onChange={e => setMyStats({ ...myStats, moon: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Seu Vênus</label>
               <select
                 value={myStats.venus || ''}
                 onChange={e => setMyStats({ ...myStats, venus: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Seu Marte</label>
               <select
                 value={myStats.mars || ''}
                 onChange={e => setMyStats({ ...myStats, mars: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
        </div>

        {/* SECTION 2: PARTNER DATA */}
        <div>
           <h3 className="text-xs font-sans text-lia-primary mb-4 uppercase tracking-wide font-bold border-b border-lia-accent pb-2">A Outra Pessoa</h3>

           <div className="mb-4">
             <label className="block text-[10px] text-lia-secondary mb-1 uppercase font-bold">Nome / Apelido (Opcional)</label>
             <input
               type="text"
               value={partnerData.name}
               onChange={e => setPartnerData({ ...partnerData, name: e.target.value })}
               placeholder="Ex: Crush, Chefe, Amiga..."
               className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary"
             />
           </div>

           <div className="mb-4">
             <label className="block text-[10px] text-lia-secondary mb-1 uppercase font-bold">Tipo de Relação</label>
             <div className="grid grid-cols-2 gap-2">
               {RELATIONSHIP_TYPES.map(type => (
                 <button
                   key={type}
                   type="button"
                   onClick={() => setPartnerData({ ...partnerData, type: type as any })}
                   className={`p-3 rounded-lg text-sm transition-all border ${
                     partnerData.type === type 
                     ? 'bg-lia-primary text-white border-lia-primary' 
                     : 'bg-white text-lia-secondary border-lia-accent hover:border-lia-secondary'
                   }`}
                 >
                   {type}
                 </button>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase font-bold">Signo Solar (Obrigatório)</label>
               <select
                 value={partnerData.sign}
                 onChange={e => setPartnerData({ ...partnerData, sign: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-sm text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">Selecionar</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Ascendente</label>
               <select
                 value={partnerData.ascendant}
                 onChange={e => setPartnerData({ ...partnerData, ascendant: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-sm text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">Não sei</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Lua</label>
               <select
                 value={partnerData.moon}
                 onChange={e => setPartnerData({ ...partnerData, moon: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Vênus</label>
               <select
                 value={partnerData.venus}
                 onChange={e => setPartnerData({ ...partnerData, venus: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Marte</label>
               <select
                 value={partnerData.mars}
                 onChange={e => setPartnerData({ ...partnerData, mars: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-lia-primary text-white font-serif py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <>Lendo conexão...</>
          ) : (
             <>Ver Potencial Relacional</>
          )}
        </button>

      </form>
    </div>
  );
};

export default RelationshipTool;
