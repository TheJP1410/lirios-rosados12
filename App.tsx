import React, { useState, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import { generateRomanticMessage } from './services/geminiService';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("Para la Gumynola :p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Initial generation removed to keep the specific user requested text on load
  // useEffect(() => {
  //     const initMsg = async () => {
  //         // const text = await generateRomanticMessage();
  //         // setMessage(text);
  //     }
  //     initMsg();
  // }, []);

  const handleGenerateMessage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const text = await generateRomanticMessage();
    setMessage(text);
    setIsGenerating(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* 3D Scene Container */}
      <ThreeScene text={message} />

      {/* UI Controls */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 flex flex-col justify-between p-6">
        
        {/* Top Controls */}
        <div className="flex justify-end items-start pointer-events-auto">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/10"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center pb-8 pointer-events-auto">
            <button
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="group relative px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full overflow-hidden shadow-lg hover:shadow-pink-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="flex items-center gap-3 relative z-10">
                  <Sparkles size={18} className={isGenerating ? "animate-spin" : ""} />
                  <span className="font-medium tracking-wide">
                    {isGenerating ? "Creando..." : "Nueva Dedicatoria"}
                  </span>
              </div>
            </button>
        </div>
      </div>

      {/* Simple Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(2,6,23,0.8)_100%)] z-40"></div>
    </div>
  );
};

export default App;