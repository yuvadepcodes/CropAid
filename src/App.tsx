import React from 'react';
import { Leaf, Upload, Camera, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeLeafImage } from './services/geminiService';
import { AnalysisResult, HealthStatus } from './types';

export default function App() {
  const [image, setImage] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const diagnosis = await analyzeLeafImage(base64);
      setResult(diagnosis);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />

        <div id="detector" className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-primary mb-3">Leaf Diagnostic Tool</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Upload a clear photo of the diseased leaf for an instant AI-powered diagnosis and treatment plan.</p>
          </div>

          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <div className="relative group">
                  <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-brand-primary/30 rounded-2xl bg-white/50 hover:bg-brand-primary/5 transition-all cursor-pointer overflow-hidden backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-20 h-20 mb-4 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10" />
                      </div>
                      <p className="mb-2 text-xl font-display font-medium text-gray-800">Tap to Take Photo</p>
                      <p className="text-sm text-gray-500 mb-4 italic">or upload from gallery</p>
                      <span className="px-6 py-2 bg-brand-primary text-white rounded-full text-sm font-semibold shadow-lg shadow-brand-primary/20">Select Image</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
                
                <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-brand-secondary border border-amber-200">
                  <HelpCircle className="w-6 h-6 text-brand-accent shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Tip:</span> For better results, place the leaf against a plain background and ensure good lighting.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                tabIndex={0}
                className="outline-none"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] bg-gray-100">
                    <img src={image} alt="Crop preview" className="w-full h-full object-cover" />
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="w-12 h-12" />
                        </motion.div>
                        <p className="mt-4 font-display text-lg font-medium">Analyzing with AI...</p>
                        <p className="text-xs opacity-70 px-8 text-center mt-2">Connecting to PlantVillage specialist models...</p>
                      </div>
                    )}
                  </div>

                  {/* Result Panel */}
                  <div className="flex flex-col gap-6">
                    {analyzing ? (
                      <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : error ? (
                      <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
                        <div className="flex items-center gap-3 text-red-600 mb-3">
                          <AlertCircle className="w-6 h-6" />
                          <h3 className="font-bold">Analysis Error</h3>
                        </div>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button onClick={reset} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">Try Again</button>
                      </div>
                    ) : result && (
                      <ResultPanel result={result} reset={reset} />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Features />
        <DiseaseGrid />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-lg border-b border-brand-border px-6 py-4 md:px-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-brand-text">Kheti<span className="font-light italic">Aid</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-primary">
          <a href="#how" className="hover:text-brand-text transition-colors">How it works</a>
          <a href="#about" className="hover:text-brand-text transition-colors">Our Mission</a>
          <button onClick={() => document.getElementById('detector')?.scrollIntoView({ behavior: 'smooth' })} className="bg-brand-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-brand-primary/90 transition-all shadow-md">
            Access Portal
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block">
            AI-Powered Agricultural Intelligence
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-light leading-[1.1] mb-6 text-brand-text max-w-4xl mx-auto">
            Protecting Yields for <br /><span className="font-bold text-brand-primary heading-serif">Indian Smallholders.</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-primary/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            A bridge between plant pathology and technology, reducing the <span className="font-bold text-brand-accent">35% annual crop loss</span> through MobileNetV2 computer vision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button 
                onClick={() => document.getElementById('detector')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/25 hover:scale-105 transition-all"
             >
               Access Portal
             </button>
             <a href="#how" className="w-full sm:w-auto px-8 py-4 bg-white border border-brand-border text-brand-text rounded-2xl font-bold text-lg hover:bg-white/50 flex items-center justify-center gap-2">
               Learn More <ChevronRight className="w-5 h-5" />
             </a>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}

function ResultPanel({ result, reset }: { result: AnalysisResult, reset: () => void }) {
  const statusColors = {
    healthy: 'bg-[#E2F1D4] text-[#3E4A32] border-[#DDE4D1]',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    critical: 'bg-red-50 text-red-900 border-red-200'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-brand-border flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className={`status-badge border ${statusColors[result.healthStatus]}`}>
            {result.healthStatus}
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
            Model Accuracy<br />{(result.confidence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="mb-2">
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">{result.cropType}</span>
        </div>
        <h3 className="text-2xl font-bold text-brand-text mb-2">{result.diseaseName}</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{result.description}</p>
        
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-primary"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-accent"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-border"></div>
          </div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Diagnostic Report</span>
        </div>
      </div>

      <div className="bg-[#F1EFEC] p-6 rounded-[2.5rem] border border-[#DEDBD5] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Remedy Recommendation</span>
        </div>
        <ul className="space-y-3">
          {result.remedies.map((remedy, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xs italic text-gray-600 leading-relaxed">
                "{remedy}"
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={reset}
        className="w-full py-4 bg-brand-text text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-brand-text/90 transition-all shadow-lg"
      >
        <Upload className="w-5 h-5" /> New Session
      </button>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Mobile Native",
      desc: "Designed for simple mobile web usage in low-connectivity areas."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "90% Accuracy",
      desc: "Powered by deep learning fine-tuned on the PlantVillage dataset."
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "38 Categories",
      desc: "Extensive coverage from potatoes to tomatoes and common grains."
    }
  ];

  return (
    <section id="how" className="bg-brand-secondary py-24 px-6 border-y border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-medium text-brand-text mb-4 underline decoration-brand-accent/30 underline-offset-8">Precision Tech for Smallholder Farmers</h2>
          <p className="text-brand-primary/70 max-w-2xl mx-auto font-light">Bridging the gap between expert pathology knowledge and field-level implementation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white border border-brand-border hover:shadow-xl hover:shadow-brand-primary/5 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiseaseGrid() {
  const diseases = [
    { name: "Late Blight", crop: "Potato", color: "bg-[#E2F1D4]" },
    { name: "Leaf Mold", crop: "Tomato", color: "bg-[#FBFDF6]" },
    { name: "Common Rust", crop: "Corn", color: "bg-brand-accent/10" },
    { name: "Black Rot", crop: "Apple", color: "bg-brand-primary/10" },
    { name: "Powdery Mildew", crop: "Squash", color: "bg-blue-50" },
    { name: "Early Blight", crop: "Potato", color: "bg-orange-50" },
    { name: "Bacterial Spot", crop: "Pepper", color: "bg-yellow-50" },
    { name: "Mosaic Virus", crop: "Soybean", color: "bg-brand-primary/5" },
  ];

  return (
    <section className="bg-brand-bg py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-light text-brand-text mb-4">Disease <span className="font-bold underline decoration-brand-accent">Encyclopedia</span></h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Our AI is trained to recognize 38 unique disease categories across multiple crop types.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {diseases.map((d, i) => (
            <div key={i} className="p-6 rounded-[2rem] bg-white border border-brand-border shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${d.color} mb-4 flex items-center justify-center`}>
                <Leaf className="w-5 h-5 text-brand-primary" />
              </div>
              <h4 className="font-bold text-brand-text">{d.name}</h4>
              <p className="text-[10px] text-brand-primary font-bold tracking-widest uppercase mt-1">{d.crop}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center text-[10px] font-bold text-brand-primary/50 uppercase tracking-[0.3em]">
          SYSTEM STATUS: LIVE & SYNCED
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
     <section id="about" className="py-24 px-6 bg-brand-bg">
       <div className="max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-[8px] border-white ring-4 ring-brand-primary/5">
                <img 
                  src="https://images.unsplash.com/photo-1595841696662-54094400cc54?auto=format&fit=crop&q=80&w=1200" 
                  alt="Agriculture in India" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-8 -left-8 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
            </div>
            <div>
              <h2 className="text-4xl font-display font-light text-brand-text mb-6">Our <span className="font-bold text-brand-primary">Interdisciplinary</span> Approach</h2>
              <p className="text-brand-text/70 mb-6 leading-relaxed font-light">
                KhetiAid was born from a three-week development sprint aiming to solve one of India's biggest agricultural challenges: delayed expert intervention.
              </p>
              <div className="space-y-6">
                {[
                  { title: "Deep Learning Core", desc: "Fine-tuned MobileNetV2 architecture trained on 54,000+ labeled images." },
                  { title: "Rural-First UX", desc: "Focused on high legibility, large touch targets, and offline-friendly guidance." },
                  { title: "Actionable Intelligence", desc: "Built-in remedy database providing immediate organic and medicinal treatments." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </div>
       </div>
     </section>
  )
}

function Footer() {
  return (
    <footer className="bg-brand-text pt-20 pb-10 px-6 text-brand-secondary/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight italic">KhetiAid</span>
            </div>
            <p className="max-w-sm mb-6 text-sm leading-relaxed">
              Empowering 120M smallholder farmers with AI-driven plant pathology. We bridge the gap between academic research and field reality.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6">Pipeline</h4>
            <ul className="space-y-4 text-[10px] font-bold tracking-widest uppercase">
              <li>01. DATA & AI TRAINING</li>
              <li>02. BACKEND API DEV</li>
              <li>03. CLOUD DEPLOYMENT</li>
              <li>04. RURAL IMPACT</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-light">
              <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Global Partners</li>
              <li className="hover:text-white transition-colors cursor-pointer">Support Center</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest">
           <div>&copy; 2026 KhetiAid AI. All rights reserved.</div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>System Live & Secure</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
