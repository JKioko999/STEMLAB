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
  Move,
  Flame,
  Thermometer,
  Sparkles,
  Check,
  ChevronRight,
  Eye,
  Play,
  Pause,
  Sliders,
  Activity,
  ZoomIn,
  FlaskConical,
  Layers,
  Maximize2
} from 'lucide-react';
import { ExperimentSpec, ExperimentStep } from '../../../types';
import titrationBenchImg from '../../../assets/images/titration_bench_1791271199117.jpg';
import buretteSetupImg from '../../../assets/images/workflow_burette_setup_1791560633247.jpg';
import endpointColorImg from '../../../assets/images/workflow_endpoint_color_1791560664497.jpg';
import pipettingStepImg from '../../../assets/images/workflow_pipetting_step_1791560652846.jpg';

export interface TitrationLiveTelemetry {
  titre: number;
  initialReading: number;
  finalReading: number;
  indicator: 'phenolphthalein' | 'methyl_orange' | 'potassium_permanganate_self' | 'none';
  indicatorDrops: number;
  baseVolume: number;
  addedReagents: { name: string; volume: number }[];
  temperature: number;
  solutionAppearance: string;
  isNeutralized: boolean;
  isOvertitrated: boolean;
  isInaccurate: boolean;
  inaccuracyReason?: string;
  scientificObservation: string;
  phValue?: number;
}

interface InteractiveTitrationWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onVolumeChange?: (volume: number) => void;
  onTitrationUpdate?: (telemetry: TitrationLiveTelemetry) => void;
  isExamMode?: boolean;
  currentStepIndex?: number;
  activeExperiment?: ExperimentSpec | null;
  completedSteps?: number[];
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
  addedReagents: { name: string; volume: number }[];
  isHeating: boolean;
  temperature: number;
  dilutionDone: boolean;
  indicatorType: 'phenolphthalein' | 'methyl_orange' | 'potassium_permanganate_self';
  indicatorDrops: number;
  isFlaskUnderBurette: boolean;
  buretteDeliveredVolume: number;
}

export const InteractiveTitrationWorkbench: React.FC<InteractiveTitrationWorkbenchProps> = ({
  onStepComplete,
  onVolumeChange,
  onTitrationUpdate,
  isExamMode = false,
  currentStepIndex = 0,
  activeExperiment = null,
  completedSteps = []
}) => {
  // Extract reagent names from activeExperiment apparatus or steps
  const apparatusNames = (activeExperiment?.apparatus || []).map(a => a.name);
  const stepsText = (activeExperiment?.steps || []).map(s => s.instruction).join(' ');

  // Detect Burette Reagent (Titrant)
  const buretteReagentName = (() => {
    for (const step of (activeExperiment?.steps || [])) {
      const match = step.instruction.match(/(?:fill|rinse)\s+(?:the\s+)?(?:burette|burrete|burrette)\s+with\s+([^,\n\r.]+)/i);
      if (match && match[1]) {
        const raw = match[1].trim();
        const matchingApp = apparatusNames.find(n => n.toLowerCase().includes(raw.toLowerCase()) || raw.toLowerCase().includes(n.toLowerCase()));
        if (matchingApp) return matchingApp;
        return raw;
      }
    }
    const acidApp = apparatusNames.find(n => 
      /(?:hydrochloric|hcl|acid|titrant|solution\s*n\b)/i.test(n) && !/(?:burette|stand|clamp)/i.test(n)
    );
    if (acidApp) return acidApp;
    const solB = apparatusNames.find(n => /solution\s*b\b/i.test(n) || /solution\s*a\b/i.test(n));
    if (solB) return solB;
    return 'Dilute Hydrochloric Acid (Solution N)';
  })();

  // Detect Pipette Reagent (Analyte)
  const pipetteReagentName = (() => {
    for (const step of (activeExperiment?.steps || [])) {
      const match = step.instruction.match(/(?:pipette|pippete|pipet)\s+(?:\d+\s*cm[³3]\s+of\s+)?([^,\n\r.]+?)(?:\s+into|\s+to|\s+in|$)/i);
      if (match && match[1]) {
        const raw = match[1].trim();
        const matchingApp = apparatusNames.find(n => n.toLowerCase().includes(raw.toLowerCase()) || raw.toLowerCase().includes(n.toLowerCase()));
        if (matchingApp) return matchingApp;
        return raw;
      }
    }
    const baseApp = apparatusNames.find(n => 
      /(?:sodium\s*hydroxide|sodium\s*hydrotide|naoh|base|alkali|solution\s*m\b)/i.test(n) && !/(?:pipette|filler)/i.test(n)
    );
    if (baseApp) return baseApp;
    const solM = apparatusNames.find(n => /solution\s*m\b/i.test(n) || /solution\s*c\b/i.test(n));
    if (solM) return solM;
    return 'Sodium Hydroxide (Solution M)';
  })();

  // Detect Auxiliary Reagents (e.g. 1M H2SO4)
  const auxiliaryReagentsList = (() => {
    const list: string[] = [];
    apparatusNames.forEach(n => {
      if (
        (/(?:sulphuric|h2so4)/i.test(n) || (n.toLowerCase().includes('acid') && !n.includes(buretteReagentName))) &&
        !n.includes(buretteReagentName) && !n.includes(pipetteReagentName)
      ) {
        list.push(n);
      }
    });
    return Array.from(new Set(list));
  })();

  const requiresAuxiliaryReagent = auxiliaryReagentsList.length > 0;
  const requiresHeating = /(?:heat|burner|flame|60°c|warm)/i.test(stepsText);
  const requiresDilution = /(?:dilut)/i.test(stepsText) && !(stepsText.toLowerCase().includes('dilute acid'));
  const solidReagents = (activeExperiment?.apparatus || []).filter(a => 
    /(?:solid|carbonate|f2co3|powder|chips|crystal|specimen)/i.test(a.name) || a.icon === 'Layers'
  );

  // Detect if titration is Redox / KMnO4
  const isRedoxTitration = 
    stepsText.toLowerCase().includes('pale pink') || 
    stepsText.toLowerCase().includes('manganate') || 
    apparatusNames.some(n => n.toLowerCase().includes('manganate') || n.toLowerCase().includes('kmno4'));

  // Indicator choice
  const detectedInitialIndicator = (() => {
    const combined = (stepsText + ' ' + apparatusNames.join(' ') + ' ' + (activeExperiment?.simulationConfig?.expectedObservation || '')).toLowerCase();
    if (combined.includes('methyl orange')) return 'methyl_orange';
    if (combined.includes('phenolphthalein')) return 'phenolphthalein';
    if (isRedoxTitration) return 'potassium_permanganate_self';
    if (activeExperiment?.simulationConfig?.colorAfter?.toLowerCase().includes('orange')) return 'methyl_orange';
    return 'methyl_orange';
  })();

  // View Mode: 'photorealistic' (realistic 3D lab bench) vs 'modular' (draggable schematic)
  const [viewMode, setViewMode] = useState<'photorealistic' | 'modular'>('photorealistic');
  const [stageTheme, setStageTheme] = useState<'3d_interactive' | 'photo_studio'>('3d_interactive');
  const [showLoupe, setShowLoupe] = useState<boolean>(true);
  const [showTitrationCurve, setShowTitrationCurve] = useState<boolean>(false);
  const [isMagneticStirrerActive, setIsMagneticStirrerActive] = useState<boolean>(false);
  const [isContinuousFlow, setIsContinuousFlow] = useState<boolean>(false);
  const [isDrippingAnim, setIsDrippingAnim] = useState<boolean>(false);

  // Physical assembly states on the bench (pre-assembled by default in photorealistic mode)
  const [hasStand, setHasStand] = useState(true);
  const [hasBuretteMounted, setHasBuretteMounted] = useState(true);
  const [isBuretteFilledWithAcid, setIsBuretteFilledWithAcid] = useState(true);

  const [hasTile, setHasTile] = useState(true);
  const [hasFlask, setHasFlask] = useState(true);
  
  // Pipette state
  const [pipetteSelectedVolume, setPipetteSelectedVolume] = useState<number>(25.0);
  const [pipetteState, setPipetteState] = useState<'empty' | 'filled_base' | 'dispensed'>('dispensed');
  const [flaskBaseVolume, setFlaskBaseVolume] = useState(25.0);

  // Measuring Cylinder state
  const [selectedMeasuringReagent, setSelectedMeasuringReagent] = useState<string>(auxiliaryReagentsList[0] || 'Auxiliary Reagent');
  const [selectedMeasuringVolume, setSelectedMeasuringVolume] = useState<number>(5.0);
  const [measuringCylinderState, setMeasuringCylinderState] = useState<'empty' | 'measuring' | 'poured'>('empty');
  const [addedReagents, setAddedReagents] = useState<{ name: string; volume: number }[]>([]);
  const [, setAddedSolidName] = useState<string | null>(null);

  // Bunsen Burner & Heating state
  const [isHeating, setIsHeating] = useState(false);
  const [temperature, setTemperature] = useState(22.5);

  // Dilution state
  const [dilutionDone, setDilutionDone] = useState(false);

  // Indicator choice & drops (Default: 3 drops for standard KCSE practice)
  const [indicatorType, setIndicatorType] = useState<'phenolphthalein' | 'methyl_orange' | 'potassium_permanganate_self'>(
    detectedInitialIndicator
  );
  const [indicatorDrops, setIndicatorDrops] = useState(isRedoxTitration ? 0 : 3);
  
  // Flask position
  const [isFlaskUnderBurette, setIsFlaskUnderBurette] = useState(true);

  // Apparatus movable canvas positions
  const [standPos, setStandPos] = useState<{ x: number; y: number }>({ x: 260, y: 70 });
  const [tilePos, setTilePos] = useState<{ x: number; y: number }>({ x: 280, y: 540 });
  const [flaskPos, setFlaskPos] = useState<{ x: number; y: number }>({ x: 300, y: 440 });

  // Dragging apparatus state
  const [draggingItem, setDraggingItem] = useState<'stand' | 'tile' | 'flask' | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  // Titration delivery state
  const [buretteDeliveredVolume, setBuretteDeliveredVolume] = useState(0.0);
  const [isSwirling, setIsSwirling] = useState(false);

  // In-bench notification banner
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<TitrationSnapshot[]>([]);

  const currentStep = activeExperiment?.steps?.[currentStepIndex] || null;

  // Temperature simulation
  useEffect(() => {
    let interval: any;
    if (isHeating) {
      interval = setInterval(() => {
        setTemperature(prev => {
          if (prev >= 62.0) return 62.0;
          return +(prev + 2.5).toFixed(1);
        });
      }, 500);
    } else {
      interval = setInterval(() => {
        setTemperature(prev => {
          if (prev <= 23.0) return 22.5;
          return +(prev - 1.0).toFixed(1);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHeating]);

  // Equivalence point calculation (Standard 24.50 cm3)
  const indicatorAcidOffset = (!isRedoxTitration && indicatorDrops > 4) ? +((indicatorDrops - 4) * 0.12).toFixed(2) : 0;
  const actualEquivalencePoint = flaskBaseVolume > 0 
    ? +( ((flaskBaseVolume / 25.0) * 24.50) + indicatorAcidOffset ).toFixed(2) 
    : 24.50;

  // Continuous flow interval
  useEffect(() => {
    let interval: any;
    if (isContinuousFlow) {
      interval = setInterval(() => {
        setIsDrippingAnim(true);
        setBuretteDeliveredVolume(prev => {
          if (prev >= 50.0) {
            setIsContinuousFlow(false);
            return 50.0;
          }
          const next = Math.min(50.0, +(prev + 0.10).toFixed(2));
          if (onVolumeChange) onVolumeChange(next);
          if (next >= actualEquivalencePoint) {
            triggerStepIfMatches('run_simulation', ['titrate', 'pale pink', 'permanent', 'endpoint', 'colourless']);
          }
          return next;
        });
      }, 250);
    } else {
      setIsDrippingAnim(false);
    }
    return () => clearInterval(interval);
  }, [isContinuousFlow, actualEquivalencePoint]);

  // Dragging event handlers in modular mode
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
        if (isFlaskUnderBurette) {
          setFlaskPos({ x: newX + 40, y: Math.min(benchRect.height - 180, newY + 370) });
          setTilePos({ x: newX + 20, y: Math.min(benchRect.height - 80, newY + 470) });
        }
      } else if (draggingItem === 'tile') {
        setTilePos({ x: newX, y: newY });
      } else if (draggingItem === 'flask') {
        setFlaskPos({ x: newX, y: newY });
        
        const buretteTipX = standPos.x + 40;
        const distToBurette = Math.abs(newX - buretteTipX);

        if (hasBuretteMounted && distToBurette < 70) {
          setIsFlaskUnderBurette(true);
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
        addedReagents: [...addedReagents],
        isHeating,
        temperature,
        dilutionDone,
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
    setAddedReagents(previous.addedReagents || []);
    setIsHeating(previous.isHeating || false);
    setTemperature(previous.temperature || 22.5);
    setDilutionDone(previous.dilutionDone || false);
    setIndicatorType(previous.indicatorType);
    setIndicatorDrops(previous.indicatorDrops);
    setIsFlaskUnderBurette(previous.isFlaskUnderBurette);
    setBuretteDeliveredVolume(previous.buretteDeliveredVolume);
    setBenchMessage({ text: 'Reverted to previous workbench stage.', type: 'info' });
  };

  const triggerStepIfMatches = (type: string, keywords: string[]) => {
    if (!onStepComplete || !activeExperiment) return;

    if (currentStep) {
      const matchType = currentStep.validationType === type;
      const matchText = keywords.some(k => currentStep.instruction.toLowerCase().includes(k.toLowerCase()));
      if (matchType || matchText) {
        onStepComplete(currentStep.id);
        return;
      }
    }

    const target = activeExperiment.steps.find(s => {
      if (completedSteps.includes(s.id)) return false;
      const matchType = s.validationType === type;
      const matchText = keywords.some(k => s.instruction.toLowerCase().includes(k.toLowerCase()));
      return matchType || matchText;
    });

    if (target) {
      onStepComplete(target.id);
    }
  };

  const handleRinseFlask = () => {
    pushSnapshot();
    setFlaskBaseVolume(0.0);
    setAddedReagents([]);
    setIndicatorDrops(0);
    setPipetteState('empty');
    setBuretteDeliveredVolume(0.0);
    setIsContinuousFlow(false);
    setBenchMessage({ 
      text: 'Conical flask emptied, rinsed with distilled water, and dried. Ready for a new titration trial.', 
      type: 'success' 
    });
  };

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
      setBenchMessage({ text: 'Mount the burette onto the retort stand before filling it.', type: 'warning' });
      return;
    }
    pushSnapshot();
    setIsBuretteFilledWithAcid(true);
    setBuretteDeliveredVolume(0.0);
    triggerStepIfMatches('apparatus_placed', ['burette', 'fill', 'solution b', 'solution a', '0.00']);
    setBenchMessage({ 
      text: `Burette filled with ${buretteReagentName} and zeroed to 0.00 cm³ meniscus. Jet air bubbles expelled.`, 
      type: 'success' 
    });
  };

  const handlePlaceTileAndFlask = () => {
    pushSnapshot();
    setHasTile(true);
    setHasFlask(true);
    setBenchMessage({ text: 'Clean white ceramic tile and 250 cm³ conical flask positioned on the workbench.', type: 'info' });
  };

  const handleDrawBaseWithPipette = () => {
    pushSnapshot();
    setPipetteState('filled_base');
    setBenchMessage({ 
      text: `Pipetted ${pipetteSelectedVolume.toFixed(1)} cm³ of ${pipetteReagentName}. Meniscus leveled to calibration mark.`, 
      type: 'info' 
    });
  };

  const handleDispensePipetteToFlask = () => {
    if (!hasFlask) {
      setBenchMessage({ text: 'Please place the Conical Flask on the workbench before dispensing.', type: 'warning' });
      return;
    }
    if (pipetteState !== 'filled_base') {
      setBenchMessage({ text: `Draw ${pipetteReagentName} into the pipette first before dispensing.`, type: 'warning' });
      return;
    }
    pushSnapshot();
    setPipetteState('dispensed');
    setFlaskBaseVolume(pipetteSelectedVolume);
    triggerStepIfMatches('volume_set', ['pipette', '25', 'solution c', 'solution b', 'flask']);
    setBenchMessage({ 
      text: `${pipetteSelectedVolume.toFixed(1)} cm³ of ${pipetteReagentName} transferred into the conical flask.`, 
      type: 'success' 
    });
  };

  const handlePourMeasuringCylinder = () => {
    if (!hasFlask) {
      setBenchMessage({ text: 'Place the Conical Flask on the workbench before pouring reagents.', type: 'warning' });
      return;
    }
    pushSnapshot();
    setMeasuringCylinderState('measuring');
    setTimeout(() => {
      setMeasuringCylinderState('poured');
      const updated = [...addedReagents, { name: selectedMeasuringReagent, volume: selectedMeasuringVolume }];
      setAddedReagents(updated);
      triggerStepIfMatches('reagent_added', ['measuring cylinder', 'sulphuric', 'acid', '5cm³', '5.0', 'reagent']);
      setBenchMessage({ 
        text: `✓ Added ${selectedMeasuringVolume.toFixed(1)} cm³ of ${selectedMeasuringReagent} using a measuring cylinder into the conical flask.`, 
        type: 'success' 
      });
    }, 400);
  };

  const handleToggleHeating = () => {
    if (!hasFlask) {
      setBenchMessage({ text: 'Place the Conical Flask on the workbench first.', type: 'warning' });
      return;
    }
    pushSnapshot();
    const nextHeating = !isHeating;
    setIsHeating(nextHeating);
    if (nextHeating) {
      triggerStepIfMatches('heated', ['heat', '60°c', '60', 'burner', 'warm']);
      setBenchMessage({ 
        text: 'Bunsen burner activated under conical flask. Temperature rising to 60°C.', 
        type: 'info' 
      });
    } else {
      setBenchMessage({ text: 'Bunsen burner flame turned off.', type: 'info' });
    }
  };

  const handlePerformDilution = () => {
    pushSnapshot();
    setDilutionDone(true);
    triggerStepIfMatches('diluted', ['dilute', 'distilled water', 'solution d', '75 cm³', '2.0 cm³']);
    setBenchMessage({ 
      text: 'Measured 2.0 cm³ of Solution A and diluted with 75 cm³ distilled water to make Solution D.', 
      type: 'success' 
    });
  };

  const handleAddIndicatorDrop = () => {
    if (flaskBaseVolume <= 0) {
      setBenchMessage({ text: `Transfer ${pipetteReagentName} into the conical flask before adding indicator.`, type: 'warning' });
      return;
    }
    pushSnapshot();
    const nextDrops = indicatorDrops + 1;
    setIndicatorDrops(nextDrops);
    triggerStepIfMatches('reagent_added', ['indicator', 'phenolphthalein', 'methyl orange', 'drop']);

    if (nextDrops > 5) {
      setBenchMessage({ 
        text: `⚠️ Caution: ${nextDrops} drops of indicator added! In KCSE Paper 3, excess indicator (>3-4 drops) shifts the equivalence point.`, 
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
      setBenchMessage({ text: `Fill the burette with ${buretteReagentName} before opening the tap.`, type: 'warning' });
      return;
    }
    if (!isFlaskUnderBurette) {
      setBenchMessage({ text: 'Position the conical flask directly under the burette jet tip on the white tile.', type: 'warning' });
      return;
    }

    pushSnapshot();
    setIsDrippingAnim(true);
    setTimeout(() => setIsDrippingAnim(false), 350);

    setBuretteDeliveredVolume(prev => {
      const next = Math.min(50.0, +(prev + amount).toFixed(2));
      if (onVolumeChange) onVolumeChange(next);
      
      if (next >= actualEquivalencePoint) {
        triggerStepIfMatches('run_simulation', ['titrate', 'pale pink', 'permanent', 'endpoint', 'colourless']);
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
    setAddedReagents([]);
    setIsHeating(false);
    setTemperature(22.5);
    setDilutionDone(false);
    setIndicatorDrops(0);
    setIsFlaskUnderBurette(false);
    setBuretteDeliveredVolume(0.0);
    setIsContinuousFlow(false);
    setBenchMessage({ text: 'Workbench cleared. All apparatus returned to storage shelves.', type: 'info' });
  };

  // Color & Physical State Calculation
  const isNeutralized = buretteDeliveredVolume >= actualEquivalencePoint;
  const isApproaching = buretteDeliveredVolume >= (actualEquivalencePoint - 1.20) && !isNeutralized;
  const isOvertitrated = buretteDeliveredVolume > (actualEquivalencePoint + 0.35);

  let flaskSolutionColor = '#f8fafc';
  let appearanceDescription = 'Empty flask';

  if (flaskBaseVolume > 0) {
    if (isRedoxTitration) {
      if (isOvertitrated) {
        flaskSolutionColor = '#9333ea';
        appearanceDescription = 'Deep purple/violet solution (Over-titrated with excess KMnO₄)';
      } else if (isNeutralized) {
        flaskSolutionColor = '#fbcfe8';
        appearanceDescription = 'Permanent pale pink coloration just appears (Equivalence point reached)';
      } else if (isApproaching) {
        flaskSolutionColor = '#fdf2f8';
        appearanceDescription = 'Transient pink flashes, discharges on swirling';
      } else {
        flaskSolutionColor = '#f1f5f9';
        appearanceDescription = 'Colourless clear solution (KMnO₄ reduced to Mn²⁺)';
      }
    } else if (indicatorType === 'phenolphthalein') {
      if (indicatorDrops === 0) {
        flaskSolutionColor = '#e2e8f0';
        appearanceDescription = 'Clear colourless alkaline solution (No indicator added)';
      } else if (isNeutralized) {
        flaskSolutionColor = '#f8fafc';
        appearanceDescription = isOvertitrated 
          ? 'Clear colourless acidic solution (Over-titrated with excess acid)'
          : 'Permanent colorless solution (Equivalence point attained)';
      } else if (isApproaching) {
        flaskSolutionColor = indicatorDrops > 5 ? '#f472b6' : '#fb7185';
        appearanceDescription = 'Faint transient pink (Discharges on swirling)';
      } else {
        flaskSolutionColor = indicatorDrops > 5 ? '#be185d' : '#e11d48';
        appearanceDescription = 'Intense pink alkaline solution';
      }
    } else {
      // Methyl Orange
      if (indicatorDrops === 0) {
        flaskSolutionColor = '#e2e8f0';
        appearanceDescription = 'Clear colourless solution (No indicator added)';
      } else if (isOvertitrated) {
        flaskSolutionColor = '#dc2626';
        appearanceDescription = 'Intense red solution (Over-acidified with excess acid titrant)';
      } else if (isNeutralized) {
        flaskSolutionColor = activeExperiment?.simulationConfig?.colorHexAfter || '#f97316';
        appearanceDescription = activeExperiment?.simulationConfig?.expectedObservation || 'Crisp orange/pink solution (Methyl orange endpoint attained)';
      } else if (isApproaching) {
        flaskSolutionColor = '#fb923c';
        appearanceDescription = 'Golden-orange solution (Approaching equivalence point)';
      } else {
        flaskSolutionColor = activeExperiment?.simulationConfig?.colorHexBefore || '#eab308';
        appearanceDescription = 'Yellow alkaline solution with methyl orange indicator';
      }
    }
  }

  // Real-time pH calculation
  const calculateLivePH = (): number => {
    if (flaskBaseVolume <= 0) return 7.0;
    const eq = actualEquivalencePoint;
    const v = buretteDeliveredVolume;
    if (v === 0) return 12.45;
    if (Math.abs(v - eq) < 0.05) return 7.00;
    if (v < eq) {
      const frac = v / eq;
      if (frac < 0.75) {
        return +(12.45 - frac * 1.6).toFixed(2);
      } else {
        return +(10.85 - ((frac - 0.75) / 0.25) * 3.85).toFixed(2);
      }
    } else {
      const excess = v - eq;
      const drop = Math.min(4.8, Math.log10(1 + excess * 8) * 2.1);
      return +(Math.max(1.85, 7.00 - 2.8 - drop)).toFixed(2);
    }
  };

  const currentLivePH = calculateLivePH();

  const getObservationNotice = () => {
    if (flaskBaseVolume === 0) {
      return 'Empty conical flask placed on the workbench.';
    }
    if (isRedoxTitration) {
      if (addedReagents.length === 0) {
        return `⚠️ Caution: ${pipetteReagentName} is in the flask, but 1M sulphuric(VI) acid has not been added via measuring cylinder yet. Redox titration requires an acidic medium (H⁺ ions)!`;
      }
      if (isOvertitrated) {
        return `⚠️ OVER-TITRATED: Deep purple colour observed at ${buretteDeliveredVolume.toFixed(2)} cm³! The true endpoint is a PERMANENT PALE PINK colour. Excess KMnO₄ was added.`;
      }
      if (isNeutralized) {
        return `✨ PERFECT KCSE ENDPOINT: A permanent pale pink colour just appears and persists on swirling at ${buretteDeliveredVolume.toFixed(2)} cm³. Accurate to KNEC standard!`;
      }
      if (isApproaching) {
        return `Approaching endpoint (${buretteDeliveredVolume.toFixed(2)} cm³). Pink colour takes longer to decolorize. Deliver Solution B dropwise!`;
      }
      return `Solution C acidified with sulphuric acid. Clear liquid; titrate with Solution B from burette until a permanent pale pink colour just appears.`;
    }
    if (indicatorDrops === 0) {
      return `Transfer completed. Remember to add indicator before titrating.`;
    }
    if (isNeutralized) {
      return activeExperiment?.simulationConfig?.expectedObservation || `✨ Equivalence point attained at ${buretteDeliveredVolume.toFixed(2)} cm³. Color change permanent on swirling.`;
    }
    return `Solution prepared with indicator. Ready for titration.`;
  };

  // Broadcast telemetry to parent
  useEffect(() => {
    if (onTitrationUpdate) {
      const isInaccurate = isOvertitrated || (!isRedoxTitration && indicatorDrops === 0) || flaskBaseVolume !== 25.0;
      let reason: string | undefined;
      if (!isRedoxTitration && indicatorDrops === 0 && buretteDeliveredVolume > 0) reason = 'Titration performed without indicator';
      else if (isOvertitrated) reason = `Over-titrated by +${(buretteDeliveredVolume - actualEquivalencePoint).toFixed(2)} cm³`;
      else if (flaskBaseVolume !== 25.0 && flaskBaseVolume > 0) reason = `Non-standard base volume (${flaskBaseVolume.toFixed(1)} cm³)`;

      onTitrationUpdate({
        titre: buretteDeliveredVolume,
        initialReading: 0.00,
        finalReading: buretteDeliveredVolume,
        indicator: isRedoxTitration ? 'potassium_permanganate_self' : (indicatorDrops === 0 ? 'none' : indicatorType),
        indicatorDrops,
        baseVolume: flaskBaseVolume,
        addedReagents,
        temperature,
        solutionAppearance: appearanceDescription,
        isNeutralized,
        isOvertitrated,
        isInaccurate,
        inaccuracyReason: reason,
        scientificObservation: getObservationNotice(),
        phValue: currentLivePH
      });
    }
  }, [
    buretteDeliveredVolume,
    flaskBaseVolume,
    addedReagents,
    temperature,
    indicatorDrops,
    indicatorType,
    isNeutralized,
    isOvertitrated,
    appearanceDescription,
    currentLivePH
  ]);

  return (
    <div className="space-y-4">
      
      {/* Top Header: View Switcher & Global Lab Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                KCSE Chemistry Volumetric Workbench
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Photorealistic Physics Engine
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Titrant: <strong className="text-cyan-300">{buretteReagentName.split(':')[0]}</strong></span>
              <span>•</span>
              <span>Analyte: <strong className="text-emerald-300">{pipetteReagentName.split(':')[0]}</strong></span>
              {addedReagents.length > 0 && (
                <>
                  <span>•</span>
                  <span>Aux: <strong className="text-amber-300">{addedReagents.map(r => `${r.volume}cm³ ${r.name.split(':')[0]}`).join(', ')}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls & View Switcher */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('photorealistic')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'photorealistic'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Realistic Workbench</span>
            </button>
            <button
              onClick={() => setViewMode('modular')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'modular'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Modular Canvas</span>
            </button>
          </div>

          {/* Sub-Theme Toggle for Photorealistic Mode */}
          {viewMode === 'photorealistic' && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStageTheme('3d_interactive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  stageTheme === '3d_interactive'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive 3D Rendered Lab Bench with physics and animations"
              >
                3D Interactive
              </button>
              <button
                onClick={() => setStageTheme('photo_studio')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  stageTheme === 'photo_studio'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cinematic Photographic Studio View directly matching the lab workflow specification"
              >
                Photo Studio
              </button>
            </div>
          )}

          {/* Meniscus Loupe Toggle */}
          <button
            onClick={() => setShowLoupe(!showLoupe)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1 ${
              showLoupe
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle optical magnifier for meniscus level reading"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Loupe</span>
          </button>

          {/* Titration Curve Toggle */}
          <button
            onClick={() => setShowTitrationCurve(!showTitrationCurve)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1 ${
              showTitrationCurve
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle real-time pH titration curve"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>pH Curve</span>
          </button>

          {/* Quick Align Flask Under Burette */}
          <button
            onClick={() => {
              const tipX = standPos.x + 40;
              setFlaskPos({ x: tipX, y: Math.min(650, standPos.y + 370) });
              setTilePos({ x: standPos.x + 20, y: Math.min(710, standPos.y + 470) });
              setIsFlaskUnderBurette(true);
              setBenchMessage({ text: 'Conical flask aligned directly under burette tip on white tile.', type: 'info' });
            }}
            className="px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition flex items-center gap-1 shadow"
            title="Snap conical flask directly under the burette tip"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Align Flask</span>
          </button>

          {/* Reset Positions */}
          <button
            onClick={() => {
              setStandPos({ x: 260, y: 70 });
              setFlaskPos({ x: 300, y: 440 });
              setTilePos({ x: 280, y: 540 });
              setIsFlaskUnderBurette(true);
              setBenchMessage({ text: 'Apparatus positions reset to standard titration layout.', type: 'info' });
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1 shadow"
            title="Reset apparatus positions on the workbench"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Positions</span>
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium transition disabled:opacity-40 flex items-center gap-1"
            title="Reverse previous action"
          >
            <History className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          {/* Rinse Flask */}
          <button
            onClick={handleRinseFlask}
            disabled={flaskBaseVolume === 0 && buretteDeliveredVolume === 0 && addedReagents.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition disabled:opacity-40 flex items-center gap-1"
            title="Empty and rinse conical flask for a fresh trial"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rinse</span>
          </button>

          {/* Clear Bench */}
          <button
            onClick={handleResetAll}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-700 text-xs font-medium transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Teacher's Expected Result Banner */}
      {(activeExperiment?.simulationConfig?.expectedObservation || activeExperiment?.simulationConfig?.colorAfter) && (
        <div className="p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-emerald-300">
                KCSE Calibration Target:
              </span>{' '}
              <span className="text-emerald-100">
                {activeExperiment.simulationConfig.expectedObservation || activeExperiment.simulationConfig.colorAfter}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className="text-slate-400">{activeExperiment.simulationConfig.colorBefore || 'Initial (Yellow)'}</span>
            <span className="text-emerald-400">➔</span>
            <span 
              className="px-2.5 py-0.5 rounded font-bold text-slate-950 shadow border border-white/20"
              style={{ backgroundColor: activeExperiment.simulationConfig.colorHexAfter || '#ea580c' }}
            >
              {activeExperiment.simulationConfig.colorAfter || 'Orange Endpoint (24.50 cm³)'}
            </span>
          </div>
        </div>
      )}

      {/* Active Step Quick-Action Banner */}
      {currentStep && (
        <div className="p-3.5 bg-slate-900 border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[11px] shrink-0">
              Active Step {currentStep.id}
            </span>
            <p className="text-slate-200 font-medium leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {completedSteps.includes(currentStep.id) ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> Validated ({currentStep.marks} mk)
              </span>
            ) : (
              <button
                onClick={() => {
                  const ins = currentStep.instruction.toLowerCase();
                  if (ins.includes('burette') || ins.includes('burrete') || ins.includes('fill')) {
                    handlePlaceStand();
                    handleMountBurette();
                    handleFillBuretteWithAcid();
                  } else if (ins.includes('pipette') || ins.includes('pippete') || ins.includes('25cm') || ins.includes('flask')) {
                    handlePlaceTileAndFlask();
                    handleDrawBaseWithPipette();
                    handleDispensePipetteToFlask();
                  } else if (ins.includes('indicator') || ins.includes('methyl orange') || ins.includes('phenolphthalein') || ins.includes('drop')) {
                    handleAddIndicatorDrop();
                  } else if (solidReagents.length > 0 && (ins.includes('solid') || ins.includes('carbonate') || ins.includes('add'))) {
                    setAddedSolidName(solidReagents[0].name);
                    setBenchMessage({ text: `Placed ${solidReagents[0].name} into the reaction container.`, type: 'success' });
                    if (onStepComplete) onStepComplete(currentStep.id);
                  } else if (requiresAuxiliaryReagent && (ins.includes('measuring cylinder') || ins.includes('sulphuric'))) {
                    handlePlaceTileAndFlask();
                    handlePourMeasuringCylinder();
                  } else if (requiresHeating && (ins.includes('heat') || ins.includes('60°c'))) {
                    handleToggleHeating();
                  } else if (requiresDilution && ins.includes('dilute')) {
                    handlePerformDilution();
                  } else if (ins.includes('titrate') || ins.includes('endpoint') || ins.includes('table')) {
                    handleMoveFlaskUnderBurette();
                    handleTitrate(24.50);
                  } else {
                    if (onStepComplete) onStepComplete(currentStep.id);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-1.5 shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Step {currentStep.id} on Bench</span>
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* MAIN WORKBENCH STAGE */}
      {viewMode === 'photorealistic' ? (
        
        /* ================= 1. PHOTOREALISTIC 3D LAB BENCH MODE ================= */
        <div className="space-y-4">
          
          {/* Main Visual Stage */}
          <div 
            ref={benchRef}
            className="relative w-full min-h-[740px] lg:min-h-[800px] rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl select-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 25%, #2a3447 0%, #111827 60%, #030712 100%)'
            }}
          >
            {/* Photographic Studio Background if Photo Studio is active */}
            {stageTheme === 'photo_studio' ? (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 z-0"
                style={{
                  backgroundImage: `url(${isNeutralized ? endpointColorImg : buretteSetupImg})`
                }}
              >
                {/* Subtle vignette & contrast overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/50 pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/40 text-amber-300 text-xs font-medium shadow-lg pointer-events-none flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cinematic Laboratory Studio Active • {isNeutralized ? 'Equivalence Endpoint Attained' : 'Standard 50ml Burette & Conical Setup'}</span>
                </div>
              </div>
            ) : (
              <>
                {/* Laboratory Teak Workbench Table Surface at Bottom */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-[260px] border-t-4 border-amber-950/70 shadow-2xl z-0"
                  style={{
                    background: 'linear-gradient(180deg, #3d2417 0%, #28170d 45%, #180d07 100%)',
                    boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Teak Wood Grain Overlay lines */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 40px)'
                    }}
                  />
                  {/* Table Lip Bevel */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-amber-400/25" />
                </div>

                {/* Ambient Spotlight from Top */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background: 'radial-gradient(circle at 45% 35%, rgba(147, 197, 253, 0.25) 0%, transparent 65%)'
                  }}
                />
              </>
            )}

            {/* Top Scene HUD Header */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-xs z-30 pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] font-bold">DIGITAL LAB ENVIRONMENT • KCSE PAPER 3</span>
              </div>

              {/* Digital pH & Temperature HUD in top-right */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">pH Probe:</span>
                    <strong className="font-mono text-sm text-cyan-300">{currentLivePH.toFixed(2)}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Temp:</span>
                    <strong className="font-mono text-xs text-amber-300">{temperature.toFixed(1)}°C</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING MENISCUS ZOOM LOUPE */}
            {showLoupe && isBuretteFilledWithAcid && (
              <div className="absolute top-16 left-6 z-40 bg-slate-950/90 backdrop-blur-md border-2 border-amber-500/70 p-3 rounded-2xl shadow-2xl w-48 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" /> Meniscus Loupe (3x)
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Eye-Level</span>
                </div>

                {/* Loupe Viewport */}
                <div className="relative h-24 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col justify-center px-4">
                  {/* Glass Highlights */}
                  <div className="absolute inset-y-0 left-2 w-1.5 bg-white/20 rounded-full blur-[0.5px]" />
                  <div className="absolute inset-y-0 right-2 w-1 bg-white/15 rounded-full" />

                  {/* Millimeter Graduation Lines */}
                  <div className="space-y-1.5 py-1">
                    {[
                      buretteDeliveredVolume - 0.20,
                      buretteDeliveredVolume - 0.10,
                      buretteDeliveredVolume,
                      buretteDeliveredVolume + 0.10,
                      buretteDeliveredVolume + 0.20
                    ].map((val, idx) => {
                      const isCenter = idx === 2;
                      return (
                        <div key={idx} className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                          <span className={`h-px ${isCenter ? 'w-5 bg-amber-400' : 'w-2.5 bg-slate-500'}`} />
                          <span className={isCenter ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                            {Math.max(0, val).toFixed(2)} cm³
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Concave Meniscus Curve Shader */}
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-2.5 border-b-2 border-cyan-300 rounded-b-full shadow-sm pointer-events-none" />
                </div>

                <div className="mt-2 text-[10px] text-center font-mono text-slate-300">
                  Current Level: <strong className="text-cyan-400 font-bold">{buretteDeliveredVolume.toFixed(2)} cm³</strong>
                </div>
              </div>
            )}

            {/* LIVE TITRATION CURVE MODAL / OVERLAY */}
            {showTitrationCurve && (
              <div className="absolute top-16 right-6 z-40 bg-slate-950/95 backdrop-blur-md border border-violet-500/50 p-3.5 rounded-2xl shadow-2xl w-64 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Titration Curve (pH vs Vol)
                  </span>
                  <button onClick={() => setShowTitrationCurve(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
                
                {/* SVG Sigmoid Titration Curve */}
                <div className="h-32 w-full bg-slate-900 rounded-xl p-2 relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    {/* Grid lines */}
                    <line x1="20" y1="10" x2="190" y2="10" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="20" y1="50" x2="190" y2="50" stroke="#475569" strokeDasharray="2" strokeWidth="0.8" />
                    <line x1="20" y1="90" x2="190" y2="90" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="110" y1="10" x2="110" y2="90" stroke="#f97316" strokeDasharray="2" strokeWidth="0.8" />
                    
                    {/* pH Axis labels */}
                    <text x="5" y="14" fill="#94a3b8" fontSize="6" fontFamily="monospace">14</text>
                    <text x="5" y="53" fill="#38bdf8" fontSize="6" fontFamily="monospace">7</text>
                    <text x="5" y="93" fill="#f43f5e" fontSize="6" fontFamily="monospace">0</text>
                    
                    {/* Sigmoid Curve Path */}
                    <path
                      d="M 20 18 Q 80 25, 105 45 T 115 55 T 140 85 T 190 90"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                    />

                    {/* Equivalence Point Marker */}
                    <circle cx="110" cy="50" r="3" fill="#ea580c" />
                    
                    {/* Current Position Marker */}
                    {buretteDeliveredVolume > 0 && (
                      <circle 
                        cx={Math.min(190, 20 + (buretteDeliveredVolume / 50.0) * 170)} 
                        cy={Math.max(12, Math.min(90, 100 - (currentLivePH / 14.0) * 80))} 
                        r="3.5" 
                        fill="#38bdf8" 
                        className="animate-ping" 
                      />
                    )}
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>Equivalence: 24.50 cm³</span>
                  <span className="text-cyan-400 font-bold">pH {currentLivePH.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ================= STAGE CENTER: THE RETORT STAND, BURETTE & CONICAL FLASK (MOVABLE) ================= */}
            {stageTheme === '3d_interactive' && (
              <>
                {/* 1. MOVABLE RETORT STAND & BURETTE */}
                <div 
                  style={{ left: `${standPos.x}px`, top: `${standPos.y}px` }}
                  className={`absolute z-20 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
                    draggingItem === 'stand' ? 'ring-2 ring-amber-400/50 scale-[1.01] z-40' : ''
                  }`}
                >
                  {/* Stand Drag Handle Banner */}
                  <div 
                    onMouseDown={e => handleStartDrag(e, 'stand')}
                    onTouchStart={e => handleStartDrag(e, 'stand')}
                    className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1.5 bg-slate-950/90 border border-amber-500/40 text-amber-300 text-[9px] font-mono px-2.5 py-1 rounded-full shadow-lg hover:border-amber-400 transition"
                    title="Click and drag to move Retort Stand & Burette anywhere on the bench"
                  >
                    <Move className="w-2.5 h-2.5 text-amber-400" />
                    <span className="font-bold">STAND & BURETTE (DRAG)</span>
                  </div>

                  <div className="relative w-[180px] h-[520px]">
                    {/* Chrome Vertical Retort Rod */}
                    <div 
                      className="absolute bottom-16 left-8 w-3 h-[420px] rounded-t-sm shadow-xl z-10"
                      style={{
                        background: 'linear-gradient(90deg, #64748b 0%, #e2e8f0 40%, #94a3b8 70%, #475569 100%)',
                        boxShadow: '2px 0 10px rgba(0,0,0,0.5)'
                      }}
                    />

                    {/* Heavy Cast Iron Retort Stand Base */}
                    <div 
                      className="absolute bottom-10 left-0 w-44 h-6 rounded-md shadow-2xl z-10 border border-slate-600"
                      style={{
                        background: 'linear-gradient(180deg, #475569 0%, #334155 40%, #1e293b 100%)',
                        boxShadow: '0 15px 25px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.3)'
                      }}
                    >
                      <div className="text-[7px] font-mono text-slate-400 uppercase tracking-widest text-center pt-1 font-bold">
                        LAB-PRO CAST IRON STAND • 500g
                      </div>
                    </div>

                    {/* Metallic Bosshead Clamp */}
                    <div className="absolute top-28 left-8 w-16 h-5 z-20 flex items-center">
                      <div className="w-7 h-5 bg-gradient-to-r from-slate-600 to-slate-800 rounded border border-slate-500 shadow flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                      </div>
                      {/* Clamp Arm extending to burette */}
                      <div className="w-9 h-3 bg-gradient-to-r from-slate-500 to-slate-400 border border-slate-400 shadow-md rounded-r" />
                    </div>

                    {/* Glass 50.0 cm³ Precision Burette */}
                    <div className="absolute top-4 left-20 flex flex-col items-center z-25">
                      
                      {/* Reagent Top Tag */}
                      <div className="mb-1 text-[9px] font-mono bg-slate-900/90 border border-cyan-500/40 px-2 py-0.5 rounded-full text-cyan-300 shadow whitespace-nowrap">
                        {buretteReagentName.split(':')[0]} (0.00 cm³)
                      </div>

                      {/* Borosilicate Glass Column */}
                      <div 
                        className="relative w-8 h-[290px] rounded-t-sm border-2 border-slate-250 flex flex-col justify-end overflow-hidden shadow-2xl"
                        style={{
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.3) 100%)',
                          backdropFilter: 'blur(1px)'
                        }}
                      >
                        {/* Glass Specular Sheen lines */}
                        <div className="absolute inset-y-0 left-1 w-0.5 bg-white/40 pointer-events-none" />
                        <div className="absolute inset-y-0 right-1 w-0.5 bg-white/30 pointer-events-none" />

                        {/* Liquid Column */}
                        {isBuretteFilledWithAcid && (
                          <div 
                            className={`w-full transition-all duration-300 relative ${
                              isRedoxTitration 
                                ? 'bg-gradient-to-t from-purple-800/90 to-purple-600/80 border-t-2 border-purple-300' 
                                : 'bg-gradient-to-t from-cyan-400/50 via-cyan-300/40 to-cyan-200/30 border-t-2 border-cyan-200'
                            }`}
                            style={{
                              height: `${Math.max(4, 100 - (buretteDeliveredVolume / 50.0) * 100)}%`
                            }}
                          >
                            {/* Meniscus curvature */}
                            <div className="absolute -top-1 inset-x-0 h-1.5 bg-white/60 rounded-b-full shadow-sm" />
                          </div>
                        )}

                        {/* Graduation Marks */}
                        <div className="absolute inset-0 flex flex-col justify-between py-1 px-1 pointer-events-none opacity-70">
                          {[0, 10, 20, 30, 40, 50].map(val => (
                            <div key={val} className="w-full border-b border-slate-200 text-[8px] font-mono text-white text-right pr-1 flex items-center justify-between">
                              <span className="w-2 h-px bg-white" />
                              <span className="drop-shadow-md font-bold">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PTFE / Glass Stopcock Tap Dial */}
                      <div className="relative my-0.5 flex flex-col items-center">
                        <div className="w-10 h-5 bg-gradient-to-r from-slate-700 via-slate-655 to-slate-800 border border-slate-400 rounded-md shadow-lg flex items-center justify-center">
                          {/* Rotating Tap Handle */}
                          <button
                            onClick={() => setIsContinuousFlow(!isContinuousFlow)}
                            title={isContinuousFlow ? 'Click to close stopcock tap' : 'Click to open stopcock tap for continuous flow'}
                            className={`w-5 h-2.5 rounded transition-transform duration-300 shadow-md ${
                              isContinuousFlow 
                                ? 'bg-emerald-400 rotate-90 ring-2 ring-emerald-300 animate-pulse' 
                                : 'bg-amber-400 rotate-0 hover:bg-amber-300'
                            }`}
                          />
                        </div>
                        <span className="text-[7px] font-mono text-slate-400 mt-0.5">
                          {isContinuousFlow ? 'TAP OPEN' : 'TAP CLOSED'}
                        </span>
                      </div>

                      {/* Delivery Jet Tip */}
                      <div className="relative w-1.5 h-7 bg-slate-200/90 border-x border-slate-400 rounded-b-full flex justify-center">
                        {/* Animated Falling Droplet */}
                        {(isDrippingAnim || isContinuousFlow) && (
                          <div 
                            className={`absolute w-2 h-2.5 rounded-full shadow-lg animate-bounce ${
                              isRedoxTitration ? 'bg-purple-500' : 'bg-cyan-300'
                            }`}
                            style={{ top: '18px' }}
                          />
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* 2. MOVABLE WHITE CERAMIC TILE */}
                <div 
                  style={{ left: `${tilePos.x}px`, top: `${tilePos.y}px` }}
                  className={`absolute z-15 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
                    draggingItem === 'tile' ? 'ring-2 ring-slate-400/50 scale-[1.02] z-35' : ''
                  }`}
                >
                  <div 
                    onMouseDown={e => handleStartDrag(e, 'tile')}
                    onTouchStart={e => handleStartDrag(e, 'tile')}
                    className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/80 border border-slate-700 text-slate-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow"
                    title="Click and drag to move White Ceramic Tile"
                  >
                    <Move className="w-2 h-2 text-slate-400" />
                    <span>WHITE TILE (DRAG)</span>
                  </div>

                  <div 
                    className="w-36 h-5 rounded-md border-2 border-slate-200 shadow-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      KCSE WHITE TILE
                    </span>
                  </div>
                </div>

                {/* 3. MOVABLE CONICAL FLASK (250 cm³ Pyrex) */}
                <div 
                  style={{ left: `${flaskPos.x}px`, top: `${flaskPos.y}px` }}
                  className={`absolute z-25 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
                    draggingItem === 'flask' ? 'ring-2 ring-cyan-400/50 scale-[1.02] z-45' : ''
                  }`}
                >
                  {/* Flask Drag Handle & Alignment Badge */}
                  <div 
                    onMouseDown={e => handleStartDrag(e, 'flask')}
                    onTouchStart={e => handleStartDrag(e, 'flask')}
                    className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-cyan-300 transition"
                    title="Click and drag to move Conical Flask around the workbench"
                  >
                    <Move className="w-2 h-2 text-cyan-400" />
                    <span className="font-bold">FLASK (DRAG)</span>
                    {isFlaskUnderBurette ? (
                      <span className="text-emerald-400 font-bold ml-1">✓ Under Jet</span>
                    ) : (
                      <span className="text-amber-400 ml-1">⚠️ Move under tip</span>
                    )}
                  </div>

                  <div 
                    className={`flex flex-col items-center transition-transform ${
                      isSwirling || isMagneticStirrerActive ? 'rotate-2 scale-102 duration-150' : 'duration-300'
                    }`}
                  >
                    {/* Flask Neck with rim */}
                    <div 
                      className="w-8 h-9 border-2 border-b-0 border-slate-200/90 rounded-t-sm flex flex-col items-center justify-between shadow-sm relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 100%)'
                      }}
                    >
                      {/* Beaded rim */}
                      <div className="w-10 h-1 bg-white/70 rounded-full -mt-0.5 shadow-xs" />
                    </div>

                    {/* Flask Conical Body */}
                    <div 
                      className="relative w-30 h-22 border-2 border-slate-250 rounded-b-2xl overflow-hidden shadow-2xl flex items-end justify-center transition-colors duration-500"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                        backgroundColor: flaskSolutionColor
                      }}
                    >
                      {/* Graduations on Flask */}
                      <div className="absolute inset-y-2 right-4 flex flex-col justify-between text-[6px] font-mono text-slate-600 select-none pointer-events-none opacity-60">
                        <span>200</span>
                        <span>150</span>
                        <span>100</span>
                        <span>50 mL</span>
                      </div>

                      {/* Swirling fluid ripples & magnetic vortex */}
                      {(isSwirling || isMagneticStirrerActive) && (
                        <div className="absolute inset-0 opacity-45 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                      )}

                      {/* Magnetic stir bar flea spinning at bottom */}
                      {isMagneticStirrerActive && (
                        <div className="absolute bottom-1 w-4 h-1.5 bg-white rounded-full shadow-md animate-spin" />
                      )}

                      {/* Endpoint sparkle highlight */}
                      {isNeutralized && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/90 animate-pulse">
                          <Sparkles className="w-7 h-7 drop-shadow-md text-amber-200" />
                        </div>
                      )}
                    </div>

                    {/* Volume Tag below flask */}
                    <div className="mt-1 text-[9px] font-mono bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-slate-200 shadow whitespace-nowrap">
                      {(flaskBaseVolume + addedReagents.reduce((a, b) => a + b.volume, 0) + buretteDeliveredVolume).toFixed(1)} cm³ in flask
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= RIGHT SIDE: LABORATORY REAGENT BOTTLES RACK ================= */}
            <div className="absolute top-16 right-6 z-25 flex flex-col gap-2.5 max-w-[210px] pointer-events-auto">
              <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1">
                  Workbench Reagent Bottles
                </span>

                {/* 1. Amber Reagent Bottle: Solution N (Acid) */}
                <button
                  onClick={handleFillBuretteWithAcid}
                  className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-600/30 text-left transition flex items-center gap-2 group"
                >
                  <div className="w-6 h-8 rounded-t bg-amber-700 border border-amber-500 flex flex-col items-center justify-between p-0.5 shadow shrink-0">
                    <div className="w-3 h-1 bg-slate-800 rounded-xs" />
                    <span className="text-[6px] font-bold text-white">HCl</span>
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-amber-300 block truncate group-hover:text-amber-200">
                      {buretteReagentName.split(':')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400">Click to fill burette</span>
                  </div>
                </button>

                {/* 2. Clear Reagent Bottle: Solution M (Base) */}
                <button
                  onClick={handleDrawBaseWithPipette}
                  className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-600/30 text-left transition flex items-center gap-2 group"
                >
                  <div className="w-6 h-8 rounded-t bg-cyan-700/60 border border-cyan-400 flex flex-col items-center justify-between p-0.5 shadow shrink-0">
                    <div className="w-3 h-1 bg-slate-800 rounded-xs" />
                    <span className="text-[6px] font-bold text-white">NaOH</span>
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-cyan-300 block truncate group-hover:text-cyan-200">
                      {pipetteReagentName.split(':')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400">Click to draw with pipette</span>
                  </div>
                </button>

                {/* 3. Dropper Bottle: Indicator */}
                <button
                  onClick={handleAddIndicatorDrop}
                  className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-rose-600/30 text-left transition flex items-center gap-2 group"
                >
                  <div className="w-5 h-7 rounded-t bg-rose-700 border border-rose-400 flex flex-col items-center justify-between p-0.5 shadow shrink-0">
                    <div className="w-2 h-1.5 bg-slate-900 rounded-full" />
                    <span className="text-[5px] font-bold text-white">IND</span>
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-rose-300 block truncate group-hover:text-rose-200">
                      {indicatorType === 'phenolphthalein' ? 'Phenolphthalein' : 'Methyl Orange'}
                    </span>
                    <span className="text-[9px] text-slate-400">+1 drop ({indicatorDrops} in flask)</span>
                  </div>
                </button>

                {/* 4. Wash Bottle: Distilled Water */}
                <button
                  onClick={handleRinseFlask}
                  className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-blue-500/30 text-left transition flex items-center gap-2 group"
                >
                  <div className="w-5 h-7 rounded bg-blue-500/30 border border-blue-400 flex items-center justify-center shadow shrink-0">
                    <Droplet className="w-3 h-3 text-blue-300" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-blue-300 block truncate group-hover:text-blue-200">
                      Distilled Water H₂O
                    </span>
                    <span className="text-[9px] text-slate-400">Rinse flask for next trial</span>
                  </div>
                </button>

              </div>
            </div>

            {/* ================= BOTTOM FLOATING CONTROL PANEL ================= */}
            <div className="absolute bottom-4 left-6 right-6 z-30 flex flex-wrap items-center justify-between gap-3 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-2xl">
              
              {/* LCD Delivered Titre Reading */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">DELIVERED TITRE:</span>
                  <div className="text-xl font-mono font-bold text-cyan-400 tracking-wider">
                    {buretteDeliveredVolume.toFixed(2)} <span className="text-xs font-sans text-slate-400">cm³</span>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">FLASK STATUS:</span>
                  <span className={`text-xs font-semibold block max-w-xs truncate ${
                    isNeutralized ? 'text-emerald-400 font-bold' : 'text-slate-200'
                  }`}>
                    {appearanceDescription}
                  </span>
                </div>
              </div>

              {/* Precision Titration Taps */}
              <div className="flex items-center flex-wrap gap-2">
                
                {/* Micro-Drop */}
                <button
                  onClick={() => handleTitrate(0.05)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1 shadow"
                  title="Deliver a single micro drop of 0.05 cm³"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+0.05</span>
                </button>

                {/* Single Drop */}
                <button
                  onClick={() => handleTitrate(0.10)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                  title="Deliver 0.10 cm³ standard drop"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+0.10 cm³</span>
                </button>

                {/* Rapid 1.00 mL */}
                <button
                  onClick={() => handleTitrate(1.00)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                  title="Deliver 1.00 cm³ rapid burst"
                >
                  <span>+1.00 cm³</span>
                </button>

                {/* Continuous Flow Tap Toggle */}
                <button
                  onClick={() => setIsContinuousFlow(!isContinuousFlow)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                    isContinuousFlow 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={isContinuousFlow ? 'Stop continuous flow' : 'Open stopcock tap for continuous flow'}
                >
                  {isContinuousFlow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isContinuousFlow ? 'Close Tap' : 'Open Tap Flow'}</span>
                </button>

                {/* Swirl Flask */}
                <button
                  onMouseDown={() => setIsSwirling(true)}
                  onMouseUp={() => setIsSwirling(false)}
                  onTouchStart={() => setIsSwirling(true)}
                  onTouchEnd={() => setIsSwirling(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition active:bg-slate-750 flex items-center gap-1"
                >
                  <span>Hold to Swirl</span>
                </button>

                {/* Magnetic Stirrer Toggle */}
                <button
                  onClick={() => setIsMagneticStirrerActive(!isMagneticStirrerActive)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1 ${
                    isMagneticStirrerActive 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-inner' 
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Toggle automatic magnetic stirrer bar"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isMagneticStirrerActive ? 'Stirrer ON' : 'Stirrer OFF'}</span>
                </button>

              </div>
            </div>

          </div>

        </div>

      ) : (

        /* ================= 2. MODULAR INTERACTIVE SCHEMATIC CANVAS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Shelf Tools */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interactive Lab Tools
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">Modular Assembly</span>
            </div>

            <div className="space-y-2.5 text-xs">
              
              {/* 1. Burette Setup */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block">1. Burette Setup & Titrant</span>
                {!hasStand ? (
                  <button onClick={handlePlaceStand} className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition">Place Stand</button>
                ) : !hasBuretteMounted ? (
                  <button onClick={handleMountBurette} className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition">Mount Burette</button>
                ) : !isBuretteFilledWithAcid ? (
                  <button onClick={handleFillBuretteWithAcid} className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition">Fill Burette with {buretteReagentName.split(':')[0]}</button>
                ) : (
                  <div className="text-emerald-400 font-medium py-1">✓ Filled (50.0 cm³)</div>
                )}
              </div>

              {/* 2. Pipette & Flask */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-violet-400 block">2. Pipette & Conical Flask</span>
                {!hasFlask ? (
                  <button onClick={handlePlaceTileAndFlask} className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium transition">Place White Tile & Flask</button>
                ) : pipetteState === 'empty' ? (
                  <button onClick={handleDrawBaseWithPipette} className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition">Pipette 25.0 cm³ of {pipetteReagentName.split(':')[0]}</button>
                ) : (
                  <button onClick={handleDispensePipetteToFlask} className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition">Dispense into Flask</button>
                )}
              </div>

              {/* 3. Indicator */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-rose-400 block">3. Add Indicator</span>
                <button onClick={handleAddIndicatorDrop} className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition">+1 Drop ({indicatorDrops} drops added)</button>
              </div>

              {/* 4. Delivery Controls */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 block">4. Titration Delivery Tap</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleTitrate(0.10)} className="py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold">+0.10 cm³</button>
                  <button onClick={() => handleTitrate(1.00)} className="py-1.5 px-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] font-bold">+1.00 cm³</button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Draggable Canvas */}
          <div className="lg:col-span-8">
            <div 
              ref={benchRef}
              className="relative w-full h-[540px] bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 select-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            >
              <div className="absolute top-4 left-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                MODULAR SCHEMATIC BENCH • (APPARATUS ARE DRAGGABLE)
              </div>

              {/* Retort Stand */}
              {hasStand && (
                <div 
                  onMouseDown={e => handleStartDrag(e, 'stand')}
                  onTouchStart={e => handleStartDrag(e, 'stand')}
                  style={{ left: `${standPos.x}px`, top: `${standPos.y}px` }}
                  className="absolute z-20 cursor-grab active:cursor-grabbing"
                >
                  <div className="w-3 h-[420px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-t-sm shadow-xl" />
                  <div className="w-48 h-5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-md border border-slate-600 shadow-2xl -mt-1" />
                </div>
              )}

              {/* Conical Flask */}
              {hasFlask && (
                <div 
                  onMouseDown={e => handleStartDrag(e, 'flask')}
                  onTouchStart={e => handleStartDrag(e, 'flask')}
                  style={{ left: `${flaskPos.x}px`, top: `${flaskPos.y}px` }}
                  className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center"
                >
                  <div className="w-7 h-8 border-2 border-b-0 border-slate-300 rounded-t-sm" />
                  <div 
                    className="w-28 h-20 border-2 border-slate-300 rounded-b-2xl overflow-hidden shadow-2xl flex items-end justify-center"
                    style={{
                      clipPath: 'polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)',
                      backgroundColor: flaskSolutionColor
                    }}
                  />
                  <div className="text-[9px] font-mono text-slate-300 mt-1">
                    {(flaskBaseVolume + buretteDeliveredVolume).toFixed(1)} cm³
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
