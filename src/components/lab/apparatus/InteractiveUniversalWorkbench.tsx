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
  Flame,
  Thermometer,
  Sparkles,
  Play,
  Pause,
  Check,
  Snowflake,
  Activity,
  Layers,
  ArrowRight,
  FlaskConical,
  Scale,
  Clock,
  Square,
  Zap,
  Sliders,
  Gauge,
  Eye,
  Plus,
  Move
} from 'lucide-react';
import { ExperimentSpec, ApparatusItem } from '../../../types';

interface InteractiveUniversalWorkbenchProps {
  isExamMode?: boolean;
  currentStepIndex?: number;
  activeExperiment: ExperimentSpec;
  completedSteps?: number[];
  onStepComplete?: (stepId: number, simulatedValue?: number) => void;
  onTelemetryUpdate?: (data: any) => void;
}

export const InteractiveUniversalWorkbench: React.FC<InteractiveUniversalWorkbenchProps> = ({
  isExamMode = false,
  currentStepIndex = 0,
  activeExperiment,
  completedSteps = [],
  onStepComplete,
  onTelemetryUpdate
}) => {
  // Domain detection
  const isSolubilityMode = activeExperiment.simulationType === 'solubility' || 
    activeExperiment.title.toLowerCase().includes('solubility') || 
    activeExperiment.topic.toLowerCase().includes('solubility') ||
    activeExperiment.steps.some(s => s.instruction.toLowerCase().includes('crystall'));

  const isRateOfReaction = activeExperiment.title.toLowerCase().includes('rate of reaction') ||
    activeExperiment.topic.toLowerCase().includes('rate') ||
    activeExperiment.apparatus.some(a => a.name.toLowerCase().includes('magnesium') || a.name.toLowerCase().includes('stopwatch')) ||
    activeExperiment.steps.some(s => s.instruction.toLowerCase().includes('30 seconds') || s.instruction.toLowerCase().includes('magnesium'));

  const isOpticsMode = activeExperiment.title.toLowerCase().includes('prism') ||
    activeExperiment.title.toLowerCase().includes('refraction') ||
    activeExperiment.apparatus.some(a => a.name.toLowerCase().includes('prism') || a.name.toLowerCase().includes('optical pin'));

  // Active Procedure (Procedure 1 vs Procedure 2 etc.)
  const [activeProcedureNumber, setActiveProcedureNumber] = useState<number>(1);

  // Placed apparatus on the virtual workbench
  const [placedApparatusIds, setPlacedApparatusIds] = useState<string[]>(() => {
    return (activeExperiment.apparatus || []).slice(0, 4).map(a => a.id);
  });

  // Reaction Vessel Type: 'boiling_tube' | 'conical_flask' | 'beaker' | 'soft_board'
  const defaultVessel = isOpticsMode 
    ? 'soft_board' 
    : (isSolubilityMode && activeProcedureNumber === 1) || activeExperiment.steps.some(s => s.instruction.toLowerCase().includes('boiling tube')) 
      ? 'boiling_tube' 
      : 'conical_flask';

  const [activeVessel, setActiveVessel] = useState<'boiling_tube' | 'conical_flask' | 'beaker' | 'soft_board'>(defaultVessel);

  // Reaction Mixture & Vessel Contents
  const [liquidVolumeCm3, setLiquidVolumeCm3] = useState<number>(0.0);
  const [liquidName, setLiquidName] = useState<string>('Empty Vessel');
  const [addedSolidName, setAddedSolidName] = useState<string | null>(null);
  const [isSolidDissolved, setIsSolidDissolved] = useState<boolean>(false);
  const [, setHasIndicator] = useState<boolean>(false);
  const [isTitrationEndpointReached, setIsTitrationEndpointReached] = useState<boolean>(false);

  // Teacher Expected Results & Simulation Configuration
  const simConfig = activeExperiment.simulationConfig || {};
  const teacherExpectedColor = simConfig.colorAfter || '';
  const teacherExpectedColorHex = simConfig.colorHexAfter || '';
  const teacherInitialColor = simConfig.colorBefore || 'Colourless';
  const teacherInitialColorHex = simConfig.colorHexBefore || '#e0f2fe';
  const teacherExpectedObs = simConfig.expectedObservation || activeExperiment.steps[currentStepIndex]?.expectedResult || '';
  const teacherExpectedGas = simConfig.expectedGas && simConfig.expectedGas !== 'None' ? simConfig.expectedGas : null;
  const teacherPrecipitate = simConfig.precipitateName || (teacherExpectedColor.toLowerCase().includes('precipitate') ? teacherExpectedColor : null);

  // Burette Equipment & Dynamic Reagent Detection
  const hasBuretteEquipment = (
    isSolubilityMode || 
    activeExperiment.simulationType === 'titration' ||
    (activeExperiment.apparatus || []).some(a => /(?:burette|burrete|burrette|buret)/i.test(a.name) || a.icon === 'Burette') ||
    (activeExperiment.steps || []).some(s => /(?:burette|burrete|burrette|buret|titrat)/i.test(s.instruction))
  );

  const dynamicBuretteSolution = (() => {
    for (const step of activeExperiment.steps) {
      const match = step.instruction.match(/(?:fill|rinse)\s+(?:the\s+)?(?:burette|burrete|burrette)\s+with\s+([^,\n\r.]+)/i);
      if (match && match[1]) return match[1].trim();
    }
    const found = (activeExperiment.apparatus || []).find(a => 
      /(?:hydrochloric|hcl|acid|titrant|solution\s*n\b)/i.test(a.name) && !/(?:burette|stand)/i.test(a.name)
    );
    if (found) return found.name;
    return isSolubilityMode && activeProcedureNumber === 1 ? 'Distilled Water' : 'Solution N (Dilute Acid)';
  })();

  const [isReactionOccurred, setIsReactionOccurred] = useState<boolean>(false);
  const [, setDispensedReagents] = useState<string[]>([]);

  // Thermal & Reaction Simulation State
  const [temperature, setTemperature] = useState<number>(22.0); // ambient °C
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [isCoolingInBath, setIsCoolingInBath] = useState<boolean>(false);
  const [isReactingExothermic, setIsReactingExothermic] = useState<boolean>(false);
  const [, setReactionProgressSeconds] = useState<number>(0);
  const [isCrystallized, setIsCrystallized] = useState<boolean>(false);
  const [crystallizationTemperature, setCrystallizationTemperature] = useState<number | null>(null);

  // Burette State (for titration & solubility)
  const [buretteLiquid, setBuretteLiquid] = useState<string>(dynamicBuretteSolution);
  const [buretteLevel, setBuretteLevel] = useState<number>(0.00);
  const [isBuretteFilling, setIsBuretteFilling] = useState<boolean>(false);

  // Digital Stopwatch State
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const stopwatchIntervalRef = useRef<any>(null);

  // Optics State
  const [incidentAngleI, setIncidentAngleI] = useState<number>(30);
  const [arePinsPlaced, setArePinsPlaced] = useState<boolean>(false);

  // Bench Notification Banner
  const [benchNotification, setBenchNotification] = useState<{ msg: string; type: 'success' | 'info' | 'warn' } | null>({
    msg: isRateOfReaction 
      ? 'Workbench ready: Measure 20cm³ Solution K into boiling tube, record initial temperature, then add magnesium ribbon and start stopwatch.'
      : isSolubilityMode
        ? 'Workbench ready: Mount burette with distilled water and prepare boiling tube with Solid A.'
        : 'Universal virtual science workbench active. Apparatus are freely movable across the bench.',
    type: 'info'
  });

  // Recorded Experimental Trials (Table 1 / Table 2 rows)
  const [recordedTrials, setRecordedTrials] = useState<Array<{ 
    label?: string;
    time?: number; 
    temp?: number; 
    volume?: number; 
    solubility?: number; 
    observation?: string;
    col_1?: number;
    col_2?: number | string;
    col_3?: string;
  }>>([]);

  // ================= MOVABLE APPARATUS POSITIONS =================
  const DEFAULT_POSITIONS = {
    vessel: { x: 380, y: 170 },
    burner: { x: 190, y: 390 },
    coldBath: { x: 620, y: 390 },
    stopwatch: { x: 30, y: 80 },
    reagents: { x: 740, y: 80 },
    burette: { x: 380, y: 20 },
    balance: { x: 30, y: 400 },
    prism: { x: 380, y: 220 }
  };

  const [vesselPos, setVesselPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.vessel);
  const [burnerPos, setBurnerPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.burner);
  const [coldBathPos, setColdBathPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.coldBath);
  const [stopwatchPos, setStopwatchPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.stopwatch);
  const [reagentsPos, setReagentsPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.reagents);
  const [burettePos, setBurettePos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.burette);
  const [balancePos, setBalancePos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.balance);
  const [prismPos, setPrismPos] = useState<{ x: number; y: number }>(DEFAULT_POSITIONS.prism);

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  // Current Step
  const currentStep = activeExperiment?.steps?.[currentStepIndex] || null;

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, itemKey: string) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();

    const mouseX = clientX - benchRect.left;
    const mouseY = clientY - benchRect.top;

    let initialPos = vesselPos;
    if (itemKey === 'burner') initialPos = burnerPos;
    else if (itemKey === 'coldBath') initialPos = coldBathPos;
    else if (itemKey === 'stopwatch') initialPos = stopwatchPos;
    else if (itemKey === 'reagents') initialPos = reagentsPos;
    else if (itemKey === 'burette') initialPos = burettePos;
    else if (itemKey === 'balance') initialPos = balancePos;
    else if (itemKey === 'prism') initialPos = prismPos;

    setDraggingItem(itemKey);
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

      const newX = Math.round(Math.max(10, Math.min(benchRect.width - 160, mouseX - dragOffset.x)));
      const newY = Math.round(Math.max(10, Math.min(benchRect.height - 140, mouseY - dragOffset.y)));

      if (draggingItem === 'vessel') {
        setVesselPos({ x: newX, y: newY });
        // Proximity to cold water bath
        const distToBath = Math.hypot(newX - coldBathPos.x, newY - coldBathPos.y);
        if (distToBath < 80 && !isCoolingInBath && !isHeating) {
          setIsCoolingInBath(true);
          setBenchNotification({ msg: '❄️ Reaction vessel placed into cold water bath. Cooling commenced.', type: 'info' });
        }
      } else if (draggingItem === 'burner') {
        setBurnerPos({ x: newX, y: newY });
        // Proximity to vessel
        const distToVessel = Math.hypot(newX - vesselPos.x, newY - vesselPos.y);
        if (distToVessel < 75 && !isHeating) {
          setIsHeating(true);
          setIsCoolingInBath(false);
          setBenchNotification({ msg: '🔥 Bunsen burner placed under vessel. Ignited and heating mixture.', type: 'info' });
        }
      } else if (draggingItem === 'coldBath') {
        setColdBathPos({ x: newX, y: newY });
      } else if (draggingItem === 'stopwatch') {
        setStopwatchPos({ x: newX, y: newY });
      } else if (draggingItem === 'reagents') {
        setReagentsPos({ x: newX, y: newY });
      } else if (draggingItem === 'burette') {
        setBurettePos({ x: newX, y: newY });
      } else if (draggingItem === 'balance') {
        setBalancePos({ x: newX, y: newY });
      } else if (draggingItem === 'prism') {
        setPrismPos({ x: newX, y: newY });
      }
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
  }, [draggingItem, dragOffset, vesselPos, burnerPos, coldBathPos, isCoolingInBath, isHeating]);

  const handleResetPositions = () => {
    setVesselPos(DEFAULT_POSITIONS.vessel);
    setBurnerPos(DEFAULT_POSITIONS.burner);
    setColdBathPos(DEFAULT_POSITIONS.coldBath);
    setStopwatchPos(DEFAULT_POSITIONS.stopwatch);
    setReagentsPos(DEFAULT_POSITIONS.reagents);
    setBurettePos(DEFAULT_POSITIONS.burette);
    setBalancePos(DEFAULT_POSITIONS.balance);
    setPrismPos(DEFAULT_POSITIONS.prism);
    setBenchNotification({ msg: 'All apparatus neatly repositioned on the teakwood workbench.', type: 'info' });
  };

  // Kinetics Curve for Magnesium + Hydrochloric Acid (Rate of Reaction)
  const getRateTemperatureAtTime = (sec: number): number => {
    if (sec <= 0) return 22.0;
    if (sec <= 30) return Math.round((22.0 + (sec / 30) * 4.5) * 10) / 10;
    if (sec <= 60) return Math.round((26.5 + ((sec - 30) / 30) * 6.5) * 10) / 10;
    if (sec <= 90) return Math.round((33.0 + ((sec - 60) / 30) * 8.5) * 10) / 10;
    if (sec <= 120) return Math.round((41.5 + ((sec - 90) / 30) * 5.5) * 10) / 10;
    if (sec <= 150) return Math.round((47.0 + ((sec - 120) / 30) * 2.5) * 10) / 10;
    if (sec <= 180) return Math.round((49.5 - ((sec - 150) / 30) * 1.5) * 10) / 10;
    return 48.0;
  };

  // Solubility crystallization curve
  const getCrystallizationPointForVolume = (vol: number): number => {
    if (vol <= 4.2) return 68.0;
    if (vol <= 5.2) return 59.0;
    if (vol <= 6.2) return 52.0;
    if (vol <= 7.2) return 45.0;
    return 39.0;
  };

  // Stopwatch ticking loop
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchSeconds(prev => {
          const next = prev + 1;
          if (isReactingExothermic) {
            setReactionProgressSeconds(next);
            const currentKineticTemp = getRateTemperatureAtTime(next);
            setTemperature(currentKineticTemp);
          }
          return next;
        });
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning, isReactingExothermic]);

  // Heating with Bunsen burner loop
  useEffect(() => {
    let interval: any = null;
    if (isHeating) {
      interval = setInterval(() => {
        setTemperature(prev => {
          if (prev >= 80.0) {
            setIsHeating(false);
            if (addedSolidName) {
              setIsSolidDissolved(true);
              setIsCrystallized(false);
              setBenchNotification({
                msg: `All ${addedSolidName} has completely dissolved into a clear solution at ${prev.toFixed(1)}°C. Ready to cool!`,
                type: 'success'
              });
            }
            return 80.0;
          }
          const next = prev + 3.0;
          if (next >= 65.0 && addedSolidName) {
            setIsSolidDissolved(true);
          }
          return Math.round(next * 10) / 10;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isHeating, addedSolidName]);

  // Cooling in Cold Water Bath loop
  useEffect(() => {
    let interval: any = null;
    if (isCoolingInBath && !isHeating) {
      const targetCrystTemp = getCrystallizationPointForVolume(liquidVolumeCm3 || 4.0);
      interval = setInterval(() => {
        setTemperature(prev => {
          if (prev <= targetCrystTemp) {
            setIsCrystallized(true);
            setCrystallizationTemperature(targetCrystTemp);
            setBenchNotification({
              msg: `❄️ Crystals of solid first appeared at ${targetCrystTemp.toFixed(1)}°C! Record this crystallization temperature into Table 1.`,
              type: 'success'
            });
            const curStep = activeExperiment.steps[currentStepIndex];
            if (curStep && curStep.instruction.toLowerCase().includes('crystall')) {
              onStepComplete?.(curStep.id, targetCrystTemp);
            }
            return targetCrystTemp;
          }
          const next = prev - 2.0;
          return Math.round(next * 10) / 10;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isCoolingInBath, isHeating, liquidVolumeCm3, currentStepIndex]);

  // Broadcast Telemetry updates to Answer Sheet
  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        temperature,
        stopwatchSeconds,
        liquidVolumeCm3,
        liquidName,
        addedSolidName,
        isReactionOccurred,
        isCrystallized,
        crystallizationTemperature,
        buretteLevel,
        recordedTrials,
        incidentAngleI
      });
    }
  }, [
    temperature, 
    stopwatchSeconds, 
    liquidVolumeCm3, 
    liquidName, 
    addedSolidName, 
    isReactionOccurred, 
    isCrystallized, 
    crystallizationTemperature, 
    buretteLevel, 
    recordedTrials,
    incidentAngleI
  ]);

  // Place/remove apparatus
  const handleTogglePlaceApparatus = (app: ApparatusItem) => {
    if (placedApparatusIds.includes(app.id)) {
      setPlacedApparatusIds(placedApparatusIds.filter(id => id !== app.id));
      setBenchNotification({ msg: `Returned ${app.name} to equipment storage.`, type: 'info' });
    } else {
      setPlacedApparatusIds([...placedApparatusIds, app.id]);
      setBenchNotification({ msg: `Placed ${app.name} onto the laboratory workbench.`, type: 'success' });
    }
  };

  // Liquid transfer
  const handleTransferLiquid = (reagentName: string, amount: number) => {
    const nextVol = +(liquidVolumeCm3 + amount).toFixed(1);
    setLiquidVolumeCm3(nextVol);
    setLiquidName(reagentName);
    setDispensedReagents(prev => [...prev, reagentName]);

    setBenchNotification({
      msg: `Dispensed ${amount} cm³ of ${reagentName} into vessel. Total: ${nextVol} cm³.`,
      type: 'success'
    });

    const currentStep = activeExperiment.steps[currentStepIndex];
    if (currentStep && (
      currentStep.instruction.toLowerCase().includes(reagentName.toLowerCase()) || 
      currentStep.instruction.toLowerCase().includes('measure') ||
      currentStep.instruction.toLowerCase().includes('pour') ||
      currentStep.instruction.toLowerCase().includes('add')
    )) {
      onStepComplete?.(currentStep.id, nextVol);
    }
  };

  // Add Solid
  const handleAddSolidOrSpecimen = (specimenName: string) => {
    setAddedSolidName(specimenName);
    setIsSolidDissolved(false);

    const isMagnesiumToAcid = (
      specimenName.toLowerCase().includes('magnesium') || 
      specimenName.toLowerCase().includes('ribbon')
    );

    if (isMagnesiumToAcid) {
      setIsReactingExothermic(true);
      if (!isStopwatchRunning) {
        setIsStopwatchRunning(true);
      }
      setBenchNotification({
        msg: `⚡ Placed ${specimenName} into acid! Vigorous effervescence of hydrogen gas commenced. Stopwatch running. Record temperature every 30s!`,
        type: 'success'
      });
    } else {
      setBenchNotification({
        msg: `Placed ${specimenName} into the reaction container.`,
        type: 'success'
      });
    }

    const currentStep = activeExperiment.steps[currentStepIndex];
    if (currentStep && (
      currentStep.instruction.toLowerCase().includes('place') ||
      currentStep.instruction.toLowerCase().includes('add') ||
      currentStep.instruction.toLowerCase().includes(specimenName.toLowerCase()) ||
      currentStep.instruction.toLowerCase().includes('ribbon')
    )) {
      onStepComplete?.(currentStep.id, 1);
    }
  };

  // Log reading into Table
  const handleLogCurrentReading = () => {
    const newEntry = {
      label: `${stopwatchSeconds}s`,
      time: stopwatchSeconds,
      temp: temperature,
      col_1: stopwatchSeconds,
      col_2: temperature,
      col_3: isReactingExothermic ? 'Rapid effervescence / hot mixture' : 'Stable observation',
      observation: isReactingExothermic ? 'Rapid bubbling of gas' : 'Normal',
      volume: liquidVolumeCm3
    };

    setRecordedTrials(prev => {
      const filtered = prev.filter(p => p.time !== stopwatchSeconds);
      return [...filtered, newEntry].sort((a, b) => (a.time || 0) - (b.time || 0));
    });

    setBenchNotification({
      msg: `Recorded reading: Time = ${stopwatchSeconds}s, Temperature = ${temperature.toFixed(1)}°C. Saved for table!`,
      type: 'success'
    });

    const currentStep = activeExperiment.steps[currentStepIndex];
    if (currentStep && currentStep.instruction.toLowerCase().includes('record')) {
      onStepComplete?.(currentStep.id, temperature);
    }
  };

  // Fill Burette
  const handleFillBurette = (solution: string) => {
    setIsBuretteFilling(true);
    setBuretteLiquid(solution);
    setTimeout(() => {
      setIsBuretteFilling(false);
      setBuretteLevel(0.00);
      setBenchNotification({
        msg: `Burette filled to 0.00 cm³ mark with ${solution}. Meniscus adjusted.`,
        type: 'success'
      });
      const currentStep = activeExperiment.steps[currentStepIndex];
      if (currentStep && currentStep.instruction.toLowerCase().includes('burette')) {
        onStepComplete?.(currentStep.id, 0.00);
      }
    }, 400);
  };

  // Titrate
  const handleTitrateStep = () => {
    const titre = 24.50;
    setBuretteLevel(titre);
    setIsTitrationEndpointReached(true);
    const endDesc = teacherExpectedObs || teacherExpectedColor || 'Permanent end-point reached';
    setBenchNotification({
      msg: `Titrated dropwise to equivalence end-point. ${endDesc} persisted at ${titre.toFixed(2)} cm³!`,
      type: 'success'
    });
    const currentStep = activeExperiment.steps[currentStepIndex];
    if (currentStep && (currentStep.instruction.toLowerCase().includes('titrate') || currentStep.instruction.toLowerCase().includes('table'))) {
      onStepComplete?.(currentStep.id, titre);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0 text-slate-100 text-xs">
      
      {/* Workbench Header & Procedure Switcher */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Universal Adaptive Laboratory Workbench</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                Movable 3D Bench
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeExperiment.title}
            </p>
          </div>
        </div>

        {/* Procedures Selector & Reset Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
            {(activeExperiment.procedures && activeExperiment.procedures.length > 0 
              ? activeExperiment.procedures 
              : [{ number: 1, title: 'Procedure I: Main Investigation' }]
            ).map(proc => (
              <button
                key={proc.number}
                type="button"
                onClick={() => setActiveProcedureNumber(proc.number)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeProcedureNumber === proc.number
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{proc.title.split(':')[0] || `Procedure ${proc.number}`}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetPositions}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1 shadow"
            title="Reset all apparatus positions to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Positions</span>
          </button>
        </div>
      </div>

      {/* TOP APPARATUS RACK: All Provided Equipment & Chemicals */}
      <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Provided Laboratory Apparatus ({activeExperiment.apparatus.length} items)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Apparatus are movable via click & drag</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activeExperiment.apparatus.map(item => {
            const isPlaced = placedApparatusIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTogglePlaceApparatus(item)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 shrink-0 transition ${
                  isPlaced
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 shadow-2xs font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate max-w-[180px]">{item.name}</span>
                {isPlaced && <span className="text-[9px] text-emerald-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Bench Notification Banner */}
      {benchNotification && (
        <div className={`p-2.5 px-4 border-b flex items-center justify-between text-xs ${
          benchNotification.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
            : benchNotification.type === 'warn'
              ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
              : 'bg-indigo-950/50 border-indigo-800/60 text-indigo-300'
        }`}>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{benchNotification.msg}</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">
            Step {currentStepIndex + 1}/{activeExperiment.steps.length}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REALISTIC LABORATORY WORKBENCH STAGE (EXPANSIVE 740PX+ CANVAS)           */}
      {/* ========================================================================= */}
      <div 
        ref={benchRef}
        className="relative w-full min-h-[720px] lg:min-h-[780px] overflow-hidden select-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #2a3447 0%, #111827 60%, #030712 100%)'
        }}
      >
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

        {/* TOP SCENE HUD (TELEMETRY + TOOLBAR) */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs z-30 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase">PHYSICAL BENCH • {activeVessel.toUpperCase()}</span>
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => setActiveVessel('boiling_tube')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeVessel === 'boiling_tube' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                Tube
              </button>
              <button
                type="button"
                onClick={() => setActiveVessel('conical_flask')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeVessel === 'conical_flask' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                Flask
              </button>
              <button
                type="button"
                onClick={() => setActiveVessel('beaker')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeVessel === 'beaker' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                Beaker
              </button>
            </div>
          </div>

          {/* Real-time LED Thermometer & State Readout */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-slate-950/90 backdrop-blur-md border border-rose-500/30 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-mono text-slate-400">Temp:</span>
              <strong className="font-mono text-sm text-rose-400">{temperature.toFixed(1)}°C</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsReactionOccurred(true);
                setBenchNotification({
                  msg: `✓ Verified reaction outcome: ${teacherExpectedObs || teacherExpectedColor || 'Reaction completed!'}`,
                  type: 'success'
                });
                const curStep = activeExperiment.steps[currentStepIndex];
                if (curStep) onStepComplete?.(curStep.id, temperature);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isReactionOccurred ? '✓ Observed' : 'Observe Outcome'}</span>
            </button>
          </div>
        </div>

        {/* ================= APPARATUS 1: THE REACTION VESSEL (MOVABLE) ================= */}
        <div 
          style={{ left: `${vesselPos.x}px`, top: `${vesselPos.y}px` }}
          className={`absolute z-25 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
            draggingItem === 'vessel' ? 'ring-2 ring-emerald-400/50 scale-[1.01] z-45' : ''
          }`}
        >
          {/* Drag Handle */}
          <div 
            onMouseDown={e => handleStartDrag(e, 'vessel')}
            onTouchStart={e => handleStartDrag(e, 'vessel')}
            className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-emerald-300 transition"
            title="Click and drag to move Reaction Vessel anywhere on the bench"
          >
            <Move className="w-2.5 h-2.5 text-emerald-400" />
            <span className="font-bold">VESSEL (DRAG)</span>
            {isHeating && <span className="text-amber-400 font-bold ml-1">🔥 Heated</span>}
            {isCoolingInBath && <span className="text-cyan-400 font-bold ml-1">❄️ In Bath</span>}
          </div>

          {/* Boiling Tube Graphic */}
          {activeVessel === 'boiling_tube' && (
            <div className="relative flex flex-col items-center">
              {/* Thermometer inserted into tube */}
              <div className="w-2.5 h-24 bg-slate-300 border border-slate-500 rounded-t flex flex-col justify-end overflow-hidden mb-[-12px] z-10 shadow-sm">
                <div 
                  className="w-full bg-rose-500 transition-all duration-300" 
                  style={{ height: `${Math.min(100, Math.max(10, (temperature / 100) * 100))}%` }}
                />
              </div>

              {/* Pyrex Boiling Tube Body */}
              <div 
                className="relative w-18 h-48 border-2 border-slate-300/80 rounded-b-3xl flex flex-col justify-end p-1 overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 100%)',
                  backdropFilter: 'blur(1px)'
                }}
              >
                {/* Specular sheen */}
                <div className="absolute inset-y-0 left-1 w-0.5 bg-white/40 pointer-events-none" />

                {/* Liquid Solution Level */}
                {liquidVolumeCm3 > 0 && (
                  <div 
                    className="w-full rounded-b-2xl transition-all duration-700 flex flex-col justify-end items-center relative overflow-hidden shadow-inner"
                    style={{ 
                      height: `${Math.min(92, Math.max(28, (liquidVolumeCm3 / 25) * 80))}%`,
                      backgroundColor: isReactionOccurred 
                        ? (teacherExpectedColorHex || (isTitrationEndpointReached ? '#f472b6' : isReactingExothermic ? '#fed7aa' : '#bae6fd'))
                        : (teacherInitialColorHex || '#e0f2fe')
                    }}
                  >
                    {/* Animated bubbles */}
                    {(isReactingExothermic || (isReactionOccurred && teacherExpectedGas)) && (
                      <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-85 pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" />
                      </div>
                    )}

                    {/* Precipitate */}
                    {(isReactionOccurred && (teacherPrecipitate || teacherExpectedColor.toLowerCase().includes('precipitate'))) && (
                      <div 
                        className="w-full py-1 text-center text-[9px] font-bold text-slate-900 border-t border-black/20 shadow-xs"
                        style={{ backgroundColor: teacherExpectedColorHex || '#facc15' }}
                      >
                        <span className="truncate block px-1">{teacherPrecipitate || 'Precipitate'}</span>
                      </div>
                    )}

                    {/* Crystals */}
                    {isCrystallized && (
                      <div className="w-full text-center pb-2 text-[10px] text-cyan-800 font-bold animate-pulse flex items-center justify-center gap-0.5">
                        <Snowflake className="w-3 h-3 text-cyan-600" />
                        <span>Crystals</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Solid or Mg Ribbon */}
                {addedSolidName && (
                  <div className="w-full p-1 bg-slate-300 border-t border-slate-400 rounded-b-2xl shadow-inner flex items-center justify-center text-[8px] font-bold text-slate-800">
                    {isReactingExothermic ? 'Mg Ribbon (Reacting)' : addedSolidName.substring(0, 16)}
                  </div>
                )}
              </div>

              {/* Wooden Tube Clamp Stand Base */}
              <div className="w-28 h-6 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border border-amber-700 rounded-md shadow-xl flex items-center justify-center">
                <span className="text-[7px] font-mono text-amber-300 font-bold">PYREX TUBE STAND</span>
              </div>
            </div>
          )}

          {/* Conical Flask or Beaker Graphic */}
          {activeVessel !== 'boiling_tube' && activeVessel !== 'soft_board' && (
            <div className="relative flex flex-col items-center">
              {/* Flask Neck */}
              <div 
                className={`${activeVessel === 'beaker' ? 'w-24 h-4 border-t-2' : 'w-10 h-8 border-x-2 border-t-2'} border-slate-300 rounded-t-sm`}
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 100%)' }}
              />

              {/* Vessel Body */}
              <div 
                className={`relative ${activeVessel === 'beaker' ? 'w-36 h-32 rounded-b-xl border-2' : 'w-40 h-34 rounded-b-3xl border-2'} border-slate-300 flex flex-col justify-end p-2 overflow-hidden shadow-2xl transition-colors duration-500`}
                style={{
                  clipPath: activeVessel === 'beaker' ? 'none' : 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                  backgroundColor: liquidVolumeCm3 > 0
                    ? (isReactionOccurred
                        ? (teacherExpectedColorHex || (isTitrationEndpointReached ? '#f472b6' : '#bae6fd'))
                        : (teacherInitialColorHex || '#e0f2fe'))
                    : 'transparent'
                }}
              >
                {/* Effervescence Bubbles */}
                {(isReactingExothermic || (isReactionOccurred && teacherExpectedGas)) && (
                  <div className="absolute inset-0 flex justify-around items-center opacity-85 animate-pulse pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" />
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                  </div>
                )}

                {/* Precipitate */}
                {isReactionOccurred && (teacherPrecipitate || teacherExpectedColor.toLowerCase().includes('precipitate')) && (
                  <div 
                    className="w-full py-1 text-center text-[10px] font-bold text-slate-900 border-t border-black/20 rounded shadow-xs mb-1"
                    style={{ backgroundColor: teacherExpectedColorHex || '#facc15' }}
                  >
                    ✓ {teacherPrecipitate || teacherExpectedColor}
                  </div>
                )}

                {/* Outcome badge */}
                {isReactionOccurred && (
                  <div className="w-full text-center pb-1 text-[9px] font-bold text-slate-900 bg-white/80 rounded px-1 shadow-xs">
                    {teacherExpectedColor || teacherExpectedObs || 'Reaction Completed'}
                  </div>
                )}
              </div>

              {/* Vol tag */}
              <div className="mt-1 text-[9px] font-mono bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded text-slate-300 shadow">
                {liquidVolumeCm3 > 0 ? `${liquidVolumeCm3.toFixed(1)} cm³ (${liquidName})` : 'Empty Vessel'}
              </div>
            </div>
          )}

          {/* Soft Board & Prism Graphic (Optics) */}
          {activeVessel === 'soft_board' && (
            <div className="relative w-64 h-52 bg-amber-900/60 border-2 border-amber-700 rounded-xl shadow-2xl flex flex-col items-center justify-center p-3">
              <span className="text-[8px] font-mono text-amber-300 font-bold mb-2">OPTICAL SOFT BOARD WITH DRAWING PAPER</span>
              
              {/* Triangular Glass Prism */}
              <div 
                className="w-28 h-24 border-2 border-cyan-400 bg-cyan-200/30 flex items-center justify-center shadow-lg relative"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              >
                <span className="text-[9px] font-bold text-cyan-900">PRISM (60°)</span>
              </div>

              {/* Pins placed */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setArePinsPlaced(!arePinsPlaced)}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${arePinsPlaced ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  {arePinsPlaced ? '✓ Pins P1, P2 Placed' : 'Place Optical Pins'}
                </button>
                <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300">
                  <span>∠i:</span>
                  <input 
                    type="range" 
                    min={20} 
                    max={65} 
                    value={incidentAngleI} 
                    onChange={e => setIncidentAngleI(+e.target.value)}
                    className="w-16 accent-amber-500" 
                  />
                  <span>{incidentAngleI}°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= APPARATUS 2: BUNSEN BURNER (MOVABLE) ================= */}
        <div 
          style={{ left: `${burnerPos.x}px`, top: `${burnerPos.y}px` }}
          className={`absolute z-20 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
            draggingItem === 'burner' ? 'ring-2 ring-amber-400/50 scale-[1.02] z-40' : ''
          }`}
        >
          {/* Burner Drag Handle */}
          <div 
            onMouseDown={e => handleStartDrag(e, 'burner')}
            onTouchStart={e => handleStartDrag(e, 'burner')}
            className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/90 border border-amber-500/40 text-amber-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-amber-300 transition"
            title="Click and drag to position Bunsen Burner"
          >
            <Move className="w-2.5 h-2.5 text-amber-400" />
            <span className="font-bold">BUNSEN BURNER (DRAG)</span>
          </div>

          <div className="relative flex flex-col items-center">
            {/* Animated Flame */}
            {isHeating ? (
              <div className="flex flex-col items-center animate-bounce mb-[-4px]">
                <div className="w-5 h-9 bg-gradient-to-t from-blue-500 via-amber-400 to-amber-200 rounded-full blur-[1px] shadow-lg" />
                <span className="text-[7px] font-mono text-amber-300 font-bold">ROARING FLAME</span>
              </div>
            ) : (
              <div className="h-6" />
            )}

            {/* Chrome Barrel */}
            <div className="w-4 h-16 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 border border-slate-400 rounded-t-sm shadow-md" />

            {/* Knurled Air Collar */}
            <div className="w-5 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded border border-amber-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Heavy Cast Iron Base */}
            <div className="w-20 h-5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-md border border-slate-500 shadow-xl flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsCoolingInBath(false);
                  setIsHeating(!isHeating);
                  setBenchNotification({
                    msg: !isHeating ? 'Bunsen burner ignited. Heating mixture.' : 'Bunsen flame turned off.',
                    type: 'info'
                  });
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-bold ${isHeating ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'}`}
              >
                {isHeating ? 'FLAME ON' : 'IGNITE'}
              </button>
            </div>
          </div>
        </div>

        {/* ================= APPARATUS 3: COLD WATER BATH (MOVABLE) ================= */}
        <div 
          style={{ left: `${coldBathPos.x}px`, top: `${coldBathPos.y}px` }}
          className={`absolute z-15 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
            draggingItem === 'coldBath' ? 'ring-2 ring-cyan-400/50 scale-[1.02] z-40' : ''
          }`}
        >
          {/* Cold Bath Drag Handle */}
          <div 
            onMouseDown={e => handleStartDrag(e, 'coldBath')}
            onTouchStart={e => handleStartDrag(e, 'coldBath')}
            className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-cyan-300 transition"
            title="Click and drag to position Cold Water Bath"
          >
            <Move className="w-2.5 h-2.5 text-cyan-400" />
            <span className="font-bold">COLD WATER BATH (DRAG)</span>
          </div>

          <div className="relative w-36 h-22 border-2 border-cyan-400/60 rounded-b-2xl bg-cyan-600/30 backdrop-blur-xs shadow-xl flex flex-col justify-end p-2 overflow-hidden">
            {/* Ice Cubes inside */}
            <div className="flex items-center justify-around pb-1 opacity-80">
              <div className="w-4 h-4 bg-white/70 border border-cyan-200 rounded rotate-12 shadow-xs" />
              <div className="w-5 h-5 bg-white/80 border border-cyan-200 rounded -rotate-6 shadow-xs" />
              <div className="w-4 h-4 bg-white/70 border border-cyan-200 rounded rotate-45 shadow-xs" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsHeating(false);
                setIsCoolingInBath(!isCoolingInBath);
                setBenchNotification({
                  msg: !isCoolingInBath ? 'Cold water bath activated for cooling & crystallization.' : 'Removed from cold bath.',
                  type: 'info'
                });
              }}
              className={`w-full py-0.5 rounded text-[8px] font-bold text-center ${isCoolingInBath ? 'bg-cyan-500 text-white' : 'bg-slate-900/80 text-cyan-200'}`}
            >
              {isCoolingInBath ? 'COOLING ACTIVE' : 'USE COLD BATH'}
            </button>
          </div>
        </div>

        {/* ================= APPARATUS 4: DIGITAL STOPWATCH (MOVABLE) ================= */}
        <div 
          style={{ left: `${stopwatchPos.x}px`, top: `${stopwatchPos.y}px` }}
          className={`absolute z-30 flex flex-col pointer-events-auto select-none transition-shadow ${
            draggingItem === 'stopwatch' ? 'ring-2 ring-indigo-400/50 scale-[1.02] z-45' : ''
          }`}
        >
          {/* Stopwatch Drag Handle */}
          <div 
            onMouseDown={e => handleStartDrag(e, 'stopwatch')}
            onTouchStart={e => handleStartDrag(e, 'stopwatch')}
            className="cursor-grab active:cursor-grabbing mb-1 flex items-center justify-between gap-1 bg-slate-950/90 border border-indigo-500/40 text-indigo-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-indigo-300 transition"
            title="Click and drag to move Digital Stopwatch"
          >
            <div className="flex items-center gap-1">
              <Move className="w-2 h-2 text-indigo-400" />
              <span className="font-bold">STOPWATCH</span>
            </div>
            <Clock className="w-2.5 h-2.5 text-indigo-400" />
          </div>

          <div className="w-48 bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 shadow-2xl space-y-2">
            {/* Big LED Display */}
            <div className="py-1 text-center bg-black text-emerald-400 font-mono text-xl font-bold rounded-lg border border-slate-800 shadow-inner">
              {Math.floor(stopwatchSeconds / 60).toString().padStart(2, '0')}:
              {(stopwatchSeconds % 60).toString().padStart(2, '0')}.00
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={`py-1 px-1 rounded font-bold text-[10px] flex items-center justify-center gap-0.5 ${
                  isStopwatchRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isStopwatchRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isStopwatchRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsStopwatchRunning(false);
                  setStopwatchSeconds(0);
                  setReactionProgressSeconds(0);
                }}
                className="py-1 px-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-[10px] flex items-center justify-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleLogCurrentReading}
                className="py-1 px-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center gap-0.5"
                title="Log current time & temperature into table"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= APPARATUS 5: CHEMICAL REAGENTS & SOLIDS TRAY (MOVABLE) ================= */}
        <div 
          style={{ left: `${reagentsPos.x}px`, top: `${reagentsPos.y}px` }}
          className={`absolute z-30 flex flex-col pointer-events-auto select-none transition-shadow ${
            draggingItem === 'reagents' ? 'ring-2 ring-sky-400/50 scale-[1.02] z-45' : ''
          }`}
        >
          {/* Reagents Drag Handle */}
          <div 
            onMouseDown={e => handleStartDrag(e, 'reagents')}
            onTouchStart={e => handleStartDrag(e, 'reagents')}
            className="cursor-grab active:cursor-grabbing mb-1 flex items-center justify-between gap-1 bg-slate-950/90 border border-sky-500/40 text-sky-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow hover:border-sky-300 transition"
            title="Click and drag to move Reagent Shelf"
          >
            <div className="flex items-center gap-1">
              <Move className="w-2 h-2 text-sky-400" />
              <span className="font-bold">REAGENTS TRAY</span>
            </div>
            <Droplet className="w-2.5 h-2.5 text-sky-400" />
          </div>

          <div className="w-56 bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 shadow-2xl space-y-2 max-h-72 overflow-y-auto">
            {/* Liquid Reagents */}
            {(() => {
              const liquids = (activeExperiment.apparatus || []).filter(a => {
                const n = a.name.toLowerCase();
                return n.includes('solution') || n.includes('acid') || n.includes('water') || 
                  n.includes('liquid') || n.includes('reagent') || n.includes('extract') ||
                  n.includes('hcl') || n.includes('naoh') || n.includes('iodine');
              });

              if (liquids.length === 0) {
                return (
                  <div className="text-[10px] text-slate-500 italic p-1">No liquid reagents required.</div>
                );
              }

              return liquids.map(liq => (
                <div key={liq.id} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-sky-300 block truncate" title={liq.name}>{liq.name}</span>
                  <div className="flex gap-1">
                    {[5, 10, 20].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleTransferLiquid(liq.name, amt)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-sky-700 text-slate-200 text-[9px] font-semibold transition"
                      >
                        +{amt}cm³
                      </button>
                    ))}
                  </div>
                </div>
              ));
            })()}

            {/* Solids & Specimens */}
            {(() => {
              const solids = (activeExperiment.apparatus || []).filter(a => {
                const n = a.name.toLowerCase();
                return n.includes('solid') || n.includes('magnesium') || n.includes('ribbon') || 
                  n.includes('zinc') || n.includes('powder') || n.includes('chips') || n.includes('specimen');
              });

              return solids.map(solidItem => (
                <button
                  key={solidItem.id}
                  type="button"
                  onClick={() => handleAddSolidOrSpecimen(solidItem.name)}
                  disabled={addedSolidName === solidItem.name}
                  className={`w-full py-1 px-1.5 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    addedSolidName === solidItem.name
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <Scale className="w-2.5 h-2.5" />
                  <span className="truncate">{addedSolidName === solidItem.name ? `✓ ${solidItem.name}` : `Add ${solidItem.name}`}</span>
                </button>
              ));
            })()}

            {/* Burette Controls if burette present */}
            {hasBuretteEquipment && (
              <div className="pt-1 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Burette:</span>
                  <span className="text-cyan-400 font-bold">{buretteLevel.toFixed(2)} cm³</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => handleFillBurette(dynamicBuretteSolution)}
                    disabled={isBuretteFilling}
                    className="py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-bold"
                  >
                    Refill 0.00
                  </button>
                  <button
                    type="button"
                    onClick={handleTitrateStep}
                    className="py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold"
                  >
                    Titrate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= APPARATUS 6: RETORT STAND WITH BURETTE (MOVABLE, IF APPLICABLE) ================= */}
        {hasBuretteEquipment && (
          <div 
            style={{ left: `${burettePos.x}px`, top: `${burettePos.y}px` }}
            className={`absolute z-18 flex flex-col items-center pointer-events-auto select-none transition-shadow ${
              draggingItem === 'burette' ? 'ring-2 ring-cyan-400/50 scale-[1.01] z-40' : ''
            }`}
          >
            <div 
              onMouseDown={e => handleStartDrag(e, 'burette')}
              onTouchStart={e => handleStartDrag(e, 'burette')}
              className="cursor-grab active:cursor-grabbing mb-1 flex items-center gap-1 bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-[8px] font-mono px-2 py-0.5 rounded-full shadow"
              title="Click and drag to position Burette Stand"
            >
              <Move className="w-2 h-2 text-cyan-400" />
              <span>BURETTE STAND (DRAG)</span>
            </div>

            <div className="relative w-12 h-64 flex flex-col items-center">
              <div className="w-2 h-60 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 shadow-md" />
              <div className="absolute top-10 w-8 h-2 bg-slate-600 rounded" />
              {/* Glass Burette column */}
              <div className="absolute top-4 left-6 w-5 h-48 border border-slate-300 bg-sky-100/30 rounded-t flex flex-col justify-end overflow-hidden shadow-lg">
                <div 
                  className="w-full bg-cyan-400/50 transition-all duration-300"
                  style={{ height: `${Math.max(10, 100 - (buretteLevel / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}



      </div>

      {/* ========================================================================= */}
      {/* BOTTOM WORKBENCH CONSOLE: RECORDED TRIALS & STEP VALIDATION CARD           */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Trials Mini Table */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recorded Trials & Laboratory Data ({recordedTrials.length})</span>
            </span>
            <button
              type="button"
              onClick={handleLogCurrentReading}
              className="text-[10px] font-bold text-indigo-400 hover:underline"
            >
              + Log Current ({temperature.toFixed(1)}°C)
            </button>
          </div>

          {recordedTrials.length === 0 ? (
            <div className="p-3 text-center text-slate-500 text-[11px] rounded bg-slate-950 border border-dashed border-slate-800">
              Click &quot;Log&quot; on the stopwatch or &quot;+ Log Current&quot; to capture data points for your table.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto font-mono text-[11px]">
              {recordedTrials.map((tr, idx) => (
                <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400">{tr.label || `${tr.time}s`}</span>
                  <span className="font-bold text-emerald-400">{tr.temp?.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step Validation Card */}
        {currentStep && (
          <div className="lg:col-span-6 bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Step {currentStepIndex + 1} • {currentStep.marks} mark{currentStep.marks > 1 ? 's' : ''}
              </span>
              {completedSteps.includes(currentStep.id) && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  ✓ Validated
                </span>
              )}
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {currentStep.instruction}
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => onStepComplete?.(currentStep.id, temperature)}
                disabled={completedSteps.includes(currentStep.id)}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedSteps.includes(currentStep.id) ? 'Validated' : 'Validate Step ' + currentStep.id}</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
