import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { calculateNumerology } from '../services/numerology';
import { ZODIAC_SIGNS, NUMEROLOGY_MEANINGS } from '../constants';
import { Crown, Sparkles, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (p: UserProfile) => Promise<void> | void;
  onClose: () => void;
  onClearChat: () => void;
  onFullReset: () => void;
}

const ProfileSettings: React.FC<Props> = ({ profile, onSave, onClose, onClearChat, onFullReset }) => {
  const [formData, setFormData] = useState(profile);
  const [showNumerologyDetails, setShowNumerologyDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Recalculate numerology if name or birthdate changes
  useEffect(() => {
    if (formData.name && formData.birthDate) {
      const numData = calculateNumerology(formData.name, formData.birthDate);
      setFormData(prev => ({ ...prev, numerology: numData }));
    }
  }, [formData.name, formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...formData, hasOnboarded: true });
    setSaving(false);
  };

  const handleLoginOrUpgrade = () => {
    alert("Em breve: crie sua conta para salvar na nuvem e assinar o LIA Premium.");
  };

  return (
    <div className="h-full overflow-y-auto bg-lia-bg p-6 pb-20 animate-fade-in no-scrollbar">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 text-lia-secondary hover:text-lia-primary transition-colors rounded-full hover:bg-stone-100"
          title="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-serif text-lia-primary">Seu Perfil</h2>
      </div>

      {/* Subscription Card */}
      {profile.hasOnboarded && (
        <div className={`mb-8 p-6 rounded-2xl shadow-sm border flex justify-between items-center ${
           profile.subscriptionStatus === 'PREMIUM' 
           ? 'bg-[#292524] border-yellow-600/50 text-stone-100' 
           : 'bg-white border-lia-accent'
        }`}>
           <div>
             <h3 className={`text-sm font-sans uppercase tracking-widest mb-1 ${
                profile.subscriptionStatus === 'PREMIUM' ? 'text-yellow-500' : 'text-lia-secondary'
             }`}>
                Sua Assinatura
             </h3>
             <div className="flex items-center gap-2">
                {profile.subscriptionStatus === 'PREMIUM' && <Crown size={16} className="text-yellow-500" />}
                <span className={`text-xl font-serif font-bold ${
                   profile.subscriptionStatus === 'PREMIUM' ? 'text-white' : 'text-lia-primary'
                }`}>
                   {profile.subscriptionStatus === 'PREMIUM' ? 'LIA Premium' : 'Plano Gratuito'}
                </span>
             </div>
           </div>
           
           <button 
             onClick={handleLoginOrUpgrade}
             className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                profile.subscriptionStatus === 'PREMIUM'
                ? 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                : 'bg-lia-primary text-white hover:bg-stone-700 shadow-md'
             }`}
           >
             {profile.subscriptionStatus === 'PREMIUM' ? 'Gerenciar' : 'Assinar Premium'}
           </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-sans text-lia-secondary mb-2 uppercase tracking-wide">Como gostaria de ser chamada?</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
           <label className="block text-sm font-sans text-lia-secondary mb-2 uppercase tracking-wide">Data de Nascimento</label>
           <input
             type="date"
             required
             value={formData.birthDate || ''}
             onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
             className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
           />
           <p className="text-[10px] text-lia-muted mt-1 italic">Usada para calcular sua numerologia.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-sans text-lia-secondary mb-2 uppercase tracking-wide">Signo</label>
            <select
              value={formData.sign}
              onChange={e => setFormData({ ...formData, sign: e.target.value })}
              className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary"
            >
              <option value="">Selecione</option>
              {ZODIAC_SIGNS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-sans text-lia-secondary mb-2 uppercase tracking-wide">Ascendente</label>
            <select
              value={formData.ascendant}
              onChange={e => setFormData({ ...formData, ascendant: e.target.value })}
              className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary"
            >
              <option value="">Selecione</option>
              <option value="Nao sei">Nao sei</option>
              {ZODIAC_SIGNS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deep Astrology Fields */}
        <div className="pt-4 border-t border-lia-accent/30">
          <label className="block text-sm font-sans text-lia-secondary mb-4 uppercase tracking-wide">Mapa Profundo (Opcional)</label>
          <div className="grid grid-cols-3 gap-2">
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Lua</label>
               <select
                 value={formData.moon || ''}
                 onChange={e => setFormData({ ...formData, moon: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Venus</label>
               <select
                 value={formData.venus || ''}
                 onChange={e => setFormData({ ...formData, venus: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] text-lia-secondary mb-1 uppercase">Marte</label>
               <select
                 value={formData.mars || ''}
                 onChange={e => setFormData({ ...formData, mars: e.target.value })}
                 className="w-full bg-white border border-lia-accent rounded-lg p-2 text-xs text-lia-primary focus:outline-none focus:border-lia-secondary"
               >
                 <option value="">-</option>
                 {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
          <p className="text-[10px] text-lia-muted mt-2 italic">Esses dados enriquecem a analise relacional.</p>
        </div>

        {/* Numerology Card */}
        {formData.numerology && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-lia-accent/50 overflow-hidden">
             <div 
               className="p-4 bg-stone-50 border-b border-lia-accent/30 flex justify-between items-center cursor-pointer hover:bg-stone-100 transition-colors"
               onClick={() => setShowNumerologyDetails(!showNumerologyDetails)}
             >
               <div className="flex items-center gap-2">
                 <Sparkles size={16} className="text-lia-secondary" />
                 <h3 className="font-serif text-lia-primary text-lg">Numerologia da Jornada</h3>
               </div>
               <span className="text-xs text-lia-secondary uppercase tracking-widest">{showNumerologyDetails ? 'Ocultar' : 'Ver Detalhes'}</span>
             </div>
             
             <div className="p-4 grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col">
                  <span className="text-2xl font-serif text-lia-primary">{formData.numerology.destination}</span>
                  <span className="text-[9px] uppercase tracking-wider text-lia-secondary">Destino</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-serif text-lia-primary">{formData.numerology.expression}</span>
                  <span className="text-[9px] uppercase tracking-wider text-lia-secondary">Expressao</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-serif text-lia-primary">{formData.numerology.personality}</span>
                  <span className="text-[9px] uppercase tracking-wider text-lia-secondary">Persona</span>
                </div>
                <div className="flex flex-col border-l border-lia-accent/50 pl-2">
                  <span className="text-2xl font-serif text-lia-primary">{formData.numerology.personalYear}</span>
                  <span className="text-[9px] uppercase tracking-wider text-lia-secondary">Ano Pessoal</span>
                </div>
             </div>

             {showNumerologyDetails && (
               <div className="p-4 bg-stone-50/50 border-t border-lia-accent/30 space-y-3 animate-fade-in">
                 <div>
                   <span className="text-xs font-bold text-lia-primary">Destino {formData.numerology.destination}:</span>
                   <p className="text-xs text-lia-secondary leading-relaxed">{NUMEROLOGY_MEANINGS[formData.numerology.destination]}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-lia-primary">Expressao {formData.numerology.expression}:</span>
                   <p className="text-xs text-lia-secondary leading-relaxed">{NUMEROLOGY_MEANINGS[formData.numerology.expression]}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-lia-primary">Persona {formData.numerology.personality}:</span>
                   <p className="text-xs text-lia-secondary leading-relaxed">{NUMEROLOGY_MEANINGS[formData.numerology.personality]}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-lia-primary">Ano Pessoal {formData.numerology.personalYear}:</span>
                   <p className="text-xs text-lia-secondary leading-relaxed">{NUMEROLOGY_MEANINGS[formData.numerology.personalYear]}</p>
                 </div>
                 <p className="text-[10px] italic text-lia-muted mt-2 text-center">Ferramenta de autoconhecimento, nao de destino.</p>
               </div>
             )}
          </div>
        )}

        {/* ACCOUNT CREATION / LOGIN FIELDS */}
        <div className="pt-8 border-t border-lia-accent/30">
          <h3 className="text-sm font-sans text-lia-secondary mb-4 uppercase tracking-wide">
             {profile.hasOnboarded ? 'Dados de Acesso' : 'Crie sua conta (Opcional)'}
          </h3>
          
          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-bold text-lia-secondary mb-1 uppercase">Seu melhor E-mail</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
                  placeholder="exemplo@email.com"
                />
             </div>
             
             <div>
                <label className="block text-[10px] font-bold text-lia-secondary mb-1 uppercase">
                   {profile.hasOnboarded ? 'Alterar Senha' : 'Crie uma Senha Secreta'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ''}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-lia-accent rounded-lg p-3 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
                    placeholder="******"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-lia-secondary hover:text-lia-primary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!profile.hasOnboarded && (
                  <p className="text-[10px] text-lia-muted mt-1 italic">
                    Para garantir que suas conversas e analises fiquem salvas para sempre.
                  </p>
                )}
             </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-lia-primary text-white font-serif py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : profile.hasOnboarded ? 'Atualizar Perfil' : 'Comecar Jornada'}
        </button>
        
        {/* LEGAL DISCLAIMER SMALL */}
        <div className="text-center mt-4">
           <p className="text-[10px] text-lia-muted">
             Ao continuar, voce concorda com nossos Termos de Uso e Politica de Privacidade.
           </p>
        </div>
      </form>

      {profile.hasOnboarded && (
        <div className="mt-12 border-t border-lia-accent pt-8">
          <h3 className="text-sm font-sans text-lia-muted mb-4 uppercase tracking-wide">Zona de Perigo</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { if(window.confirm('Tem certeza? Isso apaga apenas o historico do chat.')) onClearChat(); }}
              className="w-full border border-lia-accent text-lia-secondary py-3 rounded-lg hover:bg-stone-100 transition-colors text-sm"
            >
              Zerar Conversa
            </button>
            <button
              type="button"
              onClick={() => { if(window.confirm('Tem certeza? Isso apaga TUDO e reinicia o app.')) onFullReset(); }}
              className="w-full border border-red-200 text-red-400 py-3 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              Resetar Tudo (Comecar do Zero)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
