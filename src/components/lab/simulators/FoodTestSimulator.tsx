import React, { useState } from 'react';
import { Droplet, Flame, RotateCcw } from 'lucide-react';

interface FoodTestSimulatorProps {
  onStepComplete?: (stepNumber: number) => void;
}

export const FoodTestSimulator: React.FC<FoodTestSimulatorProps> = ({
  onStepComplete
}) => {
  // Test 1: Benedict's test for reducing sugars (turns brick-red with boiling water bath)
  const [benedictState, setBenedictState] = useState<'sample' | 'reagent_added' | 'heated_orange'>('sample');

  // Test 2: Biuret test for proteins (turns purple/violet without heat)
  const [biuretState, setBiuretState] = useState<'sample' | 'purple'>('sample');

  // Test 3: Iodine test for starch (remains brown/no change since starch absent)
  const [iodineState, setIodineState] = useState<'sample' | 'brown'>('sample');

  const handleHeatBenedict = () => {
    setBenedictState('heated_orange');
    if (onStepComplete) onStepComplete(1);
  };

  const handleAddBiuret = () => {
    setBiuretState('purple');
    if (onStepComplete) onStepComplete(2);
  };

  const handleAddIodine = () => {
    setIodineState('brown');
    if (onStepComplete) onStepComplete(3);
  };

  const handleReset = () => {
    setBenedictState('sample');
    setBiuretState('sample');
    setIodineState('sample');
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80">
      
      {/* Visual Canvas */}
      <div className="relative w-full max-w-md h-96 bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-between overflow-hidden shadow-inner">
        
        {/* Three test tubes */}
        <div className="flex items-end justify-center space-x-8 mt-6 z-10">
          
          {/* Tube 1: Benedict's */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-slate-300 mb-1">Benedict's</span>
            <div className="w-8 h-40 rounded-b-full border-2 border-slate-400 bg-slate-800/40 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-lg">
              {benedictState === 'sample' && <div className="w-full h-12 bg-slate-300/30 rounded-b-full" />}
              {benedictState === 'reagent_added' && <div className="w-full h-16 bg-blue-500/80 rounded-b-full" />}
              {benedictState === 'heated_orange' && (
                <div className="w-full h-20 bg-amber-600 rounded-b-full flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold text-center leading-tight">Brick-Red Ppt</span>
                </div>
              )}
            </div>
          </div>

          {/* Tube 2: Biuret */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-slate-300 mb-1">Biuret</span>
            <div className="w-8 h-40 rounded-b-full border-2 border-slate-400 bg-slate-800/40 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-lg">
              {biuretState === 'sample' && <div className="w-full h-12 bg-slate-300/30 rounded-b-full" />}
              {biuretState === 'purple' && (
                <div className="w-full h-20 bg-purple-700 rounded-b-full flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold text-center leading-tight">Purple / Violet</span>
                </div>
              )}
            </div>
          </div>

          {/* Tube 3: Iodine */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-slate-300 mb-1">Iodine</span>
            <div className="w-8 h-40 rounded-b-full border-2 border-slate-400 bg-slate-800/40 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-lg">
              {iodineState === 'sample' && <div className="w-full h-12 bg-slate-300/30 rounded-b-full" />}
              {iodineState === 'brown' && (
                <div className="w-full h-16 bg-amber-800 rounded-b-full flex items-center justify-center">
                  <span className="text-[7px] text-amber-200 font-bold text-center leading-tight">Yellow-Brown (Retained)</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Live Observation Box */}
        <div className="w-full bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl text-xs text-center z-10">
          <span className="text-slate-400">Live Reaction Note: </span>
          <span className="font-semibold text-white">
            {benedictState === 'heated_orange' && 'Solution turned to brick-red precipitate (Reducing sugars present). '}
            {biuretState === 'purple' && 'Solution turned violet/purple (Proteins present). '}
            {iodineState === 'brown' && 'Iodine brown colour remained unchanged (Starch absent). '}
            {benedictState === 'sample' && biuretState === 'sample' && iodineState === 'sample' && 'Solution X portions ready for testing.'}
          </span>
        </div>

      </div>

      {/* Food Test Controls */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Biochemical Actions
          </h4>

          <button
            onClick={handleHeatBenedict}
            disabled={benedictState === 'heated_orange'}
            className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Add Benedict's & Heat in Water Bath</span>
          </button>

          <button
            onClick={handleAddBiuret}
            disabled={biuretState === 'purple'}
            className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Add Biuret Reagent (NaOH + CuSO4)</span>
          </button>

          <button
            onClick={handleAddIodine}
            disabled={iodineState === 'brown'}
            className="w-full py-2 px-3 rounded-lg bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Add 2 Drops Iodine Solution</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-300 text-xs transition flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Tests</span>
          </button>
        </div>
      </div>

    </div>
  );
};
