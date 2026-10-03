import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Activity, 
  Gauge, 
  ToggleLeft, 
  ToggleRight, 
  HelpCircle,
  PlusCircle,
  Move,
  History,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface CircuitLiveTelemetry {
  current: number;
  voltage: number;
  resistance: number;
  isSwitchClosed: boolean;
  isCircuitActive: boolean;
  isShortCircuit: boolean;
  isVoltmeterInSeries: boolean;
  isAmmeterInParallel: boolean;
  isReversePolarity: boolean;
  wiresCount: number;
  circuitStateText: string;
  scientificObservation: string;
}

interface Terminal {
  id: string;
  componentId: string;
  name: string;
  type: 'positive' | 'negative' | 'neutral';
  color: string;
  x: number; // offset within component
  y: number;
}

interface ComponentItem {
  id: string;
  type: 'battery' | 'switch' | 'ammeter' | 'voltmeter' | 'rheostat';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  terminals: Terminal[];
}

interface Wire {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  color: string;
}

interface CircuitSnapshot {
  placedComponents: ComponentItem[];
  wires: Wire[];
  isSwitchClosed: boolean;
  rheostatResistance: number;
}

interface InteractiveOhmsLawWorkbenchProps {
  onStepComplete?: (stepNumber: number) => void;
  onReadingsRecorded?: (reading: { current: number; voltage: number; resistance: number }) => void;
  onCircuitUpdate?: (telemetry: CircuitLiveTelemetry) => void;
  currentStepIndex?: number;
}

export const InteractiveOhmsLawWorkbench: React.FC<InteractiveOhmsLawWorkbenchProps> = ({
  onStepComplete,
  onReadingsRecorded,
  onCircuitUpdate,
  currentStepIndex = 0
}) => {
  // Available apparatus in shelf tray
  const TRAY_ITEMS = [
    { type: 'battery', name: '3.0V DC Battery Pack', icon: '🔋' },
    { type: 'ammeter', name: 'Analogue DC Ammeter (0-1.0A)', icon: '⏱️' },
    { type: 'rheostat', name: 'Variable Rheostat (0-20Ω)', icon: '🎛️' },
    { type: 'switch', name: 'Knife Contact Switch', icon: '🔌' },
    { type: 'voltmeter', name: 'DC Voltmeter (0-3.0V)', icon: '⚡' }
  ];

  // Placed components on the lab bench
  const [placedComponents, setPlacedComponents] = useState<ComponentItem[]>([]);
  // Active wires between terminals
  const [wires, setWires] = useState<Wire[]>([]);
  // Selected terminal for wire drawing
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [wireColor, setWireColor] = useState<string>('#ef4444');

  // Circuit electrical state
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [rheostatResistance, setRheostatResistance] = useState(6.0); // ohms

  // Dragging component state
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const benchRef = useRef<HTMLDivElement>(null);

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, comp: ComponentItem) => {
    // If clicking on a terminal button or slider, don't drag the apparatus body
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!benchRef.current) return;
    const benchRect = benchRef.current.getBoundingClientRect();
    
    const mouseX = clientX - benchRect.left;
    const mouseY = clientY - benchRect.top;

    setDraggingCompId(comp.id);
    setDragOffset({
      x: mouseX - comp.x,
      y: mouseY - comp.y
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingCompId || !benchRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const benchRect = benchRef.current.getBoundingClientRect();

      const mouseX = clientX - benchRect.left;
      const mouseY = clientY - benchRect.top;

      const newX = Math.round(Math.max(10, Math.min(benchRect.width - 150, mouseX - dragOffset.x)));
      const newY = Math.round(Math.max(10, Math.min(benchRect.height - 130, mouseY - dragOffset.y)));

      setPlacedComponents(prev => prev.map(c => c.id === draggingCompId ? { ...c, x: newX, y: newY } : c));
    };

    const handleEnd = () => {
      if (draggingCompId) {
        setDraggingCompId(null);
      }
    };

    if (draggingCompId) {
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
  }, [draggingCompId, dragOffset]);

  // In-bench notification banner
  const [benchMessage, setBenchMessage] = useState<{ text: string; type: 'warning' | 'info' | 'error' | 'success' } | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<CircuitSnapshot[]>([]);

  const pushSnapshot = () => {
    setHistory(prev => [
      ...prev,
      {
        placedComponents: JSON.parse(JSON.stringify(placedComponents)),
        wires: JSON.parse(JSON.stringify(wires)),
        isSwitchClosed,
        rheostatResistance
      }
    ]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));

    setPlacedComponents(previous.placedComponents);
    setWires(previous.wires);
    setIsSwitchClosed(previous.isSwitchClosed);
    setRheostatResistance(previous.rheostatResistance);
    setSelectedTerminal(null);
    setBenchMessage({ text: 'Reverted to previous circuit stage.', type: 'info' });
  };

  // Pre-defined default coordinates for apparatus when added
  const getInitialCoords = (type: string) => {
    switch (type) {
      case 'battery': return { x: 50, y: 50 };
      case 'ammeter': return { x: 260, y: 50 };
      case 'rheostat': return { x: 470, y: 50 };
      case 'switch': return { x: 260, y: 270 };
      case 'voltmeter': return { x: 470, y: 250 };
      default: return { x: 100, y: 100 };
    }
  };

  const createComponent = (type: string): ComponentItem => {
    const coords = getInitialCoords(type);
    switch (type) {
      case 'battery':
        return {
          id: 'comp-battery',
          type: 'battery',
          name: '3.0V DC Cell Pack',
          x: coords.x,
          y: coords.y,
          width: 140,
          height: 110,
          terminals: [
            { id: 'bat-pos', componentId: 'comp-battery', name: '(+) Red', type: 'positive', color: '#ef4444', x: 35, y: 10 },
            { id: 'bat-neg', componentId: 'comp-battery', name: '(-) Black', type: 'negative', color: '#0f172a', x: 105, y: 10 }
          ]
        };
      case 'ammeter':
        return {
          id: 'comp-ammeter',
          type: 'ammeter',
          name: 'DC Ammeter (0-1.0 A)',
          x: coords.x,
          y: coords.y,
          width: 140,
          height: 120,
          terminals: [
            { id: 'amm-pos', componentId: 'comp-ammeter', name: '(+) Red In', type: 'positive', color: '#ef4444', x: 30, y: 110 },
            { id: 'amm-neg', componentId: 'comp-ammeter', name: '(-) Black Out', type: 'negative', color: '#0f172a', x: 110, y: 110 }
          ]
        };
      case 'rheostat':
        return {
          id: 'comp-rheostat',
          type: 'rheostat',
          name: 'Rheostat (Variable Resistor)',
          x: coords.x,
          y: coords.y,
          width: 160,
          height: 110,
          terminals: [
            { id: 'rheo-in', componentId: 'comp-rheostat', name: 'Terminal A (In)', type: 'neutral', color: '#f59e0b', x: 20, y: 95 },
            { id: 'rheo-out', componentId: 'comp-rheostat', name: 'Slider Contact B', type: 'neutral', color: '#f59e0b', x: 140, y: 95 }
          ]
        };
      case 'switch':
        return {
          id: 'comp-switch',
          type: 'switch',
          name: 'Knife Switch',
          x: coords.x,
          y: coords.y,
          width: 130,
          height: 90,
          terminals: [
            { id: 'sw-t1', componentId: 'comp-switch', name: 'Terminal 1', type: 'neutral', color: '#64748b', x: 25, y: 45 },
            { id: 'sw-t2', componentId: 'comp-switch', name: 'Terminal 2', type: 'neutral', color: '#64748b', x: 105, y: 45 }
          ]
        };
      case 'voltmeter':
        return {
          id: 'comp-voltmeter',
          type: 'voltmeter',
          name: 'DC Voltmeter (0-3.0 V)',
          x: coords.x,
          y: coords.y,
          width: 140,
          height: 120,
          terminals: [
            { id: 'volt-pos', componentId: 'comp-voltmeter', name: '(+) Red', type: 'positive', color: '#ef4444', x: 30, y: 10 },
            { id: 'volt-neg', componentId: 'comp-voltmeter', name: '(-) Black', type: 'negative', color: '#0f172a', x: 110, y: 10 }
          ]
        };
      default:
        throw new Error('Unknown type');
    }
  };

  // Add component to bench
  const handlePlaceFromTray = (type: string) => {
    if (placedComponents.some(c => c.type === type)) {
      setBenchMessage({ text: `The ${type} is already on your workbench. You can drag it to position it.`, type: 'info' });
      return;
    }
    pushSnapshot();
    const newComp = createComponent(type);
    setPlacedComponents(prev => [...prev, newComp]);

    if (type === 'battery' && onStepComplete) {
      onStepComplete(1);
    }
    setBenchMessage({ text: `Placed ${newComp.name} on the workbench.`, type: 'info' });
  };

  // Terminal connection logic
  const handleTerminalClick = (terminal: Terminal) => {
    if (!selectedTerminal) {
      setSelectedTerminal(terminal);
      setBenchMessage({ text: `Selected terminal: ${terminal.name}. Now click target terminal to connect wire.`, type: 'info' });
    } else {
      if (selectedTerminal.id === terminal.id) {
        setSelectedTerminal(null);
        setBenchMessage({ text: 'Wire drawing cancelled.', type: 'info' });
        return;
      }
      if (selectedTerminal.componentId === terminal.componentId) {
        setBenchMessage({ text: 'Cannot connect two terminals on the same apparatus directly.', type: 'warning' });
        setSelectedTerminal(null);
        return;
      }

      // Check if connection already exists
      const exists = wires.some(
        w => (w.fromTerminalId === selectedTerminal.id && w.toTerminalId === terminal.id) ||
             (w.fromTerminalId === terminal.id && w.toTerminalId === selectedTerminal.id)
      );

      if (exists) {
        setBenchMessage({ text: 'These two terminals are already connected with a wire.', type: 'warning' });
        setSelectedTerminal(null);
        return;
      }

      pushSnapshot();

      // Automatically choose realistic wire color
      let color = wireColor;
      if (selectedTerminal.type === 'positive' || terminal.type === 'positive') {
        color = '#ef4444'; // Red for positive wire
      } else if (selectedTerminal.type === 'negative' || terminal.type === 'negative') {
        color = '#0284c7'; // Blue/Black for negative return
      } else if (selectedTerminal.componentId === 'comp-voltmeter' || terminal.componentId === 'comp-voltmeter') {
        color = '#eab308'; // Yellow for voltmeter
      }

      const newWire: Wire = {
        id: `wire-${Date.now().toString(36)}`,
        fromTerminalId: selectedTerminal.id,
        toTerminalId: terminal.id,
        color
      };

      const updatedWires = [...wires, newWire];
      setWires(updatedWires);
      setSelectedTerminal(null);
      setBenchMessage({ text: `Wire connected from ${selectedTerminal.name} to ${terminal.name}.`, type: 'success' });

      // Validate connection steps
      checkCircuitSteps(updatedWires, placedComponents);
    }
  };

  // Remove single wire
  const handleRemoveWire = (wireId: string) => {
    pushSnapshot();
    setWires(prev => prev.filter(w => w.id !== wireId));
    setBenchMessage({ text: 'Wire disconnected.', type: 'info' });
  };

  // Helper: check if two terminals are connected
  const areConnected = (t1: string, t2: string, wiresList = wires) => {
    return wiresList.some(
      w => (w.fromTerminalId === t1 && w.toTerminalId === t2) ||
           (w.fromTerminalId === t2 && w.toTerminalId === t1)
    );
  };

  // Check circuit verification
  const checkCircuitSteps = (currentWires = wires, comps = placedComponents) => {
    // Step 2: Battery (+) to Ammeter (+)
    if (areConnected('bat-pos', 'amm-pos', currentWires)) {
      if (onStepComplete) onStepComplete(2);
    }

    // Step 3: Ammeter (-) to Rheostat (In)
    if (areConnected('amm-neg', 'rheo-in', currentWires)) {
      if (onStepComplete) onStepComplete(3);
    }

    // Step 4: Series circuit closed:
    const rheoToSwitch = areConnected('rheo-out', 'sw-t1', currentWires) || areConnected('rheo-out', 'sw-t2', currentWires);
    const switchToBat = areConnected('sw-t2', 'bat-neg', currentWires) || areConnected('sw-t1', 'bat-neg', currentWires);
    if (rheoToSwitch && switchToBat) {
      if (onStepComplete) onStepComplete(4);
    }

    // Step 5: Voltmeter in parallel across Rheostat
    const voltPosConnected = areConnected('volt-pos', 'rheo-in', currentWires) || areConnected('volt-pos', 'amm-neg', currentWires);
    const voltNegConnected = areConnected('volt-neg', 'rheo-out', currentWires) || areConnected('volt-neg', 'sw-t1', currentWires);
    if (voltPosConnected && voltNegConnected) {
      if (onStepComplete) onStepComplete(5);
    }
  };

  // ================= CIRCUIT PHYSICS ENGINE (REAL & WRONG OBSERVATIONS) =================
  // 1. Direct Short Circuit: Battery connected to itself or through switch without resistor!
  const isDirectBatteryShort = 
    areConnected('bat-pos', 'bat-neg') || 
    (isSwitchClosed && (
      (areConnected('bat-pos', 'sw-t1') && areConnected('bat-neg', 'sw-t2')) ||
      (areConnected('bat-pos', 'sw-t2') && areConnected('bat-neg', 'sw-t1'))
    ));

  // 2. Reverse Polarity on Ammeter:
  const isReversePolarity = 
    (areConnected('bat-neg', 'amm-pos') && areConnected('bat-pos', 'amm-neg')) ||
    (areConnected('bat-neg', 'amm-pos') && !areConnected('bat-pos', 'amm-pos'));

  // 3. Voltmeter wired in series in the main loop:
  const isVoltmeterInSeries = 
    areConnected('bat-pos', 'volt-pos') && (areConnected('volt-neg', 'rheo-in') || areConnected('volt-neg', 'sw-t1'));

  // 4. Ammeter in parallel across the rheostat:
  const isAmmeterInParallel = 
    (areConnected('amm-pos', 'rheo-in') && areConnected('amm-neg', 'rheo-out')) ||
    (areConnected('amm-neg', 'rheo-in') && areConnected('amm-pos', 'rheo-out'));

  // 5. Correct Standard Series Circuit:
  const hasSeriesLoop = 
    areConnected('bat-pos', 'amm-pos') &&
    areConnected('amm-neg', 'rheo-in') &&
    (areConnected('rheo-out', 'sw-t1') || areConnected('rheo-out', 'sw-t2')) &&
    (areConnected('sw-t2', 'bat-neg') || areConnected('sw-t1', 'bat-neg'));

  const isVoltmeterParallel = 
    (areConnected('volt-pos', 'rheo-in') || areConnected('volt-pos', 'amm-neg')) &&
    (areConnected('volt-neg', 'rheo-out') || areConnected('volt-neg', 'sw-t1'));

  const E = 3.0;
  const r = 0.50;
  const R_fixed = 4.0;
  const R_external = R_fixed + rheostatResistance;

  let currentI = 0.000;
  let voltageV = 0.00;
  let circuitObservation = 'Open circuit. Switch is open or wiring is incomplete.';

  if (isDirectBatteryShort) {
    currentI = 8.500; // Overload max
    voltageV = 0.00;
    circuitObservation = '💥 SHORT CIRCUIT ERROR: Battery terminals are connected directly with zero load! Excessive current (>8.0A). Wires overheat and battery drains rapidly.';
  } else if (isSwitchClosed && isVoltmeterInSeries) {
    currentI = 0.000;
    voltageV = 3.00;
    circuitObservation = '⚠️ VOLTMETER IN SERIES ERROR: The voltmeter has been connected in series into the circuit loop. Because of its extremely high internal resistance (>20,000Ω), it completely chokes current flow to 0.000A, while the voltmeter reads battery EMF (3.00V).';
  } else if (isSwitchClosed && isAmmeterInParallel) {
    currentI = +(E / (R_fixed + r)).toFixed(3);
    voltageV = 0.00;
    circuitObservation = '⚠️ AMMETER IN PARALLEL ERROR: Ammeter connected in parallel across the resistor! The near-zero resistance of the ammeter shorts out the rheostat. Voltmeter reads 0.00V while ammeter takes heavy surge current.';
  } else if (isSwitchClosed && isReversePolarity) {
    currentI = -0.050; // deflecting backwards!
    voltageV = +(currentI * R_external).toFixed(2);
    circuitObservation = '⚠️ REVERSE POLARITY ERROR: Ammeter wired backwards! Positive and negative leads inverted. Galvanometer needle is deflecting backward against the zero pin stop (-0.05A).';
  } else if (isSwitchClosed && hasSeriesLoop) {
    currentI = +(E / (R_external + r)).toFixed(3);
    voltageV = isVoltmeterParallel ? +(currentI * R_external).toFixed(2) : 0.00;
    circuitObservation = isVoltmeterParallel
      ? `✅ ACCURATE OHM'S LAW CIRCUIT: Closed loop with current I = ${currentI.toFixed(3)} A and potential difference V = ${voltageV.toFixed(2)} V. Satisfies V = IR.`
      : `⚠️ Voltmeter not connected in parallel across resistor! Current flows (I = ${currentI.toFixed(3)} A), but voltmeter reads 0.00 V.`;
  }

  const isCircuitActive = isSwitchClosed && (hasSeriesLoop || isDirectBatteryShort || isVoltmeterInSeries || isAmmeterInParallel);

  // Meter needle rotation angles (-45deg to +45deg)
  const ammeterAngle = isReversePolarity 
    ? -50 
    : isDirectBatteryShort 
    ? 50 
    : Math.min(45, -45 + (Math.max(0, currentI) / 1.0) * 90);

  const voltmeterAngle = Math.min(45, -45 + (Math.max(0, voltageV) / 3.0) * 90);

  // Broadcast telemetry
  useEffect(() => {
    if (onCircuitUpdate) {
      onCircuitUpdate({
        current: currentI,
        voltage: voltageV,
        resistance: R_external,
        isSwitchClosed,
        isCircuitActive,
        isShortCircuit: isDirectBatteryShort,
        isVoltmeterInSeries,
        isAmmeterInParallel,
        isReversePolarity,
        wiresCount: wires.length,
        circuitStateText: isDirectBatteryShort ? 'SHORT CIRCUIT' : isCircuitActive ? 'ACTIVE (CLOSED)' : 'OPEN / INCOMPLETE',
        scientificObservation: circuitObservation
      });
    }
  }, [currentI, voltageV, R_external, isSwitchClosed, isCircuitActive, isDirectBatteryShort, isVoltmeterInSeries, isAmmeterInParallel, isReversePolarity, wires.length]);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Interactive Electrical Circuit Workbench • KCSE 232/3 Physics</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Place real apparatus on the workbench and connect terminal wires. Incorrect polarity, short circuits, or series voltmeter connections generate live physical lab reactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Back / Undo Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
            title="Undo previous wire or action"
          >
            <History className="w-3.5 h-3.5" />
            <span>Step Back (Undo)</span>
          </button>

          {/* Quick preset auto-assembly */}
          <button
            onClick={() => {
              pushSnapshot();
              const b = createComponent('battery');
              const a = createComponent('ammeter');
              const r = createComponent('rheostat');
              const s = createComponent('switch');
              const v = createComponent('voltmeter');
              setPlacedComponents([b, a, r, s, v]);
              setWires([
                { id: 'w1', fromTerminalId: 'bat-pos', toTerminalId: 'amm-pos', color: '#ef4444' },
                { id: 'w2', fromTerminalId: 'amm-neg', toTerminalId: 'rheo-in', color: '#0284c7' },
                { id: 'w3', fromTerminalId: 'rheo-out', toTerminalId: 'sw-t1', color: '#0284c7' },
                { id: 'w4', fromTerminalId: 'sw-t2', toTerminalId: 'bat-neg', color: '#0f172a' },
                { id: 'w5', fromTerminalId: 'volt-pos', toTerminalId: 'rheo-in', color: '#eab308' },
                { id: 'w6', fromTerminalId: 'volt-neg', toTerminalId: 'rheo-out', color: '#eab308' }
              ]);
              setIsSwitchClosed(true);
              if (onStepComplete) {
                onStepComplete(1);
                onStepComplete(2);
                onStepComplete(3);
                onStepComplete(4);
                onStepComplete(5);
              }
              setBenchMessage({ text: 'Preset standard Ohm\'s Law circuit assembled and switch closed.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-bold transition"
            title="Auto-assemble circuit for rapid testing"
          >
            <span>Preset Setup</span>
          </button>

          <button
            onClick={() => {
              pushSnapshot();
              setWires([]);
              setSelectedTerminal(null);
              setBenchMessage({ text: 'All wires removed from the circuit.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-bold transition"
          >
            Clear Wires
          </button>

          <button
            onClick={() => {
              pushSnapshot();
              setPlacedComponents([]);
              setWires([]);
              setIsSwitchClosed(false);
              setSelectedTerminal(null);
              setBenchMessage({ text: 'Workbench cleared.', type: 'info' });
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-750 text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Bench</span>
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

      {/* Main Grid: Apparatus Shelf + Circuit Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Apparatus Tray + Rheostat Slider + Wires List (Col 4) */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-4">
          
          {/* Apparatus Shelf */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Apparatus Tray (Click to Add to Bench)
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {TRAY_ITEMS.map(item => {
                const isPlaced = placedComponents.some(c => c.type === item.type);
                return (
                  <button
                    key={item.type}
                    onClick={() => handlePlaceFromTray(item.type)}
                    disabled={isPlaced}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isPlaced
                        ? 'bg-slate-900/60 border-slate-750 text-slate-500 opacity-60 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-750 border-slate-700 text-white shadow'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    {isPlaced ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Placed
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                        <PlusCircle className="w-3.5 h-3.5" /> Place
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rheostat Slider Controller */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-750 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400">Rheostat Slider (R)</span>
              <span className="font-mono text-white font-bold">{rheostatResistance.toFixed(1)} Ω</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={rheostatResistance}
              onChange={e => setRheostatResistance(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.0 Ω (Max Current)</span>
              <span>20.0 Ω (Min Current)</span>
            </div>
          </div>

          {/* Knife Switch State Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Knife Switch Contact</span>
              <span className="text-[10px] text-slate-400">
                {isSwitchClosed ? 'Circuit Closed (Current Active)' : 'Circuit Open (No Current)'}
              </span>
            </div>
            <button
              onClick={() => {
                pushSnapshot();
                setIsSwitchClosed(!isSwitchClosed);
                setBenchMessage({ 
                  text: !isSwitchClosed ? 'Knife switch closed.' : 'Knife switch opened.', 
                  type: 'info' 
                });
              }}
              className={`p-2 rounded-xl transition flex items-center space-x-1.5 text-xs font-bold shadow ${
                isSwitchClosed 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-slate-700 hover:bg-slate-650 text-slate-300'
              }`}
            >
              {isSwitchClosed ? <ToggleRight className="w-5 h-5 text-emerald-300" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{isSwitchClosed ? 'CLOSED' : 'OPEN'}</span>
            </button>
          </div>

          {/* Active Wires List with Delete option */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Active Circuit Wires ({wires.length})
              </span>
              <span className="text-[10px] text-slate-500">Click × to disconnect</span>
            </div>
            
            {wires.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-2 bg-slate-900/50 rounded-lg">
                No wires connected yet. Click any terminal to begin wiring.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {wires.map(w => (
                  <div 
                    key={w.id} 
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-750 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                      <span className="text-slate-300 font-mono truncate">{w.fromTerminalId} ↔ {w.toTerminalId}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveWire(w.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition"
                      title="Disconnect wire"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Canvas: Interactive Workbench Circuit Board (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={benchRef}
            className={`relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl border-2 select-none transition-colors ${
              isDirectBatteryShort
                ? 'bg-rose-950/40 border-rose-500 animate-pulse'
                : 'bg-slate-950/95 border-slate-800'
            }`}
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.1) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Workbench Grid Header */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
              CIRCUIT BOARD • VIRTUAL OHM'S LAW LABORATORY
            </div>

            {/* Empty Board Notice */}
            {placedComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="text-center p-8 max-w-sm space-y-3 bg-slate-900/60 border border-slate-800 rounded-2xl pointer-events-auto">
                  <Zap className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-white">Empty Circuit Board</h4>
                  <p className="text-xs text-slate-400">
                    Click apparatus in the left tray to place the Battery, Ammeter, Rheostat, Switch, and Voltmeter onto the workbench.
                  </p>
                </div>
              </div>
            )}

            {/* SVG Connecting Wires Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {wires.map(wire => {
                let t1Comp: ComponentItem | undefined;
                let t1: Terminal | undefined;
                let t2Comp: ComponentItem | undefined;
                let t2: Terminal | undefined;

                placedComponents.forEach(c => {
                  c.terminals.forEach(term => {
                    if (term.id === wire.fromTerminalId) { t1Comp = c; t1 = term; }
                    if (term.id === wire.toTerminalId) { t2Comp = c; t2 = term; }
                  });
                });

                if (!t1Comp || !t1 || !t2Comp || !t2) return null;

                const x1 = t1Comp.x + t1.x;
                const y1 = t1Comp.y + t1.y;
                const x2 = t2Comp.x + t2.x;
                const y2 = t2Comp.y + t2.y;

                // Bezier curve control points
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 + 35; // natural cable sag

                return (
                  <g key={wire.id}>
                    {/* Cable shadow */}
                    <path
                      d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.6)"
                      strokeWidth="5"
                    />
                    {/* Realistic Insulated Wire */}
                    <path
                      d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                      fill="none"
                      stroke={wire.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className={isCircuitActive && !isDirectBatteryShort ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Placed Interactive Components on Canvas */}
            {placedComponents.map(comp => (
              <div
                key={comp.id}
                onMouseDown={e => handleStartDrag(e, comp)}
                onTouchStart={e => handleStartDrag(e, comp)}
                style={{
                  left: `${comp.x}px`,
                  top: `${comp.y}px`,
                  width: `${comp.width}px`
                }}
                className={`absolute z-30 transition-shadow select-none cursor-grab active:cursor-grabbing group ${
                  draggingCompId === comp.id ? 'ring-2 ring-cyan-400 shadow-2xl scale-102 z-50' : ''
                }`}
              >
                {/* Drag handle pill */}
                <div className="flex items-center justify-between mb-1 px-1 opacity-60 group-hover:opacity-100 transition">
                  <div className="flex items-center space-x-1 text-[8px] font-mono text-slate-400">
                    <Move className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Drag to move</span>
                  </div>
                </div>
                {/* 1. BATTERY COMPONENT */}
                {comp.type === 'battery' && (
                  <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-3 shadow-xl flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      🔋 3.0V DC Cells
                    </span>
                    <div className="flex space-x-2 my-1">
                      <div className="w-8 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded border border-amber-400/50 flex flex-col justify-between p-1 items-center shadow">
                        <span className="text-[7px] font-bold text-slate-950">1.5V</span>
                        <div className="w-2 h-1 bg-slate-300 rounded-t" />
                      </div>
                      <div className="w-8 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded border border-amber-400/50 flex flex-col justify-between p-1 items-center shadow">
                        <span className="text-[7px] font-bold text-slate-950">1.5V</span>
                        <div className="w-2 h-1 bg-slate-300 rounded-t" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AMMETER COMPONENT */}
                {comp.type === 'ammeter' && (
                  <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-3 shadow-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-amber-400" /> Ammeter
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${currentI < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {currentI.toFixed(3)} A
                      </span>
                    </div>

                    {/* Analogue dial face */}
                    <div className="relative w-28 h-14 bg-slate-950 rounded-t-full border-t border-x border-slate-700 overflow-hidden flex items-end justify-center mb-1">
                      <div className="absolute inset-0 flex justify-between px-2 pt-0.5 text-[6px] font-mono text-slate-500">
                        <span>0.0</span>
                        <span>0.5</span>
                        <span>1.0</span>
                      </div>
                      {/* Needle */}
                      <div 
                        className={`w-0.5 h-12 origin-bottom transition-transform duration-300 shadow ${
                          currentI < 0 ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                        style={{ transform: `rotate(${ammeterAngle}deg)` }}
                      />
                      <div className="w-2 h-2 bg-slate-400 rounded-full z-10" />
                    </div>
                  </div>
                )}

                {/* 3. RHEOSTAT COMPONENT */}
                {comp.type === 'rheostat' && (
                  <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-3 shadow-xl flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-300 mb-1">
                      Rheostat ({rheostatResistance.toFixed(1)} Ω)
                    </span>
                    <div className="w-full h-8 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded border border-amber-600/40 relative flex items-center shadow-inner">
                      {/* Coils visualization */}
                      <div className="absolute inset-0 flex justify-between px-1 opacity-40 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-[1px] h-full bg-slate-300" />
                        ))}
                      </div>
                      {/* Slider contact */}
                      <div 
                        className="absolute h-10 w-3 bg-slate-300 border border-slate-700 rounded shadow-lg -translate-x-1/2"
                        style={{ left: `${(rheostatResistance / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 4. SWITCH COMPONENT */}
                {comp.type === 'switch' && (
                  <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-2.5 shadow-xl flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-300 mb-1">
                      Knife Switch
                    </span>
                    <div className="relative w-24 h-8 bg-slate-950 rounded border border-slate-800 flex items-center justify-between px-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      {/* Switch blade */}
                      <div 
                        className={`h-1.5 bg-amber-400 origin-left transition-transform duration-200 rounded ${
                          isSwitchClosed ? 'w-16 rotate-0' : 'w-16 -rotate-30'
                        }`}
                      />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  </div>
                )}

                {/* 5. VOLTMETER COMPONENT */}
                {comp.type === 'voltmeter' && (
                  <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 rounded-2xl p-3 shadow-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-cyan-400" /> Voltmeter
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {voltageV.toFixed(2)} V
                      </span>
                    </div>

                    <div className="relative w-28 h-14 bg-slate-950 rounded-t-full border-t border-x border-slate-700 overflow-hidden flex items-end justify-center mb-1">
                      <div className="absolute inset-0 flex justify-between px-2 pt-0.5 text-[6px] font-mono text-slate-500">
                        <span>0.0</span>
                        <span>1.5</span>
                        <span>3.0</span>
                      </div>
                      <div 
                        className="w-0.5 h-12 bg-cyan-400 origin-bottom transition-transform duration-300 shadow"
                        style={{ transform: `rotate(${voltmeterAngle}deg)` }}
                      />
                      <div className="w-2 h-2 bg-slate-400 rounded-full z-10" />
                    </div>
                  </div>
                )}

                {/* Terminal Nodes with Clickable Binding Dots */}
                {comp.terminals.map(term => {
                  const isSelected = selectedTerminal?.id === term.id;
                  const isWired = wires.some(w => w.fromTerminalId === term.id || w.toTerminalId === term.id);

                  return (
                    <button
                      key={term.id}
                      onClick={e => {
                        e.stopPropagation();
                        handleTerminalClick(term);
                      }}
                      style={{
                        left: `${term.x}px`,
                        top: `${term.y}px`,
                        backgroundColor: term.type === 'positive' ? '#ef4444' : term.type === 'negative' ? '#0f172a' : '#f59e0b'
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-transform shadow-lg z-40 flex items-center justify-center ${
                        isSelected 
                          ? 'border-white scale-125 ring-4 ring-amber-400 animate-bounce' 
                          : isWired 
                          ? 'border-emerald-400 scale-105' 
                          : 'border-slate-400 hover:scale-115'
                      }`}
                      title={`Click to wire: ${term.name}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    </button>
                  );
                })}

              </div>
            ))}

          </div>

          {/* Real-time Electrical HUD and Log Readings */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current (I)</span>
                <span className={`font-mono text-lg font-bold ${currentI < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {currentI.toFixed(3)} A
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Voltage (V)</span>
                <span className="font-mono text-lg font-bold text-cyan-400">{voltageV.toFixed(2)} V</span>
              </div>

              <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-750">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Circuit State</span>
                <span className={`text-xs font-bold ${
                  isDirectBatteryShort 
                    ? 'text-rose-400' 
                    : isCircuitActive 
                    ? 'text-emerald-400' 
                    : 'text-slate-400'
                }`}>
                  {isDirectBatteryShort ? '💥 SHORT CIRCUIT' : isCircuitActive ? '⚡ LIVE CURRENT FLOW' : 'OFF (Open / Incomplete)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isCircuitActive) {
                  setBenchMessage({ text: 'Please complete the circuit connections and close the switch first.', type: 'warning' });
                  return;
                }
                if (onReadingsRecorded) {
                  onReadingsRecorded({
                    current: currentI,
                    voltage: voltageV,
                    resistance: R_external
                  });
                }
                setBenchMessage({ text: `Recorded to Table 2: I = ${currentI.toFixed(3)} A, V = ${voltageV.toFixed(2)} V`, type: 'success' });
              }}
              disabled={!isCircuitActive}
              className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/30 disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <span>Record Reading into Answer Sheet</span>
            </button>
          </div>

          {/* OBSERVATIONS & SCIENTIFIC FEEDBACK CALLOUT */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-colors shadow-lg ${
            isDirectBatteryShort || isReversePolarity || isVoltmeterInSeries || isAmmeterInParallel
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : hasSeriesLoop && isVoltmeterParallel && isSwitchClosed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-850 border-slate-700/80 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                {isDirectBatteryShort || isReversePolarity || isVoltmeterInSeries || isAmmeterInParallel ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Inaccurate Circuit Observation & Diagnostics</span>
                  </>
                ) : hasSeriesLoop && isVoltmeterParallel && isSwitchClosed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accurate Observation: KNEC V = IR Verification</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Circuit Diagnostic Status</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">KCSE Physics 232/3</span>
            </div>

            <p className="leading-relaxed">
              {circuitObservation}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
