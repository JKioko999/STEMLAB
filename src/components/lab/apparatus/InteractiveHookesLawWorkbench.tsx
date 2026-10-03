import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Weight, 
  Ruler, 
  PlusCircle, 
  MinusCircle, 
  HelpCircle,
  History,
  AlertTriangle,
  Info,
  Move
} from 'lucide-react';

export interface HookesLawLiveTelemetry {
  massGrams: number;
  weightN: number;
  pointerCm: number;
  extensionCm: number;
  isOverloaded: boolean;
  scientificObservation: string;
}

interface InteractiveHookesLawWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onReadingRecorded?: (reading: { massGrams: number; weightN: number; pointerCm: number; extensionCm: number }) => void;
  onHookesLawUpdate?: (telemetry: HookesLawLiveTelemetry) => void;
}

export const InteractiveHookesLawWorkbench: React.FC<InteractiveHookesLawWorkbenchProps> = ({
  onStepComplete,
  onReadingRecorded,
  onHookesLawUpdate
}) => {
  // Slotted masses loaded on hanger in grams (0 to 450g)
  const [loadedMassGrams, setLoadedMassGrams] = useState<number>(50);
  const [isPermanentlyStretched, setIsPermanentlyStretched] = useState<boolean>(false);

  // Parallax angle: 'normal' (eye-level), 'high', 'low'
  const [parallaxMode, setParallaxMode] = useState<'normal' | 'high' | 'low'>('normal');

  // Apparatus movable canvas position
  const [standPos, setStandPos] = useState<{ x: number; y: number }>({ x: 80, y: 30 });
  const [draggingItem, setDraggingItem] = useState<'stand' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, item: 'stand') => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();
    setDraggingItem(item);
    setDragOffset({
      x: (clientX - benchRect.left) - standPos.x,
      y: (clientY - benchRect.top) - standPos.y
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingItem || !benchRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const benchRect = benchRef.current.getBoundingClientRect();

      const mouseX = clientX - benchRect.left;
      const mouseY = clientY - benchRect.top;

      const newX = Math.round(Math.max(10, Math.min(benchRect.width - 280, mouseX - dragOffset.x)));
      const newY = Math.round(Math.max(10, Math.min(benchRect.height - 380, mouseY - dragOffset.y)));

      setStandPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (draggingItem) setDraggingItem(null);
    };

    if (draggingItem) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [draggingItem, dragOffset]);

  // In-bench notification banner
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<number[]>([]);

  const pushSnapshot = () => {
    setHistory(prev => [...prev, loadedMassGrams]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setLoadedMassGrams(previous);
    setBenchMessage({ text: `Reverted load to ${previous}g.`, type: 'info' });
  };

  // Initial pointer reading without load L0 = 20.0 cm (or 26.0 cm if deformed)
  const L0 = isPermanentlyStretched ? 26.0 : 20.0;
  const k = 20.0; // Spring constant N/m

  // Weight F = mg in Newtons (g = 10 N/kg)
  const weightN = +((loadedMassGrams / 1000) * 10).toFixed(2);
  
  // Extension e = F / k (m) -> in cm: e = (weightN / 20) * 100
  // If overloaded, extension spikes non-linearly
  const isOverloaded = loadedMassGrams > 350;
  const rawExtensionCm = isOverloaded 
    ? +((weightN / k) * 100 * 1.5).toFixed(1)
    : +((weightN / k) * 100).toFixed(1);

  // Parallax offset: +0.6 cm if looking from high, -0.6 cm if low
  const parallaxOffset = parallaxMode === 'high' ? 0.6 : parallaxMode === 'low' ? -0.6 : 0.0;
  const extensionCm = rawExtensionCm;
  const pointerCm = +(L0 + extensionCm + parallaxOffset).toFixed(1);

  // Visual spring height
  const springHeightPx = Math.min(360, 100 + extensionCm * 6.5);

  const handleAddMass = (amountGrams: number) => {
    pushSnapshot();
    setLoadedMassGrams(prev => {
      const next = prev + amountGrams;
      if (next > 350) {
        setIsPermanentlyStretched(true);
        setBenchMessage({ 
          text: '⚠️ ELASTIC LIMIT EXCEEDED! The spring has experienced plastic yield and permanent elongation. Hooke\'s law (F = ke) is no longer valid.', 
          type: 'error' 
        });
      } else {
        setBenchMessage({ text: `Added ${amountGrams}g to hanger. Total load = ${next}g (${((next/1000)*10).toFixed(2)} N).`, type: 'info' });
      }

      if (next >= 50 && onStepComplete) onStepComplete(2);
      if (next >= 200 && onStepComplete) onStepComplete(3);

      return next;
    });
  };

  const handleRemoveMass = (amountGrams: number) => {
    pushSnapshot();
    setLoadedMassGrams(prev => {
      const next = Math.max(0, prev - amountGrams);
      setBenchMessage({ text: `Removed ${amountGrams}g from hanger. Total load = ${next}g.`, type: 'info' });
      return next;
    });
  };

  const handleLogReading = () => {
    if (onReadingRecorded) {
      onReadingRecorded({
        massGrams: loadedMassGrams,
        weightN,
        pointerCm,
        extensionCm
      });
    }
    setBenchMessage({ 
      text: `Logged to Table 3: Mass = ${loadedMassGrams}g, Weight = ${weightN} N, Pointer L = ${pointerCm} cm, Extension e = ${extensionCm} cm`, 
      type: 'success' 
    });
  };

  const handleReset = () => {
    pushSnapshot();
    setLoadedMassGrams(0);
    setIsPermanentlyStretched(false);
    setBenchMessage({ text: 'All masses removed from spring hanger.', type: 'info' });
  };

  const getObservationNotice = () => {
    if (isOverloaded || isPermanentlyStretched) {
      return `⚠️ ELASTIC LIMIT EXCEEDED (Load = ${loadedMassGrams}g): The spring has suffered permanent plastic deformation. Even when masses are unloaded, the spring will not return to initial length L0 = 20.0 cm. In KCSE Physics, this invalidates the straight-line graph through the origin.`;
    }
    if (parallaxMode !== 'normal') {
      return `⚠️ PARALLAX ERROR ACTIVE (${parallaxMode === 'high' ? 'High Eye Angle (+0.6 cm)' : 'Low Eye Angle (-0.6 cm)'}): Your eye is not horizontally aligned with the pointer tip and metre rule scale. This introduces a systematic measurement error.`;
    }
    if (loadedMassGrams === 0) {
      return 'Unloaded spring. Pointer rests at initial reference mark L₀ = 20.0 cm.';
    }
    return `Linear elastic region: Weight F = ${weightN} N produces extension e = ${extensionCm} cm (Pointer L = ${pointerCm} cm). Consistent with k = 20.0 N/m.`;
  };

  useEffect(() => {
    if (onHookesLawUpdate) {
      onHookesLawUpdate({
        massGrams: loadedMassGrams,
        weightN,
        pointerCm,
        extensionCm,
        isOverloaded: isOverloaded || isPermanentlyStretched,
        scientificObservation: getObservationNotice()
      });
    }
  }, [loadedMassGrams, weightN, pointerCm, extensionCm, isOverloaded, isPermanentlyStretched, parallaxMode]);

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Hooke's Law Mechanics Workbench • KCSE Physics Paper 3</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Suspend slotted masses onto the helical spring. Exceeding 350g causes plastic deformation; viewing off eye-level introduces parallax error.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Back / Undo Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Undo previous mass change"
          >
            <History className="w-3.5 h-3.5" />
            <span>Step Back (Undo)</span>
          </button>

          <button
            onClick={() => {
              pushSnapshot();
              setLoadedMassGrams(150);
              setIsPermanentlyStretched(false);
              if (onStepComplete) {
                onStepComplete(1);
                onStepComplete(2);
              }
              setBenchMessage({ text: 'Preset standard 150g mass loaded.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-bold transition"
          >
            <span>Preset (150g)</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-750 text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Unload Masses</span>
          </button>
        </div>
      </div>

      {/* In-bench Notification Banner */}
      {benchMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all animate-in fade-in duration-200 ${
          benchMessage.type === 'warning'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            : benchMessage.type === 'error'
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            : benchMessage.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-blue-500/15 border-blue-500/40 text-blue-300'
        }`}>
          <div className="flex items-center space-x-2">
            {benchMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {benchMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {benchMessage.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span>{benchMessage.text}</span>
          </div>
          <button 
            onClick={() => setBenchMessage(null)}
            className="text-[11px] font-bold opacity-75 hover:opacity-100 ml-3"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Mass Tray Controls + Spring Apparatus Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side Controls (Col 4) */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slotted Masses Tray
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              Total: {loadedMassGrams}g ({weightN} N)
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Click masses to attach or remove from the hanging mass carrier:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[50, 100].map(m => (
              <button
                key={m}
                onClick={() => handleAddMass(m)}
                disabled={loadedMassGrams + m > 450}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs transition disabled:opacity-40 flex items-center justify-between shadow"
              >
                <span>+{m}g Mass</span>
                <span className="text-[10px] font-mono text-cyan-400 font-normal">{(m/100).toFixed(1)} N</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[50, 100].map(m => (
              <button
                key={m}
                onClick={() => handleRemoveMass(m)}
                disabled={loadedMassGrams < m}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-750 border border-slate-750 text-slate-300 font-bold text-xs transition disabled:opacity-40 flex items-center justify-between"
              >
                <span>-{m}g Remove</span>
                <MinusCircle className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Parallax / Viewing Angle Selector */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 block">Observer Viewing Angle (Parallax Check)</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setParallaxMode('high')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
                  parallaxMode === 'high' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Above (+0.6cm)
              </button>
              <button
                onClick={() => setParallaxMode('normal')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
                  parallaxMode === 'normal' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Eye-Level (Exact)
              </button>
              <button
                onClick={() => setParallaxMode('low')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition ${
                  parallaxMode === 'low' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Below (-0.6cm)
              </button>
            </div>
          </div>

          {/* Overload Warning */}
          {isOverloaded && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Elastic Limit Exceeded!
              </span>
              <p className="text-[11px] leading-relaxed">
                Loading &gt; 350g breaks Hooke's Law and stretches the spring permanently.
              </p>
            </div>
          )}

          {/* Record button */}
          <button
            onClick={handleLogReading}
            className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Reading to Practical Answer Sheet</span>
          </button>
        </div>

        {/* Right Side: Spring Apparatus Graphic Canvas (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={benchRef}
            className="relative w-full h-[520px] bg-slate-950/95 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 select-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Header */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none flex items-center space-x-2">
              <span>SPRING APPARATUS & METRE RULE • KCSE MECHANICS</span>
              <span className="text-cyan-400 font-bold">• (Apparatus is movable via drag & drop)</span>
            </div>

            {/* Stand, Spring, Pointer & Metre Rule Setup (Movable) */}
            <div 
              onMouseDown={e => handleStartDrag(e, 'stand')}
              onTouchStart={e => handleStartDrag(e, 'stand')}
              style={{
                left: `${standPos.x}px`,
                top: `${standPos.y}px`
              }}
              className={`absolute z-20 cursor-grab active:cursor-grabbing group ${
                draggingItem === 'stand' ? 'ring-2 ring-cyan-400/50 scale-102 z-40' : ''
              }`}
              title="Click and drag Retort Stand and Spring Apparatus to reposition"
            >
              {/* Move Badge handle */}
              <div className="text-[9px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 flex items-center gap-1 mb-1 transition">
                <Move className="w-3 h-3 text-cyan-400" />
                <span>Move Stand & Apparatus</span>
              </div>

              <div className="relative w-72 h-[450px]">
                {/* Vertical Metre Rule (Left of spring) */}
                <div className="absolute left-8 top-4 w-12 h-[420px] bg-amber-100/90 border-2 border-amber-300 rounded shadow-2xl flex flex-col justify-between py-2 px-1 pointer-events-none">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(cm => (
                    <div key={cm} className="flex items-center justify-between w-full">
                      <span className="text-[8px] font-mono font-bold text-slate-900 leading-none">{cm}</span>
                      <div className={`h-[1px] bg-slate-800 ${cm % 10 === 0 ? 'w-4' : 'w-2'}`} />
                    </div>
                  ))}
                </div>

                {/* Retort Stand Arm */}
                <div className="absolute top-6 left-0 w-60 h-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500 rounded shadow-lg" />
                <div className="absolute top-4 left-0 w-4 h-[420px] bg-slate-500 rounded" />
                {/* Stand Base */}
                <div className="absolute bottom-0 -left-6 w-32 h-5 bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 rounded-lg shadow-2xl" />

                {/* Suspended Helical Spring Assembly */}
                <div className="absolute top-9 left-36 flex flex-col items-center">
                  {/* Clamp Hook */}
                  <div className="w-2 h-4 bg-slate-400 rounded-t" />

                  {/* Helical Spring Graphic */}
                  <svg 
                    width="40" 
                    height={springHeightPx} 
                    className="transition-all duration-300"
                    viewBox={`0 0 40 ${springHeightPx}`}
                  >
                    <path
                      d={`M 20 0 Q 35 15 20 30 T 20 60 T 20 90 T 20 120 T 20 150 T 20 180 T 20 210 T 20 ${springHeightPx}`}
                      fill="none"
                      stroke={isPermanentlyStretched ? '#f43f5e' : '#94a3b8'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Horizontal Pointer Needle pointing to Rule */}
                  <div className="relative w-36 h-2 -ml-28 flex items-center">
                    <div className="w-28 h-1 bg-rose-500 shadow-md" />
                    <div className="w-2.5 h-2.5 bg-rose-600 rounded-full -ml-1 ring-2 ring-rose-300" />
                  </div>

                  {/* Mass Hanger & Slotted Masses */}
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-1.5 h-10 bg-slate-400" />
                    {/* Base pan */}
                    <div className="w-14 h-2.5 bg-amber-600 rounded border border-amber-400 shadow flex items-center justify-center">
                      <span className="text-[6px] font-bold text-slate-950">50g HANGER</span>
                    </div>

                    {/* Loaded slotted discs */}
                    {loadedMassGrams > 50 && (
                      <div className="flex flex-col items-center space-y-0.5 mt-0.5">
                        {[...Array(Math.floor((loadedMassGrams - 50) / 50))].map((_, idx) => (
                          <div key={idx} className="w-16 h-2.5 bg-slate-300 border border-slate-500 rounded shadow-sm flex items-center justify-center">
                            <span className="text-[6px] font-bold text-slate-800">50g DISC</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Measurements HUD */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl shadow-xl space-y-1.5 min-w-[210px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Hooke's Law Readings</span>
                <span className={`w-2 h-2 rounded-full ${isOverloaded ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'}`} />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Pointer Reading (L):</span>
                <span className="text-lg font-mono font-black text-cyan-300">
                  {pointerCm.toFixed(1)} <span className="text-xs font-normal text-slate-400">cm</span>
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800 pt-1">
                <span>Extension (e):</span>
                <span className="text-emerald-400 font-bold">{extensionCm.toFixed(1)} cm</span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Total Weight (F):</span>
                <span className="text-amber-400 font-bold">{weightN.toFixed(2)} N</span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Initial L₀:</span>
                <span className="text-white">{L0.toFixed(1)} cm</span>
              </div>
            </div>

          </div>

          {/* OBSERVATIONS & SCIENTIFIC FEEDBACK */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 shadow-lg ${
            isOverloaded || isPermanentlyStretched
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : parallaxMode !== 'normal'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-slate-850 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-cyan-400">
                {isOverloaded ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Plastic Deformation & Overload Warning</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mechanics Observation & Extension Physics</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">KCSE Physics 232/3</span>
            </div>

            <p className="leading-relaxed">
              {getObservationNotice()}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
