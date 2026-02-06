import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, BrainCircuit, Zap, Layers, 
  ScanFace, Wand2, CheckCircle2, Instagram, X
} from 'lucide-react';
import { getShowcaseItems, getHeroExampleImage, getHeroExampleDetails } from '../services/mockBackend';

interface LandingPageProps {
  onStart: () => void;
}

// Helper for Vertical Scrolling Column in Background
// Accepts 'reverse' to scroll down instead of up
const ScrollingColumn: React.FC<{ images: any[], duration: string, reverse?: boolean }> = ({ images, duration, reverse }) => {
  // Ensure we have enough images to loop smoothly without gaps
  const safeImages = images.length > 0 ? images : [];
  // Quadruple the list to ensure smooth infinite scroll coverage
  const displayList = [...safeImages, ...safeImages, ...safeImages, ...safeImages];

  return (
    <div className="flex flex-col gap-5 relative w-full">
      <div 
        className={`flex flex-col gap-5 w-full ${reverse ? 'animate-scroll-down' : 'animate-scroll-up'}`} 
        style={{ animationDuration: duration }}
      >
        {displayList.map((img, idx) => (
          <div key={`${reverse ? 'r' : 'n'}-${idx}`} className="w-full aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden bg-slate-800/50 border border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 shadow-2xl">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to render a single Marquee card (Horizontal for Showcase section)
const MarqueeCard: React.FC<{ img: any }> = ({ img }) => (
  <div className="group relative w-[280px] h-[380px] flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all hover:scale-[1.02] shadow-2xl mx-3 bg-slate-900 z-10">
    <img src={img.url} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">{img.category}</span>
      <h3 className="text-lg text-white font-bold leading-tight">{img.title}</h3>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [topRowImages, setTopRowImages] = useState<any[]>([]);
  const [bottomRowImages, setBottomRowImages] = useState<any[]>([]);
  const [allImages, setAllImages] = useState<any[]>([]); // Combined for background
  const [heroResultImage, setHeroResultImage] = useState<string>("https://i.imgur.com/uFk1x5S.jpeg"); // Default
  
  // Hero Text States
  const [heroInput, setHeroInput] = useState("");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroCaption, setHeroCaption] = useState("");

  // Default hardcoded images - Fallback if no custom images exist
  const defaultTopImages = [
    { url: "https://i.imgur.com/6qR2vjA.jpeg", title: "DESIGN SEM SUOR", category: "Marketing Criativo" },
    { url: "https://i.imgur.com/eB45y6k.jpeg", title: "DETALHE DE MILHÕES", category: "Fotografia de Produto" },
    { url: "https://i.imgur.com/gX6Z2jE.jpeg", title: "MIND EXPLOSION", category: "Arte Conceitual" },
    { url: "https://i.imgur.com/7xJ9y8P.jpeg", title: "CÓDIGO ABERTO", category: "Tech & Cyberpunk" },
    { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop", title: "PORTRAIT AI", category: "Retrato" },
  ];

  const defaultBottomImages = [
    { url: "https://i.imgur.com/uFk1x5S.jpeg", title: "DESTRUA O BLOQUEIO", category: "Visual Impact" },
    { url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop", title: "NEON DREAMS", category: "Futurismo" },
    { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", title: "RETRO TECH", category: "Gaming" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop", title: "FLUID ART", category: "Abstrato" },
    { url: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop", title: "NEON CITY", category: "Cyberpunk" },
  ];

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Custom Hero Data
      try {
        const customHero = await getHeroExampleImage();
        if (customHero) {
          setHeroResultImage(customHero);
        }
        
        const details = getHeroExampleDetails();
        setHeroInput(details.input);
        setHeroPrompt(details.prompt);
        setHeroCaption(details.caption);

      } catch (e) {
        console.error("Failed to load hero image", e);
      }

      // 2. Load Gallery
      try {
        const dynamicItems = await getShowcaseItems();
        
        const mappedItems = dynamicItems.map(item => ({
          url: item.imageUrl!,
          title: item.title,
          category: item.category,
          row: item.row || 'top' // Default to top if missing
        }));

        const dynamicTop = mappedItems.filter(i => i.row === 'top');
        const dynamicBottom = mappedItems.filter(i => i.row === 'bottom');

        // Setup Top Row: Dynamic + Defaults, sliced to max 10
        const combinedTop = [...dynamicTop, ...defaultTopImages];
        const finalTop = combinedTop.slice(0, 10);
        setTopRowImages(finalTop);

        // Setup Bottom Row: Dynamic + Defaults, sliced to max 10
        const combinedBottom = [...dynamicBottom, ...defaultBottomImages];
        const finalBottom = combinedBottom.slice(0, 10);
        setBottomRowImages(finalBottom);

        setAllImages([...finalTop, ...finalBottom]);

      } catch (e) {
        console.error("Error loading gallery", e);
        setTopRowImages(defaultTopImages);
        setBottomRowImages(defaultBottomImages);
        setAllImages([...defaultTopImages, ...defaultBottomImages]);
      }
    };
    loadData();
  }, []);
  
  const features = [
    {
      icon: ScanFace,
      title: "Visão Computacional",
      desc: "O agente 'enxerga' suas referências, extraindo iluminação, ângulos e características físicas com precisão cirúrgica."
    },
    {
      icon: BrainCircuit,
      title: "Engenharia de Prompt",
      desc: "Transforma ideias vagas em estruturas complexas de prompt otimizadas para Nano Banana, ChatGPT, Midjourney, Leonardo.ai, Stable Diffusion e roteiros cinematográficos para Veo 3."
    },
    {
      icon: Layers,
      title: "Direção de Arte",
      desc: "Aplica conceitos profissionais de composição, paleta de cores e tipografia para criar imagens de alta conversão."
    }
  ];

  const promptExamples = [
    {
      role: "Input do Usuário",
      content: heroInput || "Carregando...",
      isAi: false
    },
    {
      role: "Nexus Vision PRO (Gerado)",
      content: heroPrompt || "Carregando...",
      isAi: true
    }
  ];

  // Create loops for animation
  const loopTop = [...topRowImages, ...topRowImages, ...topRowImages, ...topRowImages];
  const loopBottom = [...bottomRowImages, ...bottomRowImages, ...bottomRowImages, ...bottomRowImages];

  // Prepare columns for background (distribute all images dynamically)
  const bgSource = allImages.length > 0 ? allImages : [...defaultTopImages, ...defaultBottomImages];
  
  const bgCol1 = bgSource.filter((_, i) => i % 4 === 0);
  const bgCol2 = bgSource.filter((_, i) => i % 4 === 1);
  const bgCol3 = bgSource.filter((_, i) => i % 4 === 2);
  const bgCol4 = bgSource.filter((_, i) => i % 4 === 3);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden font-sans selection:bg-purple-500/30 relative">
      
      {/* CSS for Animations */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 100s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 100s linear infinite;
        }
        .animate-scroll-up {
          animation: scroll-up 60s linear infinite;
        }
        .animate-scroll-down {
          animation: scroll-down 70s linear infinite;
        }
        .marquee-mask {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

      {/* --- BACKGROUND ANIMATION (EASY BACKGROUND STYLE) --- */}
      <div className="fixed inset-0 z-0 bg-[#0a0a0c] overflow-hidden">
        
        {/* Slanted Container for Columns */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] flex justify-center gap-6 rotate-[-12deg] opacity-60">
           {/* Column 1: Up */}
           <div className="w-48 md:w-72 pt-20"><ScrollingColumn images={bgCol1.length ? bgCol1 : defaultTopImages} duration="55s" /></div>
           
           {/* Column 2: Down (Reverse) */}
           <div className="w-48 md:w-72 pt-0"><ScrollingColumn images={bgCol2.length ? bgCol2 : defaultBottomImages} duration="65s" reverse /></div>
           
           {/* Column 3: Up */}
           <div className="w-48 md:w-72 pt-32"><ScrollingColumn images={bgCol3.length ? bgCol3 : defaultTopImages} duration="50s" /></div>
           
           {/* Column 4: Down (Reverse) */}
           <div className="w-48 md:w-72 pt-10"><ScrollingColumn images={bgCol4.length ? bgCol4 : defaultBottomImages} duration="70s" reverse /></div>

           {/* Extra Columns for Wide Screens */}
           <div className="hidden lg:block w-48 md:w-72 pt-40"><ScrollingColumn images={[...bgCol1, ...bgCol3]} duration="60s" /></div>
        </div>

        {/* --- OVERLAYS --- */}
        
        {/* 1. Gradient from Top/Bottom (Black Edges) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c] z-10" />
        
        {/* 2. Side Vignettes (Black Sides) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c] z-10 opacity-80" />

        {/* 3. Radial Focus (Center is clearer) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0c_100%)] z-10 opacity-90" />

        {/* 4. Global Dimmer (Contrast) */}
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* --- CONTENT (Z-20 to stay above background) --- */}
      <div className="relative z-20">

        {/* Navigation */}
        <nav className="border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 p-2 rounded-lg shadow-lg shadow-purple-900/40">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">Nexus Vision <span className="text-purple-400">PRO</span></span>
            </div>
            
            <button 
              onClick={onStart}
              className="bg-white text-black hover:bg-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-white/10"
            >
              Entrar no App <ArrowRight size={16} />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-28 pb-16 px-6 flex flex-col items-center justify-center min-h-[65vh]">
          {/* Central Glow behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-purple-900/40 rounded-[100%] blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
          
          <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-purple-300 mb-4 animate-fade-in backdrop-blur-md shadow-lg shadow-black/20">
              <Sparkles size={12} /> NOVA VERSÃO 2.0 DISPONÍVEL
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
              Adeus <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Bloqueio</span>. <br />
              Olá Direção de Arte.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-xl font-medium">
              Sua agência de criação pessoal impulsionada por IA. Transforme ideias simples em prompts profissionais que geram imagens de alta conversão em segundos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xl shadow-[0_0_50px_-10px_rgba(147,51,234,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-3 border border-white/20"
              >
                <Zap size={24} className="fill-white" />
                Começar Gratuitamente
              </button>
            </div>
          </div>
        </header>

        {/* Showcase Section (Marquee) */}
        <section id="showcase" className="pt-8 pb-24 overflow-hidden bg-gradient-to-b from-transparent to-[#0a0a0c]">
          <div className="text-center mb-12 px-6">
            <h2 className="text-3xl font-bold mb-4">Resultados Reais</h2>
            <p className="text-slate-400">Imagens geradas a partir de prompts criados pelo Nexus Vision PRO.</p>
          </div>

          <div className="space-y-8 marquee-mask">
            {/* Top Row: Slides Right */}
            <div className="flex w-full overflow-hidden">
               <div className="flex animate-scroll-right hover:[animation-play-state:paused]">
                  {loopTop.map((img, idx) => (
                     <MarqueeCard key={`top-${idx}`} img={img} />
                  ))}
               </div>
            </div>

            {/* Bottom Row: Slides Left */}
            <div className="flex w-full overflow-hidden">
               <div className="flex animate-scroll-left hover:[animation-play-state:paused]">
                  {loopBottom.map((img, idx) => (
                     <MarqueeCard key={`bottom-${idx}`} img={img} />
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* O Poder do Agente (Features) */}
        <section id="funcionalidades" className="py-24 px-6 relative bg-[#0a0a0c]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Mais que um gerador de texto. <br />
                  <span className="text-purple-400">Um Diretor de Arte Virtual.</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  A maioria das pessoas falha na geração de imagens por não saber descrever iluminação, lentes e estilos artísticos. O Nexus Vision preenche essa lacuna técnica.
                </p>
                
                <div className="space-y-6">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <feature.icon className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Example Card */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="text-purple-400" size={20} />
                    <span className="text-xs font-bold text-slate-500 uppercase">Simulação em Tempo Real</span>
                  </div>

                  {promptExamples.map((ex, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${ex.isAi ? 'bg-purple-900/20 border-purple-500/30 shadow-lg shadow-purple-900/10' : 'bg-slate-800/50 border-slate-700'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold uppercase ${ex.isAi ? 'text-purple-400' : 'text-slate-400'}`}>
                          {ex.role}
                        </span>
                        {ex.isAi && <Sparkles size={12} className="text-purple-400 animate-pulse" />}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Text Column */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${ex.isAi ? 'text-purple-100 font-mono' : 'text-slate-300'}`}>
                            {ex.content}
                          </p>
                          
                          {/* Negative Prompt (New Location) */}
                          {ex.isAi && (
                             <div className="mt-4 pt-3 border-t border-purple-500/30">
                              <div className="flex items-center gap-2 mb-1">
                                <X size={12} className="text-red-400" /> 
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Prompt Negativo</span>
                              </div>
                              <p className="text-xs text-red-200/70 font-mono">
                                cartoon, illustration, drawing, painting, disfigured, low quality, grainy, text, watermark, signature
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Result Column (Integrated) */}
                        {ex.isAi && (
                          <div className="sm:w-60 shrink-0 pt-1">
                             <div className="bg-black/40 rounded-xl p-3 border border-purple-500/20 flex flex-col gap-3 h-full">
                                <div className="aspect-[3/4] w-full rounded-lg bg-slate-800 overflow-hidden border border-white/10 group/img cursor-default relative">
                                   <img 
                                     src={heroResultImage} 
                                     className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                                     alt="Resultado" 
                                   />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 mb-1">
                                    <CheckCircle2 size={10} /> Resultado
                                  </span>
                                  <p className="text-[9px] text-slate-400 leading-tight">
                                     Imagem final gerada com este prompt.
                                  </p>
                                </div>

                                {/* Caption (New Location) */}
                                {heroCaption && (
                                  <div className="pt-2 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Instagram size={12} className="text-pink-400" /> 
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Sugestão de Legenda</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 italic font-sans leading-relaxed">
                                      "{heroCaption}"
                                    </p>
                                  </div>
                                )}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-24 bg-gradient-to-b from-[#0a0a0c] to-black border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-16">Fluxo de Trabalho Otimizado</h2>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -z-10" />

              {[
                { title: "Briefing", desc: "Defina nicho, tema e insira suas referências visuais (rosto, estilo, produto).", step: "01" },
                { title: "Processamento IA", desc: "O agente analisa os pixels e cruza com conhecimentos de design e fotografia.", step: "02" },
                { title: "Geração de Prompt", desc: "Receba 3 conceitos prontos para copiar e colar no seu gerador favorito.", step: "03" }
              ].map((step, idx) => (
                <div key={idx} className="relative bg-[#0a0a0c] p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors group">
                  <div className="w-24 h-24 mx-auto bg-slate-900 rounded-full border-4 border-[#0a0a0c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-purple-900/10">
                    <span className="text-2xl font-black text-slate-700 group-hover:text-purple-500 transition-colors">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 px-6 text-center bg-[#0a0a0c]">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Pronto para elevar seu nível?
            </h2>
            <p className="text-lg text-purple-200 mb-8 relative z-10">
              Junte-se a designers e creators que estão economizando horas de trabalho.
            </p>
            
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-white text-purple-900 hover:bg-slate-100 rounded-xl font-bold text-lg shadow-xl transition-all relative z-10 hover:scale-105"
            >
              Começar Agora - É Grátis
            </button>
            <p className="text-xs text-purple-300 mt-4 relative z-10">5 gerações gratuitas incluídas no plano Free.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-sm bg-[#0a0a0c]">
          <p>&copy; 2026 Nexus Vision PRO. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;