import React, { useState } from 'react';
import { Droplet, Flame, RotateCcw, AlertCircle } from 'lucide-react';

interface QualitativeSimulatorProps {
  onStepComplete?: (stepNumber: number) => void;
}

export const QualitativeSimulator: React.FC<QualitativeSimulatorProps> = ({
  onStepComplete
}) => {
  // Test tube 1: NaOH test (Fe2+ -> dirty green ppt, insoluble in excess)
  const [tube1State, setTube1State] = useState<'empty' | 'solid_q' | 'solution_q' | 'naoh_dropwise' | 'naoh_excess'>('solution_q');
  
  // Test tube 2: Ba(NO3)2 + HCl test (SO4 2- -> white ppt insoluble in HCl)
  const [tube2State, setTube2State] = useState<'solution_q' | 'bano3_added' | 'hcl_added'>('solution_q');

  const handleAddNaOHDropwise = () => {
    setTube1State('naoh_dropwise');
    if (onStepComplete) onStepComplete(3);
  };

  const handleAddNaOHExcess = () => {
    setTube1State('naoh_excess');
  };

  const handleAddBaNO3 = () => {
    setTube2State('bano3_added');
    if (onStepComplete) onStepComplete(4);
  };

  const handleAddHCl = () => {
    setTube2State('hcl_added');
  };

  const handleReset = () => {
    setTube1State('solution_q');
    setTube2State('solution_q');
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80">
      
      {/* Test Tube Rack Canvas */}
      <div className="relative w-full max-w-md h-96 bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-end overflow-hidden shadow-inner">
        
        {/* Test Tube Rack Wooden/Plastic Stand */}
        <div className="absolute bottom-8 w-64 h-3 bg-amber-800/80 rounded-sm shadow-md" />
        <div className="absolute bottom-32 w-64 h-2 bg-amber-800/80 rounded-sm shadow-md" />
        <div className="absolute bottom-8 left-20 w-3 h-24 bg-amber-900" />
        <div className="absolute bottom-8 right-20 w-3 h-24 bg-amber-900" />

        {/* The Two Portions */}
        <div className="flex items-end justify-center space-x-12 mb-10 z-10">
          
          {/* Test Tube 1 (NaOH Test) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2">Portion 1</span>
            <div className="w-8 h-44 rounded-b-full border-2 border-slate-400 bg-slate-800/40 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-lg">
              
              {/* Solution & Precipitate */}
              {tube1State === 'solution_q' && (
                <div className="w-full h-16 bg-emerald-300/20 border-t border-emerald-400/50 rounded-b-full" />
              )}

              {tube1State === 'naoh_dropwise' && (
                <div className="w-full h-20 bg-emerald-800/80 rounded-b-full relative flex flex-col items-center justify-center">
                  <div className="text-[7px] text-emerald-200 font-bold text-center leading-tight">
                    Dirty Green Ppt
                  </div>
                </div>
              )}

              {tube1State === 'naoh_excess' && (
                <div className="w-full h-28 bg-emerald-900/90 rounded-b-full relative flex flex-col items-center justify-center">
                  <div className="text-[7px] text-emerald-200 font-bold text-center leading-tight">
                    Ppt Insoluble (Excess)
                  </div>
                </div>
              )}

            </div>
            <span className="text-[10px] text-amber-300 font-mono mt-1 font-semibold">Test: NaOH</span>
          </div>

          {/* Test Tube 2 (Ba(NO3)2 Test) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2">Portion 2</span>
            <div className="w-8 h-44 rounded-b-full border-2 border-slate-400 bg-slate-800/40 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-lg">
              
              {tube2State === 'solution_q' && (
                <div className="w-full h-16 bg-emerald-300/20 border-t border-emerald-400/50 rounded-b-full" />
              )}

              {tube2State === 'bano3_added' && (
                <div className="w-full h-20 bg-white/90 rounded-b-full relative flex flex-col items-center justify-center">
                  <div className="text-[7px] text-slate-900 font-bold text-center leading-tight">
                    White Ppt (BaSO4)
                  </div>
                </div>
              )}

              {tube2State === 'hcl_added' && (
                <div className="w-full h-24 bg-white/95 rounded-b-full relative flex flex-col items-center justify-center">
                  <div className="text-[7px] text-slate-900 font-bold text-center leading-tight">
                    Ppt Insoluble in Dilute HCl
                  </div>
                </div>
              )}

            </div>
            <span className="text-[10px] text-cyan-300 font-mono mt-1 font-semibold">Test: Ba(NO3)2</span>
          </div>

        </div>

        {/* Observation banner */}
        <div className="w-full bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl text-xs text-center z-10">
          <span className="text-slate-400">Live Reaction Note: </span>
          <span className="font-semibold text-white">
            {tube1State === 'naoh_dropwise' && 'Dirty green gelatinous precipitate formed with dropwise NaOH.'}
            {tube1State === 'naoh_excess' && 'Precipitate is insoluble in excess Sodium Hydroxide (confirms Fe²⁺).'}
            {tube2State === 'bano3_added' && 'Dense white precipitate formed upon adding Barium Nitrate.'}
            {tube2State === 'hcl_added' && 'White precipitate remains insoluble upon adding dilute HCl (confirms SO₄²⁻).'}
            {tube1State === 'solution_q' && tube2State === 'solution_q' && 'Aqueous Solid Q portions ready for reagent addition.'}
          </span>
        </div>

      </div>

      {/* Reagent Dropper Controls */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Reagent Additions
          </h4>

          {/* Portion 1 buttons */}
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-750 space-y-2">
            <span className="text-xs font-bold text-amber-400 block">Portion 1: Test with NaOH</span>
            
            <button
              onClick={handleAddNaOHDropwise}
              disabled={tube1State !== 'solution_q'}
              className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Add 2M NaOH Dropwise</span>
            </button>

            <button
              onClick={handleAddNaOHExcess}
              disabled={tube1State !== 'naoh_dropwise'}
              className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              <span>Add NaOH Until in Excess</span>
            </button>
          </div>

          {/* Portion 2 buttons */}
          <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-750 space-y-2">
            <span className="text-xs font-bold text-cyan-400 block">Portion 2: Test with Ba(NO3)2 + HCl</span>
            
            <button
              onClick={handleAddBaNO3}
              disabled={tube2State !== 'solution_q'}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Add Aqueous Barium Nitrate</span>
            </button>

            <button
              onClick={handleAddHCl}
              disabled={tube2State !== 'bano3_added'}
              className="w-full py-2 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              <span>Add Dilute HCl</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-300 text-xs transition flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Portions</span>
          </button>
        </div>
      </div>

    </div>
  );
};
