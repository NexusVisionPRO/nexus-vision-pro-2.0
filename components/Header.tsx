import React from 'react';
import { BrainCircuit, LogOut, Zap, Coins } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenPricing: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenPricing }) => {
  const isUltra = user.plan === 'ultra' || user.plan === 'ultra_yearly';

  return (
    <nav className="border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 p-2 rounded-lg shadow-lg shadow-purple-900/40">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none text-white hidden sm:block">Nexus Vision <span className="text-purple-400">PRO</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden sm:block">Direção de Arte & Engenharia de Prompt</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Credits Display */}
          <div 
            onClick={onOpenPricing}
            className="cursor-pointer bg-slate-900 border border-slate-700 rounded-full px-4 py-1.5 flex items-center gap-2 hover:border-purple-500/50 transition-colors group"
          >
            {isUltra ? <Zap size={14} className="text-yellow-400" /> : <Coins size={14} className="text-yellow-400" />}
            <span className={`text-xs font-bold ${isUltra ? 'text-yellow-400' : 'text-slate-200'}`}>
              {`${user.credits} Créditos`}
            </span>
            {!isUltra && (
              <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded ml-1 group-hover:bg-purple-500">
                +
              </span>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{user.plan} Plan</p>
            </div>
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
            />
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Header;