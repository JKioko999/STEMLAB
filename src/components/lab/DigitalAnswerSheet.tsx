import React, { useState, useEffect } from 'react';
import { AnswerSheetQuestion, StudentAnswer } from '../../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  HelpCircle,
  FlaskConical,
  Zap,
  Flame,
  Scale,
  Copy,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';

interface DigitalAnswerSheetProps {
  questions: AnswerSheetQuestion[];
  isExamMode: boolean;
  onSubmit: (answers: StudentAnswer[]) => void;
  initialAnswers?: StudentAnswer[];
  persistedAnswersState?: Record<string, any>;
  onAnswersChange?: (answers: Record<string, any>) => void;
  isReadOnly?: boolean;
  liveTelemetry?: any;
  onReturnToLab?: () => void;
}

export const DigitalAnswerSheet: React.FC<DigitalAnswerSheetProps> = ({
  questions,
  isExamMode,
  onSubmit,
  initialAnswers = [],
  persistedAnswersState,
  onAnswersChange,
  isReadOnly = false,
  liveTelemetry,
  onReturnToLab
}) => {
  // Store form state by question id
  const [answersState, setAnswersState] = useState<Record<string, any>>(() => {
    if (persistedAnswersState && Object.keys(persistedAnswersState).length > 0) {
      return persistedAnswersState;
    }
    const map: Record<string, any> = {};
    initialAnswers.forEach(ans => {
      map[ans.questionId] = ans.studentValue;
    });
    return map;
  });

  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Sync to parent when answersState changes
  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange(answersState);
    }
  }, [answersState]);

  // Handle inputs
  const handleTextChange = (questionId: string, val: string) => {
    setAnswersState(prev => ({ ...prev, [questionId]: val }));
  };

  const handleNumberChange = (questionId: string, val: number) => {
    setAnswersState(prev => ({ ...prev, [questionId]: val }));
  };

  const handleTableChange = (questionId: string, rowKey: string, field: string, val: number) => {
    setAnswersState(prev => {
      const current = prev[questionId] || {};
      const row = current[rowKey] || { initial: 0, final: 0, titre: 0 };
      const updatedRow = { ...row, [field]: val };
      if (field === 'final' || field === 'initial') {
        const f = Number(updatedRow.final) || 0;
        const i = Number(updatedRow.initial) || 0;
        updatedRow.titre = +(f - i).toFixed(2);
      }
      return {
        ...prev,
        [questionId]: {
          ...current,
          [rowKey]: updatedRow
        }
      };
    });
  };

  // Quick Auto-Fill from Live Telemetry
  const handleAutoFillFromTelemetry = (questionId: string, qType: string) => {
    if (!liveTelemetry) return;

    if (qType === 'data_table') {
      // If titration telemetry
      if (liveTelemetry.titre !== undefined) {
        const titreVal = liveTelemetry.titre;
        setAnswersState(prev => ({
          ...prev,
          [questionId]: {
            t1: { initial: 0.00, final: titreVal, titre: titreVal },
            t2: { initial: 0.00, final: +(titreVal - 0.10).toFixed(2), titre: +(titreVal - 0.10).toFixed(2) },
            t3: { initial: 0.00, final: titreVal, titre: titreVal }
          }
        }));
        setCopiedNotification('Recorded live burette readings into Titre Table.');
      } else if (liveTelemetry.current !== undefined) {
        // Ohm's law
        setAnswersState(prev => ({
          ...prev,
          [questionId]: {
            r1: { current: liveTelemetry.current, voltage: liveTelemetry.voltage }
          }
        }));
        setCopiedNotification('Recorded live current and voltage readings into table.');
      }
    } else if (qType === 'observation_inference') {
      const observation = liveTelemetry.scientificObservation || liveTelemetry.currentObservation;
      if (observation) {
        setAnswersState(prev => ({
          ...prev,
          [questionId]: observation
        }));
        setCopiedNotification('Pasted workbench observation note into answer field.');
      }
    } else if (qType === 'calculation') {
      if (liveTelemetry.titre !== undefined) {
        // Average titre
        setAnswersState(prev => ({
          ...prev,
          [questionId]: liveTelemetry.titre
        }));
        setCopiedNotification(`Pasted live volume (${liveTelemetry.titre} cm³) into calculation.`);
      }
    }

    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Grade student answers with realistic penalty for inaccurate readings / wrong observations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluatedAnswers: StudentAnswer[] = questions.map(q => {
      const val = answersState[q.id];
      let autoScore = 0;

      if (q.type === 'data_table') {
        if (val && Object.keys(val).length >= (q.tableRows?.length || 3)) {
          // Check if candidate values are within KNEC standard range
          const rowKeys = Object.keys(val);
          let allConsistent = true;
          let withinKNECAccuracy = true;

          const standardTitre = q.tableRows?.[0]?.simulatedValue || 24.50;

          rowKeys.forEach(k => {
            const r = val[k];
            if (r && r.titre !== undefined) {
              if (Math.abs(r.titre - standardTitre) > 0.40) {
                withinKNECAccuracy = false; // Candidate over-titrated or under-titrated!
              }
            }
          });

          if (withinKNECAccuracy) {
            autoScore = q.maxMarks; // Full marks
          } else {
            // Deduct marks for inaccurate candidate practical readings (e.g. over-titration error)
            autoScore = Math.max(1, Math.round(q.maxMarks * 0.5));
          }
        } else {
          autoScore = Math.max(0, Math.round(q.maxMarks * 0.3));
        }
      } else if (q.type === 'calculation') {
        const numVal = Number(val);
        if (q.correctNumericValue !== undefined && !isNaN(numVal)) {
          const tol = q.tolerance || 0.2;
          if (Math.abs(numVal - q.correctNumericValue) <= tol) {
            autoScore = q.maxMarks;
          } else if (Math.abs(numVal - q.correctNumericValue) <= tol * 2.5) {
            autoScore = Math.max(1, Math.round(q.maxMarks * 0.5));
          } else {
            autoScore = 0; // Wrong calculation
          }
        }
      } else if (q.type === 'observation_inference') {
        const text = String(val || '').toLowerCase();
        
        // Check for erroneous observations resulting from inaccurate procedures:
        const hasWrongProcedureKeywords = 
          text.includes('boiled') && text.includes('biuret') ||
          text.includes('curdled') ||
          text.includes('overtitrated') ||
          text.includes('no indicator') ||
          text.includes('short circuit') ||
          text.includes('reverse polarity');

        if (hasWrongProcedureKeywords) {
          // Inaccurate lab procedure yields wrong scientific observations -> 0 or low mark
          autoScore = 0;
        } else {
          let matches = 0;
          q.observationAcceptedKeywords?.forEach(kw => {
            if (text.includes(kw.toLowerCase())) matches++;
          });
          q.inferenceAcceptedKeywords?.forEach(kw => {
            if (text.includes(kw.toLowerCase())) matches++;
          });

          if (matches >= 2) autoScore = q.maxMarks;
          else if (matches === 1) autoScore = Math.round(q.maxMarks / 2);
          else autoScore = 0;
        }
      } else if (q.type === 'short_answer') {
        const text = String(val || '').toLowerCase();
        const hasKeyword = q.observationAcceptedKeywords?.some(kw => text.includes(kw.toLowerCase()));
        autoScore = hasKeyword ? q.maxMarks : Math.round(q.maxMarks / 2);
      }

      return {
        questionId: q.id,
        studentValue: val,
        autoScore
      };
    });

    onSubmit(evaluatedAnswers);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header with Title and Return to Lab option */}
      <div className="border-b border-slate-700/80 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            <span>KCSE Digital Practical Answer Sheet</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">Examiner Recording & Working Paper</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-750">
            Total Marks: <strong className="text-amber-400">{questions.reduce((acc, q) => acc + q.maxMarks, 0)}</strong>
          </span>

          {onReturnToLab && (
            <button
              type="button"
              onClick={onReturnToLab}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-650 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>← Check Lab Apparatus</span>
            </button>
          )}
        </div>
      </div>

      {/* LIVE LABORATORY REFERENCE DOCK (Keeps experiment readings visible right here!) */}
      {liveTelemetry && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Experiment Telemetry & Observation Dock
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Preserved in Memory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Titration Telemetry */}
            {liveTelemetry.titre !== undefined && (
              <>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Live Burette Delivered (V)</span>
                  <span className="text-base font-mono font-bold text-cyan-300">
                    {liveTelemetry.titre.toFixed(2)} cm³
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Flask Solution Appearance</span>
                  <span className="text-xs text-white font-medium line-clamp-1">
                    {liveTelemetry.solutionAppearance || 'Colorless'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Procedure Status</span>
                  <span className={`text-xs font-bold ${liveTelemetry.isInaccurate ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {liveTelemetry.isInaccurate ? `⚠️ ${liveTelemetry.inaccuracyReason || 'Inaccurate'}` : '✓ Standard KNEC Volume'}
                  </span>
                </div>
              </>
            )}

            {/* Circuit Telemetry */}
            {liveTelemetry.current !== undefined && (
              <>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Ammeter Reading (I)</span>
                  <span className="text-base font-mono font-bold text-amber-400">
                    {liveTelemetry.current.toFixed(3)} A
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Voltmeter Reading (V)</span>
                  <span className="text-base font-mono font-bold text-cyan-400">
                    {liveTelemetry.voltage.toFixed(2)} V
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Circuit Condition</span>
                  <span className="text-xs font-bold text-slate-200">
                    {liveTelemetry.circuitStateText}
                  </span>
                </div>
              </>
            )}

            {/* Qualitative or Food Test Telemetry */}
            {liveTelemetry.tubes !== undefined && (
              <div className="md:col-span-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold mb-1">Active Test Tubes Observations</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {liveTelemetry.tubes.map((tb: any) => (
                    <div key={tb.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                      <span className="font-bold text-emerald-400">{tb.name}: </span>
                      <span className="text-slate-300">{tb.observationText || tb.observationSummary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {liveTelemetry.scientificObservation && (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Workbench Observation:</strong> {liveTelemetry.scientificObservation}</span>
            </div>
          )}

          {copiedNotification && (
            <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{copiedNotification}</span>
            </div>
          )}
        </div>
      )}

      {/* QUESTION FIELDS */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-750 space-y-3 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                Question {idx + 1}: {q.prompt}
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                {liveTelemetry && (
                  <button
                    type="button"
                    onClick={() => handleAutoFillFromTelemetry(q.id, q.type)}
                    className="p-1 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition"
                    title="Paste reading from your live workbench"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Paste Lab Reading</span>
                  </button>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  [{q.maxMarks} marks]
                </span>
              </div>
            </div>

            {/* DATA TABLE QUESTION */}
            {q.type === 'data_table' && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left text-slate-300 border border-slate-700 rounded-xl overflow-hidden">
                  <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5 border border-slate-700">Titre Trial</th>
                      <th className="p-2.5 border border-slate-700">Final Reading (cm³)</th>
                      <th className="p-2.5 border border-slate-700">Initial Reading (cm³)</th>
                      <th className="p-2.5 border border-slate-700">Volume Used (cm³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(q.tableRows || [
                      { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
                      { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
                      { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
                    ]).map((row, rIdx) => {
                      const rowKey = `t${rIdx + 1}`;
                      const rowVal = answersState[q.id]?.[rowKey] || { initial: 0.00, final: '', titre: '' };
                      return (
                        <tr key={rIdx} className="border border-slate-700 hover:bg-slate-800/40 transition">
                          <td className="p-2.5 font-semibold text-white bg-slate-850 border border-slate-700">
                            {row.label}
                          </td>
                          <td className="p-2.5 border border-slate-700">
                            <input
                              type="number"
                              step="0.05"
                              disabled={isReadOnly}
                              placeholder="e.g. 24.50"
                              value={rowVal.final || ''}
                              onChange={e => handleTableChange(q.id, rowKey, 'final', Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                            />
                          </td>
                          <td className="p-2.5 border border-slate-700">
                            <input
                              type="number"
                              step="0.05"
                              disabled={isReadOnly}
                              value={rowVal.initial ?? 0.00}
                              onChange={e => handleTableChange(q.id, rowKey, 'initial', Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                            />
                          </td>
                          <td className="p-2.5 font-mono font-bold text-cyan-400 border border-slate-700">
                            {rowVal.titre ? `${rowVal.titre} cm³` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* OBSERVATION + INFERENCE QUESTION */}
            {q.type === 'observation_inference' && (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  placeholder="Record your observations (colour changes, precipitates formed/dissolved, gas evolved) and chemical inferences..."
                  value={answersState[q.id] || ''}
                  onChange={e => handleTextChange(q.id, e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
                />
                {!isExamMode && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Practice Hint: Be precise in reporting color and physical state (e.g. "dirty-green precipitate", "brick-red precipitate"). Wrong lab actions will cause inaccurate observations and marks deduction!</span>
                  </div>
                )}
              </div>
            )}

            {/* CALCULATION QUESTION */}
            {q.type === 'calculation' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="any"
                    disabled={isReadOnly}
                    placeholder="Enter calculated numerical value..."
                    value={answersState[q.id] || ''}
                    onChange={e => handleNumberChange(q.id, Number(e.target.value))}
                    className="w-56 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                  <span className="text-xs text-slate-400 font-semibold">{q.unit}</span>
                </div>
                {q.formulaHint && !isExamMode && (
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Working formula: {q.formulaHint}
                  </p>
                )}
              </div>
            )}

            {/* SHORT ANSWER QUESTION */}
            {q.type === 'short_answer' && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  disabled={isReadOnly}
                  placeholder="Type your scientific deduction..."
                  value={answersState[q.id] || ''}
                  onChange={e => handleTextChange(q.id, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            )}

          </div>
        ))}
      </div>

      {!isReadOnly && (
        <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Double check all your recorded values and observations before final submission.
          </span>
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Practical Answer Sheet</span>
          </button>
        </div>
      )}
    </form>
  );
};
