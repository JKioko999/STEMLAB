import React, { useState, useRef, useEffect } from 'react';
import { AnswerSheetQuestion } from '../../types';
import { 
  RotateCcw, 
  HelpCircle, 
  Check, 
  Sparkles, 
  Trash2, 
  Download, 
  Maximize2,
  Table as TableIcon,
  TrendingUp,
  Crosshair
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface GraphPlottingQuestionProps {
  question: AnswerSheetQuestion;
  value?: { points: Point[]; hasCurve: boolean };
  onChange: (val: { points: Point[]; hasCurve: boolean }) => void;
  isReadOnly?: boolean;
  tableData?: any; // To allow 1-click importing from Table I
}

export const GraphPlottingQuestion: React.FC<GraphPlottingQuestionProps> = ({
  question,
  value,
  onChange,
  isReadOnly = false,
  tableData
}) => {
  const config = question.graphConfig || {
    xLabel: 'Crystallization temperature (°C)',
    yLabel: 'Solubility of solid A (g/100g of water)',
    xMin: 20,
    xMax: 80,
    xStep: 10,
    yMin: 0,
    yMax: 160,
    yStep: 20,
    curveType: 'smooth_curve'
  };

  const [points, setPoints] = useState<Point[]>(value?.points || []);
  const [hasCurve, setHasCurve] = useState<boolean>(value?.hasCurve ?? true);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Sync to parent
  useEffect(() => {
    onChange({ points, hasCurve });
  }, [points, hasCurve]);

  // Graph Dimensions
  const PADDING = { top: 40, right: 30, bottom: 50, left: 65 };
  const WIDTH = 680;
  const HEIGHT = 460;
  const GRAPH_WIDTH = WIDTH - PADDING.left - PADDING.right;
  const GRAPH_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

  // Math conversions
  const toSvgX = (dataX: number) => {
    const ratio = (dataX - config.xMin) / (config.xMax - config.xMin);
    return PADDING.left + ratio * GRAPH_WIDTH;
  };

  const toSvgY = (dataY: number) => {
    const ratio = (dataY - config.yMin) / (config.yMax - config.yMin);
    return PADDING.top + GRAPH_HEIGHT - (ratio * GRAPH_HEIGHT);
  };

  const toDataCoords = (svgX: number, svgY: number) => {
    const ratioX = (svgX - PADDING.left) / GRAPH_WIDTH;
    const ratioY = (PADDING.top + GRAPH_HEIGHT - svgY) / GRAPH_HEIGHT;
    const rawX = config.xMin + ratioX * (config.xMax - config.xMin);
    const rawY = config.yMin + ratioY * (config.yMax - config.yMin);
    return {
      x: Math.max(config.xMin, Math.min(config.xMax, Math.round(rawX * 10) / 10)),
      y: Math.max(config.yMin, Math.min(config.yMax, Math.round(rawY * 10) / 10))
    };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isReadOnly || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
      clickX < PADDING.left || 
      clickX > PADDING.left + GRAPH_WIDTH || 
      clickY < PADDING.top || 
      clickY > PADDING.top + GRAPH_HEIGHT
    ) {
      return;
    }

    const { x, y } = toDataCoords(clickX, clickY);

    // If near an existing point within 15px, remove or select
    const existingIndex = points.findIndex(p => {
      const px = toSvgX(p.x);
      const py = toSvgY(p.y);
      const dist = Math.hypot(px - clickX, py - clickY);
      return dist < 12;
    });

    if (existingIndex >= 0) {
      // Remove point
      setPoints(prev => prev.filter((_, i) => i !== existingIndex));
      setSelectedPointId(null);
    } else {
      // Add point
      const newPt: Point = {
        id: `pt-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
        x,
        y
      };
      setPoints(prev => [...prev, newPt]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
      mouseX >= PADDING.left && 
      mouseX <= PADDING.left + GRAPH_WIDTH && 
      mouseY >= PADDING.top && 
      mouseY <= PADDING.top + GRAPH_HEIGHT
    ) {
      setHoverCoord(toDataCoords(mouseX, mouseY));
    } else {
      setHoverCoord(null);
    }
  };

  const handleClearAll = () => {
    if (isReadOnly) return;
    setPoints([]);
  };

  const handleImportFromTable = () => {
    if (isReadOnly) return;
    // Standard KCSE Solubility Points:
    // 4cm³ (150 g/100g, 68°C), 5cm³ (120 g/100g, 59°C), 6cm³ (100 g/100g, 52°C), 7cm³ (85.7 g/100g, 45°C), 8cm³ (75 g/100g, 39°C)
    const presetPoints: Point[] = [
      { id: 'pt-1', x: 68.0, y: 150.0 },
      { id: 'pt-2', x: 59.0, y: 120.0 },
      { id: 'pt-3', x: 52.0, y: 100.0 },
      { id: 'pt-4', x: 45.0, y: 85.7 },
      { id: 'pt-5', x: 39.0, y: 75.0 }
    ];
    setPoints(presetPoints);
    setHasCurve(true);
  };

  // Generate smooth curve SVG path through points sorted by X
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  const generateCurvePath = () => {
    if (sortedPoints.length < 2) return '';
    let d = `M ${toSvgX(sortedPoints[0].x)} ${toSvgY(sortedPoints[0].y)}`;
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p0 = sortedPoints[i === 0 ? i : i - 1];
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];
      const p3 = sortedPoints[i + 2 < sortedPoints.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = toSvgX(p1.x + (p2.x - p0.x) / 6);
      const cp1y = toSvgY(p1.y + (p2.y - p0.y) / 6);
      const cp2x = toSvgX(p2.x - (p3.x - p1.x) / 6);
      const cp2y = toSvgY(p2.y - (p3.y - p1.y) / 6);

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toSvgX(p2.x)} ${toSvgY(p2.y)}`;
    }
    return d;
  };

  // Generate Axis Grid Ticks
  const xTicks: number[] = [];
  const xStep = config.xStep || 10;
  for (let val = config.xMin; val <= config.xMax; val += xStep) {
    xTicks.push(val);
  }

  const yTicks: number[] = [];
  const yStep = config.yStep || 20;
  for (let val = config.yMin; val <= config.yMax; val += yStep) {
    yTicks.push(val);
  }

  return (
    <div className="space-y-3 pt-2">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Millimeter Examination Grid Paper</span>
          </div>
          <span className="text-[11px] text-slate-500">
            ({points.length} points plotted)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {hoverCoord && (
            <div className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px] font-mono flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-emerald-600" />
              <span>X: {hoverCoord.x.toFixed(1)}°C | Y: {hoverCoord.y.toFixed(1)} g</span>
            </div>
          )}

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={handleImportFromTable}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[11px] transition shadow-2xs flex items-center gap-1"
                title="Plot data from Table I readings"
              >
                <TableIcon className="w-3 h-3 text-emerald-600" />
                <span>Auto-Plot Table I Points</span>
              </button>

              <button
                type="button"
                onClick={() => setHasCurve(!hasCurve)}
                className={`px-2.5 py-1 rounded font-medium text-[11px] transition shadow-2xs flex items-center gap-1 ${
                  hasCurve 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{hasCurve ? '✓ Best-Fit Curve Active' : 'Draw Curve'}</span>
              </button>

              {points.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 px-2 rounded bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 border border-slate-200 dark:border-slate-700 font-medium text-[11px] transition"
                  title="Clear all plotted points"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SVG Millimeter Graph Paper */}
      <div className="relative overflow-x-auto rounded-xl border-2 border-emerald-700/30 bg-[#f4faf5] dark:bg-[#071b0e] shadow-inner p-2 select-none">
        
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full max-w-full h-auto cursor-crosshair"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
        >
          <defs>
            {/* Minor Millimeter Grid Pattern (2mm green lines) */}
            <pattern id="minorGrid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#22c55e" strokeWidth="0.3" strokeOpacity="0.35" />
            </pattern>
            {/* Major Millimeter Grid Pattern (10mm dark green lines) */}
            <pattern id="majorGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="url(#minorGrid)" />
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#15803d" strokeWidth="0.8" strokeOpacity="0.65" />
            </pattern>
          </defs>

          {/* Paper Background Fill with Millimeter Pattern */}
          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            fill="url(#majorGrid)"
          />

          {/* Graph Paper Outer Border */}
          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            fill="none"
            stroke="#166534"
            strokeWidth="1.5"
          />

          {/* X Axis Major Grid Lines & Labels */}
          {xTicks.map(val => {
            const x = toSvgX(val);
            return (
              <g key={`x-${val}`}>
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={PADDING.top + GRAPH_HEIGHT}
                  stroke="#166534"
                  strokeWidth="1"
                  strokeOpacity="0.8"
                />
                <text
                  x={x}
                  y={PADDING.top + GRAPH_HEIGHT + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#14532d"
                  className="font-mono dark:fill-emerald-300"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Y Axis Major Grid Lines & Labels */}
          {yTicks.map(val => {
            const y = toSvgY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + GRAPH_WIDTH}
                  y2={y}
                  stroke="#166534"
                  strokeWidth="1"
                  strokeOpacity="0.8"
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="600"
                  fill="#14532d"
                  className="font-mono dark:fill-emerald-300"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text
            x={PADDING.left + GRAPH_WIDTH / 2}
            y={HEIGHT - 12}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#0f3922"
            className="dark:fill-emerald-200"
          >
            {config.xLabel}
          </text>

          <text
            x={-PADDING.top - GRAPH_HEIGHT / 2}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#0f3922"
            className="dark:fill-emerald-200"
          >
            {config.yLabel}
          </text>

          {/* Smooth Best-Fit Solubility Curve */}
          {hasCurve && sortedPoints.length >= 2 && (
            <path
              d={generateCurvePath()}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
          )}

          {/* Plotted Points (Rendered as Crisp Scientific Crosses '×' with Ring) */}
          {points.map(pt => {
            const sx = toSvgX(pt.x);
            const sy = toSvgY(pt.y);
            const isSel = selectedPointId === pt.id;

            return (
              <g key={pt.id} className="cursor-pointer group">
                {/* Circle target */}
                <circle
                  cx={sx}
                  cy={sy}
                  r="7"
                  fill={isSel ? '#fee2e2' : 'white'}
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  className="transition-transform group-hover:scale-125"
                />
                {/* Cross marker '×' inside */}
                <line x1={sx - 3.5} y1={sy - 3.5} x2={sx + 3.5} y2={sy + 3.5} stroke="#dc2626" strokeWidth="2" />
                <line x1={sx + 3.5} y1={sy - 3.5} x2={sx - 3.5} y2={sy + 3.5} stroke="#dc2626" strokeWidth="2" />
                
                {/* Coordinate Badge on Point */}
                <text
                  x={sx + 9}
                  y={sy - 6}
                  fontSize="9.5"
                  fontWeight="bold"
                  fill="#991b1b"
                  className="font-mono bg-white dark:fill-red-400 select-none pointer-events-none"
                >
                  ({pt.x.toFixed(0)}, {pt.y.toFixed(0)})
                </text>
              </g>
            );
          })}

          {/* Live Crosshair Guide on Hover */}
          {hoverCoord && (
            <g pointerEvents="none">
              <line
                x1={toSvgX(hoverCoord.x)}
                y1={PADDING.top}
                x2={toSvgX(hoverCoord.x)}
                y2={PADDING.top + GRAPH_HEIGHT}
                stroke="#047857"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={PADDING.left}
                y1={toSvgY(hoverCoord.y)}
                x2={PADDING.left + GRAPH_WIDTH}
                y2={toSvgY(hoverCoord.y)}
                stroke="#047857"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>

      </div>

      {/* Instructions & Help */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            <strong>Plotting instructions:</strong> Click on the green grid to plot coordinate points (Temperature on x-axis, Solubility on y-axis). Click any point again to remove it. Toggle the curve of best fit to trace the continuous solubility curve.
          </span>
        </div>
        <div className="shrink-0 font-semibold bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
          Scale: 10 units/cm
        </div>
      </div>

    </div>
  );
};
