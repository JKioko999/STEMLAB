import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Flame, 
  RotateCcw, 
  CheckCircle2, 
  Thermometer, 
  Clock,
  PlusCircle,
  HelpCircle,
  History,
  AlertTriangle,
  Info,
  RefreshCw,
  Move
} from 'lucide-react';

export interface FoodTestLiveTelemetry {
  tubes: Array<{
    id: string;
    name: string;
    sampleVolumeMl: number;
    reagent: string | null;
    reagentVolumeMl: number;
    isHeated: boolean;
    heatedSeconds: number;
    liquidColor: string;
    observationText: string;
    hasError: boolean;
    errorReason?: string;
  }>;
  selectedTubeId: string;
  currentObservation: string;
}

interface InteractiveFoodTestWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onFoodTestUpdate?: (telemetry: FoodTestLiveTelemetry) => void;
}

interface FoodTube {
  id: string;
  name: string;
  label: string;
  sampleVolumeMl: number;
  reagentName: 'benedicts' | 'biuret' | 'iodine' | null;
  reagentVolumeMl: number;
  isInWaterBath: boolean;
  heatedSeconds: number;
  liquidColor: string;
  observationLabel: string | null;
  isSpoiled: boolean;
  spoilageReason?: string;
  x: number;
  y: number;
}

export const InteractiveFoodTestWorkbench: React.FC<InteractiveFoodTestWorkbenchProps> = ({
  onStepComplete,
  onFoodTestUpdate
}) => {
  const [tubes, setTubes] = useState<FoodTube[]>([
    {
      id: 'tube-1',
      name: 'Tube 1',
      label: 'Benedict\'s Test',
      sampleVolumeMl: 0,
      reagentName: null,
      reagentVolumeMl: 0,
      isInWaterBath: false,
      heatedSeconds: 0,
      liquidColor: 'transparent',
      observationLabel: null,
      isSpoiled: false,
      x: 70,
      y: 120
    },
    {
      id: 'tube-2',
      name: 'Tube 2',
      label: 'Biuret Test',
      sampleVolumeMl: 0,
      reagentName: null,
      reagentVolumeMl: 0,
      isInWaterBath: false,
      heatedSeconds: 0,
      liquidColor: 'transparent',
      observationLabel: null,
      isSpoiled: false,
      x: 160,
      y: 120
    },
    {
      id: 'tube-3',
      name: 'Tube 3',
      label: 'Iodine Test',
      sampleVolumeMl: 0,
      reagentName: null,
      reagentVolumeMl: 0,
      isInWaterBath: false,
      heatedSeconds: 0,
      liquidColor: 'transparent',
      observationLabel: null,
      isSpoiled: false,
      x: 250,
      y: 120
    }
  ]);

  const [selectedTubeId, setSelectedTubeId] = useState<string>('tube-1');
  const [sampleDoseMl, setSampleDoseMl] = useState<number>(2.0);

  // Dragging state
  const [draggingTubeId, setDraggingTubeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  // Apparatus movable positions (Rack & Water Bath)
  const [rackPos, setRackPos] = useState<{ x: number; y: number }>({ x: 30, y: 350 });
  const [bathPos, setBathPos] = useState<{ x: number; y: number }>({ x: 420, y: 230 });
  const [draggingApparatus, setDraggingApparatus] = useState<'rack' | 'bath' | null>(null);
  const [apparatusDragOffset, setApparatusDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleStartApparatusDrag = (e: React.MouseEvent | React.TouchEvent, item: 'rack' | 'bath') => {
    if ((e.target as HTMLElement).closest('button')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();
    setDraggingApparatus(item);
    const initialPos = item === 'rack' ? rackPos : bathPos;
    setApparatusDragOffset({
      x: (clientX - benchRect.left) - initialPos.x,
      y: (clientY - benchRect.top) - initialPos.y
    });
  };

  // In-bench notification banner
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<FoodTube[][]>([]);

  const pushSnapshot = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(tubes))]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setTubes(previous);
    setBenchMessage({ text: 'Reverted to previous test tube stage.', type: 'info' });
  };

  const selectedTube = tubes.find(t => t.id === selectedTubeId) || tubes[0];

  const updateTube = (tubeId: string, updater: (prev: FoodTube) => FoodTube) => {
    pushSnapshot();
    setTubes(prev => prev.map(t => (t.id === tubeId ? updater(t) : t)));
  };

  // Dragging Handlers
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, tube: FoodTube) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();

    setSelectedTubeId(tube.id);
    setDraggingTubeId(tube.id);
    setDragOffset({
      x: (clientX - benchRect.left) - tube.x,
      y: (clientY - benchRect.top) - tube.y
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!benchRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const benchRect = benchRef.current.getBoundingClientRect();

      const mouseX = clientX - benchRect.left;
      const mouseY = clientY - benchRect.top;

      if (draggingApparatus) {
        const newX = Math.round(Math.max(10, Math.min(benchRect.width - 240, mouseX - apparatusDragOffset.x)));
        const newY = Math.round(Math.max(10, Math.min(benchRect.height - 200, mouseY - apparatusDragOffset.y)));

        if (draggingApparatus === 'rack') {
          const deltaX = newX - rackPos.x;
          const deltaY = newY - rackPos.y;
          setRackPos({ x: newX, y: newY });
          // Move tubes that are in the rack along with the rack
          setTubes(prev => prev.map(t => {
            if (!t.isInWaterBath) {
              return { ...t, x: t.x + deltaX, y: t.y + deltaY };
            }
            return t;
          }));
        } else if (draggingApparatus === 'bath') {
          const deltaX = newX - bathPos.x;
          const deltaY = newY - bathPos.y;
          setBathPos({ x: newX, y: newY });
          // Move tubes that are in water bath along with it
          setTubes(prev => prev.map(t => {
            if (t.isInWaterBath) {
              return { ...t, x: t.x + deltaX, y: t.y + deltaY };
            }
            return t;
          }));
        }
        return;
      }

      if (draggingTubeId) {
        const newX = Math.round(Math.max(10, Math.min(benchRect.width - 70, mouseX - dragOffset.x)));
        const newY = Math.round(Math.max(10, Math.min(benchRect.height - 220, mouseY - dragOffset.y)));

        // Proximity detection to water bath position
        const inWaterBathZone = Math.abs(newX - (bathPos.x + 40)) < 90 && Math.abs(newY - (bathPos.y - 30)) < 110;

        setTubes(prev => prev.map(t => {
          if (t.id === draggingTubeId) {
            return {
              ...t,
              x: newX,
              y: newY,
              isInWaterBath: inWaterBathZone
            };
          }
          return t;
        }));
      }
    };

    const handleEnd = () => {
      if (draggingApparatus) {
        setDraggingApparatus(null);
      }
      if (draggingTubeId) {
        const targetTube = tubes.find(t => t.id === draggingTubeId);
        if (targetTube && targetTube.isInWaterBath) {
          handleHeatInWaterBath(30, draggingTubeId);
        }
        setDraggingTubeId(null);
      }
    };

    if (draggingTubeId || draggingApparatus) {
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
  }, [draggingTubeId, draggingApparatus, dragOffset, apparatusDragOffset, rackPos, bathPos, tubes]);

  // ACTION 1: Dispense Solution X (Food Extract)
  const handleAddSampleX = (volume: number) => {
    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(5, prev.sampleVolumeMl + volume);
      return {
        ...prev,
        sampleVolumeMl: newVol,
        liquidColor: 'rgba(254, 243, 199, 0.6)',
        observationLabel: `Contains ${newVol.toFixed(1)} cm³ pale milky Food Extract X`
      };
    });
    setBenchMessage({ text: `Dispensed ${volume.toFixed(1)} cm³ of Solution X into ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 2: Add Chosen Reagent to active tube
  const handleAddSpecificReagent = (reagentType: 'benedicts' | 'biuret' | 'iodine') => {
    if (selectedTube.sampleVolumeMl === 0) {
      setBenchMessage({ text: `The ${selectedTube.name} is completely empty! Dispense 2.0 cm³ of Solution X into the tube first.`, type: 'warning' });
      return;
    }

    if (reagentType === 'benedicts') {
      updateTube(selectedTube.id, prev => ({
        ...prev,
        reagentName: 'benedicts',
        reagentVolumeMl: 2.0,
        liquidColor: '#3b82f6',
        observationLabel: 'Blue solution (Unheated Benedict\'s mixture)'
      }));
      setBenchMessage({ text: `Added 2.0 cm³ of Benedict's solution to ${selectedTube.name}. Move into boiling water bath to heat!`, type: 'info' });
    } else if (reagentType === 'biuret') {
      updateTube(selectedTube.id, prev => ({
        ...prev,
        reagentName: 'biuret',
        reagentVolumeMl: 1.0,
        liquidColor: '#9333ea',
        observationLabel: 'Violet/Purple coloration formed immediately without heating (Proteins present)'
      }));
      if (onStepComplete) onStepComplete(2);
      setBenchMessage({ text: `Added Biuret reagent to ${selectedTube.name}. Immediate violet coloration confirms proteins (peptide bonds). DO NOT HEAT!`, type: 'success' });
    } else if (reagentType === 'iodine') {
      updateTube(selectedTube.id, prev => ({
        ...prev,
        reagentName: 'iodine',
        reagentVolumeMl: 0.3,
        liquidColor: '#b45309',
        observationLabel: 'Yellow-brown colour of iodine solution persisted (Starch absent)'
      }));
      if (onStepComplete) onStepComplete(3);
      setBenchMessage({ text: `Added 3 drops of Iodine solution to ${selectedTube.name}. Yellow-brown color persisted; starch is absent.`, type: 'info' });
    }
  };

  // ACTION 3: Heat active tube in water bath
  const handleHeatInWaterBath = (durationSeconds: number, targetTubeId = selectedTubeId) => {
    const tubeToHeat = tubes.find(t => t.id === targetTubeId) || selectedTube;
    if (tubeToHeat.sampleVolumeMl === 0) {
      setBenchMessage({ text: 'Cannot heat an empty test tube!', type: 'warning' });
      return;
    }

    updateTube(targetTubeId, prev => {
      const totalTime = prev.heatedSeconds + durationSeconds;

      // Move into water bath visually if not already there
      const bathX = 420;
      const bathY = 130;

      // 1. Inaccurate Action: Boiling Biuret test!
      if (prev.reagentName === 'biuret') {
        return {
          ...prev,
          x: bathX,
          y: bathY,
          isInWaterBath: true,
          heatedSeconds: totalTime,
          isSpoiled: true,
          spoilageReason: 'Biuret test boiled (Proteins denatured and coagulated)',
          liquidColor: '#451a03',
          observationLabel: '⚠️ INCORRECT TECHNIQUE: Biuret test must NEVER be boiled! High temperature coagulated proteins into a dark curdled brown mess.'
        };
      }

      // 2. Boiling sample with NO reagent:
      if (!prev.reagentName) {
        return {
          ...prev,
          x: bathX,
          y: bathY,
          isInWaterBath: true,
          heatedSeconds: totalTime,
          liquidColor: 'rgba(254, 243, 199, 0.8)',
          observationLabel: 'Sample boiled without reagent. Water vapor evolved, but solution remained milky white without color change.'
        };
      }

      // 3. Boiling Iodine test:
      if (prev.reagentName === 'iodine') {
        return {
          ...prev,
          x: bathX,
          y: bathY,
          isInWaterBath: true,
          heatedSeconds: totalTime,
          liquidColor: '#78350f',
          observationLabel: '⚠️ Iodine test heated. Iodine vapor evolved; color faded to pale yellow.'
        };
      }

      // 4. Boiling Benedict's test:
      if (prev.reagentName === 'benedicts') {
        if (totalTime < 30) {
          return {
            ...prev,
            x: bathX,
            y: bathY,
            isInWaterBath: true,
            heatedSeconds: totalTime,
            liquidColor: '#10b981',
            observationLabel: '⚠️ INSUFFICIENT BOILING: Heated for only 20 seconds. Solution turned green/yellow-green but failed to form the characteristic brick-red precipitate.'
          };
        } else if (totalTime < 60) {
          return {
            ...prev,
            x: bathX,
            y: bathY,
            isInWaterBath: true,
            heatedSeconds: totalTime,
            liquidColor: '#f97316',
            observationLabel: 'Orange colouration with slight suspension (Developing precipitate; boil for full 60-90 seconds).'
          };
        } else {
          return {
            ...prev,
            x: bathX,
            y: bathY,
            isInWaterBath: true,
            heatedSeconds: totalTime,
            liquidColor: '#c2410c',
            observationLabel: '✨ Dense brick-red precipitate formed upon boiling (Reducing sugars present!)'
          };
        }
      }

      return { ...prev, x: bathX, y: bathY, isInWaterBath: true };
    });

    if (tubeToHeat.reagentName === 'benedicts' && durationSeconds >= 45 && onStepComplete) {
      onStepComplete(1);
    }

    if (tubeToHeat.reagentName === 'biuret') {
      setBenchMessage({ 
        text: '⚠️ WRONG LABORATORY TECHNIQUE: You boiled the Biuret test! In KCSE Biology, Biuret must never be heated; boiling denatures proteins and ruins the test.', 
        type: 'error' 
      });
    } else {
      setBenchMessage({ text: `Heated ${tubeToHeat.name} in boiling water bath (+${durationSeconds}s).`, type: 'info' });
    }
  };

  // Move tube back to rack
  const handleReturnToRack = (tubeId: string) => {
    pushSnapshot();
    const defaultX = tubeId === 'tube-1' ? 70 : tubeId === 'tube-2' ? 160 : 250;
    updateTube(tubeId, prev => ({
      ...prev,
      x: defaultX,
      y: 120,
      isInWaterBath: false
    }));
    setBenchMessage({ text: `Returned ${tubeId} to wooden test tube rack.`, type: 'info' });
  };

  // Wash / Rinse active tube
  const handleClearSelectedTube = () => {
    pushSnapshot();
    const defaultX = selectedTubeId === 'tube-1' ? 70 : selectedTubeId === 'tube-2' ? 160 : 250;
    updateTube(selectedTubeId, prev => ({
      ...prev,
      sampleVolumeMl: 0,
      reagentName: null,
      reagentVolumeMl: 0,
      isInWaterBath: false,
      heatedSeconds: 0,
      liquidColor: 'transparent',
      observationLabel: null,
      isSpoiled: false,
      spoilageReason: undefined,
      x: defaultX,
      y: 120
    }));
    setBenchMessage({ text: `${selectedTube.name} emptied, washed with distilled water, and returned to rack.`, type: 'success' });
  };

  const handleReset = () => {
    pushSnapshot();
    setTubes([
      { id: 'tube-1', name: 'Tube 1', label: 'Benedict\'s Test', sampleVolumeMl: 0, reagentName: null, reagentVolumeMl: 0, isInWaterBath: false, heatedSeconds: 0, liquidColor: 'transparent', observationLabel: null, isSpoiled: false, x: 70, y: 120 },
      { id: 'tube-2', name: 'Tube 2', label: 'Biuret Test', sampleVolumeMl: 0, reagentName: null, reagentVolumeMl: 0, isInWaterBath: false, heatedSeconds: 0, liquidColor: 'transparent', observationLabel: null, isSpoiled: false, x: 160, y: 120 },
      { id: 'tube-3', name: 'Tube 3', label: 'Iodine Test', sampleVolumeMl: 0, reagentName: null, reagentVolumeMl: 0, isInWaterBath: false, heatedSeconds: 0, liquidColor: 'transparent', observationLabel: null, isSpoiled: false, x: 250, y: 120 }
    ]);
    setBenchMessage({ text: 'All test tubes reset to clean and returned to wooden rack.', type: 'info' });
  };

  // Broadcast telemetry
  useEffect(() => {
    if (onFoodTestUpdate) {
      const summaryList = tubes.map(t => ({
        id: t.id,
        name: t.name,
        sampleVolumeMl: t.sampleVolumeMl,
        reagent: t.reagentName,
        reagentVolumeMl: t.reagentVolumeMl,
        isHeated: t.isInWaterBath,
        heatedSeconds: t.heatedSeconds,
        liquidColor: t.liquidColor,
        observationText: t.observationLabel || (t.sampleVolumeMl > 0 ? 'Food extract unreacted' : 'Empty tube'),
        hasError: t.isSpoiled,
        errorReason: t.spoilageReason
      }));

      onFoodTestUpdate({
        tubes: summaryList,
        selectedTubeId,
        currentObservation: selectedTube.observationLabel || 'Observation pending laboratory action.'
      });
    }
  }, [tubes, selectedTubeId]);

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Biochemical food tests workbench • Biology practical</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Tubes are <strong>movable via drag & drop</strong>. Drag any tube into the boiling water bath beaker to heat, or drag it back onto the wooden rack to inspect.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Back / Undo Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Undo previous step"
          >
            <History className="w-3.5 h-3.5" />
            <span>Step Back (Undo)</span>
          </button>

          {/* Rinse Current Tube Button */}
          <button
            onClick={handleClearSelectedTube}
            disabled={selectedTube.sampleVolumeMl === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Empty and wash active test tube"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rinse Tube</span>
          </button>

          <button
            onClick={() => {
              pushSnapshot();
              setTubes([
                { id: 'tube-1', name: 'Tube 1', label: 'Benedict\'s Test', sampleVolumeMl: 2.0, reagentName: 'benedicts', reagentVolumeMl: 2.0, isInWaterBath: true, heatedSeconds: 90, liquidColor: '#c2410c', observationLabel: 'Brick-red precipitate formed upon boiling (Reducing sugars present)', isSpoiled: false, x: 420, y: 130 },
                { id: 'tube-2', name: 'Tube 2', label: 'Biuret Test', sampleVolumeMl: 2.0, reagentName: 'biuret', reagentVolumeMl: 1.0, isInWaterBath: false, heatedSeconds: 0, liquidColor: '#9333ea', observationLabel: 'Violet/Purple colouration (Proteins present)', isSpoiled: false, x: 160, y: 120 },
                { id: 'tube-3', name: 'Tube 3', label: 'Iodine Test', sampleVolumeMl: 2.0, reagentName: 'iodine', reagentVolumeMl: 0.3, isInWaterBath: false, heatedSeconds: 0, liquidColor: '#b45309', observationLabel: 'Yellow-brown colour persisted (Starch absent)', isSpoiled: false, x: 250, y: 120 }
              ]);
              if (onStepComplete) {
                onStepComplete(1);
                onStepComplete(2);
                onStepComplete(3);
              }
              setBenchMessage({ text: 'Preset standard KNEC results loaded across all 3 tubes.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-bold transition"
            title="Preload completed tests for rapid verification"
          >
            <span>Preset Setup</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-750 text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tubes</span>
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

      {/* Main Grid: Reagents & Controls on Left + Test Tubes & Water Bath Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* REAGENTS & APPARATUS CONTROLS (Col 4) */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Biology Laboratory Reagents
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              Target: {selectedTube.name}
            </span>
          </div>

          {/* Active Target Tube Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Select Tube to Work On:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {tubes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTubeId(t.id)}
                  className={`p-2 rounded-xl border text-center text-xs transition ${
                    selectedTubeId === t.id
                      ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="font-bold truncate">{t.name}</div>
                  <div className="text-[9px] opacity-80 uppercase truncate">
                    {t.isInWaterBath ? 'In Bath 🔥' : (t.reagentName || 'In Rack')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dispenser for Solution X (Food Extract) */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-750 space-y-2">
            <span className="text-xs font-bold text-amber-400 block">
              1. Dispense Solution X (Food Extract Sample)
            </span>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Graduated Syringe Volume:</span>
                <span className="font-mono font-bold text-emerald-400">{sampleDoseMl.toFixed(1)} cm³</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={sampleDoseMl}
                onChange={e => setSampleDoseMl(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleAddSampleX(sampleDoseMl)}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-between shadow"
            >
              <span>Dispense {sampleDoseMl.toFixed(1)} cm³ into {selectedTube.name}</span>
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Biochemical Reagents Shelf */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-750 space-y-2.5">
            <span className="text-xs font-bold text-cyan-400 block">
              2. Chemical Food Reagents
            </span>

            {/* Benedict's Reagent */}
            <button
              onClick={() => handleAddSpecificReagent('benedicts')}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-between shadow"
            >
              <span>Add 2.0 cm³ Benedict's Solution</span>
              <Droplet className="w-4 h-4" />
            </button>

            {/* Biuret Reagent */}
            <button
              onClick={() => handleAddSpecificReagent('biuret')}
              className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-between shadow"
            >
              <span>Add 1.0 cm³ Biuret Reagent</span>
              <Droplet className="w-4 h-4" />
            </button>

            {/* Iodine Solution */}
            <button
              onClick={() => handleAddSpecificReagent('iodine')}
              className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center justify-between shadow"
            >
              <span>Add 3 Drops Iodine Solution</span>
              <Droplet className="w-4 h-4" />
            </button>
          </div>

          {/* Boiling Water Bath Movement & Controls */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-750 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-rose-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 3. Water Bath Controls (95°C)
              </span>
              <span className="font-mono text-slate-400">Heated: {selectedTube.heatedSeconds}s</span>
            </div>

            {/* Move in/out of Water Bath toggle */}
            {!selectedTube.isInWaterBath ? (
              <button
                onClick={() => handleHeatInWaterBath(60)}
                className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-between shadow"
              >
                <span>Move {selectedTube.name} into Water Bath (+60s Boil)</span>
                <Flame className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleHeatInWaterBath(20)}
                    className="py-1.5 px-2 rounded-lg bg-rose-700 hover:bg-rose-650 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                  >
                    <Flame className="w-3 h-3" />
                    <span>Boil +20s</span>
                  </button>
                  <button
                    onClick={() => handleHeatInWaterBath(60)}
                    className="py-1.5 px-2 rounded-lg bg-rose-700 hover:bg-rose-650 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
                  >
                    <Flame className="w-3 h-3" />
                    <span>Boil +60s</span>
                  </button>
                </div>
                <button
                  onClick={() => handleReturnToRack(selectedTube.id)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-750 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  Lift {selectedTube.name} Out of Water Bath
                </button>
              </div>
            )}

            <span className="text-[10px] text-slate-400 block italic">
              Drag tube with mouse/touch into the water bath beaker on the right to boil!
            </span>
          </div>

        </div>

        {/* Right Side: Visual Laboratory Bench (Col 8) */}
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
              <span>BIOCHEMICAL FOOD TESTING APPARATUS • KCSE BIOLOGY 231/3</span>
              <span className="text-emerald-400 font-bold">• (Drag tubes between rack and water bath)</span>
            </div>

            {/* 1. WOODEN TEST TUBE RACK (Movable) */}
            <div 
              onMouseDown={e => handleStartApparatusDrag(e, 'rack')}
              onTouchStart={e => handleStartApparatusDrag(e, 'rack')}
              style={{
                left: `${rackPos.x}px`,
                top: `${rackPos.y}px`
              }}
              className={`absolute z-10 w-[270px] cursor-grab active:cursor-grabbing group ${
                draggingApparatus === 'rack' ? 'ring-2 ring-amber-400/50 scale-102 z-40' : ''
              }`}
              title="Click and drag to move Wooden Tube Rack"
            >
              <div className="text-[9px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 flex items-center gap-1 mb-1 transition">
                <Move className="w-2.5 h-2.5 text-amber-400" />
                <span className="font-bold">WOODEN TUBE RACK</span>
              </div>
              <div className="w-full h-6 bg-amber-950 border-t-2 border-b-2 border-amber-800 rounded-lg shadow-2xl flex items-center justify-around px-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-14 h-2 bg-slate-950/80 rounded-full" />
                ))}
              </div>
              <div className="w-full flex justify-between px-6">
                <div className="w-5 h-8 bg-amber-950 border-x border-amber-900 rounded-b" />
                <div className="w-5 h-8 bg-amber-950 border-x border-amber-900 rounded-b" />
              </div>
            </div>

            {/* 2. BOILING WATER BATH SETUP (Movable) */}
            <div 
              onMouseDown={e => handleStartApparatusDrag(e, 'bath')}
              onTouchStart={e => handleStartApparatusDrag(e, 'bath')}
              style={{
                left: `${bathPos.x}px`,
                top: `${bathPos.y}px`
              }}
              className={`absolute z-10 w-52 flex flex-col items-center cursor-grab active:cursor-grabbing group ${
                draggingApparatus === 'bath' ? 'ring-2 ring-rose-400/50 scale-102 z-40' : ''
              }`}
              title="Click and drag to move Boiling Water Bath"
            >
              <div className="text-[9px] font-mono text-rose-400 opacity-80 group-hover:opacity-100 flex items-center gap-1 mb-1 font-bold transition">
                <Move className="w-2.5 h-2.5 text-rose-400" />
                <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>95°C WATER BATH</span>
              </div>

              {/* Glass Beaker with Boiling Water */}
              <div className="relative w-44 h-48 border-2 border-cyan-400/50 rounded-b-2xl bg-cyan-950/20 shadow-2xl overflow-hidden flex flex-col justify-end p-2">
                {/* Boiling Water Level */}
                <div className="w-full h-32 bg-cyan-500/25 border-t border-cyan-300 rounded-b-xl relative overflow-hidden">
                  {/* Boiling bubbles */}
                  <div className="absolute inset-0 flex justify-around items-end pb-3">
                    <span className="w-2 h-2 rounded-full bg-white/70 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-ping delay-150" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/80 animate-ping delay-300" />
                  </div>
                </div>

                {/* Steam vapor rising */}
                <div className="absolute top-2 inset-x-0 flex justify-center space-x-3 opacity-60">
                  <span className="text-xs animate-bounce">♨️</span>
                  <span className="text-xs animate-bounce delay-100">♨️</span>
                </div>
              </div>

              {/* Tripod Stand and Bunsen Burner */}
              <div className="w-48 h-3 bg-slate-700 border border-slate-600 rounded mt-0.5" />
              <div className="w-full flex justify-between px-3">
                <div className="w-3 h-10 bg-slate-600" />
                {/* Bunsen Burner Flame in middle */}
                <div className="flex flex-col items-center -mt-1">
                  <div className="w-4 h-6 bg-gradient-to-t from-blue-500 via-amber-400 to-rose-500 rounded-full animate-pulse shadow-lg" />
                  <div className="w-6 h-6 bg-slate-700 rounded-t" />
                </div>
                <div className="w-3 h-10 bg-slate-600" />
              </div>
            </div>

            {/* 3. MOVABLE TEST TUBES ON CANVAS */}
            {tubes.map(t => {
              const isSelected = selectedTubeId === t.id;
              const totalVol = t.sampleVolumeMl + t.reagentVolumeMl;
              const heightPercent = Math.min(85, (totalVol / 6.0) * 80);

              return (
                <div
                  key={t.id}
                  onMouseDown={e => handleStartDrag(e, t)}
                  onTouchStart={e => handleStartDrag(e, t)}
                  style={{
                    left: `${t.x}px`,
                    top: `${t.y}px`
                  }}
                  className={`absolute z-30 flex flex-col items-center cursor-grab active:cursor-grabbing group transition-shadow ${
                    draggingTubeId === t.id ? 'z-50 scale-105' : ''
                  }`}
                  title="Drag this test tube between the rack and the boiling water bath!"
                >
                  {/* Drag handle tooltip */}
                  <div className="text-[8px] font-mono text-slate-300 opacity-60 group-hover:opacity-100 flex items-center gap-1 mb-1 bg-slate-900/90 px-1 rounded shadow">
                    <Move className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{t.name}</span>
                  </div>

                  {/* Glass Tube Container */}
                  <div className={`relative w-14 h-56 rounded-b-3xl border-2 overflow-hidden transition-all shadow-2xl ${
                    t.isSpoiled
                      ? 'border-rose-500 ring-2 ring-rose-500/50 bg-rose-950/30'
                      : isSelected 
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-white/10' 
                      : 'border-slate-500/50 bg-white/5'
                  }`}>
                    {/* Lip */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-white/20 border-b border-slate-400/40 rounded-t" />

                    {/* Liquid Layer */}
                    {totalVol > 0 && (
                      <div
                        className="absolute bottom-0 inset-x-0 transition-all duration-500 rounded-b-2xl"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: t.liquidColor
                        }}
                      >
                        <div className="w-full h-2 rounded-b-full bg-white/30" />
                        {t.isInWaterBath && (
                          <div className="absolute inset-0 flex justify-around items-end pb-2">
                            <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-ping" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status tag */}
                  <div className="mt-1 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white whitespace-nowrap shadow">
                    {t.isInWaterBath ? 'In water bath' : `${totalVol.toFixed(1)} cm³`}
                  </div>
                </div>
              );
            })}

            {/* Live Observation HUD on Selected Tube */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl space-y-1 min-w-[220px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active: {selectedTube.name}</span>
                <span className={`w-2 h-2 rounded-full ${selectedTube.isSpoiled ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              </div>
              <div className={`text-xs font-semibold ${selectedTube.isSpoiled ? 'text-rose-300' : 'text-white'}`}>
                {selectedTube.observationLabel || 'Empty test tube'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                <span>Location: {selectedTube.isInWaterBath ? 'Water Bath (Hot)' : 'Wooden Rack (Cool)'}</span>
              </div>
            </div>

          </div>

          {/* OBSERVATIONS & SCIENTIFIC FEEDBACK CALLOUT */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 shadow-lg ${
            selectedTube.isSpoiled
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-slate-850 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-emerald-400">
                {selectedTube.isSpoiled ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Laboratory Error & Protein Denaturation ({selectedTube.name})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Biological Observations & Deductions ({selectedTube.name})</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">KCSE Biology 231/3</span>
            </div>

            <p className="leading-relaxed">
              {selectedTube.observationLabel || 'Select a test tube and add chemical reagents. Drag the tube into the water bath to heat!'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
