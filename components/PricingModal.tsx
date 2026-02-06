import React, { useState } from 'react';
import { X, Check, Loader, Zap, Star, Shield, Infinity as InfinityIcon } from 'lucide-react';
import { PlanType } from '../types';
import { processPayment, PLANS } from '../services/mockBackend';
import { createMercadoPagoPreference } from '../services/mercadoPago';

interface PricingModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ userId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handlePurchase = async (baseType: 'free' | 'starter' | 'pro' | 'ultra') => {
    // Determine the actual PlanType based on billing cycle
    const planType: PlanType = (billingCycle === 'yearly' && baseType !== 'free') 
      ? `${baseType}_yearly` as PlanType 
      : baseType;

    setLoading(planType);
    try {
      if (planType === 'free') {
        const updatedUser = await processPayment(userId, planType);
        onSuccess(updatedUser);
        onClose();
      } else {
        // Create Mercado Pago preference server-side and redirect to checkout
        const plan = PLANS[planType];
        const items = [{ title: plan.name, quantity: 1, unit_price: plan.price }];
        const resp = await createMercadoPagoPreference(items, { email: '' });
        const initPoint = resp.init_point || resp.sandbox_init_point || resp.permalink;
        if (!initPoint) throw new Error('No checkout URL returned');
        // Redirect user to Mercado Pago checkout
        window.location.href = initPoint;
      }
    } catch (e:any) {
      console.error('purchase error:', e);
      alert(e.message || "Erro no pagamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const PlanCard = ({ 
    type, recommended, icon: Icon, features 
  }: { 
    type: 'free' | 'starter' | 'pro' | 'ultra', recommended?: boolean, icon: any, features: string[] 
  }) => {
    
    // Get correct plan data based on cycle
    const planId: PlanType = (billingCycle === 'yearly' && type !== 'free') 
      ? `${type}_yearly` as PlanType 
      : type;
    
    const planData = PLANS[planId];
    const isYearly = billingCycle === 'yearly' && type !== 'free';

    return (
      <div className={`relative p-6 rounded-2xl border flex flex-col h-full transition-all hover:scale-105 ${
        recommended 
          ? 'bg-slate-800/80 border-purple-500 shadow-xl shadow-purple-900/30' 
          : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-500'
      }`}>
        {recommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Mais Popular
          </div>
        )}
        
        <div className="mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${recommended ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/30 text-slate-400'}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-bold text-white capitalize">{planData.name}</h3>
          
          <div className="flex items-end gap-1 mt-2">
            <span className="text-2xl font-bold text-white">
              {type === 'free' ? 'Grátis' : `R$ ${planData.price}`}
            </span>
            {type !== 'free' && (
              <span className="text-xs text-slate-500 mb-1">/{isYearly ? 'ano' : 'mês'}</span>
            )}
          </div>
          
          <div className="flex flex-col mt-2">
            <p className="text-sm font-medium text-purple-300">
               {type === 'ultra' ? 'Gerações Ilimitadas' : `${planData.credits} Gerações`}
            </p>
            {isYearly && (
               <span className="text-[10px] text-green-400 font-bold bg-green-500/10 inline-block px-2 py-0.5 rounded w-fit mt-1">
                 Economize 15%
               </span>
            )}
          </div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => handlePurchase(type)}
          disabled={!!loading}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            recommended
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
              : 'bg-white text-black hover:bg-slate-200'
          }`}
        >
          {loading === planId ? <Loader className="animate-spin" size={16} /> : (type === 'free' ? 'Plano Atual' : 'Fazer Upgrade')}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]">
      <div className="bg-[#0f1115] w-full max-w-5xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Escolha seu Plano</h2>
            <p className="text-sm text-slate-400">Desbloqueie o poder total da IA para seus projetos.</p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
             <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               Mensal
             </button>
             <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
               Anual <span className="text-[9px] bg-white text-purple-700 px-1.5 rounded-full">-15%</span>
             </button>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white absolute top-4 right-4 md:static">
            <X size={20} />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <PlanCard 
              type="free" 
              icon={Shield}
              features={['Acesso básico', 'Qualidade padrão', 'Histórico limitado']} 
            />
            
            <PlanCard 
              type="starter" 
              icon={Zap}
              features={['Tudo do Free', 'Prioridade na fila', 'Imagens em HD', 'Suporte por email']} 
            />

            <PlanCard 
              type="pro" 
              icon={Star}
              recommended
              features={['Tudo do Starter', 'Modelos exclusivos', 'Upscale 4K', 'Licença comercial']} 
            />

            <PlanCard 
              type="ultra" 
              icon={InfinityIcon}
              features={['Gerações Ilimitadas', 'Acesso antecipado a novas features', 'Consultoria de Prompt', 'Atendimento VIP']} 
            />

          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <Shield size={12} /> Pagamento seguro via Mercado Pago (Sandbox/Public Key usada no checkout).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;