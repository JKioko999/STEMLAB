import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  FlaskConical, 
  Layers, 
  Flame, 
  Activity, 
  CheckCircle, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Copy, 
  Sliders, 
  Droplets,
  Zap,
  Scale,
  Clock,
  Compass,
  Cpu
} from 'lucide-react';
import { ApparatusItem } from '../../../types';

interface InteractiveGeneralWorkbenchProps {
  currentStepIndex?: number;
  onStepComplete?: (stepId: number) => void;
  onUpdateTelemetry?: (data: any) => void;
}

export const InteractiveGeneralWorkbench: React.FC<InteractiveGeneralWorkbenchProps> = ({
  currentStepIndex = 0,
  onStepComplete,
  onUpdateTelemetry
}) => {
  const { activeExperiment } = useApp();

  const [placedApparatus, setPlacedApparatus] = useState<ApparatusItem[]>(() => {
    // Start with the first 2 apparatus on the bench
    return (activeExperiment?.apparatus || []).slice(0, 2);
  });

  const [temperature, setTemperature] = useState<number>(22.5); // Room temp °C
  const [liquidVolume, setLiquidVolume] = useState<number>(50.0); // cm³
  const [isHeatActive, setIsHeatActive] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [benchNotes, setBenchNotes] = useState<string>('Apparatus mounted and stabilized at room temperature.');
  const [notification, setNotification] = useState<string | null>(null);

  const availableApparatus = activeExperiment?.apparatus || [];
  const currentStep = activeExperiment?.steps[currentStepIndex];

  // Notify telemetry to workspace
  const pushTelemetry = (temp: number, vol: number, notes: string) => {
    if (onUpdateTelemetry) {
      onUpdateTelemetry({
        reading: temp,
        volume: vol,
        notes: notes,
        observation: notes
      });
    }
  };

  const handlePlaceApparatus = (item: ApparatusItem) => {
    if (placedApparatus.some(p => p.id === item.id)) {
      setNotification(`"${item.name}" is already placed on the bench.`);
      setTimeout(() => setNotification(null), 2500);
      return;
    }
    const updated = [...placedApparatus, item];
    setPlacedApparatus(updated);
    setBenchNotes(`Placed ${item.name} onto the laboratory workspace.`);
    pushTelemetry(temperature, liquidVolume, `Placed ${item.name}`);

    // If current step requires apparatus placement, trigger step complete
    if (currentStep && (currentStep.validationType === 'apparatus_placed' || currentStep.validationType === 'connection_made')) {
      if (onStepComplete) {
        onStepComplete(currentStep.id);
      }
    }
  };

  const handleRemoveFromBench = (id: string) => {
    setPlacedApparatus(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleHeat = () => {
    const nextHeat = !isHeatActive;
    setIsHeatActive(nextHeat);
    const newTemp = nextHeat ? temperature + 15.0 : Math.max(22.5, temperature - 5.0);
    setTemperature(newTemp);
    const note = nextHeat ? 'Heat source activated. Temperature rising.' : 'Heat source removed. Cooling.';
    setBenchNotes(note);
    pushTelemetry(newTemp, liquidVolume, note);

    if (currentStep && (currentStep.validationType === 'run_simulation' || currentStep.validationType === 'reagent_added')) {
      if (onStepComplete) {
        onStepComplete(currentStep.id);
      }
    }
  };

  const handleAdjustVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(250, Number((liquidVolume + delta).toFixed(1))));
    setLiquidVolume(newVol);
    const note = `Adjusted liquid volume to ${newVol} cm³.`;
    setBenchNotes(note);
    pushTelemetry(temperature, newVol, note);

    if (currentStep && currentStep.validationType === 'volume_set') {
      if (onStepComplete) {
        onStepComplete(currentStep.id);
      }
    }
  };

  const handleRecordMeasurement = () => {
    if (currentStep && onStepComplete) {
      onStepComplete(currentStep.id);
    }
    setNotification(`Recorded reading: ${temperature}°C, ${liquidVolume} cm³.`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleResetBench = () => {
    setPlacedApparatus(availableApparatus.slice(0, 2));
    setTemperature(22.5);
    setLiquidVolume(50.0);
    setIsHeatActive(false);
    setBenchNotes('Workbench reset to default initial setup.');
    setNotification('Bench reset.');
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
      
      {/* Bench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Universal Science Workbench
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            {activeExperiment?.title || 'Interactive Practical Workspace'}
          </h2>
          <p className="text-xs text-slate-400">
            Interactive apparatus controls, real-time measurements, and step verification for custom practicals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetBench}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Setup</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Bench Grid: Left is Locker, Right is Active Mat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Apparatus Locker (Teacher's chosen items) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Apparatus Locker</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {availableApparatus.length} Available
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Click any apparatus configured by your teacher to mount it onto the lab workbench:
          </p>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {availableApparatus.map(item => {
              const isPlaced = placedApparatus.some(p => p.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handlePlaceApparatus(item)}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                    isPlaced
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                      : item.isDistractor
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-300 hover:border-rose-500'
                      : 'bg-slate-900 border-slate-750 text-slate-200 hover:border-emerald-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">
                    {isPlaced ? 'Placed' : '+ Place'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Workbench Mat & Interactive Instruments */}
        <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" />
              <span>Active Laboratory Bench Surface</span>
            </span>

            <span className="text-xs text-slate-400">
              {placedApparatus.length} item(s) on bench
            </span>
          </div>

          {/* Placed Apparatus Display */}
          <div className="min-h-36 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap gap-2.5 items-center justify-start relative">
            {placedApparatus.length === 0 ? (
              <div className="w-full text-center text-slate-500 text-xs py-8">
                Bench is empty. Select apparatus from the locker to mount your equipment.
              </div>
            ) : (
              placedApparatus.map(item => (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs flex items-center gap-2 shadow group"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-medium">{item.name}</span>
                  <button
                    onClick={() => handleRemoveFromBench(item.id)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                    title="Remove from bench"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Interactive Dials & Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Thermometer / Temperature Sensor */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase">
                <span>Thermometer</span>
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl font-mono font-extrabold text-white">
                {temperature.toFixed(1)} °C
              </div>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  onClick={() => setTemperature(prev => Math.max(0, Number((prev - 1.0).toFixed(1))))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  -1°C
                </button>
                <button
                  onClick={() => setTemperature(prev => Math.min(100, Number((prev + 1.0).toFixed(1))))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  +1°C
                </button>
              </div>
            </div>

            {/* Liquid Volume Dispenser */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase">
                <span>Liquid Volume</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-mono font-extrabold text-cyan-300">
                {liquidVolume.toFixed(1)} cm³
              </div>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <button
                  onClick={() => handleAdjustVolume(-5)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  -5 cm³
                </button>
                <button
                  onClick={() => handleAdjustVolume(5)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  +5 cm³
                </button>
              </div>
            </div>

            {/* Burner / Energy Source */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase">
                <span>Heat / Power</span>
                <Flame className={`w-3.5 h-3.5 ${isHeatActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className={`text-sm font-bold mt-1 ${isHeatActive ? 'text-amber-400' : 'text-slate-400'}`}>
                {isHeatActive ? 'HEAT ON (Active)' : 'OFF (Idle)'}
              </div>
              <button
                onClick={handleToggleHeat}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                  isHeatActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isHeatActive ? 'Extinguish Burner' : 'Light Burner'}
              </button>
            </div>

          </div>

          {/* Real-time Observation Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Workbench Status:
              </span>
              <span className="text-white font-medium">{benchNotes}</span>
            </div>

            <button
              onClick={handleRecordMeasurement}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Record & Complete Step</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
