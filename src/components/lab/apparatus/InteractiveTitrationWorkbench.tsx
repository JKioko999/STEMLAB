import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Droplet, 
  CheckCircle2, 
  HelpCircle, 
  PlusCircle, 
  AlertTriangle,
  Beaker,
  History,
  RefreshCw,
  Info,
  Move
} from 'lucide-react';

export interface TitrationLiveTelemetry {
  titre: number;
  initialReading: number;
  finalReading: number;
  indicator: 'phenolphthalein' | 'methyl_orange' | 'none';
  indicatorDrops: number;
  baseVolume: number;
  solutionAppearance: string;
  isNeutralized: boolean;
  isOvertitrated: boolean;
  isInaccurate: boolean;
  inaccuracyReason?: string;
  scientificObservation: string;
}

interface InteractiveTitrationWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onVolumeChange?: (volume: number) => void;
  onTitrationUpdate?: (telemetry: TitrationLiveTelemetry) => void;
  isExamMode?: boolean;
}

interface TitrationSnapshot {
  hasStand: boolean;
  hasBuretteMounted: boolean;
  isBuretteFilledWithAcid: boolean;
  hasTile: boolean;
  hasFlask: boolean;
  pipetteState: 'empty' | 'filled_base' | 'dispensed';
  pipetteSelectedVolume: number;
  flaskBaseVolume: number;
  indicatorType: 'phenolphthalein' | 'methyl_orange';
  indicatorDrops: number;
  isFlaskUnderBurette: boolean;
  buretteDeliveredVolume: number;
}

export const InteractiveTitrationWorkbench: React.FC<InteractiveTitrationWorkbenchProps> = ({
  onStepComplete,
  onVolumeChange,
  onTitrationUpdate,
  isExamMode = false
}) => {
  // Physical assembly states on the bench
  const [hasStand, setHasStand] = useState(false);
  const [hasBuretteMounted, setHasBuretteMounted] = useState(false);
  const [isBuretteFilledWithAcid, setIsBuretteFilledWithAcid] = useState(false);

  const [hasTile, setHasTile] = useState(false);
  const [hasFlask, setHasFlask] = useState(false);
  
  // Pipette state
  const [pipetteSelectedVolume, setPipetteSelectedVolume] = useState<number>(25.0); // 25.0 cm3 (KNEC standard), or 15.0 or 35.0
  const [pipetteState, setPipetteState] = useState<'empty' | 'filled_base' | 'dispensed'>('empty');
  const [flaskBaseVolume, setFlaskBaseVolume] = useState(0.0); // 0 or selected cm3

  // Indicator choice & drops
  const [indicatorType, setIndicatorType] = useState<'phenolphthalein' | 'methyl_orange'>('phenolphthalein');
  const [indicatorDrops, setIndicatorDrops] = useState(0); // 0 to 12
  
  // Flask position: 'free' or 'under_burette'
  const [isFlaskUnderBurette, setIsFlaskUnderBurette] = useState(false);

  // Apparatus movable canvas positions (px relative to canvas)
  const [standPos, setStandPos] = useState<{ x: number; y: number }>({ x: 220, y: 30 });
  const [tilePos, setTilePos] = useState<{ x: number; y: number }>({ x: 440, y: 440 });
  const [flaskPos, setFlaskPos] = useState<{ x: number; y: number }>({ x: 500, y: 340 });

  // Dragging apparatus state
  const [draggingItem, setDraggingItem] = useState<'stand' | 'tile' | 'flask' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, item: 'stand' | 'tile' | 'flask') => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();

    const mouseX = clientX - benchRect.left;
    const mouseY = clientY - benchRect.top;

    setDraggingItem(item);
    const initialPos = item === 'stand' ? standPos : item === 'tile' ? tilePos : flaskPos;
    setDragOffset({
      x: mouseX - initialPos.x,
      y: mouseY - initialPos.y
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

      const newX = Math.round(Math.max(20, Math.min(benchRect.width - 120, mouseX - dragOffset.x)));
      const newY = Math.round(Math.max(20, Math.min(benchRect.height - 120, mouseY - dragOffset.y)));

      if (draggingItem === 'stand') {
        setStandPos({ x: newX, y: newY });
        // If flask was docked under burette, move it along with the stand
        if (isFlaskUnderBurette) {
          setFlaskPos({ x: newX + 40, y: 340 });
          setTilePos({ x: newX + 40, y: 440 });
        }
      } else if (draggingItem === 'tile') {
        setTilePos({ x: newX, y: newY });
      } else if (draggingItem === 'flask') {
        setFlaskPos({ x: newX, y: newY });
        
        // Proximity detection to burette jet tip:
        // Burette tip is at standPos.x + 40, around y: 340
        const buretteTipX = standPos.x + 40;
        const distToBurette = Math.abs(newX - buretteTipX);

        if (hasBuretteMounted && distToBurette < 60) {
          // Snap directly under burette
          setIsFlaskUnderBurette(true);
          setTilePos({ x: buretteTipX, y: 440 });
        } else if (distToBurette > 85) {
          setIsFlaskUnderBurette(false);
        }
      }
    };

    const handleEnd = () => {
      if (draggingItem) {
        setDraggingItem(null);
      }
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
  }, [draggingItem, dragOffset, standPos, isFlaskUnderBurette, hasBuretteMounted]);

  // Titration delivery state
  const [buretteDeliveredVolume, setBuretteDeliveredVolume] = useState(0.0); // 0.00 to 50.00 cm3
  const [isSwirling, setIsSwirling] = useState(false);

  // In-bench notification banner (instead of window.alert)
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<TitrationSnapshot[]>([]);

  // Calculate actual equivalence point:
  // Standard 25.0 cm3 of 0.10M NaOH requires exactly 24.50 cm3 of 0.102M HCl.
  // Excess indicator (>5 drops) shifts the equivalence point slightly (+0.10 cm3 per 2 extra drops because indicator is weak acid).
  const indicatorAcidOffset = indicatorDrops > 4 ? +((indicatorDrops - 4) * 0.12).toFixed(2) : 0;
  const actualEquivalencePoint = flaskBaseVolume > 0 
    ? +( ((flaskBaseVolume / 25.0) * 24.50) + indicatorAcidOffset ).toFixed(2) 
    : 24.50;

  // Snapshot before mutation
  const pushSnapshot = () => {
    setHistory(prev => [
      ...prev,
      {
        hasStand,
        hasBuretteMounted,
        isBuretteFilledWithAcid,
        hasTile,
        hasFlask,
        pipetteState,
        pipetteSelectedVolume,
        flaskBaseVolume,
        indicatorType,
        indicatorDrops,
        isFlaskUnderBurette,
        buretteDeliveredVolume
      }
    ]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));

    setHasStand(previous.hasStand);
    setHasBuretteMounted(previous.hasBuretteMounted);
    setIsBuretteFilledWithAcid(previous.isBuretteFilledWithAcid);
    setHasTile(previous.hasTile);
    setHasFlask(previous.hasFlask);
    setPipetteState(previous.pipetteState);
    setPipetteSelectedVolume(previous.pipetteSelectedVolume);
    setFlaskBaseVolume(previous.flaskBaseVolume);
    setIndicatorType(previous.indicatorType);
    setIndicatorDrops(previous.indicatorDrops);
    setIsFlaskUnderBurette(previous.isFlaskUnderBurette);
    setBuretteDeliveredVolume(previous.buretteDeliveredVolume);
    setBenchMessage({ text: 'Reverted to previous workbench stage.', type: 'info' });
  };

  // Rinse & Wash Conical Flask for a fresh trial without dismantling the mounted burette
  const handleRinseFlask = () => {
    pushSnapshot();
    setFlaskBaseVolume(0.0);
    setIndicatorDrops(0);
    setPipetteState('empty');
    setBuretteDeliveredVolume(0.0);
    setBenchMessage({ 
      text: 'Conical flask emptied, rinsed with distilled water, and dried. Ready for a new titration trial.', 
      type: 'success' 
    });
  };

  // Actions
  const handlePlaceStand = () => {
    pushSnapshot();
    setHasStand(true);
    setBenchMessage({ text: 'Retort stand positioned firmly on the lab workbench.', type: 'info' });
  };

  const handleMountBurette = () => {
    if (!hasStand) {
      setBenchMessage({ text: 'Please place the Retort Stand on the workbench first to clamp the burette.', type: 'warning' });
      return;
    }
    pushSnapshot();
    setHasBuretteMounted(true);
    setBenchMessage({ text: 'Clean 50.0 cm³ burette mounted vertically onto the clamp.', type: 'info' });
  };

  const handleFillBuretteWithAcid = () => {
    if (!hasBuretteMounted) {
      setBenchMessage({ text: 'Mount the burette onto the retort stand before filling it with acid.', type: 'warning' });
      return;
    }
    pushSnapshot();
    setIsBuretteFilledWithAcid(true);
    setBuretteDeliveredVolume(0.0);
    if (onStepComplete) onStepComplete(1);
    setBenchMessage({ text: 'Burette filled with Solution A (0.10M HCl) and zeroed to 0.00 cm³ meniscus. Jet filled.', type: 'success' });
  };

  const handlePlaceTileAndFlask = () => {
    pushSnapshot();
    setHasTile(true);
    setHasFlask(true);
    setBenchMessage({ text: 'Clean white tile and 250 cm³ conical flask positioned on the workbench.', type: 'info' });
  };

  const handleDrawBaseWithPipette = () => {
    pushSnapshot();
    setPipetteState('filled_base');
    setBenchMessage({ text: `Pipetted ${pipetteSelectedVolume.toFixed(1)} cm³ of Solution B (0.10M NaOH). Meniscus leveled to calibration mark.`, type: 'info' });
  };

  const handleDispensePipetteToFlask = () => {
    if (!hasFlask) {
      setBenchMessage({ text: 'Please place the Conical Flask on the workbench before dispensing.', type: 'warning' });
      return;
    }
    if (pipetteState !== 'filled_base') {
      setBenchMessage({ text: 'Draw Solution B (NaOH) into the pipette first before dispensing.', type: 'warning' });
      return;
    }
    pushSnapshot();
    setPipetteState('dispensed');
    setFlaskBaseVolume(pipetteSelectedVolume);
    if (onStepComplete) onStepComplete(2);
    setBenchMessage({ 
      text: `${pipetteSelectedVolume.toFixed(1)} cm³ of Solution B transferred into the conical flask.${pipetteSelectedVolume !== 25.0 ? ' ⚠️ Note: Non-standard base volume chosen!' : ''}`, 
      type: pipetteSelectedVolume === 25.0 ? 'success' : 'warning' 
    });
  };

  const handleAddIndicatorDrop = () => {
    if (flaskBaseVolume <= 0) {
      setBenchMessage({ text: 'Transfer Solution B (NaOH) into the conical flask before adding indicator.', type: 'warning' });
      return;
    }
    pushSnapshot();
    const nextDrops = indicatorDrops + 1;
    setIndicatorDrops(nextDrops);
    if (onStepComplete) onStepComplete(3);

    if (nextDrops > 5) {
      setBenchMessage({ 
        text: `⚠️ Caution: ${nextDrops} drops of indicator added! In KCSE Paper 3, excess indicator (>3-4 drops) shifts the equivalence point and causes a positive titration volume error.`, 
        type: 'warning' 
      });
    } else {
      setBenchMessage({ 
        text: `Added drop ${nextDrops} of ${indicatorType === 'phenolphthalein' ? 'phenolphthalein' : 'methyl orange'}.`, 
        type: 'info' 
      });
    }
  };

  const handleMoveFlaskUnderBurette = () => {
    if (!hasBuretteMounted) {
      setBenchMessage({ text: 'Burette must be mounted on the stand first.', type: 'warning' });
      return;
    }
    pushSnapshot();
    const targetX = standPos.x + 40;
    setTilePos({ x: targetX, y: 440 });
    setFlaskPos({ x: targetX, y: 340 });
    setIsFlaskUnderBurette(true);
    setBenchMessage({ text: 'Conical flask positioned on white tile directly under burette delivery jet.', type: 'info' });
  };

  const handleTitrate = (amount: number) => {
    if (!isBuretteFilledWithAcid) {
      setBenchMessage({ text: 'Fill the burette with Solution A (HCl) before opening the stopcock tap.', type: 'warning' });
      return;
    }
    if (!isFlaskUnderBurette) {
      setBenchMessage({ text: 'Position the conical flask directly under the burette jet tip on the white tile.', type: 'warning' });
      return;
    }

    pushSnapshot();
    setBuretteDeliveredVolume(prev => {
      const next = Math.min(50.0, +(prev + amount).toFixed(2));
      if (onVolumeChange) onVolumeChange(next);
      
      if (next >= actualEquivalencePoint && onStepComplete) {
        onStepComplete(4);
      }
      return next;
    });
  };

  const handleResetAll = () => {
    pushSnapshot();
    setHasStand(false);
    setHasBuretteMounted(false);
    setIsBuretteFilledWithAcid(false);
    setHasTile(false);
    setHasFlask(false);
    setPipetteState('empty');
    setFlaskBaseVolume(0.0);
    setIndicatorDrops(0);
    setIsFlaskUnderBurette(false);
    setBuretteDeliveredVolume(0.0);
    setBenchMessage({ text: 'Workbench cleared. All apparatus returned to storage shelves.', type: 'info' });
  };

  // Color & Physical State Calculation
  const isNeutralized = buretteDeliveredVolume >= actualEquivalencePoint;
  const isApproaching = buretteDeliveredVolume >= (actualEquivalencePoint - 1.20) && !isNeutralized;
  const isOvertitrated = buretteDeliveredVolume > (actualEquivalencePoint + 0.35);

  let flaskSolutionColor = '#f8fafc'; // transparent water
  let appearanceDescription = 'Empty flask';

  if (flaskBaseVolume > 0 && indicatorDrops === 0) {
    flaskSolutionColor = '#e2e8f0'; // alkaline colorless (no indicator)
    appearanceDescription = buretteDeliveredVolume > 0 
      ? 'Clear colourless solution (No indicator added - reaction unmonitored!)' 
      : 'Clear colourless alkaline solution';
  } else if (flaskBaseVolume > 0 && indicatorDrops > 0) {
    if (indicatorType === 'phenolphthalein') {
      if (isNeutralized) {
        flaskSolutionColor = '#f8fafc'; // clear colorless
        appearanceDescription = isOvertitrated 
          ? 'Clear colourless acidic solution (Over-titrated with excess HCl)'
          : 'Permanent colorless solution (Equivalence point attained)';
      } else if (isApproaching) {
        flaskSolutionColor = indicatorDrops > 5 ? '#f472b6' : '#fb7185'; // pale pink
        appearanceDescription = 'Faint transient pink (Discharges on swirling)';
      } else {
        flaskSolutionColor = indicatorDrops > 5 ? '#be185d' : '#e11d48'; // intense or cloudy magenta
        appearanceDescription = indicatorDrops > 5 ? 'Turbid deep magenta (Excess indicator)' : 'Intense pink alkaline solution';
      }
    } else {
      // Methyl Orange
      if (isOvertitrated) {
        flaskSolutionColor = '#dc2626'; // Red in strong acid!
        appearanceDescription = 'Intense red solution (Over-acidified with excess HCl)';
      } else if (isNeutralized) {
        flaskSolutionColor = '#f97316'; // Orange at endpoint!
        appearanceDescription = 'Pale orange solution (Methyl orange endpoint)';
      } else {
        flaskSolutionColor = '#eab308'; // Yellow in alkali
        appearanceDescription = 'Yellow alkaline solution';
      }
    }
  }

  // Realistic Scientific Observation Description
  const getObservationNotice = () => {
    if (flaskBaseVolume === 0) {
      return 'Empty conical flask placed on the workbench.';
    }
    if (indicatorDrops === 0) {
      if (buretteDeliveredVolume > 0) {
        return `⚠️ NO INDICATOR ERROR: Added ${buretteDeliveredVolume.toFixed(2)} cm³ of acid, but no indicator was added. Solution remains clear throughout. In a real lab, you cannot detect the equivalence point without indicator; all marks for titre accuracy will be lost!`;
      }
      return `${flaskBaseVolume.toFixed(1)} cm³ Solution B (NaOH) transferred. Solution is clear alkaline liquid. Remember to add indicator before titrating.`;
    }
    if (indicatorDrops > 5) {
      if (isNeutralized) {
        return `⚠️ EXCESS INDICATOR ERROR: Discharged to colorless at ${buretteDeliveredVolume.toFixed(2)} cm³, but ${indicatorDrops} drops were added. Weak acid indicator consumed +${indicatorAcidOffset.toFixed(2)} cm³ extra titrant, distorting your titre value.`;
      }
      return `⚠️ EXCESS INDICATOR: ${indicatorDrops} drops added. Solution is turbid dark coloration. KNEC practical standard specifies 2-3 drops.`;
    }
    if (flaskBaseVolume !== 25.0) {
      return `⚠️ NON-STANDARD BASE VOLUME: You used ${flaskBaseVolume.toFixed(1)} cm³ instead of 25.0 cm³. End-point was reached at ${buretteDeliveredVolume.toFixed(2)} cm³, which differs from the standard 24.50 cm³ expected by KNEC examiners.`;
    }
    if (isOvertitrated) {
      const overBy = +(buretteDeliveredVolume - actualEquivalencePoint).toFixed(2);
      return `⚠️ OVER-TITRATED BY ${overBy} cm³! Final burette reading is ${buretteDeliveredVolume.toFixed(2)} cm³ (past the 24.50 cm³ neutral mark). In KCSE Paper 3, recording this value will result in a lower calculated acid concentration and inconsistent titre marks.`;
    }
    if (isNeutralized) {
      return `✨ PERFECT KCSE EQUIVALENCE POINT! Pink coloration permanently discharged to crystal clear at exactly ${buretteDeliveredVolume.toFixed(2)} cm³. Consistent with KNEC ±0.20 cm³ accuracy.`;
    }
    if (isApproaching) {
      return `Approaching end-point (${buretteDeliveredVolume.toFixed(2)} cm³). Pink colour flashes and fades slowly on swirling. Use micro-drops (+0.05 cm³)!`;
    }
    return `Alkaline solution (${flaskBaseVolume} cm³ NaOH + ${indicatorDrops} drops ${indicatorType}). Intense pink coloration; ready for titration.`;
  };

  // Live telemetry broadcast to parent LabWorkspace
  useEffect(() => {
    if (onTitrationUpdate) {
      const isInaccurate = isOvertitrated || indicatorDrops === 0 || indicatorDrops > 5 || flaskBaseVolume !== 25.0;
      let reason: string | undefined;
      if (indicatorDrops === 0 && buretteDeliveredVolume > 0) reason = 'Titration performed without indicator';
      else if (isOvertitrated) reason = `Over-titrated by +${(buretteDeliveredVolume - actualEquivalencePoint).toFixed(2)} cm³`;
      else if (indicatorDrops > 5) reason = `Excess indicator added (${indicatorDrops} drops)`;
      else if (flaskBaseVolume !== 25.0 && flaskBaseVolume > 0) reason = `Non-standard base volume (${flaskBaseVolume.toFixed(1)} cm³)`;

      onTitrationUpdate({
        titre: buretteDeliveredVolume,
        initialReading: 0.00,
        finalReading: buretteDeliveredVolume,
        indicator: indicatorDrops === 0 ? 'none' : indicatorType,
        indicatorDrops,
        baseVolume: flaskBaseVolume,
        solutionAppearance: appearanceDescription,
        isNeutralized,
        isOvertitrated,
        isInaccurate,
        inaccuracyReason: reason,
        scientificObservation: getObservationNotice()
      });
    }
  }, [
    buretteDeliveredVolume,
    flaskBaseVolume,
    indicatorDrops,
    indicatorType,
    isNeutralized,
    isOvertitrated
  ]);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Beaker className="w-4 h-4 text-emerald-400" />
            <span>Volumetric analysis workbench • Chemistry practical</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Assemble the apparatus on the workbench step-by-step. Inaccurate volumes, excess indicator, or over-titration produce realistic laboratory consequences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reverse Step / Undo Previous Action Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Reverse previous action / step back"
          >
            <History className="w-3.5 h-3.5" />
            <span>Step Back (Undo)</span>
          </button>

          {/* Rinse Flask Button (Realistic lab feature) */}
          <button
            onClick={handleRinseFlask}
            disabled={flaskBaseVolume === 0 && buretteDeliveredVolume === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Empty and rinse conical flask with distilled water for a fresh trial"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rinse Flask (New Trial)</span>
          </button>

          <button
            onClick={() => {
              // Quick auto-assemble preset
              pushSnapshot();
              setHasStand(true);
              setHasBuretteMounted(true);
              setIsBuretteFilledWithAcid(true);
              setHasTile(true);
              setHasFlask(true);
              setPipetteSelectedVolume(25.0);
              setPipetteState('dispensed');
              setFlaskBaseVolume(25.0);
              setIndicatorType('phenolphthalein');
              setIndicatorDrops(3);
              setIsFlaskUnderBurette(true);
              if (onStepComplete) {
                onStepComplete(1);
                onStepComplete(2);
                onStepComplete(3);
              }
              setBenchMessage({ text: 'Preset standard KCSE setup loaded. Ready to titrate.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-bold transition"
            title="Pre-mount apparatus for fast testing"
          >
            <span>Preset Setup</span>
          </button>

          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-750 text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Bench</span>
          </button>
        </div>
      </div>

      {/* In-bench Notification / Warning Banner */}
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

      {/* Main Grid: Apparatus Shelf + Lab Bench Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Tray / Actions Shelf (Col 4) */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Lab Steps & Actions
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">Step-by-Step</span>
          </div>

          <div className="space-y-2 text-xs">
            
            {/* Step 1: Stand & Burette */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750 space-y-2">
              <span className="font-bold text-amber-400 block">1. Burette Setup & Filling</span>
              
              {!hasStand ? (
                <button
                  onClick={handlePlaceStand}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-between"
                >
                  <span>Place Retort Stand on Bench</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
              ) : !hasBuretteMounted ? (
                <button
                  onClick={handleMountBurette}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center justify-between"
                >
                  <span>Mount Burette onto Clamp</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
              ) : !isBuretteFilledWithAcid ? (
                <button
                  onClick={handleFillBuretteWithAcid}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-between shadow"
                >
                  <span>Pour Solution A (HCl) to 0.00 cm³</span>
                  <Droplet className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-emerald-400 font-bold flex items-center justify-between py-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Burette Mounted & Charged</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    50.0 cm³
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Pipette Base */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-400 block">2. Transfer Solution B (0.10M NaOH)</span>
                {pipetteState === 'empty' && (
                  <select
                    value={pipetteSelectedVolume}
                    onChange={e => setPipetteSelectedVolume(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-white text-[10px] rounded px-1.5 py-0.5"
                    title="Volume selection (KNEC standard is 25.0 cm³)"
                  >
                    <option value={25.0}>25.0 cm³ (Standard)</option>
                    <option value={15.0}>15.0 cm³ (Inaccurate)</option>
                    <option value={35.0}>35.0 cm³ (Inaccurate)</option>
                  </select>
                )}
              </div>
              
              {!hasFlask ? (
                <button
                  onClick={handlePlaceTileAndFlask}
                  className="w-full py-2 px-3 rounded-lg bg-slate-750 hover:bg-slate-700 text-white font-bold transition flex items-center justify-between"
                >
                  <span>Place White Tile & Conical Flask</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
              ) : pipetteState === 'empty' ? (
                <button
                  onClick={handleDrawBaseWithPipette}
                  className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center justify-between"
                >
                  <span>Draw {pipetteSelectedVolume.toFixed(1)} cm³ NaOH into Pipette</span>
                  <PlusCircle className="w-4 h-4" />
                </button>
              ) : pipetteState === 'filled_base' ? (
                <button
                  onClick={handleDispensePipetteToFlask}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-between shadow"
                >
                  <span>Dispense {pipetteSelectedVolume.toFixed(1)} cm³ into Conical Flask</span>
                  <Droplet className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-emerald-400 font-bold flex items-center justify-between py-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{flaskBaseVolume.toFixed(1)} cm³ NaOH in Conical Flask</span>
                  </div>
                  {flaskBaseVolume !== 25.0 && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded">Wrong Vol!</span>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Indicator Selection & Addition */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 block">3. Add Indicator</span>
                <select
                  value={indicatorType}
                  onChange={e => setIndicatorType(e.target.value as any)}
                  disabled={indicatorDrops > 0}
                  className="bg-slate-950 border border-slate-700 text-white text-[10px] rounded px-1.5 py-0.5"
                >
                  <option value="phenolphthalein">Phenolphthalein (Pink→Clear)</option>
                  <option value="methyl_orange">Methyl Orange (Yellow→Orange)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddIndicatorDrop}
                  disabled={flaskBaseVolume <= 0}
                  className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-40 flex items-center justify-between shadow"
                >
                  <span>+1 Drop ({indicatorDrops} added)</span>
                  <Droplet className="w-4 h-4" />
                </button>
              </div>

              {indicatorDrops > 0 && (
                <div className="text-[11px] space-y-0.5">
                  <span className={`font-semibold block ${indicatorDrops > 5 ? 'text-amber-400' : 'text-pink-400'}`}>
                    {indicatorType === 'phenolphthalein'
                      ? (indicatorDrops > 5 ? '⚠️ Turbid dark magenta (Excess indicator error!)' : 'Intense pink developed in base')
                      : (indicatorDrops > 5 ? '⚠️ Deep yellow-orange (Excess indicator error!)' : 'Bright yellow color in base')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Recommended: 2 to 3 drops. More drops distort titration endpoint.
                  </span>
                </div>
              )}
            </div>

            {/* Step 4: Titration Stopcock Tap Controls */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750 space-y-2">
              <span className="font-bold text-cyan-400 block">4. Titration Tap & Swirling</span>
              
              {!isFlaskUnderBurette ? (
                <button
                  onClick={handleMoveFlaskUnderBurette}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
                >
                  Position Flask Under Clamped Burette
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTitrate(0.05)}
                      className="py-1.5 px-2 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                      title="Micro-drop delivery (±0.05 cm³)"
                    >
                      <Droplet className="w-3 h-3 text-cyan-300" />
                      <span>+0.05 cm³ (Micro)</span>
                    </button>

                    <button
                      onClick={() => handleTitrate(0.10)}
                      className="py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                      title="Standard droplet (0.10 cm³)"
                    >
                      <Droplet className="w-3 h-3" />
                      <span>+0.10 cm³ (Drop)</span>
                    </button>

                    <button
                      onClick={() => handleTitrate(0.50)}
                      className="py-1.5 px-2 rounded-lg bg-cyan-700 hover:bg-cyan-650 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                    >
                      <span>+0.50 cm³ (Half)</span>
                    </button>

                    <button
                      onClick={() => handleTitrate(1.00)}
                      className="py-1.5 px-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                    >
                      <span>+1.00 cm³ (Stream)</span>
                    </button>
                  </div>

                  <button
                    onMouseDown={() => setIsSwirling(true)}
                    onMouseUp={() => setIsSwirling(false)}
                    className="w-full py-2 rounded-lg bg-slate-750 hover:bg-slate-700 text-white font-semibold transition active:bg-slate-650 flex items-center justify-center gap-1.5"
                  >
                    <span>Hold to Swirl Conical Flask</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Canvas: The Real Laboratory Bench (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={benchRef}
            className="relative w-full h-[520px] bg-slate-950/95 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 select-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Lab Bench Header */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none flex items-center space-x-2">
              <span>VOLUMETRIC ANALYSIS BENCH • KCSE CHEMISTRY PRACTICAL</span>
              <span className="text-emerald-400 font-bold">• (All apparatus are movable via drag & drop)</span>
            </div>

            {/* Empty Workbench Guidance if nothing placed */}
            {!hasStand && (
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="text-center p-8 max-w-sm space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl pointer-events-auto">
                  <Beaker className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-white">Empty Laboratory Workbench</h4>
                  <p className="text-xs text-slate-400">
                    Click "Place Retort Stand on Bench" or use Preset Setup. You can freely drag and position all apparatus on the workbench!
                  </p>
                </div>
              </div>
            )}

            {/* 1. RETORT STAND & CLAMP (Movable) */}
            {hasStand && (
              <div 
                onMouseDown={e => handleStartDrag(e, 'stand')}
                onTouchStart={e => handleStartDrag(e, 'stand')}
                style={{
                  left: `${standPos.x}px`,
                  top: `${standPos.y}px`
                }}
                className={`absolute z-20 cursor-grab active:cursor-grabbing group ${
                  draggingItem === 'stand' ? 'ring-2 ring-amber-400/50 scale-102 z-40' : ''
                }`}
                title="Click and drag Retort Stand to reposition"
              >
                {/* Drag handle tag */}
                <div className="text-[8px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 flex items-center gap-1 mb-1 transition">
                  <Move className="w-2.5 h-2.5 text-amber-400" />
                  <span>Stand</span>
                </div>

                <div className="flex flex-col items-center">
                  {/* Vertical Rod */}
                  <div className="w-3.5 h-[410px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 shadow-xl rounded-t relative">
                    {/* Clamp Bosshead */}
                    {hasBuretteMounted && (
                      <div className="absolute top-24 -left-3 w-10 h-7 bg-slate-800 border border-slate-600 rounded shadow-md flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        {/* Clamp arm extending to burette */}
                        <div className="absolute left-9 top-2 w-10 h-3 bg-slate-700 border-t border-b border-slate-500" />
                      </div>
                    )}
                  </div>
                  {/* Heavy Cast Iron Base */}
                  <div className="w-48 h-5 bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 rounded-lg shadow-2xl" />
                </div>
              </div>
            )}

            {/* 2. BURETTE (Mounted at standPos.x + 40px) */}
            {hasBuretteMounted && (
              <div 
                style={{
                  left: `${standPos.x + 40}px`,
                  top: `${standPos.y + 45}px`
                }}
                className="absolute z-25 flex flex-col items-center pointer-events-none"
              >
                {/* Burette Glass Tube */}
                <div className="w-9 h-[290px] bg-cyan-100/10 border-x-2 border-cyan-400/40 relative shadow-inner overflow-hidden rounded-t pointer-events-auto">
                  
                  {/* Acid Solution Level inside Burette */}
                  {isBuretteFilledWithAcid && (
                    <div 
                      className="absolute bottom-0 w-full bg-cyan-400/25 border-t-2 border-cyan-300 transition-all duration-300"
                      style={{
                        height: `${Math.max(0, 100 - (buretteDeliveredVolume / 50.0) * 100)}%`
                      }}
                    >
                      <div className="w-full h-2 rounded-b-full bg-cyan-200/50" />
                    </div>
                  )}

                  {/* Millimeter Graduation Markings */}
                  <div className="absolute inset-0 flex flex-col justify-between p-1 pointer-events-none select-none">
                    {[0, 10, 20, 30, 40, 50].map((val) => (
                      <div key={val} className="flex items-center justify-between w-full">
                        <span className="text-[8px] font-mono text-cyan-300 font-bold leading-none">{val}</span>
                        <div className="w-2.5 h-[1px] bg-cyan-300/70" />
                      </div>
                    ))}
                  </div>

                  {/* Red Meniscus Reading Line */}
                  {isBuretteFilledWithAcid && (
                    <div 
                      className="absolute w-full border-b border-rose-400/80 pointer-events-none transition-all duration-300 flex items-center justify-end pr-0.5"
                      style={{
                        top: `${(buretteDeliveredVolume / 50.0) * 100}%`
                      }}
                    >
                      <span className="text-[8px] font-mono font-bold text-rose-300 bg-slate-950/80 px-0.5 rounded -mt-2">
                        {buretteDeliveredVolume.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stopcock Valve & Tap */}
                <div className="w-11 h-6 bg-slate-800 border border-slate-600 rounded flex items-center justify-center my-0.5 shadow relative pointer-events-auto">
                  <div className="w-6 h-2 bg-amber-500 rounded" />
                  <span className="text-[7px] font-mono text-slate-300 absolute">TAP</span>
                </div>

                {/* Burette Jet Tip */}
                <div className="w-2.5 h-7 bg-cyan-100/20 border-x border-cyan-400/40 rounded-b relative pointer-events-auto">
                  {isBuretteFilledWithAcid && isFlaskUnderBurette && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mx-auto animate-ping mt-4" />
                  )}
                </div>
              </div>
            )}

            {/* 3. WHITE TILE (Movable) */}
            {hasTile && (
              <div 
                onMouseDown={e => handleStartDrag(e, 'tile')}
                onTouchStart={e => handleStartDrag(e, 'tile')}
                style={{
                  left: `${tilePos.x}px`,
                  top: `${tilePos.y}px`
                }}
                className={`absolute z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing group ${
                  draggingItem === 'tile' ? 'ring-2 ring-cyan-400 shadow-2xl scale-105 z-30' : ''
                }`}
                title="Drag White Tile to position underneath conical flask"
              >
                <div className="text-[8px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 flex items-center justify-center gap-1 mb-0.5">
                  <Move className="w-2.5 h-2.5 text-slate-400" />
                  <span>White Tile</span>
                </div>
                <div className="w-36 h-4 bg-white/95 border-2 border-slate-300 rounded shadow-xl flex items-center justify-center">
                  <span className="text-[7px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    WHITE TILE
                  </span>
                </div>
              </div>
            )}

            {/* 4. CONICAL FLASK (Movable & Proximity Snapping) */}
            {hasFlask && (
              <div 
                onMouseDown={e => handleStartDrag(e, 'flask')}
                onTouchStart={e => handleStartDrag(e, 'flask')}
                style={{
                  left: `${flaskPos.x}px`,
                  top: `${flaskPos.y}px`
                }}
                className={`absolute z-30 -translate-x-1/2 cursor-grab active:cursor-grabbing group ${
                  draggingItem === 'flask' ? 'ring-2 ring-emerald-400 shadow-2xl scale-105 z-40' : ''
                } ${isSwirling ? 'animate-bounce' : ''}`}
                title="Click and drag Conical Flask! Position near burette tip to dock for titration."
              >
                {/* Drag handle tooltip */}
                <div className="text-[8px] font-mono text-emerald-400 opacity-80 group-hover:opacity-100 flex items-center justify-center gap-1 mb-1 bg-slate-900/80 px-1 rounded">
                  <Move className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Drag Flask {isFlaskUnderBurette ? '(Docked ✓)' : '(Free)'}</span>
                </div>

                {/* Conical Flask SVG Graphic */}
                <div className="relative w-32 h-36 flex flex-col items-center">
                  {/* Flask Neck */}
                  <div className="w-8 h-10 border-x-2 border-t-2 border-slate-400/60 bg-white/5 rounded-t relative" />

                  {/* Flask Body Triangle */}
                  <div className="relative w-28 h-24 overflow-hidden">
                    <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-lg">
                      <polygon 
                        points="35,0 65,0 98,78 2,78" 
                        fill="rgba(255, 255, 255, 0.05)" 
                        stroke="rgba(148, 163, 184, 0.6)" 
                        strokeWidth="2.5" 
                      />

                      {/* Liquid inside flask */}
                      {flaskBaseVolume > 0 && (
                        <polygon 
                          points="30,25 70,25 96,76 4,76" 
                          fill={flaskSolutionColor}
                          opacity={isApproaching ? 0.75 : 0.9}
                          className="transition-colors duration-500"
                        />
                      )}
                    </svg>
                  </div>

                  {/* Observation label attached to flask */}
                  {flaskBaseVolume > 0 && (
                    <div className="absolute -bottom-6 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white whitespace-nowrap shadow-lg">
                      {appearanceDescription}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE DIGITAL BURETTE GAUGE (Top Right Overlay) */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl shadow-xl space-y-1.5 min-w-[210px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Live Meniscus Telemetry</span>
                <span className={`w-2 h-2 rounded-full ${isNeutralized ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Delivered Titre (V):</span>
                <span className="text-lg font-mono font-black text-cyan-300">
                  {buretteDeliveredVolume.toFixed(2)} <span className="text-xs font-normal text-slate-400">cm³</span>
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800 pt-1">
                <span>Flask Contents:</span>
                <span className="text-white font-semibold">{flaskBaseVolume.toFixed(1)} cm³ Base</span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Indicator:</span>
                <span className={indicatorDrops > 5 ? 'text-amber-400 font-semibold' : 'text-slate-200 font-semibold'}>
                  {indicatorDrops === 0 ? 'None (Missing)' : `${indicatorDrops} drops ${indicatorType === 'phenolphthalein' ? 'Phenol.' : 'Methyl O.'}`}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${
                  isOvertitrated 
                    ? 'text-rose-400' 
                    : isNeutralized 
                    ? 'text-emerald-400' 
                    : 'text-amber-400'
                }`}>
                  {isOvertitrated ? 'Overtitrated' : isNeutralized ? 'Neutralized' : 'Alkaline'}
                </span>
              </div>
            </div>

          </div>

          {/* OBSERVATIONS & SCIENTIFIC FEEDBACK CALLOUT (Section 3.1.3) */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors shadow-lg ${
            isOvertitrated
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : indicatorDrops > 5
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : isNeutralized
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-850 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                {isOvertitrated ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Inaccurate Observation: Titration Over-Shot!</span>
                  </>
                ) : isNeutralized ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accurate Observation: KNEC Concordant Titre</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Laboratory Observation & Inferences</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">KCSE Paper 3 Criteria</span>
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
