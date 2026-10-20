import React from 'react';

interface ErpLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  dark?: boolean;
}

export const ErpLogo: React.FC<ErpLogoProps> = ({ size = 'hero', showSubtitle = true, dark = false }) => {
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2 select-none">
        <div className="font-black tracking-tighter font-mono text-xl leading-none">
          <span className={dark ? 'text-white' : 'text-slate-900'}>MF</span>
          <span className="text-red-500">x</span>
        </div>
        <div className="bg-slate-700 text-slate-200 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded">
          TECNOLOGIA
        </div>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className="flex flex-col items-center select-none">
        <div className="font-black tracking-tighter text-3xl font-mono leading-none">
          <span className={dark ? 'text-white' : 'text-slate-900'}>MF</span>
          <span className="text-red-500">x</span>
        </div>
        <div className="bg-slate-700 text-white text-[10px] font-black tracking-[0.25em] uppercase px-3 py-0.5 rounded shadow-sm mt-1">
          TECNOLOGIA
        </div>
      </div>
    );
  }

  // Hero Size (for exact center of the Welcome Screen & Login)
  return (
    <div className="flex flex-col items-center justify-center select-none text-center">
      {/* Decorative subtle industrial glow */}
      <div className="relative flex flex-col items-center">
        {/* Main Monogram MFX */}
        <div className="flex items-center justify-center font-black tracking-tighter text-7xl sm:text-8xl md:text-9xl font-sans drop-shadow-sm leading-none">
          <span className={dark ? 'text-white font-extrabold tracking-tight' : 'text-slate-900 font-extrabold tracking-tight'}>MF</span>
          <span className="text-red-600 font-black relative">
            x
            <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-mono font-bold tracking-normal opacity-90 shadow">
              ®
            </span>
          </span>
        </div>

        {/* Gray Box with TECNOLOGIA */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 text-white font-extrabold text-sm sm:text-lg md:text-xl tracking-[0.45em] sm:tracking-[0.55em] uppercase px-8 sm:px-12 py-1.5 sm:py-2 rounded shadow-md mt-2 border border-slate-600/50">
          TECNOLOGIA
        </div>

        {/* Industrial Specialty Tag */}
        {showSubtitle && (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <div className={`text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-red-600 font-black">•</span>
              <span>LASER FIBRA</span>
              <span className="text-red-600 font-black">•</span>
              <span>PLASMA</span>
              <span className="text-red-600 font-black">•</span>
              <span>OXI-CORTE</span>
              <span className="text-red-600 font-black">•</span>
            </div>
            <div className={`text-[11px] sm:text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sistemas de Automação CNC, Consumíveis & Assistência Técnica Industrial
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
