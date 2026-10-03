import React, { useState } from 'react';
import { Droplet, Play, RotateCcw, Sparkles } from 'lucide-react';

interface TitrationSimulatorProps {
  onStepComplete?: (stepNumber: number) => void;
  onVolumeChange?: (volume: number) => void;
  isExamMode?: boolean;
}

export const TitrationSimulator: React.FC<TitrationSimulatorProps> = ({
  onStepComplete,
  onVolumeChange,
  isExamMode = false
}) => {
  const [buretteLevel, setBuretteLevel] = useState(0.0); // 0.00 to 50.00 cm3 delivered
  const [hasIndicator, setHasIndicator] = useState(false);
  const [pipettedBase, setPipettedBase] = useState(false);
  const [isTapOpen, setIsTapOpen] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState<'dropwise' | 'stream'>('dropwise');
  const [isSwirling, setIsSwirling] = useState(false);

  // Equivalence point is around 24.50 cm3
  const equivalencePoint = 24.50;

  // Handle tap titration
  const handleDeliver = (amount: number) => {
    setBuretteLevel(prev => {
      const next = Math.min(50.0, +(prev + amount).toFixed(2));
      if (onVolumeChange) onVolumeChange(next);
      return next;
    });
  };

  const handlePipette = () => {
    setPipettedBase(true);
    if (onStepComplete) onStepComplete(2);
  };

  const handleAddIndicator = () => {
    if (!pipettedBase) {
      alert('Please pipette 25.0 cm³ of Solution B (NaOH) into the conical flask first.');
      return;
    }
    setHasIndicator(true);
    if (onStepComplete) onStepComplete(3);
  };

  const handleTitrateDrop = () => {
    if (!pipettedBase || !hasIndicator) {
      alert('Ensure Solution B is pipetted and indicator added before opening the burette tap.');
      return;
    }
    handleDeliver(0.10);
  };

  const handleTitrateStream = () => {
    if (!pipettedBase || !hasIndicator) {
      alert('Ensure Solution B is pipetted and indicator added before opening the burette tap.');
      return;
    }
    handleDeliver(1.00);
  };

  // Determine conical flask color
  // In alkaline NaOH + phenolphthalein: vibrant magenta/pink (#f43f5e)
  // At equivalence (>= 24.50 cm3 HCl): neutral/acidic, becomes clear (#f8fafc)
  const isNeutralized = buretteLevel >= equivalencePoint;
  const isApproaching = buretteLevel >= 23.50 && !isNeutralized;

  let flaskColor = '#e2e8f0'; // pure water / empty
  if (pipettedBase && !hasIndicator) {
    flaskColor = '#e2e8f0'; // colorless alkaline before indicator
  } else if (pipettedBase && hasIndicator) {
    if (isNeutralized) {
      flaskColor = '#f1f5f9'; // crystal clear (colorless)
    } else if (isApproaching) {
      flaskColor = '#fb7185'; // pale pink
    } else {
      flaskColor = '#e11d48'; // intense pink/magenta
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80">
      
      {/* Visual Simulation Canvas */}
      <div className="relative w-full max-w-md h-96 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden shadow-inner">
        
        {/* Retort Stand SVG */}
        <div className="absolute left-16 top-6 bottom-4 w-3 bg-slate-600 rounded-t-sm shadow-md" />
        <div className="absolute left-8 bottom-4 w-32 h-3 bg-slate-700 rounded-sm shadow-lg" />
        
        {/* Burette Clamp */}
        <div className="absolute left-16 top-24 w-12 h-3 bg-slate-500 rounded-r-md shadow" />

        {/* Burette Apparatus */}
        <div className="absolute left-28 top-8 flex flex-col items-center">
          {/* Glass tube */}
          <div className="relative w-6 h-56 bg-slate-800/60 border-2 border-slate-400 rounded-t-sm overflow-hidden flex flex-col justify-end shadow-md">
            
            {/* Liquid level */}
            <div 
              className="w-full bg-cyan-400/30 border-t-2 border-cyan-400 transition-all duration-300"
              style={{ height: `${Math.max(5, 100 - (buretteLevel / 50) * 100)}%` }}
            />

            {/* Graduations */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 px-0.5 pointer-events-none opacity-40">
              {[0, 10, 20, 30, 40, 50].map(val => (
                <div key={val} className="w-full border-b border-slate-400 text-[6px] text-slate-300 text-right pr-0.5">
                  {val}
                </div>
              ))}
            </div>
          </div>

          {/* Stopcock / Tap */}
          <div className="relative w-8 h-4 bg-slate-600 rounded flex items-center justify-center my-0.5 shadow">
            <div className="w-4 h-2 bg-emerald-500 rounded-full" />
          </div>

          {/* Jet tip */}
          <div className="w-1.5 h-6 bg-slate-400 border-x border-slate-500 rounded-b-full relative">
            {/* Droplet animation */}
            {buretteLevel > 0 && buretteLevel < 50 && (
              <div className="absolute -bottom-2 left-0.5 w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
            )}
          </div>
        </div>

        {/* Conical Flask Apparatus */}
        <div className={`absolute left-20 bottom-8 transition-transform ${isSwirling ? 'rotate-3 scale-105' : ''}`}>
          <div className="relative w-24 h-24 flex flex-col items-center">
            
            {/* Flask neck */}
            <div className="w-6 h-7 bg-slate-800/40 border-2 border-b-0 border-slate-400 rounded-t-sm z-10" />

            {/* Flask triangular body */}
            <div 
              className="w-24 h-16 border-2 border-slate-400 rounded-b-xl overflow-hidden relative shadow-lg flex items-end justify-center transition-colors duration-500"
              style={{ 
                clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                backgroundColor: flaskColor
              }}
            >
              {/* Internal swirl ripples */}
              {isSwirling && (
                <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
              )}
            </div>

            {/* White ceramic tile under flask */}
            <div className="w-28 h-2 bg-slate-100 rounded-sm shadow-md mt-0.5" />
          </div>
        </div>

        {/* Digital Burette Reading HUD */}
        <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-right shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Burette Reading</span>
          <span className="font-mono text-xl font-bold text-cyan-400">
            {buretteLevel.toFixed(2)} <span className="text-xs text-slate-400">cm³</span>
          </span>
          <span className="text-[10px] text-slate-500 block">Meniscus (Bottom)</span>
        </div>

        {/* Flask State Indicator */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl text-right shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Flask Solution State</span>
          <span className={`text-xs font-bold ${
            !pipettedBase ? 'text-slate-400' :
            !hasIndicator ? 'text-slate-300' :
            isNeutralized ? 'text-emerald-400' : 'text-pink-400'
          }`}>
            {!pipettedBase ? 'Empty Flask' :
             !hasIndicator ? 'Alkaline (No Indicator)' :
             isNeutralized ? 'Neutral End-Point (Clear)' : 'Alkaline (Pink Medium)'}
          </span>
        </div>

      </div>

      {/* Interactive Controls & Reagents */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Lab Actions
          </h4>

          {/* Action 1: Pipette 25.0 cm3 NaOH */}
          <button
            onClick={handlePipette}
            disabled={pipettedBase}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
              pipettedBase
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
            }`}
          >
            <span>1. Pipette 25.0 cm³ Solution B (NaOH)</span>
            {pipettedBase && <span className="text-[10px] font-mono">DONE</span>}
          </button>

          {/* Action 2: Add Phenolphthalein Indicator */}
          <button
            onClick={handleAddIndicator}
            disabled={hasIndicator || !pipettedBase}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
              hasIndicator
                ? 'bg-pink-950/60 text-pink-400 border border-pink-800/80'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow disabled:opacity-50'
            }`}
          >
            <span>2. Add 3 Drops Phenolphthalein</span>
            {hasIndicator && <span className="text-[10px] font-mono">PINK</span>}
          </button>

          {/* Action 3: Titrate controls */}
          <div className="pt-2 border-t border-slate-700/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              3. Deliver Solution A (HCl) from Burette:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTitrateDrop}
                disabled={!hasIndicator}
                className="py-2 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>+0.10 cm³ (Drop)</span>
              </button>

              <button
                onClick={handleTitrateStream}
                disabled={!hasIndicator}
                className="py-2 px-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <span>+1.00 cm³ (Fast)</span>
              </button>
            </div>

            {/* Swirl Flask */}
            <button
              onMouseDown={() => setIsSwirling(true)}
              onMouseUp={() => setIsSwirling(false)}
              className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold transition active:bg-slate-600"
            >
              Hold to Swirl Conical Flask
            </button>

            {/* Reset Titre for next run */}
            <button
              onClick={() => {
                setBuretteLevel(0.0);
                setHasIndicator(false);
                setPipettedBase(false);
              }}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white text-xs transition flex items-center justify-center space-x-1 border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Burette for Next Titre</span>
            </button>
          </div>
        </div>

        {/* KCSE Guidance note */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">KNEC Examination Guide:</p>
          <p>
            The equivalence point is reached when the solution permanently changes from pink to colourless. Read the burette at eye level at the bottom of the meniscus.
          </p>
        </div>
      </div>

    </div>
  );
};
