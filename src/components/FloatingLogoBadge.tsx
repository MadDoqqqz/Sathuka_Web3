import React from 'react';

interface FloatingLogoBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const FloatingLogoBadge: React.FC<FloatingLogoBadgeProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', container: 'p-1.5', rings: 'w-14 h-14' },
    md: { img: 'w-14 h-14', container: 'p-3', rings: 'w-24 h-24' },
    lg: { img: 'w-24 h-24 sm:w-28 sm:h-28', container: 'p-5 sm:p-6', rings: 'w-44 h-44 sm:w-52 sm:h-52' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Floating Glow Aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/25 via-amber-500/20 to-teal-400/25 blur-xl animate-sathuka-pulse-glow" />

      {/* Rotating Orbital Ellipses around the logo */}
      <div className={`absolute ${currentSize.rings} rounded-[48%] border border-teal-400/40 pointer-events-none animate-sathuka-orbit-slow`}
           style={{ transform: 'rotate(25deg) scaleX(1.3) scaleY(0.7)' }} />

      <div className={`absolute ${currentSize.rings} rounded-[48%] border border-amber-400/40 pointer-events-none animate-sathuka-orbit-reverse`}
           style={{ transform: 'rotate(-45deg) scaleX(1.25) scaleY(0.75)' }} />

      {/* Floating Center Card Container */}
      <div className={`relative ${currentSize.container} rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0B101B]/95 to-slate-900/90 border border-slate-700/80 shadow-[0_10px_35px_rgba(0,196,159,0.18)] backdrop-blur-md animate-sathuka-float flex flex-col items-center justify-center group hover:border-teal-400/80 transition-all`}>
        {/* Floating Logo Image */}
        <img
          src="/assets/aistudio/image_1d08876f.png"
          alt="Sathuka Web3 Community"
          className={`${currentSize.img} object-contain transition-transform group-hover:scale-105 duration-300 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
        />

        {showText && size === 'lg' && (
          <div className="mt-2.5 text-center">
            <span className="text-xs font-bold text-white tracking-wider block">
              SATHUKA
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-widest block uppercase">
              Web3 Community
            </span>
          </div>
        )}

        {/* Small floating diamond accent at top right */}
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rotate-45 shadow-[0_0_8px_#F59E0B] animate-sathuka-pulse-glow" />
      </div>
    </div>
  );
};
