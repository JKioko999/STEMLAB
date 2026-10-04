import React, { useState, useEffect } from 'react';
import { AnswerSheetQuestion, StudentAnswer } from '../../types';
import { 
  CheckCircle2, 
  HelpCircle, 
  FlaskConical, 
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

  // Auto-Fill from Live Telemetry
  const handleAutoFillFromTelemetry = (questionId: string, qType: string) => {
    if (!liveTelemetry) return;

    if (qType === 'data_table') {
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
        setCopiedNotification('Recorded live burette readings into titre table.');
      } else if (liveTelemetry.current !== undefined) {
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
        setAnswersState(prev => ({
          ...prev,
          [questionId]: liveTelemetry.titre
        }));
        setCopiedNotification(`Pasted live volume (${liveTelemetry.titre} cm³) into calculation.`);
      }
    }

    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Grade student answers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluatedAnswers: StudentAnswer[] = questions.map(q => {
      const val = answersState[q.id];
      let autoScore = 0;

      if (q.type === 'data_table') {
        if (val && Object.keys(val).length >= (q.tableRows?.length || 3)) {
          const rowKeys = Object.keys(val);
          let allConsistent = true;
          let withinAccuracy = true;
          const standardTitre = q.tableRows?.[0]?.simulatedValue || 24.50;

          rowKeys.forEach(k => {
            const r = val[k];
            if (r && r.titre !== undefined) {
              const diff = Math.abs(r.titre - standardTitre);
              if (diff > 0.40) withinAccuracy = false;
            }
          });

          if (withinAccuracy) {
            autoScore = q.maxMarks;
          } else {
            autoScore = Math.max(1, Math.round(q.maxMarks * 0.6));
          }
        }
      } else if (q.type === 'calculation') {
        const numVal = Number(val);
        const correctVal = q.correctNumericValue;
        const tol = q.tolerance || 0.2;
        if (!isNaN(numVal) && correctVal !== undefined) {
          if (Math.abs(numVal - correctVal) <= tol) {
            autoScore = q.maxMarks;
          } else if (Math.abs(numVal - correctVal) <= tol * 2) {
            autoScore = Math.max(1, Math.floor(q.maxMarks / 2));
          }
        } else if (numVal > 0) {
          autoScore = Math.max(1, Math.floor(q.maxMarks / 2));
        }
      } else if (q.type === 'observation_inference') {
        const text = String(val || '').toLowerCase();
        let matchedKeywords = 0;
        const keywords = [
          ...(q.observationAcceptedKeywords || []),
          ...(q.inferenceAcceptedKeywords || [])
        ];
        keywords.forEach((kw: string) => {
          if (text.includes(kw.toLowerCase())) {
            matchedKeywords++;
          }
        });

        if (matchedKeywords >= 2) {
          autoScore = q.maxMarks;
        } else if (matchedKeywords === 1) {
          autoScore = Math.ceil(q.maxMarks / 2);
        } else if (text.trim().length > 10) {
          autoScore = 1;
        }
      } else if (q.type === 'short_answer') {
        const text = String(val || '').toLowerCase();
        let matched = false;
        const keywords = [
          ...(q.observationAcceptedKeywords || []),
          ...(q.inferenceAcceptedKeywords || [])
        ];
        keywords.forEach((kw: string) => {
          if (text.includes(kw.toLowerCase())) matched = true;
        });
        if (matched) autoScore = q.maxMarks;
        else if (text.trim().length > 5) autoScore = 1;
      }

      return {
        questionId: q.id,
        questionPrompt: q.prompt,
        studentValue: val,
        autoScore,
        maxMarks: q.maxMarks,
        feedback: autoScore === q.maxMarks 
          ? 'Full marks awarded based on standard criteria.' 
          : autoScore > 0 
          ? 'Partial marks awarded.' 
          : 'Values outside accepted tolerance range.'
      };
    });

    onSubmit(evaluatedAnswers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Digital answer sheet
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isExamMode 
              ? 'Record your readings and calculations. Work is graded automatically against standard criteria.'
              : 'Practice mode: fill in readings and observations. Data is kept in memory while you switch tabs.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onReturnToLab && (
            <button
              type="button"
              onClick={onReturnToLab}
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-750 transition flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
              <span>Lab apparatus</span>
            </button>
          )}
        </div>
      </div>

      {/* Laboratory reference dock */}
      {liveTelemetry && (
        <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Live experiment readings
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Preserved in memory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Titration Telemetry */}
            {liveTelemetry.titre !== undefined && (
              <>
                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Burette delivered (V)</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {liveTelemetry.titre.toFixed(2)} cm³
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Solution appearance</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                    {liveTelemetry.solutionAppearance || 'Colorless'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Status</span>
                  <span className={`text-xs font-medium ${liveTelemetry.isInaccurate ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {liveTelemetry.isInaccurate ? (liveTelemetry.inaccuracyReason || 'Inaccurate') : 'Standard volume'}
                  </span>
                </div>
              </>
            )}

            {/* Circuit Telemetry */}
            {liveTelemetry.current !== undefined && (
              <>
                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Ammeter (I)</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {liveTelemetry.current.toFixed(3)} A
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Voltmeter (V)</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {liveTelemetry.voltage.toFixed(2)} V
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Circuit state</span>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {liveTelemetry.circuitStateText}
                  </span>
                </div>
              </>
            )}

            {/* Qualitative or Food Test Telemetry */}
            {liveTelemetry.tubes !== undefined && (
              <div className="md:col-span-3 bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-medium mb-1">Active test tubes</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {liveTelemetry.tubes.map((tb: any) => (
                    <div key={tb.id} className="p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{tb.name}: </span>
                      <span className="text-slate-600 dark:text-slate-400">{tb.observationText || tb.observationSummary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {liveTelemetry.scientificObservation && (
            <div className="p-2.5 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Workbench observation:</strong> {liveTelemetry.scientificObservation}</span>
            </div>
          )}

          {copiedNotification && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>{copiedNotification}</span>
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                Question {idx + 1}: {q.prompt}
              </span>
              <div className="flex items-center space-x-2 shrink-0">
                {liveTelemetry && (
                  <button
                    type="button"
                    onClick={() => handleAutoFillFromTelemetry(q.id, q.type)}
                    className="p-1 px-2 rounded border border-slate-300 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Paste reading from your live workbench"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Paste reading</span>
                  </button>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {q.maxMarks} marks
                </span>
              </div>
            </div>

            {/* DATA TABLE QUESTION */}
            {q.type === 'data_table' && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Trial</th>
                      <th className="p-2.5">Final reading (cm³)</th>
                      <th className="p-2.5">Initial reading (cm³)</th>
                      <th className="p-2.5">Volume used (cm³)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(q.tableRows || [
                      { label: 'Titre I (Trial)', simulatedValue: 24.50, tolerance: 0.20 },
                      { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
                      { label: 'Titre III (Accurate)', simulatedValue: 24.40, tolerance: 0.10 }
                    ]).map((row, rIdx) => {
                      const rowKey = `t${rIdx + 1}`;
                      const rowVal = answersState[q.id]?.[rowKey] || { initial: 0.00, final: '', titre: '' };
                      return (
                        <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-2.5 font-medium text-slate-900 dark:text-slate-200">
                            {row.label}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.05"
                              disabled={isReadOnly}
                              placeholder="e.g. 24.50"
                              value={rowVal.final || ''}
                              onChange={e => handleTableChange(q.id, rowKey, 'final', Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.05"
                              disabled={isReadOnly}
                              value={rowVal.initial ?? 0.00}
                              onChange={e => handleTableChange(q.id, rowKey, 'initial', Number(e.target.value))}
                              className="w-28 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                          </td>
                          <td className="p-2.5 font-mono font-medium text-slate-900 dark:text-slate-100">
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
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed"
                />
                {!isExamMode && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Practice note: Be specific with colors and physical states (e.g., dirty-green precipitate).</span>
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
                    className="w-56 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <span className="text-xs text-slate-500 font-medium">{q.unit}</span>
                </div>
                {q.formulaHint && !isExamMode && (
                  <p className="text-[11px] text-slate-500 font-mono">
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
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {!isReadOnly && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Check all recorded values and observations before submitting.
          </span>
          <button
            type="submit"
            className="py-2 px-4 rounded bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs transition flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit answer sheet</span>
          </button>
        </div>
      )}
    </form>
  );
};
