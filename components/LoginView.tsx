import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onGoToSignup: () => void;
}

const LoginView: React.FC<Props> = ({ onLogin, onBack, onGoToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível entrar');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-lia-bg p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-lia-secondary hover:text-lia-primary transition-colors rounded-full hover:bg-stone-100"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full -mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lia-primary text-white font-serif text-xl shadow-lg mb-4">
            L
          </div>
          <h2 className="text-2xl font-serif text-lia-primary">Bem-vinda de volta</h2>
          <p className="text-sm text-lia-secondary mt-2">
            Sua jornada continua exatamente de onde parou.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-lia-secondary mb-1 uppercase tracking-wide">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-lia-accent rounded-xl p-4 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-lia-secondary uppercase tracking-wide">Senha</label>
              <button type="button" className="text-[10px] text-lia-muted hover:text-lia-primary uppercase tracking-wider">
                Esqueci a senha
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-lia-accent rounded-xl p-4 text-lia-primary focus:outline-none focus:border-lia-secondary transition-colors"
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lia-primary text-white font-serif py-4 rounded-xl shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Acessando...</span>
            ) : (
              <>
                <LogIn size={18} /> Entrar
              </>
            )}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-lia-secondary">
            Ainda não tem cadastro?{' '}
            <button 
              onClick={onGoToSignup}
              className="font-bold text-lia-primary hover:underline"
            >
              Começar Jornada
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
