import React, { useState, useEffect } from 'react';
import { 
  Sparkles, PenTool, Terminal, RefreshCw, AlertTriangle, 
  ScanFace, Palette, Package, Type, Sliders, Lightbulb,
  Smartphone, RectangleVertical, Square, RectangleHorizontal, Monitor, Settings,
  Video, Lock
} from 'lucide-react';

import { Concept, AspectRatio, User } from './types';
import { generatePrompts } from './services/geminiService';
import { getCurrentUser, logoutUser, deductCredit, saveHistory } from './services/mockBackend';
import UploadBox from './components/UploadBox';
import ConceptCard from './components/ConceptCard';
import AuthScreen from './components/AuthScreen';
import PricingModal from './components/PricingModal';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AdminGallery from './components/AdminGallery';
import WhatsAppButton from './components/WhatsAppButton';

// Aspect Ratio Configuration
const ASPECT_RATIOS: AspectRatio[] = [
  { id: '9:16', label: '9:16', icon: Smartphone, desc: 'Stories' },
  { id: '3:4', label: '3:4', icon: RectangleVertical, desc: 'Retrato' },
  { id: '1:1', label: '1:1', icon: Square, desc: 'Quadrado' },
  { id: '4:3', label: '4:3', icon: RectangleHorizontal, desc: 'Clássico' },
  { id: '16:9', label: '16:9', icon: Monitor, desc: 'Cinema' },
];

type AppView = 'landing' | 'app' | 'admin';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // App State
  const [niche, setNiche] = useState("");
  const [theme, setTheme] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  
  // Advanced Controls
  const [includeHeadline, setIncludeHeadline] = useState(true);
  const [styleFidelity, setStyleFidelity] = useState(50);
  
  // Video Prompt State (New)
  const [includeVideo, setIncludeVideo] = useState(false);
  const [videoContext, setVideoContext] = useState("");
  
  // Images
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Auth & Routing
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentView('app'); // Skip landing if logged in
    }
    setInitializing(false);
  }, []);

  const handleStartApp = () => {
    setCurrentView('app');
  };

  const isProOrUltra = user ? ['pro', 'ultra', 'pro_yearly', 'ultra_yearly'].includes(user.plan) : false;

  const handleGenerate = async () => {
    if (!user) return;
    if (!niche || !theme) return;

    // Check Credits (all plans have credit limits now)
    if (user.credits <= 0) {
      setShowPricing(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setConcepts([]);

    try {
      // 1. Generate Content
      const generatedConcepts = await generatePrompts({
        niche,
        theme,
        additionalContext,
        aspectRatio: selectedRatio,
        includeHeadline,
        styleFidelity,
        baseImage,
        styleImage,
        productImage,
        includeVideo: isProOrUltra && includeVideo, // Only send if authorized
        videoContext: isProOrUltra && includeVideo ? videoContext : undefined
      });

      // 2. Deduct Credit & Update DB
      const updatedUser = await deductCredit(user.id);
      setUser(updatedUser);
      
      // 3. Save History with Images (now persisted in IndexedDB)
      await saveHistory(
        user.id, 
        niche, 
        theme, 
        generatedConcepts,
        { baseImage, styleImage, productImage }
      );

      setConcepts(generatedConcepts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao gerar prompts. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setConcepts([]);
    setCurrentView('landing'); // Go back to landing on logout
  };

  if (initializing) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-purple-500/30 pb-20 relative">
      
      {/* WhatsApp Support Button - Always Visible */}
      <WhatsAppButton />

      {/* Render Logic */}
      {currentView === 'landing' ? (
        <LandingPage onStart={handleStartApp} />
      ) : !user ? (
        <AuthScreen onAuthSuccess={setUser} />
      ) : currentView === 'admin' && user.isAdmin ? (
        <AdminGallery onBack={() => setCurrentView('app')} />
      ) : (
        <>
          <Header 
            user={user} 
            onLogout={handleLogout} 
            onOpenPricing={() => setShowPricing(true)} 
          />

          {/* Admin Toggle Button (Only for Admins) */}
          {user.isAdmin && (
            <div className="max-w-5xl mx-auto px-4 mt-4">
              <button 
                onClick={() => setCurrentView('admin')}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-sm"
              >
                <Settings size={16} className="text-purple-400" /> Acessar Painel de Galeria (Admin)
              </button>
            </div>
          )}

          {showPricing && (
            <PricingModal 
              userId={user.id} 
              onClose={() => setShowPricing(false)} 
              onSuccess={(u) => setUser(u)} 
            />
          )}

          <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            {/* Main Grid */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-[fadeIn_0.5s_ease-out]">
              
              {/* Left Column: Inputs */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl space-y-5 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="text-purple-400" size={18} />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Briefing Criativo</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">SEU NICHO</label>
                      <input 
                        value={niche} 
                        onChange={(e) => setNiche(e.target.value)} 
                        placeholder="Ex: Marketing, Fitness, Dropshipping..." 
                        className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">TEMA ESPECÍFICO</label>
                      <input 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value)} 
                        placeholder="Ex: Lançamento, Black Friday, Promoção..." 
                        className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">DETALHES DA CENA (OPCIONAL)</label>
                      <textarea 
                        value={additionalContext} 
                        onChange={(e) => setAdditionalContext(e.target.value)} 
                        placeholder="Ex: Fundo de escritório de luxo, quero usar cores azul marinho e dourado..." 
                        rows={2}
                        className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                      />
                    </div>

                    {/* Aspect Ratio Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">FORMATO DA ARTE</label>
                      <div className="grid grid-cols-5 gap-2">
                        {ASPECT_RATIOS.map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => setSelectedRatio(ratio.id)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all 
                              ${selectedRatio === ratio.id 
                                ? 'bg-purple-900/40 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                                : 'bg-black/30 border-slate-700/50 text-slate-500 hover:bg-slate-800'}`}
                            title={ratio.desc}
                          >
                            <ratio.icon size={14} />
                            <span className="text-[9px] font-bold">{ratio.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Controls */}
                    <div className="p-3 bg-black/20 rounded-xl border border-slate-700/50 space-y-4">
                      {/* Fidelity Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Sliders size={14} className="text-purple-400" />
                            <label className="text-xs font-bold text-slate-300">FIDELIDADE À REFERÊNCIA</label>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono bg-purple-900/30 px-2 py-0.5 rounded">
                            {styleFidelity < 30 ? 'Criativo' : styleFidelity > 70 ? 'Cópia Fiel' : 'Equilibrado'}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={styleFidelity} 
                          onChange={(e) => setStyleFidelity(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
                        />
                      </div>

                      {/* Headline Toggle */}
                      <div 
                        className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-700/50" 
                        onClick={() => setIncludeHeadline(!includeHeadline)}
                      >
                        <div className="flex items-center gap-2">
                          <Type className={includeHeadline ? "text-purple-400" : "text-slate-600"} size={16} />
                          <span className={`text-xs font-bold ${includeHeadline ? 'text-white' : 'text-slate-500'}`}>Gerar Headline na Imagem?</span>
                        </div>
                        <div className={`relative w-8 h-4 rounded-full transition-colors ${includeHeadline ? 'bg-purple-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${includeHeadline ? 'left-4.5' : 'left-0.5'}`} />
                        </div>
                      </div>

                      {/* Video Prompt Toggle (PRO/ULTRA ONLY) */}
                      <div className="pt-2 border-t border-slate-700/50">
                        <div 
                          className={`flex items-center justify-between ${isProOrUltra ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                          onClick={() => {
                            if (isProOrUltra) {
                              setIncludeVideo(!includeVideo);
                            } else {
                              setShowPricing(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Video className={includeVideo ? "text-indigo-400" : "text-slate-600"} size={16} />
                            <span className={`text-xs font-bold ${includeVideo ? 'text-white' : 'text-slate-500'} flex items-center gap-2`}>
                              Gerar Prompt de Vídeo (Veo3)
                              {!isProOrUltra && <Lock size={10} className="text-yellow-400" />}
                            </span>
                          </div>
                          <div className={`relative w-8 h-4 rounded-full transition-colors ${includeVideo ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${includeVideo ? 'left-4.5' : 'left-0.5'}`} />
                          </div>
                        </div>

                        {/* Video Context Input (Conditional) */}
                        {includeVideo && isProOrUltra && (
                          <div className="mt-3 animate-[fadeIn_0.3s]">
                            <label className="text-[10px] font-bold text-indigo-300 ml-1 mb-1 block">INSTRUÇÕES PARA O VÍDEO</label>
                            <textarea 
                              value={videoContext} 
                              onChange={(e) => setVideoContext(e.target.value)} 
                              placeholder="Descreva o movimento da câmera, ação do sujeito e ambiente sonoro..." 
                              rows={2}
                              className="w-full bg-indigo-900/10 border border-indigo-500/30 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-indigo-300/30 resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <UploadBox 
                        label="EXPERT (ROSTO)"
                        icon={ScanFace}
                        image={baseImage} 
                        onUpload={setBaseImage} 
                        onRemove={() => setBaseImage(null)} 
                        description="Sua foto (Rosto)"
                      />
                      <UploadBox 
                        label="ESTILO (REF)"
                        icon={Palette}
                        image={styleImage} 
                        onUpload={setStyleImage} 
                        onRemove={() => setStyleImage(null)} 
                        description="Visual desejado"
                      />
                    </div>

                    {/* Product Upload */}
                    <div className="pt-1">
                      <UploadBox 
                        label="PRODUTO (OPCIONAL)"
                        icon={Package}
                        image={productImage} 
                        onUpload={setProductImage} 
                        onRemove={() => setProductImage(null)} 
                        description="Ex: Garrafa, Celular, Caixa..."
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !niche || !theme}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group border border-white/10"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} /> Analisando & Criando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="group-hover:scale-110 transition-transform" /> 
                        {user.plan === 'ultra' ? 'Gerar Conceitos (Ilimitado)' : `Gerar (-1 Crédito)`}
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-lg flex gap-2 items-center">
                      <AlertTriangle size={14} /> {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="text-green-400" size={20} />
                    Console de Saída
                  </h2>
                  {concepts.length > 0 && (
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/30">
                      {concepts.length} conceitos gerados
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {!isGenerating && concepts.length === 0 && (
                    <div className="h-[400px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 text-center p-8 bg-slate-900/20 hover:bg-slate-900/30 transition-colors">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-white/5">
                        <Lightbulb size={24} className="opacity-50" />
                      </div>
                      <p className="max-w-xs font-medium">Preencha o briefing e envie suas referências para gerar o prompt perfeito.</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl animate-pulse">
                          <div className="h-6 bg-slate-800 rounded w-2/3 mb-4"></div>
                          <div className="h-20 bg-slate-800 rounded w-full mb-4 opacity-50"></div>
                          <div className="h-8 bg-slate-800 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {concepts.map((concept, idx) => (
                    <ConceptCard 
                      key={idx} 
                      concept={concept} 
                      index={idx}
                      selectedRatio={selectedRatio}
                      hasBaseImage={!!baseImage}
                      hasStyleImage={!!styleImage}
                      hasProductImage={!!productImage}
                      styleFidelity={styleFidelity}
                      includeHeadline={includeHeadline}
                    />
                  ))}
                </div>
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}