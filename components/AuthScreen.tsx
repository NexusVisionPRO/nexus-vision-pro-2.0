import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User as UserIcon, ArrowRight, Loader, ShieldAlert } from 'lucide-react';
import { loginUser, registerUser } from '../services/mockBackend';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user;
      if (isLogin) {
        user = await loginUser(email, password);
      } else {
        if (!name) throw new Error("Nome é obrigatório.");
        user = await registerUser(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate Google Login
    try {
      await new Promise(r => setTimeout(r, 1500));
      // Register a fake Google user or login if exists
      const user = await registerUser("Usuário Google", `google_${Date.now()}@gmail.com`, "googlepass");
      onAuthSuccess(user);
    } catch (e) {
      // If fails (likely email exists), try logging in with a specific mock google logic, 
      // but for this mock we just create a new one to ensure flow works.
      const user = await registerUser("Usuário Google", `google_${Date.now()}@gmail.com`, "googlepass");
      onAuthSuccess(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px]" />

      <div className="w-full max-w-md bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 p-3 rounded-xl shadow-lg shadow-purple-900/40">
              <BrainCircuit className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nexus Vision <span className="text-purple-400">PRO</span></h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-2">Direção de Arte & Engenharia de Prompt</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1">NOME</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-black/40 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">SENHA</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/30 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : (isLogin ? 'Entrar' : 'Criar Conta Grátis')}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-xs text-slate-500 uppercase">Ou continue com</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Google Mock */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        {/* Footer Toggle */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300 font-bold ml-2 transition-colors"
            >
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;