import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  PlusCircle, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  History,
  AlertTriangle,
  Info,
  RefreshCw,
  Move
} from 'lucide-react';

export interface QualitativeLiveTelemetry {
  tubes: Array<{
    id: string;
    name: string;
    volumeMl: number;
    liquidColor: string;
    precipitate: string | null;
    effervescence: boolean;
    observationSummary: string;
    isOnTile: boolean;
  }>;
  selectedTubeId: string;
  currentObservation: string;
  hasInaccurateContamination: boolean;
}

interface InteractiveQualitativeWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onQualitativeUpdate?: (telemetry: QualitativeLiveTelemetry) => void;
}

interface TestTubeData {
  id: string;
  name: string;
  label: string;
  liquidVolumeMl: number;
  solidAmountGrams: number;
  liquidColor: string;
  reagentsAdded: string[];
  precipitate: {
    present: boolean;
    color: string;
    texture: 'gelatinous' | 'dense' | 'flocculent';
    settledHeightPercent: number;
    label: string;
  } | null;
  effervescence: boolean;
  x: number;
  y: number;
  isOnTile: boolean;
}

export const InteractiveQualitativeWorkbench: React.FC<InteractiveQualitativeWorkbenchProps> = ({
  onStepComplete,
  onQualitativeUpdate
}) => {
  const [hasRack, setHasRack] = useState(false);

  // Four test tubes in rack
  const [tubes, setTubes] = useState<TestTubeData[]>([
    {
      id: 'tube-boiling',
      name: 'Boiling Tube',
      label: 'Dissolution Tube',
      liquidVolumeMl: 0,
      solidAmountGrams: 0,
      liquidColor: 'transparent',
      reagentsAdded: [],
      precipitate: null,
      effervescence: false,
      x: 50,
      y: 120,
      isOnTile: false
    },
    {
      id: 'tube-p1',
      name: 'Portion 1',
      label: 'NaOH Test (Cation)',
      liquidVolumeMl: 0,
      solidAmountGrams: 0,
      liquidColor: 'transparent',
      reagentsAdded: [],
      precipitate: null,
      effervescence: false,
      x: 130,
      y: 120,
      isOnTile: false
    },
    {
      id: 'tube-p2',
      name: 'Portion 2',
      label: 'Ba(NO3)2 Test (Anion)',
      liquidVolumeMl: 0,
      solidAmountGrams: 0,
      liquidColor: 'transparent',
      reagentsAdded: [],
      precipitate: null,
      effervescence: false,
      x: 210,
      y: 120,
      isOnTile: false
    },
    {
      id: 'tube-p3',
      name: 'Portion 3',
      label: 'Dilute HCl Acid Test',
      liquidVolumeMl: 0,
      solidAmountGrams: 0,
      liquidColor: 'transparent',
      reagentsAdded: [],
      precipitate: null,
      effervescence: false,
      x: 290,
      y: 120,
      isOnTile: false
    }
  ]);

  const [selectedTubeId, setSelectedTubeId] = useState<string>('tube-boiling');
  const [dropperDropCount, setDropperDropCount] = useState<number>(3);

  // Dragging state
  const [draggingTubeId, setDraggingTubeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  // Apparatus movable canvas positions (Rack & Tile)
  const [rackPos, setRackPos] = useState<{ x: number; y: number }>({ x: 25, y: 340 });
  const [tilePos, setTilePos] = useState<{ x: number; y: number }>({ x: 420, y: 380 });
  const [draggingApparatus, setDraggingApparatus] = useState<'rack' | 'tile' | null>(null);
  const [apparatusDragOffset, setApparatusDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleStartApparatusDrag = (e: React.MouseEvent | React.TouchEvent, item: 'rack' | 'tile') => {
    if ((e.target as HTMLElement).closest('button')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();
    setDraggingApparatus(item);
    const initialPos = item === 'rack' ? rackPos : tilePos;
    setApparatusDragOffset({
      x: (clientX - benchRect.left) - initialPos.x,
      y: (clientY - benchRect.top) - initialPos.y
    });
  };

  // In-bench notification banner
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<TestTubeData[][]>([]);

  const pushSnapshot = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(tubes))]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setTubes(previous);
    setBenchMessage({ text: 'Reverted to previous test tube state.', type: 'info' });
  };

  const selectedTube = tubes.find(t => t.id === selectedTubeId) || tubes[0];

  const updateTube = (tubeId: string, updater: (prev: TestTubeData) => TestTubeData) => {
    pushSnapshot();
    setTubes(prev => prev.map(t => (t.id === tubeId ? updater(t) : t)));
  };

  // Dragging Handlers
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, tube: TestTubeData) => {
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
        const newY = Math.round(Math.max(10, Math.min(benchRect.height - 180, mouseY - apparatusDragOffset.y)));

        if (draggingApparatus === 'rack') {
          const deltaX = newX - rackPos.x;
          const deltaY = newY - rackPos.y;
          setRackPos({ x: newX, y: newY });
          // Move tubes that are in the rack along with it
          setTubes(prev => prev.map(t => {
            if (!t.isOnTile) {
              return { ...t, x: t.x + deltaX, y: t.y + deltaY };
            }
            return t;
          }));
        } else if (draggingApparatus === 'tile') {
          const deltaX = newX - tilePos.x;
          const deltaY = newY - tilePos.y;
          setTilePos({ x: newX, y: newY });
          // Move tubes that are on the tile along with it
          setTubes(prev => prev.map(t => {
            if (t.isOnTile) {
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

        // Inspection tile proximity detection
        const onTileZone = Math.abs(newX - (tilePos.x + 30)) < 85 && Math.abs(newY - (tilePos.y - 100)) < 110;

        setTubes(prev => prev.map(t => {
          if (t.id === draggingTubeId) {
            return {
              ...t,
              x: newX,
              y: newY,
              isOnTile: onTileZone
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
  }, [draggingTubeId, draggingApparatus, dragOffset, apparatusDragOffset, rackPos, tilePos]);

  // ACTION 1: Add Spatula measure of Solid Q into selected tube
  const handleAddSolidQ = () => {
    if (!hasRack) {
      setBenchMessage({ text: 'Please place the Test Tube Rack on the workbench first.', type: 'warning' });
      return;
    }
    updateTube(selectedTubeId, prev => {
      const newSolid = Math.min(2, prev.solidAmountGrams + 1);
      return {
        ...prev,
        solidAmountGrams: newSolid
      };
    });
    setBenchMessage({ text: `Added 1 spatula measure of pale-green crystalline Solid Q into ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 2: Squirt Distilled Water from wash bottle
  const handleAddDistilledWater = (volumeMl: number) => {
    if (!hasRack) {
      setBenchMessage({ text: 'Please place the Test Tube Rack on the workbench first.', type: 'warning' });
      return;
    }
    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(10, prev.liquidVolumeMl + volumeMl);
      const isDissolved = prev.solidAmountGrams > 0;
      return {
        ...prev,
        liquidVolumeMl: newVol,
        liquidColor: isDissolved ? 'rgba(52, 211, 153, 0.45)' : 'rgba(226, 232, 240, 0.35)',
        solidAmountGrams: isDissolved ? 0 : prev.solidAmountGrams
      };
    });

    if (selectedTubeId === 'tube-boiling' && onStepComplete) {
      onStepComplete(1);
    }
    setBenchMessage({ text: `Added ${volumeMl.toFixed(1)} cm³ of distilled water into ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 3: Divide Solution into Portion 1, 2, and 3
  const handleTransferToPortions = () => {
    const boilingTube = tubes.find(t => t.id === 'tube-boiling');
    if (!boilingTube || boilingTube.liquidVolumeMl < 4) {
      setBenchMessage({ text: 'Prepare at least 4.0 cm³ of aqueous Solution Q in the Boiling Tube first before partitioning.', type: 'warning' });
      return;
    }

    pushSnapshot();
    setTubes(prev => prev.map(t => {
      if (t.id === 'tube-boiling') {
        return { ...t, liquidVolumeMl: 2.0 };
      }
      return {
        ...t,
        liquidVolumeMl: 2.5,
        liquidColor: 'rgba(52, 211, 153, 0.45)',
        reagentsAdded: ['Solution Q (Aqueous FeSO4)'],
        precipitate: null
      };
    }));

    if (onStepComplete) onStepComplete(2);
    setBenchMessage({ text: 'Solution Q partitioned into Portion 1, Portion 2, and Portion 3 in clean test tubes.', type: 'success' });
  };

  // ACTION 4: Add 2.0M Sodium Hydroxide (NaOH)
  const handleAddNaOH = (mode: 'dropwise' | 'excess') => {
    if (selectedTube.liquidVolumeMl === 0) {
      setBenchMessage({ text: `The ${selectedTube.name} is completely empty! Add sample solution first.`, type: 'warning' });
      return;
    }

    const addedVol = mode === 'dropwise' ? +(dropperDropCount * 0.05).toFixed(2) : 2.5;

    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(10, prev.liquidVolumeMl + addedVol);
      const reagents = [...prev.reagentsAdded, `NaOH (${mode})`];

      const hadBarium = prev.reagentsAdded.some(r => r.includes('Ba(NO3)2'));
      if (hadBarium) {
        return {
          ...prev,
          liquidVolumeMl: newVol,
          reagentsAdded: reagents,
          precipitate: {
            present: true,
            color: '#a7f3d0',
            texture: 'flocculent',
            settledHeightPercent: 65,
            label: '⚠️ CONTAMINATED PRECIPITATE: Mixed Ba(OH)₂ white ppt and Fe(OH)₂ green ppt formed!'
          }
        };
      }

      const hadAcid = prev.reagentsAdded.some(r => r.includes('HCl'));
      if (hadAcid && mode === 'dropwise') {
        return {
          ...prev,
          liquidVolumeMl: newVol,
          reagentsAdded: reagents,
          precipitate: null,
          label: 'No precipitate initially (Acid neutralizes NaOH first; solution remains clear pale green)'
        };
      }

      const labelText = mode === 'dropwise' 
        ? 'Dirty-green gelatinous ppt of Fe(OH)₂ formed' 
        : 'Dirty-green gelatinous ppt (INSOLUBLE in excess NaOH)';

      return {
        ...prev,
        liquidVolumeMl: newVol,
        liquidColor: 'rgba(16, 185, 129, 0.3)',
        reagentsAdded: reagents,
        precipitate: {
          present: true,
          color: '#065f46',
          texture: 'gelatinous',
          settledHeightPercent: mode === 'dropwise' ? 35 : 55,
          label: labelText
        }
      };
    });

    if (selectedTubeId === 'tube-p1' && onStepComplete) {
      onStepComplete(3);
    }
    setBenchMessage({ text: `Added 2.0M NaOH (${mode}) to ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 5: Add Aqueous Ammonia (NH3)
  const handleAddAmmonia = (mode: 'dropwise' | 'excess') => {
    if (selectedTube.liquidVolumeMl === 0) {
      setBenchMessage({ text: `The ${selectedTube.name} is empty!`, type: 'warning' });
      return;
    }

    const addedVol = mode === 'dropwise' ? +(dropperDropCount * 0.05).toFixed(2) : 2.5;

    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(10, prev.liquidVolumeMl + addedVol);
      const reagents = [...prev.reagentsAdded, `NH3 (${mode})`];

      return {
        ...prev,
        liquidVolumeMl: newVol,
        reagentsAdded: reagents,
        precipitate: {
          present: true,
          color: '#065f46',
          texture: 'gelatinous',
          settledHeightPercent: mode === 'dropwise' ? 35 : 50,
          label: mode === 'dropwise' 
            ? 'Dirty-green precipitate formed with aqueous ammonia' 
            : 'Dirty-green precipitate remains INSOLUBLE in excess ammonia'
        }
      };
    });
    setBenchMessage({ text: `Added Aqueous NH₃ (${mode}) to ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 6: Add Aqueous Barium Nitrate [Ba(NO3)2]
  const handleAddBariumNitrate = () => {
    if (selectedTube.liquidVolumeMl === 0) {
      setBenchMessage({ text: `The ${selectedTube.name} is empty! Transfer sample solution into this tube first.`, type: 'warning' });
      return;
    }

    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(10, prev.liquidVolumeMl + 1.5);
      const reagents = [...prev.reagentsAdded, 'Ba(NO3)2'];

      if (prev.reagentsAdded.some(r => r.includes('NaOH'))) {
        return {
          ...prev,
          liquidVolumeMl: newVol,
          reagentsAdded: reagents,
          precipitate: {
            present: true,
            color: '#a7f3d0',
            texture: 'flocculent',
            settledHeightPercent: 65,
            label: '⚠️ CONTAMINATED: Barium Nitrate added to NaOH mixture. Formed mixed cloudy precipitate!'
          }
        };
      }

      const isExpectedPortion2 = selectedTubeId === 'tube-p2';
      const labelText = isExpectedPortion2
        ? 'Dense chalky white ppt of Barium Sulphate [BaSO₄] formed'
        : `⚠️ Dense white ppt of BaSO₄ formed in ${prev.name}! (Tests for sulphate, not iron).`;

      return {
        ...prev,
        liquidVolumeMl: newVol,
        reagentsAdded: reagents,
        precipitate: {
          present: true,
          color: '#f8fafc',
          texture: 'dense',
          settledHeightPercent: 50,
          label: labelText
        }
      };
    });

    if (selectedTubeId === 'tube-p2' && onStepComplete) {
      onStepComplete(4);
    }
    setBenchMessage({ text: `Added Barium Nitrate [Ba(NO3)2] to ${selectedTube.name}.`, type: 'info' });
  };

  // ACTION 7: Add 2.0M Dilute Hydrochloric Acid (HCl)
  const handleAddDiluteHCl = () => {
    if (selectedTube.liquidVolumeMl === 0) {
      setBenchMessage({ text: `The ${selectedTube.name} is empty!`, type: 'warning' });
      return;
    }

    updateTube(selectedTubeId, prev => {
      const newVol = Math.min(10, prev.liquidVolumeMl + 1.5);
      const reagents = [...prev.reagentsAdded, '2.0M HCl'];
      
      if (prev.precipitate && prev.precipitate.color === '#065f46') {
        return {
          ...prev,
          liquidVolumeMl: newVol,
          liquidColor: 'rgba(52, 211, 153, 0.45)',
          reagentsAdded: reagents,
          precipitate: null,
          effervescence: false
        };
      }

      if (prev.precipitate && prev.precipitate.color === '#f8fafc') {
        return {
          ...prev,
          liquidVolumeMl: newVol,
          reagentsAdded: reagents,
          precipitate: {
            ...prev.precipitate,
            label: 'White ppt of BaSO₄ remains completely INSOLUBLE in dilute HCl (Confirms SO₄²⁻ anion)'
          }
        };
      }

      return {
        ...prev,
        liquidVolumeMl: newVol,
        reagentsAdded: reagents,
        effervescence: false
      };
    });

    setBenchMessage({ text: `Added 2.0M Dilute HCl to ${selectedTube.name}.`, type: 'info' });
  };

  // Move active tube to inspection tile
  const handleMoveToTile = (tubeId = selectedTubeId) => {
    pushSnapshot();
    updateTube(tubeId, prev => ({
      ...prev,
      x: 440,
      y: 120,
      isOnTile: true
    }));
    setBenchMessage({ text: `Positioned ${tubeId} onto the white inspection tile.`, type: 'info' });
  };

  // Move active tube back to rack
  const handleReturnToRack = (tubeId = selectedTubeId) => {
    pushSnapshot();
    const defaultX = tubeId === 'tube-boiling' ? 50 : tubeId === 'tube-p1' ? 130 : tubeId === 'tube-p2' ? 210 : 290;
    updateTube(tubeId, prev => ({
      ...prev,
      x: defaultX,
      y: 120,
      isOnTile: false
    }));
    setBenchMessage({ text: `Returned ${tubeId} to wooden test tube rack.`, type: 'info' });
  };

  // Wash / Rinse active tube
  const handleClearSelectedTube = () => {
    pushSnapshot();
    const defaultX = selectedTubeId === 'tube-boiling' ? 50 : selectedTubeId === 'tube-p1' ? 130 : selectedTubeId === 'tube-p2' ? 210 : 290;
    updateTube(selectedTubeId, prev => ({
      ...prev,
      liquidVolumeMl: 0,
      solidAmountGrams: 0,
      liquidColor: 'transparent',
      reagentsAdded: [],
      precipitate: null,
      effervescence: false,
      x: defaultX,
      y: 120,
      isOnTile: false
    }));
    setBenchMessage({ text: `${selectedTube.name} emptied, rinsed with distilled water, and returned to rack.`, type: 'success' });
  };

  const handleResetWorkbench = () => {
    pushSnapshot();
    setHasRack(false);
    setTubes([
      { id: 'tube-boiling', name: 'Boiling Tube', label: 'Dissolution Tube', liquidVolumeMl: 0, solidAmountGrams: 0, liquidColor: 'transparent', reagentsAdded: [], precipitate: null, effervescence: false, x: 50, y: 120, isOnTile: false },
      { id: 'tube-p1', name: 'Portion 1', label: 'NaOH Test (Cation)', liquidVolumeMl: 0, solidAmountGrams: 0, liquidColor: 'transparent', reagentsAdded: [], precipitate: null, effervescence: false, x: 130, y: 120, isOnTile: false },
      { id: 'tube-p2', name: 'Portion 2', label: 'Ba(NO3)2 Test (Anion)', liquidVolumeMl: 0, solidAmountGrams: 0, liquidColor: 'transparent', reagentsAdded: [], precipitate: null, effervescence: false, x: 210, y: 120, isOnTile: false },
      { id: 'tube-p3', name: 'Portion 3', label: 'Dilute HCl Acid Test', liquidVolumeMl: 0, solidAmountGrams: 0, liquidColor: 'transparent', reagentsAdded: [], precipitate: null, effervescence: false, x: 290, y: 120, isOnTile: false }
    ]);
    setBenchMessage({ text: 'Qualitative analysis bench cleared.', type: 'info' });
  };

  const getSelectedTubeObservation = () => {
    if (selectedTube.liquidVolumeMl === 0 && selectedTube.solidAmountGrams === 0) {
      return `Empty ${selectedTube.name}. No chemical reaction to observe.`;
    }
    if (selectedTube.solidAmountGrams > 0 && selectedTube.liquidVolumeMl === 0) {
      return `Pale green crystalline solid in ${selectedTube.name}.`;
    }
    if (selectedTube.precipitate) {
      return selectedTube.precipitate.label;
    }
    if (selectedTube.reagentsAdded.some(r => r.includes('HCl')) && selectedTube.reagentsAdded.some(r => r.includes('NaOH'))) {
      return 'Neutralized pale green clear solution. Dirty-green precipitate was dissolved by acid.';
    }
    if (selectedTube.liquidVolumeMl > 0) {
      return `Pale green aqueous solution (${selectedTube.liquidVolumeMl.toFixed(1)} cm³). Clear liquid, no precipitate.`;
    }
    return 'Observation pending chemical addition.';
  };

  useEffect(() => {
    if (onQualitativeUpdate) {
      const summaryList = tubes.map(t => ({
        id: t.id,
        name: t.name,
        volumeMl: t.liquidVolumeMl,
        liquidColor: t.liquidColor,
        precipitate: t.precipitate ? t.precipitate.label : null,
        effervescence: t.effervescence,
        observationSummary: t.precipitate ? t.precipitate.label : t.liquidVolumeMl > 0 ? 'Clear pale green solution' : 'Empty',
        isOnTile: t.isOnTile
      }));

      const hasContamination = tubes.some(t => t.precipitate?.label.includes('CONTAMINATED'));

      onQualitativeUpdate({
        tubes: summaryList,
        selectedTubeId,
        currentObservation: getSelectedTubeObservation(),
        hasInaccurateContamination: hasContamination
      });
    }
  }, [tubes, selectedTubeId]);

  return (
    <div className="space-y-4">
      
      {/* Workbench Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Qualitative Analysis Workbench • KCSE 233/3 (Question 2)</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Test tubes are <strong>movable via drag & drop</strong>. Drag any tube between the wooden rack and the white ceramic inspection tile to test reagents up close!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Back / Undo Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Undo previous chemical addition or step"
          >
            <History className="w-3.5 h-3.5" />
            <span>Step Back (Undo)</span>
          </button>

          {/* Wash Current Tube Button */}
          <button
            onClick={handleClearSelectedTube}
            disabled={selectedTube.liquidVolumeMl === 0 && selectedTube.solidAmountGrams === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Empty and rinse active test tube with distilled water"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rinse Tube</span>
          </button>

          <button
            onClick={() => {
              pushSnapshot();
              setHasRack(true);
              setTubes([
                { id: 'tube-boiling', name: 'Boiling Tube', label: 'Prepared Solution Q', liquidVolumeMl: 4.0, solidAmountGrams: 0, liquidColor: 'rgba(52, 211, 153, 0.45)', reagentsAdded: ['Solution Q'], precipitate: null, effervescence: false, x: 50, y: 120, isOnTile: false },
                { id: 'tube-p1', name: 'Portion 1', label: 'Ready for NaOH', liquidVolumeMl: 2.5, solidAmountGrams: 0, liquidColor: 'rgba(52, 211, 153, 0.45)', reagentsAdded: ['Portion 1'], precipitate: null, effervescence: false, x: 440, y: 120, isOnTile: true },
                { id: 'tube-p2', name: 'Portion 2', label: 'Ready for Ba(NO3)2', liquidVolumeMl: 2.5, solidAmountGrams: 0, liquidColor: 'rgba(52, 211, 153, 0.45)', reagentsAdded: ['Portion 2'], precipitate: null, effervescence: false, x: 210, y: 120, isOnTile: false },
                { id: 'tube-p3', name: 'Portion 3', label: 'Ready for Dilute HCl', liquidVolumeMl: 2.5, solidAmountGrams: 0, liquidColor: 'rgba(52, 211, 153, 0.45)', reagentsAdded: ['Portion 3'], precipitate: null, effervescence: false, x: 290, y: 120, isOnTile: false }
              ]);
              setSelectedTubeId('tube-p1');
              if (onStepComplete) {
                onStepComplete(1);
                onStepComplete(2);
              }
              setBenchMessage({ text: 'Preset partitioned Solution Q portions loaded. Portion 1 placed on tile.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-bold transition"
            title="Auto-place rack with partitioned portions"
          >
            <span>Preset Setup</span>
          </button>

          <button
            onClick={handleResetWorkbench}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-750 text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bench</span>
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

      {/* Main Grid: Reagents & Dosage Tray on Left + Test Tube Rack Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* REAGENTS & APPARATUS CONTROLS (Col 4) */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chemical Reagents Shelf
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              Target: {selectedTube.name}
            </span>
          </div>

          {/* Active Target Tube Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Active Tube to Work On:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {tubes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTubeId(t.id)}
                  className={`p-2 rounded-xl border text-left text-xs transition ${
                    selectedTubeId === t.id
                      ? 'bg-amber-600 text-white font-bold border-amber-500 shadow'
                      : 'bg-slate-900 border-slate-750 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="font-bold truncate">{t.name}</div>
                  <div className="text-[10px] opacity-80">{t.isOnTile ? 'On Tile ✨' : `${t.liquidVolumeMl.toFixed(1)} cm³`}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Placement Toggle */}
          <div className="flex gap-2">
            {!selectedTube.isOnTile ? (
              <button
                onClick={() => handleMoveToTile(selectedTube.id)}
                className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-650 text-white font-bold text-xs transition flex items-center justify-center space-x-1 shadow"
              >
                <span>Move {selectedTube.name} to Inspection Tile</span>
                <Move className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => handleReturnToRack(selectedTube.id)}
                className="w-full py-2 px-3 rounded-lg bg-slate-750 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Return {selectedTube.name} to Rack
              </button>
            )}
          </div>

          {/* Solid Sample & Dissolution Actions */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-750 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">Solid Q Sample & Distilled Water</span>
              <span className="text-[10px] font-mono text-slate-400">Sample: FeSO₄·xH₂O</span>
            </div>

            <button
              onClick={handleAddSolidQ}
              className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center justify-between"
            >
              <span>Add 1 Spatula of Solid Q</span>
              <PlusCircle className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddDistilledWater(2.0)}
                className="py-1.5 px-2 rounded-lg bg-cyan-700 hover:bg-cyan-650 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
              >
                <Droplet className="w-3 h-3" />
                <span>+2.0 cm³ Water</span>
              </button>
              <button
                onClick={() => handleAddDistilledWater(5.0)}
                className="py-1.5 px-2 rounded-lg bg-cyan-800 hover:bg-cyan-750 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1"
              >
                <Droplet className="w-3 h-3" />
                <span>+5.0 cm³ Water</span>
              </button>
            </div>

            <button
              onClick={handleTransferToPortions}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-between shadow"
            >
              <span>Divide Solution Q into 3 Portions</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          {/* Specific Chemical Test Reagents */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-750 space-y-2.5">
            <span className="text-xs font-bold text-cyan-400 block">Analytical Test Reagents</span>

            {/* 1. NaOH Dropwise & Excess */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-300 font-semibold block">2.0M Sodium Hydroxide (NaOH):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddNaOH('dropwise')}
                  className="py-2 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1 shadow"
                >
                  <Droplet className="w-3 h-3" />
                  <span>Dropwise (3 drops)</span>
                </button>
                <button
                  onClick={() => handleAddNaOH('excess')}
                  className="py-2 px-2 rounded-lg bg-emerald-800 hover:bg-emerald-750 text-white text-[11px] font-bold transition flex items-center justify-center space-x-1 shadow"
                >
                  <Droplet className="w-3 h-3" />
                  <span>Until in Excess</span>
                </button>
              </div>
            </div>

            {/* 2. Aqueous Ammonia */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-300 font-semibold block">Aqueous Ammonia (NH₃):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddAmmonia('dropwise')}
                  className="py-1.5 px-2 rounded-lg bg-teal-700 hover:bg-teal-650 text-white text-[11px] font-bold transition"
                >
                  Dropwise (NH₃)
                </button>
                <button
                  onClick={() => handleAddAmmonia('excess')}
                  className="py-1.5 px-2 rounded-lg bg-teal-800 hover:bg-teal-750 text-white text-[11px] font-bold transition"
                >
                  Excess (NH₃)
                </button>
              </div>
            </div>

            {/* 3. Barium Nitrate */}
            <div className="pt-1">
              <button
                onClick={handleAddBariumNitrate}
                className="w-full py-2 px-3 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold transition flex items-center justify-between shadow"
              >
                <span>Add Aqueous Barium Nitrate [Ba(NO₃)₂]</span>
                <Droplet className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Dilute HCl */}
            <div className="pt-1">
              <button
                onClick={handleAddDiluteHCl}
                className="w-full py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold transition flex items-center justify-between shadow"
              >
                <span>Add 2.0M Dilute Hydrochloric Acid (HCl)</span>
                <Droplet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: The Physical Test Tube Rack Canvas (Col 8) */}
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
              <span>QUALITATIVE ANALYSIS RACK • KCSE CHEMISTRY PRACTICAL</span>
              <span className="text-amber-400 font-bold">• (Drag tubes onto the ceramic tile to inspect)</span>
            </div>

            {/* Empty Workbench Notice */}
            {!hasRack && (
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="text-center p-8 max-w-sm space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl pointer-events-auto">
                  <Flame className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-white">Empty Qualitative Bench</h4>
                  <p className="text-xs text-slate-400">
                    Place the test tube rack on the bench to mount boiling tubes and begin dissolution tests.
                  </p>
                  <button
                    onClick={() => {
                      pushSnapshot();
                      setHasRack(true);
                      setBenchMessage({ text: 'Wooden test tube rack positioned on workbench.', type: 'info' });
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow"
                  >
                    Place Test Tube Rack
                  </button>
                </div>
              </div>
            )}

            {/* 1. WOODEN TEST TUBE RACK (Movable) */}
            {hasRack && (
              <div 
                onMouseDown={e => handleStartApparatusDrag(e, 'rack')}
                onTouchStart={e => handleStartApparatusDrag(e, 'rack')}
                style={{
                  left: `${rackPos.x}px`,
                  top: `${rackPos.y}px`
                }}
                className={`absolute z-10 w-[320px] cursor-grab active:cursor-grabbing group ${
                  draggingApparatus === 'rack' ? 'ring-2 ring-amber-400/50 scale-102 z-40' : ''
                }`}
                title="Click and drag to move Wooden Test Tube Rack"
              >
                <div className="text-[9px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 flex items-center gap-1 mb-1 font-bold transition">
                  <Move className="w-2.5 h-2.5 text-amber-400" />
                  <span>WOODEN TUBE RACK (STORAGE)</span>
                </div>
                <div className="w-full h-6 bg-amber-950 border-t-2 border-b-2 border-amber-800 rounded-lg shadow-2xl flex items-center justify-around px-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-12 h-2 bg-slate-950/80 rounded-full" />
                  ))}
                </div>
                <div className="w-full flex justify-between px-6">
                  <div className="w-5 h-8 bg-amber-950 border-x border-amber-900 rounded-b" />
                  <div className="w-5 h-8 bg-amber-950 border-x border-amber-900 rounded-b" />
                </div>
              </div>
            )}

            {/* 2. CERAMIC INSPECTION TILE (Movable) */}
            {hasRack && (
              <div 
                onMouseDown={e => handleStartApparatusDrag(e, 'tile')}
                onTouchStart={e => handleStartApparatusDrag(e, 'tile')}
                style={{
                  left: `${tilePos.x}px`,
                  top: `${tilePos.y}px`
                }}
                className={`absolute z-10 w-52 flex flex-col items-center cursor-grab active:cursor-grabbing group ${
                  draggingApparatus === 'tile' ? 'ring-2 ring-amber-400/50 scale-102 z-40' : ''
                }`}
                title="Click and drag to move White Ceramic Testing Tile"
              >
                <div className="text-[9px] font-mono text-amber-400 opacity-80 group-hover:opacity-100 flex items-center gap-1 mb-1 font-bold transition">
                  <Move className="w-2.5 h-2.5 text-amber-400" />
                  <span>WHITE CERAMIC TESTING TILE</span>
                </div>
                <div className="w-48 h-6 bg-white/95 border-2 border-slate-300 rounded shadow-2xl flex items-center justify-center">
                  <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    INSPECTION SPOT
                  </span>
                </div>
              </div>
            )}

            {/* 3. MOVABLE TEST TUBES ON CANVAS */}
            {hasRack && tubes.map(t => {
              const isSelected = selectedTubeId === t.id;
              const liquidHeightPercent = Math.min(85, (t.liquidVolumeMl / 8.0) * 80);

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
                  title="Drag this test tube onto the ceramic testing tile or into the rack!"
                >
                  {/* Tube Header Drag Handle */}
                  <div className={`mb-1 text-[9px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 shadow ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                      : 'bg-slate-900 border-slate-750 text-slate-400'
                  }`}>
                    <Move className="w-2.5 h-2.5" />
                    <span>{t.name}</span>
                  </div>

                  {/* Test Tube Glass Container */}
                  <div className={`relative w-14 h-60 rounded-b-3xl border-2 overflow-hidden transition-all shadow-xl ${
                    t.isOnTile
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-white/10'
                      : isSelected 
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-white/10' 
                      : 'border-slate-500/50 bg-white/5'
                  }`}>
                    <div className="absolute top-0 inset-x-0 h-2 bg-white/20 border-b border-slate-400/40 rounded-t" />

                    {/* Solid sample */}
                    {t.solidAmountGrams > 0 && t.liquidVolumeMl === 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-6 bg-emerald-500/80 rounded-b-2xl border-t border-emerald-300 flex items-center justify-center">
                        <span className="text-[7px] font-mono text-slate-950 font-bold">Solid Q</span>
                      </div>
                    )}

                    {/* Liquid level */}
                    {t.liquidVolumeMl > 0 && (
                      <div
                        className="absolute bottom-0 inset-x-0 transition-all duration-500 rounded-b-2xl"
                        style={{
                          height: `${liquidHeightPercent}%`,
                          backgroundColor: t.liquidColor
                        }}
                      >
                        <div className="w-full h-2 rounded-b-full bg-white/30" />

                        {/* Precipitate layer */}
                        {t.precipitate && (
                          <div
                            className="absolute bottom-0 inset-x-0 transition-all duration-700 rounded-b-2xl shadow-inner"
                            style={{
                              height: `${t.precipitate.settledHeightPercent}%`,
                              backgroundColor: t.precipitate.color
                            }}
                          >
                            <div className="w-full h-full opacity-30 bg-repeat" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Volume / Tile Status Badge */}
                  <div className="mt-1 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white whitespace-nowrap shadow">
                    {t.isOnTile ? 'On Tile ✨' : `${t.liquidVolumeMl.toFixed(1)} cm³`}
                  </div>
                </div>
              );
            })}

            {/* Live Observation Badge on Selected Tube */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl space-y-1 min-w-[220px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active: {selectedTube.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-white">
                {selectedTube.precipitate ? selectedTube.precipitate.label : selectedTube.liquidVolumeMl > 0 ? 'Clear pale green solution' : 'Empty tube'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                <span>Location: {selectedTube.isOnTile ? 'Ceramic Tile' : 'Wooden Rack'}</span>
                <span>{selectedTube.liquidVolumeMl.toFixed(1)} cm³</span>
              </div>
            </div>

          </div>

          {/* OBSERVATIONS & SCIENTIFIC FEEDBACK CALLOUT */}
          <div className="p-4 rounded-2xl border bg-slate-850 border-slate-700/80 text-xs space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-amber-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Laboratory Observation & Chemical Deductions ({selectedTube.name})</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">KCSE Chemistry 233/3</span>
            </div>

            <p className="leading-relaxed text-slate-200">
              {getSelectedTubeObservation()}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
