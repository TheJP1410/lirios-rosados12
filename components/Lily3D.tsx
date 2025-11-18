import React from 'react';

interface Lily3DProps {
  delay?: number;
  scale?: number;
  colorTone?: 'pink' | 'lightPink' | 'hotPink';
  rotationOffset?: number;
}

const Lily3D: React.FC<Lily3DProps> = ({ 
  delay = 0, 
  scale = 1, 
  colorTone = 'pink',
  rotationOffset = 0
}) => {
  
  // CSS Gradients for different pink tones
  const gradients = {
    pink: 'linear-gradient(to top, #be185d 0%, #f9a8d4 60%, #ffffff 100%)', // Pink-700 to Pink-300 to White
    lightPink: 'linear-gradient(to top, #db2777 0%, #fbcfe8 60%, #ffffff 100%)', // Pink-600 to Pink-200 to White
    hotPink: 'linear-gradient(to top, #9d174d 0%, #f472b6 60%, #ffe4e6 100%)', // Pink-800 to Pink-400 to Rose-100
  };

  const petalStyle = {
    background: gradients[colorTone],
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
  };

  // Staggered bloom animation
  const bloomDuration = '3s';
  const swayDuration = `${4 + Math.random() * 2}s`;

  return (
    <div 
      className="absolute bottom-0 preserve-3d"
      style={{
        transform: `translateX(-50%) scale(${scale}) rotateZ(${rotationOffset}deg)`,
        left: '50%',
        zIndex: Math.floor(scale * 100),
        animation: `sway ${swayDuration} ease-in-out infinite alternate`,
        animationDelay: `${delay}s`
      }}
    >
      {/* Stem */}
      <div className="w-2 h-[400px] bg-green-800 mx-auto rounded-full origin-bottom relative overflow-hidden shadow-lg">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-900 via-green-700 to-green-900 opacity-80"></div>
      </div>

      {/* Leaves */}
      <div className="absolute bottom-32 -left-16 w-32 h-4 bg-green-700 rounded-[50%] origin-right transform rotate-[-30deg] shadow-md"></div>
      <div className="absolute bottom-52 -right-16 w-32 h-4 bg-green-700 rounded-[50%] origin-left transform rotate-[30deg] shadow-md"></div>

      {/* Flower Head Container */}
      <div className="absolute top-0 left-1/2 w-0 h-0 preserve-3d">
        <div 
            className="relative w-0 h-0 preserve-3d"
            style={{ transform: 'translateY(-20px)' }} // Adjust head position relative to stem top
        >
            {/* Inner Petals (3) */}
            {[0, 120, 240].map((deg, i) => (
              <div
                key={`inner-${i}`}
                className="absolute bottom-0 left-1/2 origin-bottom w-12 h-32 rounded-[50%_50%_50%_50%_/_70%_70%_30%_30%] border border-pink-300/20"
                style={{
                  ...petalStyle,
                  marginLeft: '-24px', // Center width
                  transform: `rotateY(${deg}deg) rotateX(35deg)`, // Initial closed state base
                  animation: `bloomInner${i} ${bloomDuration} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                  animationDelay: `${delay}s`
                }}
              >
                {/* Texture/Veins */}
                <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
              </div>
            ))}

            {/* Outer Petals (3) */}
            {[60, 180, 300].map((deg, i) => (
              <div
                key={`outer-${i}`}
                className="absolute bottom-0 left-1/2 origin-bottom w-14 h-36 rounded-[50%_50%_50%_50%_/_70%_70%_30%_30%] border border-pink-300/20"
                style={{
                  ...petalStyle,
                  marginLeft: '-28px',
                  filter: 'brightness(0.9)', // Slightly darker
                  transform: `rotateY(${deg}deg) rotateX(45deg)`,
                  animation: `bloomOuter${i} ${bloomDuration} cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                  animationDelay: `${delay + 0.2}s`
                }}
              />
            ))}

            {/* Stamens */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={`stamen-${i}`}
                className="absolute bottom-0 left-1/2 w-1 h-24 origin-bottom bg-gradient-to-t from-green-100 to-yellow-200"
                style={{
                    marginLeft: '-2px',
                    transform: `rotateY(${deg}deg) rotateX(20deg)`,
                }}
              >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-orange-800 rounded-full shadow-sm"></div>
              </div>
            ))}
            
            {/* Center Pistil */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-28 origin-bottom bg-green-200 rounded-full" style={{ transform: 'rotateX(0deg)' }}>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full"></div>
             </div>

        </div>
      </div>

      {/* Dynamic Styles for Bloom Animation Keyframes injected via style tag locally to handle dynamic angles if needed, but for now we use standard classes or global styles. 
          Actually, let's use inline styles for the specific rotation angles in the keyframes if possible, but React style objects don't support keyframes directly.
          We will rely on the index.html global styles for general bloom, but refine here with specific transforms.
      */}
      <style>{`
        @keyframes bloomInner${0} { 0% { transform: rotateY(0deg) rotateX(90deg) scale(0.2); } 100% { transform: rotateY(0deg) rotateX(45deg) scale(1); } }
        @keyframes bloomInner${1} { 0% { transform: rotateY(120deg) rotateX(90deg) scale(0.2); } 100% { transform: rotateY(120deg) rotateX(45deg) scale(1); } }
        @keyframes bloomInner${2} { 0% { transform: rotateY(240deg) rotateX(90deg) scale(0.2); } 100% { transform: rotateY(240deg) rotateX(45deg) scale(1); } }
        
        @keyframes bloomOuter${0} { 0% { transform: rotateY(60deg) rotateX(80deg) scale(0.2); } 100% { transform: rotateY(60deg) rotateX(60deg) scale(1); } }
        @keyframes bloomOuter${1} { 0% { transform: rotateY(180deg) rotateX(80deg) scale(0.2); } 100% { transform: rotateY(180deg) rotateX(60deg) scale(1); } }
        @keyframes bloomOuter${2} { 0% { transform: rotateY(300deg) rotateX(80deg) scale(0.2); } 100% { transform: rotateY(300deg) rotateX(60deg) scale(1); } }
      `}</style>
    </div>
  );
};

export default Lily3D;