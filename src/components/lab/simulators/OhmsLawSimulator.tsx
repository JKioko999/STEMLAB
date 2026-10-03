import React, { useState } from 'react';
import { Zap, ToggleLeft, ToggleRight, Sliders, Activity, Gauge } from 'lucide-react';

interface OhmsLawSimulatorProps {
  onStepComplete?: (stepNumber: number) => void;
  onReadingsRecorded?: (reading: { current: number; voltage: number; resistance: number }) => void;
}

export const OhmsLawSimulator: React.FC<OhmsLawSimulatorProps> = ({
  onStepComplete,
  onReadingsRecorded
}) => {
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [rheostatResistance, setRheostatResistance] = useState(6.0); // 0 to 20 ohms
  const [wiresConnected, setWiresConnected] = useState({
    batteryToSwitch: true,
    switchToAmmeter: true,
    ammeterToResistor: true,
    resistorToBattery: true,
    voltmeterParallel: true
  });

  // Circuit Physics:
  // E = 3.0 V (2 dry cells in series)
  // Internal resistance r = 0.5 ohm
  // Fixed resistor R_fixed = 4.0 ohms
  // Variable Rheostat R_var
  const E = 3.0;
  const r = 0.5;
  const R_fixed = 4.0;
  const R_total_external = R_fixed + rheostatResistance;
  const R_circuit = R_total_external + r;

  // When switch is closed and all wires connected:
  const isCircuitComplete = isSwitchClosed && Object.values(wiresConnected).every(Boolean);

  const currentI = isCircuitComplete ? +(E / R_circuit).toFixed(3) : 0.00;
  const voltageV = isCircuitComplete ? +(currentI * R_total_external).toFixed(2) : 0.00;

  // Ammeter needle deflection (0 to 1.0 A => -45 deg to +45 deg)
  const ammeterAngle = -45 + (currentI / 1.0) * 90;
  // Voltmeter needle deflection (0 to 3.0 V => -45 deg to +45 deg)
  const voltmeterAngle = -45 + (voltageV / 3.0) * 90;

  const handleToggleSwitch = () => {
    setIsSwitchClosed(!isSwitchClosed);
    if (!isSwitchClosed && onStepComplete) {
      onStepComplete(5);
    }
  };

  const handleRecordDataPoint = () => {
    if (!isCircuitComplete) {
      alert('Close the switch to complete the circuit before logging readings.');
      return;
    }
    if (onReadingsRecorded) {
      onReadingsRecorded({
        current: currentI,
        voltage: voltageV,
        resistance: R_total_external
      });
    }
    alert(`Logged: Current = ${currentI} A, Voltage = ${voltageV} V`);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80">
      
      {/* Circuit Schematic Board */}
      <div className="relative w-full max-w-lg h-96 bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
        
        {/* Glow indicator if current is active */}
        {isCircuitComplete && (
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none animate-pulse" />
        )}

        {/* Top Wire & Voltmeter parallel bridge */}
        <div className="flex items-center justify-between relative z-10">
          
          {/* 3.0V DC Cell Pack */}
          <div className="bg-slate-900 border-2 border-cyan-500/40 p-2.5 rounded-xl shadow flex items-center space-x-2">
            <div className="w-8 h-10 bg-amber-500/20 border border-amber-500 rounded flex flex-col items-center justify-center text-[10px] font-bold text-amber-300">
              <span>+</span>
              <span className="text-[8px]">1.5V</span>
            </div>
            <div className="w-8 h-10 bg-amber-500/20 border border-amber-500 rounded flex flex-col items-center justify-center text-[10px] font-bold text-amber-300">
              <span>+</span>
              <span className="text-[8px]">1.5V</span>
            </div>
            <div className="text-left text-[10px] font-semibold text-slate-300">
              <div>Dry Cells</div>
              <div className="text-cyan-400 font-mono font-bold">3.0 V</div>
            </div>
          </div>

          {/* Knife Switch */}
          <button
            onClick={handleToggleSwitch}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
              isSwitchClosed
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-950/40 text-rose-400 border-rose-600'
            }`}
          >
            {isSwitchClosed ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-rose-400" />}
            <span>{isSwitchClosed ? 'Switch CLOSED' : 'Switch OPEN'}</span>
          </button>

        </div>

        {/* Center: Analogue Voltmeter (in Parallel) */}
        <div className="flex items-center justify-center relative my-2">
          <div className="w-36 h-28 bg-slate-900 border-2 border-slate-700 rounded-xl p-2 flex flex-col items-center justify-between shadow-lg relative">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Voltmeter (V)
            </span>

            {/* Analogue Dial & Deflecting Needle */}
            <div className="relative w-24 h-12 bg-slate-950 rounded-t-full border-t border-x border-slate-700 overflow-hidden flex items-end justify-center">
              {/* Dial markings */}
              <div className="absolute inset-0 flex justify-between px-2 pt-1 text-[7px] font-mono text-slate-500">
                <span>0</span>
                <span>1.5</span>
                <span>3.0</span>
              </div>
              {/* Needle */}
              <div 
                className="w-0.5 h-10 bg-cyan-400 origin-bottom transition-transform duration-300 shadow"
                style={{ transform: `rotate(${voltmeterAngle}deg)` }}
              />
              <div className="w-2 h-2 bg-slate-400 rounded-full z-10" />
            </div>

            <div className="font-mono text-xs font-bold text-cyan-300">
              {voltageV.toFixed(2)} V
            </div>
          </div>
        </div>

        {/* Bottom Wire & Series Components: DC Ammeter + Rheostat */}
        <div className="flex items-center justify-between relative z-10">
          
          {/* DC Ammeter (in Series) */}
          <div className="w-32 h-24 bg-slate-900 border-2 border-slate-700 rounded-xl p-2 flex flex-col items-center justify-between shadow">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-400" /> Ammeter (A)
            </span>

            <div className="relative w-20 h-10 bg-slate-950 rounded-t-full border-t border-x border-slate-700 overflow-hidden flex items-end justify-center">
              <div className="absolute inset-0 flex justify-between px-2 pt-0.5 text-[6px] font-mono text-slate-500">
                <span>0.0</span>
                <span>0.5</span>
                <span>1.0</span>
              </div>
              <div 
                className="w-0.5 h-8 bg-amber-400 origin-bottom transition-transform duration-300 shadow"
                style={{ transform: `rotate(${ammeterAngle}deg)` }}
              />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full z-10" />
            </div>

            <div className="font-mono text-xs font-bold text-amber-300">
              {currentI.toFixed(2)} A
            </div>
          </div>

          {/* Variable Resistor (Rheostat) */}
          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Rheostat Slider</span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              R = {rheostatResistance.toFixed(1)} Ω
            </span>
          </div>

        </div>

      </div>

      {/* Control Panel */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Rheostat & Circuit Controls
          </h4>

          {/* Slider for resistance */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Rheostat Setting:</span>
              <span className="font-mono font-bold text-cyan-400">{rheostatResistance.toFixed(1)} Ω</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="1.0"
              value={rheostatResistance}
              onChange={e => setRheostatResistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Low R (Max Current)</span>
              <span>High R (Min Current)</span>
            </div>
          </div>

          {/* Switch Button */}
          <button
            onClick={handleToggleSwitch}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
              isSwitchClosed
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSwitchClosed ? 'Open Circuit Switch' : 'Close Circuit Switch (Power ON)'}</span>
          </button>

          {/* Log reading button */}
          <button
            onClick={handleRecordDataPoint}
            disabled={!isCircuitComplete}
            className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition disabled:opacity-50"
          >
            Log Current Reading to Answer Sheet
          </button>
        </div>

        {/* KCSE Physics note */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">KCSE Physics Paper 3 Tip:</p>
          <p>
            V = E - Ir. The voltmeter measures terminal potential difference. As current I increases, the internal resistance Ir drops more voltage, resulting in a decreasing terminal voltage.
          </p>
        </div>
      </div>

    </div>
  );
};
