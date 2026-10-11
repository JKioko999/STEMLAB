import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  experimentFromDb, 
  experimentToDb,
  ensureExperimentsInSupabase
} from '../db/supabase.js';
import { ExperimentSpec } from '../../src/types/index.js';

const router = Router();

// GET /api/experiments - List experiments with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject, tier, schoolId, teacherId } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await ensureExperimentsInSupabase();
        let query = supabase.from('experiments').select('*');
        if (subject) query = query.eq('subject', subject);
        if (tier) query = query.eq('owner_type', tier);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return res.json(data.map(experimentFromDb));
        }
      }
    }

    let results = [...store.experiments];
    if (subject) {
      results = results.filter(e => e.subject === subject);
    }
    if (tier) {
      results = results.filter(e => e.ownerType === tier);
    }
    if (schoolId) {
      results = results.filter(e => e.ownerType === 'global' || e.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter(e => e.ownerType === 'global' || e.teacherId === teacherId);
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/experiments/:id - Get single experiment specification
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('experiments').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return res.json(experimentFromDb(data));
        }
      }
    }

    const exp = store.experiments.find(e => e.id === id);
    if (!exp) {
      return res.status(404).json({ error: 'Experiment specification not found' });
    }
    return res.json(exp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments - Create a new experiment
router.post('/', async (req: Request, res: Response) => {
  try {
    const specData: ExperimentSpec = req.body;
    if (!specData.title || !specData.subject) {
      return res.status(400).json({ error: 'Missing required experiment title or subject' });
    }

    const newSpec: ExperimentSpec = {
      ...specData,
      id: specData.id || `exp-custom-${Date.now().toString(36)}`,
      status: 'published'
    };

    store.experiments.unshift(newSpec);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').insert([experimentToDb(newSpec)]);
      }
    }

    return res.status(201).json(newSpec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/experiments/:id - Modify / Update an existing experiment
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedSpec: ExperimentSpec = req.body;
    let found = false;

    store.experiments = store.experiments.map(e => {
      if (e.id === id) {
        found = true;
        return { ...updatedSpec, id };
      }
      return e;
    });

    if (!found) {
      store.experiments.unshift({ ...updatedSpec, id });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').upsert([experimentToDb({ ...updatedSpec, id })]);
      }
    }

    return res.json({ success: true, experiment: updatedSpec });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/experiments/:id - Delete an experiment
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    store.experiments = store.experiments.filter(e => e.id !== id);
    store.assignments = store.assignments.filter(a => a.experimentId !== id);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').delete().eq('id', id);
      }
    }

    return res.json({ success: true, deletedExperimentId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments/parse-ai - Autonomously parse raw experiment text using Gemini AI or smart scientific NLP
router.post('/parse-ai', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide experiment text or prompt to parse.' });
    }

    const trimmed = text.trim();
    let parsedResult: any = null;
    let engineSource = 'smart-scientific-nlp';

    // 1. Try Gemini API if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({});

        const systemPrompt = `You are an expert KCSE (Kenya Certificate of Secondary Education) Senior Science Examiner and Virtual Laboratory Architect.
A teacher provides raw practical examination instructions, procedures, questions, or teacher notes.
Your task is to autonomously read, parse, and structure this into a complete virtual experiment specification JSON.

The JSON schema must adhere to:
{
  "title": string (concise descriptive title),
  "subject": "chemistry" | "physics" | "biology",
  "kcsePaper": string (e.g. "233/3 (KCSE Chemistry Practical)"),
  "topic": string (concise curriculum topic),
  "objectives": string[],
  "estimatedDurationMinutes": number,
  "simulationType": "solubility" | "titration" | "circuit" | "qualitative" | "food_test" | "hookes_law" | "thermochemistry" | "universal",
  "apparatus": [
    {
      "name": string (EXACT apparatus or chemical name, e.g. "Graduated Burette (50 cm³)", "Pipette (25.0 cm³) & Filler Bulb", "Conical Flask (250 cm³)", "Solution M: 0.2 M sodium hydroxide"),
      "subject": "chemistry" | "physics" | "biology",
      "icon": "Burette" | "FlaskConical" | "Pipette" | "Clamp" | "Cylinder" | "TestTube" | "Beaker" | "Activity" | "Flame" | "Layers" | "Droplets" | "Square" | "Scale" | "Zap" | "Gauge" | "Clock" | "Sliders" | "Search",
      "isDistractor": boolean
    }
  ],
  "procedures": [
    {
      "number": number,
      "title": string,
      "description": string,
      "steps": [
        {
          "id": number,
          "instruction": string (clean step instruction, without leading numbers or bullets),
          "validationType": "apparatus_placed" | "volume_set" | "reagent_added" | "heated" | "reading_recorded" | "observation_made" | "diluted" | "run_simulation" | "connection_made",
          "validationDetail": string,
          "marks": number,
          "hint": string,
          "allowForcePush": true,
          "procedureNumber": number,
          "expectedResult": string (teacher's exact expected observation or outcome for this step)
        }
      ]
    }
  ],
  "answerSheet": [
    {
      "id": string,
      "type": "data_table" | "calculation" | "graph" | "short_answer" | "observation_inference",
      "prompt": string,
      "maxMarks": number,
      "procedureNumber": number,
      "tableHeaders": string[],
      "tableRows": [ { "label": string, "simulatedValue": number, "tolerance": number } ],
      "graphConfig": { "xLabel": string, "yLabel": string, "xMin": number, "xMax": number, "yMin": number, "yMax": number },
      "correctNumericValue": number,
      "tolerance": number,
      "unit": string,
      "formulaHint": string,
      "modelAnswer": string,
      "acceptedKeywords": string[]
    }
  ],
  "simulationConfig": {
    "colorBefore": string (initial liquid color e.g. "Yellow", "Colourless", "Pink", "Brown"),
    "colorAfter": string (expected final liquid color or precipitate e.g. "Orange", "Colourless", "Pink", "Yellow precipitate"),
    "colorHexBefore": string (CSS hex e.g. "#eab308", "#e0f2fe", "#f472b6"),
    "colorHexAfter": string (CSS hex e.g. "#f97316", "#f8fafc", "#facc15"),
    "expectedObservation": string (teacher's exact expected observation and reaction description),
    "expectedGas": string (e.g. "Hydrogen", "Carbon dioxide", "Oxygen", "None"),
    "initialTemperature": number,
    "finalTemperature": number,
    "maxTemperature": number
  }
}

MANDATORY INSTRUCTIONS:
1. EXHAUSTIVE APPARATUS SCANNING:
   - Thoroughly read BOTH the "You are provided with" / Requirements section AND the "Procedure" / Steps.
   - Any apparatus, glassware, or instruments mentioned or required in the procedures MUST be included in "apparatus".
   - If the teacher writes "Fill the burrete with dilute Hydrochloric acid" and "Pippete 25cm3 of sodium hydroxide into a conical flask", you MUST include:
     * Graduated Burette (50 cm³) [icon: "Burette"]
     * Pipette (25.0 cm³) & Filler Bulb [icon: "Pipette"]
     * Conical Flask (250 cm³) [icon: "FlaskConical"]
     * Retort Stand & Clamp [icon: "Clamp"]
     * White Tile [icon: "Square"]
   - Be resilient to common student/teacher typos: "burrete", "burrette" -> Burette; "pippete", "pipet" -> Pipette; "sodium hydrotide" -> Sodium hydroxide.
2. STRICTLY NO UNNEEDED CHEMICALS:
   - ONLY include chemicals and reagents mentioned by the teacher (e.g. Solution M, Solution N, Solid X, Methyl Orange indicator).
   - NEVER add extraneous chemicals (do NOT add Solution A, Solution B, Solution K, Solid A, phenolphthalein, etc. unless explicitly provided in the teacher's text).
3. ACCURATE SIMULATION TYPE:
   - If the experiment involves titration (burette, pipette, titration to endpoint), set "simulationType": "titration".
4. ACCURATE WORKBENCH RESULTS & COLOR CHANGES:
   - Expected results and observations MUST match what the teacher gave or standard chemical reality for the experiment:
   - If Methyl Orange indicator is added to alkali (e.g. Solution M) and titrated with acid (Solution N):
     * colorBefore: "Yellow", colorHexBefore: "#eab308"
     * colorAfter: "Orange / Pink", colorHexAfter: "#f97316"
     * expectedObservation: "Solution turns from yellow to orange/pink at equivalence end-point."
   - If Phenolphthalein is used: colorBefore: "Pink" (#f472b6), colorAfter: "Colourless" (#f8fafc).
   - If the teacher explicitly specified an expected result or observation in their text, use that EXACT statement.
5. Return ONLY valid JSON without markdown fences.`;

        // Helper for strict API timeout
        const withTimeout = <T>(promise: Promise<T>, ms = 4500): Promise<T> =>
          Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms))
          ]);

        // Try gemini-3.1-flash-lite first for rapid response, then gemini-3.8-flash with timeout
        let rawText = '';
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: `${systemPrompt}\n\nUSER EXPERIMENT INPUT TEXT:\n${trimmed}`,
              config: { responseMimeType: 'application/json' }
            }),
            4000
          );
          rawText = response.text?.trim() || '';
          engineSource = 'gemini-3.1-flash-lite';
        } catch (liteErr: any) {
          console.warn('gemini-3.1-flash-lite failed or timed out, trying gemini-3.8-flash:', liteErr?.message);
          try {
            const response = await withTimeout(
              ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `${systemPrompt}\n\nUSER EXPERIMENT INPUT TEXT:\n${trimmed}`,
                config: { responseMimeType: 'application/json' }
              }),
              4000
            );
            rawText = response.text?.trim() || '';
            engineSource = 'gemini-3.8-flash';
          } catch (flashErr: any) {
            console.warn('Gemini calls failed, falling back immediately to smart heuristics:', flashErr?.message);
          }
        }

        if (rawText) {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            parsedResult = JSON.parse(match[0]);
          } else {
            parsedResult = JSON.parse(rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim());
          }

          // Clean Gemini apparatus - strictly remove any distractor items
          if (parsedResult && Array.isArray(parsedResult.apparatus)) {
            parsedResult.apparatus = parsedResult.apparatus.filter((a: any) => !a.isDistractor);
          }

          // Safety check: ensure Burette, Pipette, Flask, Indicators mentioned in text are included
          const lowText = trimmed.toLowerCase();
          if (/(?:burette|burrete|burrette|buret)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a: any) => /(?:burette|burrete|burrette|buret)/i.test(a.name))) {
              parsedResult.apparatus.unshift({
                name: 'Graduated Burette (50 cm³)',
                subject: 'chemistry',
                icon: 'Burette',
                isDistractor: false
              });
            }
            parsedResult.simulationType = 'titration';
          }
          if (/(?:pipette|pippete|pipet)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a: any) => /(?:pipette|pippete|pipet)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: 'Pipette (25.0 cm³) & Filler Bulb',
                subject: 'chemistry',
                icon: 'Pipette',
                isDistractor: false
              });
            }
          }
          if (/(?:conical\s*flask|flask)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a: any) => /(?:flask)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: 'Conical Flask (250 cm³)',
                subject: 'chemistry',
                icon: 'FlaskConical',
                isDistractor: false
              });
            }
          }
          if (/(?:methyl\s*orange)/i.test(lowText)) {
            if (!parsedResult.apparatus.some((a: any) => /(?:methyl\s*orange)/i.test(a.name))) {
              parsedResult.apparatus.push({
                name: 'Methyl Orange Indicator',
                subject: 'chemistry',
                icon: 'Droplets',
                isDistractor: false
              });
            }
            if (!parsedResult.simulationConfig) parsedResult.simulationConfig = {};
            if (!parsedResult.simulationConfig.colorBefore) parsedResult.simulationConfig.colorBefore = 'Yellow';
            if (!parsedResult.simulationConfig.colorHexBefore) parsedResult.simulationConfig.colorHexBefore = '#eab308';
            if (!parsedResult.simulationConfig.colorAfter) parsedResult.simulationConfig.colorAfter = 'Orange / Pink';
            if (!parsedResult.simulationConfig.colorHexAfter) parsedResult.simulationConfig.colorHexAfter = '#f97316';
            if (!parsedResult.simulationConfig.expectedObservation) {
              parsedResult.simulationConfig.expectedObservation = 'Solution changes from yellow to orange/pink at equivalence end-point.';
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini experiment parsing failed, falling back to smart rule parser:', geminiErr?.message || geminiErr);
      }
    }

    // 2. High-Precision Scientific NLP Parser fallback
    if (!parsedResult || !parsedResult.procedures || parsedResult.procedures.length === 0 || !parsedResult.apparatus || parsedResult.apparatus.length === 0) {
      parsedResult = parseExperimentWithHeuristics(trimmed);
      engineSource = 'smart-scientific-nlp';
    }

    return res.json({
      success: true,
      source: engineSource,
      experiment: parsedResult
    });
  } catch (err: any) {
    console.error('Error parsing experiment text:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse experiment text' });
  }
});

// Comprehensive, Section-Aware Multi-Domain Scientific NLP Parser
function parseExperimentWithHeuristics(rawInput: string): any {
  const normalized = rawInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lower = normalized.toLowerCase();
  const allLines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Detect Subject
  const isPhysics = lower.includes('physics') || lower.includes('current') || lower.includes('voltage') || 
    lower.includes('ammeter') || lower.includes('voltmeter') || lower.includes('resistance') || 
    lower.includes('resistor') || lower.includes('rheostat') || lower.includes('spring') || 
    lower.includes('hooke') || lower.includes('pendulum') || lower.includes('metre rule') ||
    lower.includes('stopwatch') || lower.includes('refraction') || lower.includes('prism') ||
    lower.includes('optical pin') || lower.includes('incident ray') || lower.includes('focal length') ||
    lower.includes('micrometer') || lower.includes('vernier');

  const isBiology = lower.includes('biology') || lower.includes('food test') || lower.includes('benedict') || 
    lower.includes('biuret') || lower.includes('iodine') || lower.includes('reducing sugar') || 
    lower.includes('starch') || lower.includes('protein') || lower.includes('enzyme') || 
    lower.includes('osmosis') || lower.includes('transverse section') || lower.includes('dcpip') ||
    lower.includes('sucrose') || lower.includes('potato cylinder') || lower.includes('salivary amylase') ||
    lower.includes('specimen');

  const detectedSubject: 'chemistry' | 'physics' | 'biology' = isPhysics ? 'physics' : isBiology ? 'biology' : 'chemistry';

  // 2. Section Segmentation
  // Locate "You are provided with" or "Materials" block
  const providedRegex = /(?:you\s+are\s+provided\s+with|materials|apparatus\s+and\s+reagents|requirements)[:\s]*([\s\S]*?)(?=(?:you\s+are\s+required|procedure|method|aim|investigation|$))/i;
  const providedMatch = normalized.match(providedRegex);
  const providedSectionText = providedMatch ? providedMatch[1] : '';

  // Locate "You are required to" or Aim block
  const requiredRegex = /(?:you\s+are\s+required\s+to|aim|objective)[:\s]*([\s\S]*?)(?=(?:procedure|method|table|questions|$))/i;
  const requiredMatch = normalized.match(requiredRegex);
  const requiredSectionText = requiredMatch ? requiredMatch[1].trim() : '';

  // 3. Extract Apparatus and Reagents STRICTLY from the Teacher's Input Text
  const apparatusFound: any[] = [];
  const addApp = (name: string, subject: 'chemistry' | 'physics' | 'biology', icon: string) => {
    // Clean bullet prefixes, numbers like 1. or (a) or • but PRESERVE measurements like 100 cm³ or 0.1 M
    const cleanName = name
      .replace(/^[•*\-\s]+/, '')
      .replace(/^(?:\d+[\.)]|[a-h]\)|[ivx]+\))\s+/i, '')
      .trim();
    if (cleanName.length < 2) return;
    if (!apparatusFound.some(a => a.name.toLowerCase() === cleanName.toLowerCase())) {
      apparatusFound.push({ name: cleanName, subject, icon, isDistractor: false });
    }
  };

  // Helper to choose appropriate icon (with tolerance for typos like burrete, pippete)
  const getIconForName = (itemText: string): string => {
    const it = itemText.toLowerCase();
    if (it.includes('burette') || it.includes('burrete') || it.includes('burrette') || it.includes('buret')) return 'Burette';
    if (it.includes('pipette') || it.includes('pippete') || it.includes('pipet')) return 'Pipette';
    if (it.includes('conical flask') || it.includes('flask')) return 'FlaskConical';
    if (it.includes('boiling tube') || it.includes('test tube') || it.includes('tube rack') || it.includes('tube')) return 'TestTube';
    if (it.includes('cylinder')) return 'Cylinder';
    if (it.includes('beaker') || it.includes('water bath')) return 'Beaker';
    if (it.includes('thermometer') || it.includes('temp')) return 'Activity';
    if (it.includes('burner') || it.includes('flame') || it.includes('heat') || it.includes('tripod')) return 'Flame';
    if (it.includes('stopwatch') || it.includes('stop watch') || it.includes('timer') || it.includes('clock')) return 'Clock';
    if (it.includes('balance') || it.includes('scale') || it.includes('mass') || it.includes('weight')) return 'Scale';
    if (it.includes('ammeter') || it.includes('voltmeter') || it.includes('meter')) return 'Gauge';
    if (it.includes('rheostat') || it.includes('resistor')) return 'Sliders';
    if (it.includes('wire') || it.includes('cell') || it.includes('switch') || it.includes('circuit')) return 'Zap';
    if (it.includes('solid') || it.includes('ribbon') || it.includes('metal') || it.includes('zinc') || it.includes('powder') || it.includes('chips') || it.includes('crystals') || it.includes('specimen')) return 'Layers';
    if (it.includes('prism') || it.includes('pin') || it.includes('board') || it.includes('paper') || it.includes('tile') || it.includes('ruler')) return 'Square';
    if (it.includes('indicator') || it.includes('water') || it.includes('acid') || it.includes('solution') || it.includes('liquid') || it.includes('extract') || it.includes('reagent')) return 'Droplets';
    return 'Droplets';
  };

  // 3a. Extract provided materials / reagents from "You are provided with" section
  if (providedSectionText) {
    const providedLines = providedSectionText.split('\n').map(l => l.trim()).filter(Boolean);
    for (const pl of providedLines) {
      const cleaned = pl
        .replace(/^[•*\-\s]+/, '')
        .replace(/^\d+[\.)]\s+/, '')
        .replace(/^(?:[a-z]\)|[ivx]+\))\s+/i, '')
        .replace(/–/g, '-')
        .trim();
      if (
        cleaned.length > 2 &&
        !cleaned.toLowerCase().startsWith('you are required') &&
        !cleaned.toLowerCase().startsWith('you are provided') &&
        !cleaned.toLowerCase().startsWith('the following') &&
        !cleaned.toLowerCase().startsWith('procedure') &&
        !cleaned.toLowerCase().startsWith('method') &&
        !cleaned.toLowerCase().startsWith('table') &&
        !cleaned.toLowerCase().startsWith('questions')
      ) {
        addApp(cleaned, detectedSubject, getIconForName(cleaned));
      }
    }
  }

  // 3b. Scan entire text (including procedures) for lab apparatus, glassware, indicators & chemicals
  // Burette (support typos: burrete, burrette, buret)
  if (/(?:burette|burrete|burrette|buret)/i.test(lower)) {
    addApp('Graduated Burette (50 cm³)', 'chemistry', 'Burette');
    addApp('Retort Stand & Clamp', 'chemistry', 'Clamp');
  }

  // Pipette (support typos: pippete, pipet)
  if (/(?:pipette|pippete|pipet)/i.test(lower)) {
    addApp('Pipette (25.0 cm³) & Filler Bulb', 'chemistry', 'Pipette');
  }

  // Conical Flask
  if (/(?:conical\s*flask|flask)/i.test(lower)) {
    addApp('Conical Flask (250 cm³)', 'chemistry', 'FlaskConical');
  }

  // White Tile
  if (/(?:white\s*tile|tile)/i.test(lower) || /(?:burette|burrete|titrat)/i.test(lower)) {
    addApp('White Tile', 'chemistry', 'Square');
  }

  // Indicators mentioned in text
  if (/(?:methyl\s*orange)/i.test(lower)) {
    addApp('Methyl Orange Indicator', 'chemistry', 'Droplets');
  }
  if (/(?:phenolphthalein)/i.test(lower)) {
    addApp('Phenolphthalein Indicator', 'chemistry', 'Droplets');
  }
  if (/(?:universal\s*indicator)/i.test(lower)) {
    addApp('Universal Indicator', 'chemistry', 'Droplets');
  }
  if (/(?:litmus)/i.test(lower)) {
    addApp('Litmus Indicator Solution', 'chemistry', 'Droplets');
  }
  if (/(?:starch\s*indicator|starch\s*solution)/i.test(lower)) {
    addApp('Starch Indicator Solution', 'chemistry', 'Droplets');
  }

  // Beakers & Glassware
  if (/(?:beaker)/i.test(lower)) {
    addApp('Beaker (250 cm³)', detectedSubject, 'Beaker');
  }
  if (/(?:measuring\s*cylinder|graduated\s*cylinder)/i.test(lower)) {
    addApp('Measuring Cylinder (50 cm³)', detectedSubject, 'Cylinder');
  }
  if (/(?:boiling\s*tube)/i.test(lower)) {
    addApp('Pyrex Boiling Tube', detectedSubject, 'TestTube');
  }
  if (/(?:test\s*tube)/i.test(lower) && !/(?:boiling\s*tube)/i.test(lower)) {
    addApp('Test Tube', detectedSubject, 'TestTube');
  }
  if (/(?:thermometer)/i.test(lower)) {
    addApp('Laboratory Thermometer (-10 to 110°C)', detectedSubject, 'Activity');
  }
  if (/(?:bunsen|burner)/i.test(lower)) {
    addApp('Bunsen Burner & Tripod Stand', detectedSubject, 'Flame');
  }
  if (/(?:stopwatch|stop\s*watch)/i.test(lower)) {
    addApp('Stopwatch', detectedSubject, 'Clock');
  }
  if (/(?:electronic\s*balance|weighing\s*scale|balance)/i.test(lower)) {
    addApp('Electronic Balance', detectedSubject, 'Scale');
  }
  if (/(?:spatula)/i.test(lower)) {
    addApp('Laboratory Spatula', detectedSubject, 'Sliders');
  }
  if (/(?:filter\s*funnel|filter\s*paper)/i.test(lower)) {
    addApp('Filter Funnel & Filter Paper', detectedSubject, 'Search');
  }
  if (/(?:wash\s*bottle|distilled\s*water)/i.test(lower)) {
    addApp('Wash Bottle (Distilled Water)', detectedSubject, 'Droplets');
  }
  if (/(?:prism)/i.test(lower)) {
    addApp('Glass Prism', 'physics', 'Square');
  }
  if (/(?:optical\s*pin|pins)/i.test(lower)) {
    addApp('Optical Pins & Board', 'physics', 'Square');
  }
  if (/(?:ammeter)/i.test(lower)) {
    addApp('DC Ammeter (0 - 3A)', 'physics', 'Gauge');
  }
  if (/(?:voltmeter)/i.test(lower)) {
    addApp('DC Voltmeter (0 - 5V)', 'physics', 'Gauge');
  }
  if (/(?:rheostat)/i.test(lower)) {
    addApp('Variable Rheostat', 'physics', 'Sliders');
  }

  // Named solutions mentioned in text if not already extracted
  const namedSolMatches = normalized.match(/(?:solution|reagent)\s+[a-z\d](?:\s*[:\-–]\s*[^\n,;.]+)?/gi);
  if (namedSolMatches) {
    for (const m of namedSolMatches) {
      addApp(m.trim(), detectedSubject, 'Droplets');
    }
  }

  // 4. Extract Procedures & Steps
  // Identify procedure sections (e.g. PROCEDURE I, PROCEDURE II, or single PROCEDURE)
  const procedureSplitRegex = /(?:^|\n)(PROCEDURE\s*(?:[I|V|X]+|\d+|A|B)?|PART\s*[A-Z\d]|METHOD)[\s:–-]*/gi;
  const procMatches = [...normalized.matchAll(procedureSplitRegex)];

  interface RawProcBlock {
    title: string;
    text: string;
    number: number;
  }
  const procBlocks: RawProcBlock[] = [];

  if (procMatches.length > 0) {
    for (let i = 0; i < procMatches.length; i++) {
      const currentMatch = procMatches[i];
      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = i + 1 < procMatches.length ? procMatches[i + 1].index! : normalized.length;
      const blockText = normalized.substring(startIndex, endIndex);
      const procHeader = currentMatch[1].trim();

      procBlocks.push({
        title: procHeader.toUpperCase(),
        text: blockText,
        number: i + 1
      });
    }
  } else {
    // Single procedure block: look for steps anywhere after provided / required
    const afterIntro = normalized.replace(providedRegex, '').replace(requiredRegex, '');
    procBlocks.push({
      title: 'PROCEDURE I: Practical Investigation',
      text: afterIntro,
      number: 1
    });
  }

  // Parse steps inside each procedure block
  const parsedProcedures = procBlocks.map((pb, pIdx) => {
    const pLines = pb.text.split('\n').map(l => l.trim()).filter(Boolean);

    // Filter lines that are actual steps
    const stepLines: string[] = [];
    for (const line of pLines) {
      // Exclude table headers, notes, or apparatus bullets
      if (/^complete\s+table/i.test(line) || /^table\s+[ivx\d]/i.test(line) || /^questions/i.test(line) || /^record\s+(?:your\s+)?results\s+in\s+table/i.test(line)) {
        continue;
      }
      // Check if numbered or prefixed: 1., 2., Step 1:, i), (i), a), (a), 1), 1-, -, •, etc.
      const isNumberedStep = /^((?:step\s*)?\(?[ivx\d]+\)?[\.:\)\-]?|[a-h]\)|\([a-h]\)|\d+[\.:\)\-]|[•*\-])\s+/i.test(line);
      // Or begins with standard scientific procedure command verbs
      const isActionVerb = /^(measure|transfer|place|put|fill|add|heat|cool|record|titrate|observe|shake|insert|start|stop|connect|divide|dip|stir|erect|weigh|dilute|mix|pour|take|set\s+up|prepare|adjust|read|note|tabulate|clamp|attach|cut|filter|ignite|drop|allow|leave|switch|use|determine)\b/i.test(line);

      // Or non-empty narrative procedural step line in this block
      const isProceduralLine = line.length > 20 && !line.toLowerCase().startsWith('you are') && !line.toLowerCase().includes('marks');

      if (isNumberedStep || isActionVerb || isProceduralLine) {
        stepLines.push(line);
      }
    }

    // Clean up instructions
    const steps = (stepLines.length > 0 ? stepLines : [
      'Set up the provided apparatus and reaction vessel carefully.',
      'Measure the designated volume of solution and place into the reaction container.',
      'Add the reagent / specimen and immediately record the starting measurement.',
      'Record the experimental observations and readings at regular intervals.'
    ]).map((sl, sIdx) => {
      const cleanInstruction = sl.replace(/^((?:step\s*)?\(?[ivx\d]+\)?[\.:\)\-]?|[a-h]\)|\([a-h]\)|\d+[\.:\)\-]|[•*\-])\s+/i, '').trim();
      const sLower = cleanInstruction.toLowerCase();

      let vType: any = 'observation_made';
      if (sLower.includes('heat') || sLower.includes('flame') || sLower.includes('burner') || sLower.includes('boil')) {
        vType = 'heated';
      } else if (sLower.includes('transfer') || sLower.includes('measure') || sLower.includes('pipette') || sLower.includes('fill') || sLower.includes('cylinder') || sLower.includes('burette') || sLower.includes('water from the burette')) {
        vType = 'volume_set';
      } else if (sLower.includes('place') || sLower.includes('add') || sLower.includes('insert') || sLower.includes('drop') || sLower.includes('mix')) {
        vType = 'reagent_added';
      } else if (sLower.includes('record') || sLower.includes('reading') || sLower.includes('note') || sLower.includes('temperature') || sLower.includes('time')) {
        vType = 'reading_recorded';
      } else if (sLower.includes('connect') || sLower.includes('switch') || sLower.includes('wire') || sLower.includes('pins')) {
        vType = 'connection_made';
      } else if (sLower.includes('titrate') || sLower.includes('stopwatch') || sLower.includes('repeat')) {
        vType = 'run_simulation';
      }

      return {
        id: (pIdx * 10) + sIdx + 1,
        instruction: cleanInstruction,
        validationType: vType,
        validationDetail: `Step ${sIdx + 1} completed`,
        marks: 1,
        hint: `Follow the step closely: ${cleanInstruction.substring(0, 60)}...`,
        allowForcePush: true,
        procedureNumber: pb.number
      };
    });

    return {
      number: pb.number,
      title: pb.title.includes(':') ? pb.title : `${pb.title}: Experimental Investigation`,
      description: `Follow the step-by-step instructions for ${pb.title.toLowerCase()}.`,
      steps
    };
  });

  // 5. Intelligent Title Detection
  let detectedTitle = '';
  if (requiredSectionText) {
    // e.g. "(i) The solubility of solid A (ii) The R.M.M. of solid A"
    const cleanedReq = requiredSectionText.replace(/\n+/g, ' ').replace(/\(i\)/gi, '').replace(/\(ii\)/gi, '&').replace(/\(a\)/gi, '').trim();
    if (cleanedReq.toLowerCase().startsWith('the rate of reaction')) {
      detectedTitle = `Determination of ${cleanedReq.replace(/^(the\s+)/i, '')}`;
    } else if (cleanedReq.toLowerCase().includes('solubility') && cleanedReq.toLowerCase().includes('r.m.m')) {
      detectedTitle = 'Determination of Solubility of Solid A & Relative Molecular Mass (R.M.M.)';
    } else {
      detectedTitle = `Determination of ${cleanedReq.replace(/^(the\s+)/i, '')}`;
    }
  } else {
    // Check first line if not "You are provided with"
    const firstLine = allLines[0] || '';
    if (!firstLine.toLowerCase().includes('you are provided with') && !firstLine.toLowerCase().includes('question') && firstLine.length > 5 && firstLine.length < 80) {
      detectedTitle = firstLine;
    } else if (lower.includes('rate of reaction') || (lower.includes('magnesium') && lower.includes('hydrochloric'))) {
      detectedTitle = 'Rate of Reaction Between Magnesium Ribbon and Hydrochloric Acid';
    } else if (lower.includes('solubility') || lower.includes('crystalliz')) {
      detectedTitle = 'Solubility of Solid A & Relative Molecular Mass (R.M.M.) Determination';
    } else if (lower.includes('prism') || lower.includes('refraction')) {
      detectedTitle = 'Investigation of Refraction of Light Through a Triangular Glass Prism';
    } else if (lower.includes('hooke') || lower.includes('spring')) {
      detectedTitle = "Investigation of Hooke's Law & Determination of Spring Constant";
    } else if (lower.includes('food test') || lower.includes('benedict')) {
      detectedTitle = 'Qualitative Biochemical Food Tests on Food Solution Extract';
    } else {
      detectedTitle = `${detectedSubject.charAt(0).toUpperCase() + detectedSubject.slice(1)} Practical Laboratory Investigation`;
    }
  }

  // Capitalize title properly
  detectedTitle = detectedTitle.replace(/^Determination of determination of/i, 'Determination of').trim();

  // 6. Simulation Type Routing
  let simulationType: 'solubility' | 'titration' | 'circuit' | 'qualitative' | 'food_test' | 'hookes_law' | 'thermochemistry' | 'universal' = 'universal';
  if (lower.includes('solubility') && lower.includes('crystalliz')) {
    simulationType = 'solubility';
  } else if (
    lower.includes('titrat') || 
    /(?:burette|burrete|burrette|buret)/i.test(lower) || 
    /(?:pipette|pippete|pipet)/i.test(lower) ||
    lower.includes('standardize')
  ) {
    simulationType = 'titration';
  } else if (lower.includes('ammeter') && lower.includes('voltmeter') && (lower.includes('ohm') || lower.includes('resistance'))) {
    simulationType = 'circuit';
  } else if (lower.includes('qualitative') && (lower.includes('portion') || lower.includes('cation') || lower.includes('precipitate'))) {
    simulationType = 'qualitative';
  } else if (lower.includes('food test') || (lower.includes('benedict') && lower.includes('biuret'))) {
    simulationType = 'food_test';
  } else if (lower.includes('hooke') || (lower.includes('spring') && lower.includes('extension'))) {
    simulationType = 'hookes_law';
  } else if (lower.includes('enthalpy') || lower.includes('heat of neutral') || lower.includes('calorimeter')) {
    simulationType = 'thermochemistry';
  } else {
    // Rates of reaction, gas evolution, optics, general chemistry, biology, or ANY other experiment!
    simulationType = 'universal';
  }

  // 7. Dynamic Answer Sheet Generation
  const answerSheet: any[] = [];

  // Table generation tailored to experiment context
  if (lower.includes('magnesium') && lower.includes('hydrochloric') || lower.includes('rate of reaction') || (lower.includes('every 30 seconds') || lower.includes('stopwatch'))) {
    // Rate of reaction table: Time vs Temp / Observations
    answerSheet.push({
      id: 'q-table-rate',
      type: 'data_table',
      prompt: 'Table 1: Temperature of reaction mixture recorded every 30 seconds:',
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ['Time (seconds)', 'Temperature (°C)', 'Observations (Effervescence / Reaction Progress)'],
      tableRows: [
        { label: '0 seconds (Initial)', simulatedValue: 22.0, tolerance: 0.5 },
        { label: '30 seconds', simulatedValue: 26.5, tolerance: 1.0 },
        { label: '60 seconds', simulatedValue: 33.0, tolerance: 1.0 },
        { label: '90 seconds', simulatedValue: 41.5, tolerance: 1.5 },
        { label: '120 seconds', simulatedValue: 47.0, tolerance: 1.5 },
        { label: '150 seconds (Maximum)', simulatedValue: 49.5, tolerance: 1.5 },
        { label: '180 seconds', simulatedValue: 48.0, tolerance: 1.5 }
      ]
    });

    answerSheet.push({
      id: 'q-graph-rate',
      type: 'graph',
      prompt: 'Plot a graph of temperature (°C, vertical axis) against time (seconds, horizontal axis).',
      maxMarks: 3,
      procedureNumber: 1,
      graphConfig: {
        xLabel: 'Time (seconds)',
        yLabel: 'Temperature (°C)',
        xMin: 0,
        xMax: 180,
        yMin: 20,
        yMax: 55
      }
    });

    answerSheet.push({
      id: 'q-calc-rate',
      type: 'calculation',
      prompt: '(a) Determine the rate of temperature rise during the first 60 seconds (ΔT / Δt):',
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 0.18,
      tolerance: 0.04,
      unit: '°C / s',
      formulaHint: 'Rate = (Temperature at 60s - Temperature at 0s) / 60 seconds'
    });

    answerSheet.push({
      id: 'q-obs-reaction',
      type: 'short_answer',
      prompt: '(b) State the observation made when magnesium ribbon was added to Solution K, and identify the gas evolved.',
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: 'Rapid effervescence / bubbling of a colorless, odorless gas (Hydrogen gas). The mixture becomes hot.',
      acceptedKeywords: ['effervescence', 'bubbles', 'hydrogen', 'h2', 'hot', 'exothermic', 'magnesium dissolves']
    });

  } else if (simulationType === 'titration') {
    // Pure Titration Table
    answerSheet.push({
      id: 'q-table-titration-main',
      type: 'data_table',
      prompt: 'Table I: Titration readings (Titration of base against acid titrant):',
      maxMarks: 5,
      procedureNumber: 1,
      tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume of acid used (cm³)'],
      tableRows: [
        { label: 'Titre I (Trial)', simulatedValue: 24.60, tolerance: 0.20 },
        { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
        { label: 'Titre III (Accurate)', simulatedValue: 24.50, tolerance: 0.10 }
      ]
    });

    answerSheet.push({
      id: 'q-calc-average-titre',
      type: 'calculation',
      prompt: '(a) Calculate the average volume of acid used from your consistent accurate titres:',
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 24.50,
      tolerance: 0.10,
      unit: 'cm³',
      formulaHint: 'Average Volume = (Titre II + Titre III) / 2'
    });

    if (lower.includes('ram') || lower.includes('relative atomic mass') || lower.includes('f2co3') || lower.includes('solid x')) {
      answerSheet.push({
        id: 'q-calc-ram',
        type: 'calculation',
        prompt: '(b) Determine the Relative Atomic Mass (RAM) of F in F2CO3:',
        maxMarks: 3,
        procedureNumber: 1,
        correctNumericValue: 23.0,
        tolerance: 1.0,
        unit: 'g/mol',
        formulaHint: 'Moles = (Molarity × Volume) / 1000; Mass = Moles × Molar Mass'
      });
    } else {
      answerSheet.push({
        id: 'q-calc-concentration',
        type: 'calculation',
        prompt: '(b) Calculate the concentration of the solution standardized from the titration results:',
        maxMarks: 2,
        procedureNumber: 1,
        correctNumericValue: 0.20,
        tolerance: 0.05,
        unit: 'mol/dm³',
        formulaHint: 'M1 × V1 = M2 × V2'
      });
    }

    answerSheet.push({
      id: 'q-obs-titration',
      type: 'short_answer',
      prompt: '(c) State the observation and color change observed at the end-point of the titration.',
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: lower.includes('methyl orange') 
        ? 'Solution changes permanently from yellow to orange/pink at the end-point.'
        : lower.includes('phenolphthalein')
          ? 'Solution changes permanently from pink to colourless at the end-point.'
          : 'Permanent end-point color change persisted on swirling.',
      acceptedKeywords: lower.includes('methyl orange') ? ['yellow', 'orange', 'pink'] : ['pink', 'colourless', 'colorless']
    });

  } else if (simulationType === 'solubility') {
    // Solubility table
    answerSheet.push({
      id: 'q-table-solubility',
      type: 'data_table',
      prompt: 'Table I: Volume of distilled water added, calculated solubility of Solid A, and crystallization temperature (°C):',
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ['Volume of water added (cm³)', 'Solubility of Solid A (g / 100g water)', 'Crystallization temperature (°C)'],
      tableRows: [
        { label: '4.0 cm³ water', simulatedValue: 68.0, tolerance: 1.5 },
        { label: '5.0 cm³ water', simulatedValue: 59.0, tolerance: 1.5 },
        { label: '6.0 cm³ water', simulatedValue: 52.0, tolerance: 1.5 },
        { label: '7.0 cm³ water', simulatedValue: 45.0, tolerance: 1.5 },
        { label: '8.0 cm³ water', simulatedValue: 39.0, tolerance: 1.5 }
      ]
    });

    answerSheet.push({
      id: 'q-graph-solubility',
      type: 'graph',
      prompt: 'Plot a smooth solubility curve of solubility of Solid A (g/100g water) against crystallization temperature (°C).',
      maxMarks: 3,
      procedureNumber: 1,
      graphConfig: { xLabel: 'Temperature (°C)', yLabel: 'Solubility (g/100g water)', xMin: 30, xMax: 80, yMin: 60, yMax: 160 }
    });

    if (parsedProcedures.length > 1 || lower.includes('titrat') || lower.includes('r.m.m') || lower.includes('solution b')) {
      answerSheet.push({
        id: 'q-table-titration',
        type: 'data_table',
        prompt: 'Table II: Titration of organic acid against Solution B (0.20M NaOH):',
        maxMarks: 4,
        procedureNumber: 2,
        tableHeaders: ['Titre Number', 'Final burette reading (cm³)', 'Initial burette reading (cm³)', 'Volume used (cm³)'],
        tableRows: [
          { label: 'Titre I (Trial)', simulatedValue: 24.60, tolerance: 0.20 },
          { label: 'Titre II (Accurate)', simulatedValue: 24.50, tolerance: 0.10 },
          { label: 'Titre III (Accurate)', simulatedValue: 24.50, tolerance: 0.10 }
        ]
      });

      answerSheet.push({
        id: 'q-rmm-calc',
        type: 'calculation',
        prompt: 'Calculate the Relative Molecular Mass (R.M.M.) of Solid A:',
        maxMarks: 2,
        procedureNumber: 2,
        correctNumericValue: 126.0,
        tolerance: 3.0,
        unit: 'g/mol',
        formulaHint: 'R.M.M. = Mass / Moles'
      });
    }

  } else if (lower.includes('prism') || lower.includes('refraction')) {
    // Optics refraction table
    answerSheet.push({
      id: 'q-table-optics',
      type: 'data_table',
      prompt: 'Table 1: Angle of incidence i (°), angle of refraction r (°), sin i, and sin r:',
      maxMarks: 6,
      procedureNumber: 1,
      tableHeaders: ['Angle of incidence i (°)', 'Angle of refraction r (°)', 'sin i', 'sin r'],
      tableRows: [
        { label: 'Trial 1 (i = 30°)', simulatedValue: 19.5, tolerance: 0.5 },
        { label: 'Trial 2 (i = 40°)', simulatedValue: 25.4, tolerance: 0.5 },
        { label: 'Trial 3 (i = 50°)', simulatedValue: 30.7, tolerance: 0.5 },
        { label: 'Trial 4 (i = 60°)', simulatedValue: 35.3, tolerance: 0.5 }
      ]
    });

    answerSheet.push({
      id: 'q-calc-refractive-index',
      type: 'calculation',
      prompt: 'Calculate the refractive index n of the glass prism from your readings (n = sin i / sin r):',
      maxMarks: 2,
      procedureNumber: 1,
      correctNumericValue: 1.50,
      tolerance: 0.05,
      unit: '',
      formulaHint: 'n = sin(i) / sin(r)'
    });

  } else {
    // Universal general data table for any other experiment
    answerSheet.push({
      id: 'q-table-universal',
      type: 'data_table',
      prompt: 'Table 1: Experimental Observations, Measurements and Results:',
      maxMarks: 5,
      procedureNumber: 1,
      tableHeaders: ['Trial / Step', 'Reading / Measurement', 'Observation / Chemical State'],
      tableRows: [
        { label: 'Trial 1', simulatedValue: 24.5, tolerance: 1.0 },
        { label: 'Trial 2', simulatedValue: 32.0, tolerance: 1.0 },
        { label: 'Trial 3', simulatedValue: 40.5, tolerance: 1.0 }
      ]
    });

    answerSheet.push({
      id: 'q-deduction-universal',
      type: 'short_answer',
      prompt: '(a) State your deductions and conclusions based on the practical results obtained.',
      maxMarks: 2,
      procedureNumber: 1,
      modelAnswer: 'Accurate scientific deduction recorded consistent with observations and theoretical curriculum principles.',
      acceptedKeywords: ['observed', 'reaction', 'result', 'deduction', 'conclusion', 'increases', 'decreases']
    });
  }

  // 8. Extract Teacher's Expected Results, Observations & Color Changes
  let expectedObservation = '';
  let colorBefore = 'Colourless';
  let colorAfter = '';
  let colorHexBefore = '#e0f2fe';
  let colorHexAfter = '#e0f2fe';
  let expectedGas = 'None';
  let precipitateName = '';

  // Look for explicit teacher observation statements:
  // e.g. "Expected observation: A bright yellow precipitate of lead(II) iodide is formed."
  const explicitObsMatch = normalized.match(/(?:expected\s+(?:observation|result|colour|outcome)|observation|inference|expected\s+change)[:\s]+([^\n\r]+)/i);
  if (explicitObsMatch && explicitObsMatch[1].trim().length > 3) {
    expectedObservation = explicitObsMatch[1].trim();
  }

  // Look for color keywords in the teacher's text
  const textToScanForColors = (expectedObservation + ' ' + normalized).toLowerCase();

  if (textToScanForColors.includes('methyl orange')) {
    colorBefore = 'Yellow';
    colorHexBefore = '#eab308';
    colorAfter = 'Orange / Pink';
    colorHexAfter = '#f97316';
    if (!expectedObservation) expectedObservation = 'Solution turns from yellow to orange/pink at equivalence end-point.';
  } else if (textToScanForColors.includes('phenolphthalein')) {
    colorBefore = 'Pink';
    colorHexBefore = '#f472b6';
    colorAfter = 'Colourless';
    colorHexAfter = '#f8fafc';
    if (!expectedObservation) expectedObservation = 'Solution turns from pink to colourless at end-point.';
  } else if (textToScanForColors.includes('yellow precipitate') || textToScanForColors.includes('lead iodide') || textToScanForColors.includes('yellow ppt') || textToScanForColors.includes('lead(ii) iodide')) {
    colorAfter = 'Bright yellow precipitate';
    colorHexAfter = '#facc15';
    precipitateName = 'Yellow precipitate';
    if (!expectedObservation) expectedObservation = 'Bright yellow precipitate formed.';
  } else if (textToScanForColors.includes('blue-black') || textToScanForColors.includes('blue black') || (textToScanForColors.includes('starch') && textToScanForColors.includes('iodine'))) {
    colorAfter = 'Blue-black';
    colorHexAfter = '#1e1b4b';
    if (!expectedObservation) expectedObservation = 'Solution turns blue-black.';
  } else if (textToScanForColors.includes('brick-red') || textToScanForColors.includes('brick red') || (textToScanForColors.includes('benedict') && textToScanForColors.includes('reducing sugar'))) {
    colorAfter = 'Brick-red precipitate';
    colorHexAfter = '#dc2626';
    precipitateName = 'Brick-red precipitate';
    if (!expectedObservation) expectedObservation = 'Colour change to brick-red precipitate.';
  } else if (textToScanForColors.includes('pale pink') || textToScanForColors.includes('permanent pink') || textToScanForColors.includes('pink end-point')) {
    colorAfter = 'Permanent pale pink';
    colorHexAfter = '#f472b6';
    if (!expectedObservation) expectedObservation = 'Permanent pale pink endpoint reached.';
  } else if (textToScanForColors.includes('purple') || textToScanForColors.includes('violet') || (textToScanForColors.includes('biuret') && textToScanForColors.includes('protein'))) {
    colorAfter = 'Purple / Violet';
    colorHexAfter = '#9333ea';
    if (!expectedObservation) expectedObservation = 'Solution turns purple (positive test for proteins).';
  } else if (textToScanForColors.includes('brown precipitate') || (textToScanForColors.includes('copper') && textToScanForColors.includes('zinc'))) {
    colorAfter = 'Brown precipitate';
    colorHexAfter = '#78350f';
    precipitateName = 'Brown solid copper';
    if (!expectedObservation) expectedObservation = 'Blue solution fades; brown solid deposited.';
  } else if (textToScanForColors.includes('white precipitate') || textToScanForColors.includes('cloudy') || textToScanForColors.includes('milky') || textToScanForColors.includes('thiosulphate')) {
    colorAfter = 'Cloudy precipitate';
    colorHexAfter = '#fef08a';
    precipitateName = 'Precipitate formed';
    if (!expectedObservation) expectedObservation = 'Cloudy precipitate formed; solution turns turbid.';
  } else if (textToScanForColors.includes('green')) {
    colorAfter = 'Green';
    colorHexAfter = '#16a34a';
    if (!expectedObservation) expectedObservation = 'Solution turns green.';
  } else if (textToScanForColors.includes('orange')) {
    colorAfter = 'Orange';
    colorHexAfter = '#ea580c';
    if (!expectedObservation) expectedObservation = 'Solution turns orange.';
  } else if (textToScanForColors.includes('colourless') || textToScanForColors.includes('colorless') || textToScanForColors.includes('decolourize')) {
    colorAfter = 'Colourless';
    colorHexAfter = '#f8fafc';
    if (!expectedObservation) expectedObservation = 'Decolourization occurs / solution becomes colourless.';
  }

  // Check gas evolution
  if (textToScanForColors.includes('hydrogen') || (textToScanForColors.includes('effervescence') && textToScanForColors.includes('magnesium'))) {
    expectedGas = 'Hydrogen (H₂)';
    if (!expectedObservation) expectedObservation = 'Rapid effervescence of hydrogen gas; mixture becomes warm.';
  } else if (textToScanForColors.includes('carbon dioxide') || textToScanForColors.includes('co2') || textToScanForColors.includes('limewater')) {
    expectedGas = 'Carbon dioxide (CO₂)';
    if (!expectedObservation) expectedObservation = 'Effervescence of carbon dioxide gas.';
  } else if (textToScanForColors.includes('oxygen')) {
    expectedGas = 'Oxygen (O₂)';
  } else if (textToScanForColors.includes('effervescence') || textToScanForColors.includes('bubbles')) {
    expectedGas = 'Gas bubbles';
  }

  // If still empty, provide clear context-relevant observation
  if (!expectedObservation) {
    if (detectedSubject === 'chemistry') {
      expectedObservation = 'Observations recorded accurately as per experimental procedure.';
      colorAfter = colorAfter || 'Clear solution';
      colorHexAfter = colorHexAfter !== '#e0f2fe' ? colorHexAfter : '#e2e8f0';
    } else if (detectedSubject === 'physics') {
      expectedObservation = 'Readings and deflections recorded consistently.';
      colorAfter = 'Normal apparatus state';
    } else {
      expectedObservation = 'Biological specimen changes observed and tabulated.';
      colorAfter = 'Specimen reaction';
    }
  }

  // Also assign expectedResult to procedure steps that ask for observation or recording
  for (const proc of parsedProcedures) {
    for (const st of proc.steps) {
      const sLower = st.instruction.toLowerCase();
      if (sLower.includes('observe') || sLower.includes('observation') || sLower.includes('record') || sLower.includes('colour') || sLower.includes('precipitate')) {
        (st as any).expectedResult = expectedObservation;
      }
    }
  }

  return {
    title: detectedTitle,
    subject: detectedSubject,
    kcsePaper: detectedSubject === 'physics' ? '232/3 (KCSE Physics Practical)' : detectedSubject === 'biology' ? '231/3 (KCSE Biology Practical)' : '233/3 (KCSE Chemistry Practical)',
    topic: detectedTitle,
    objectives: [
      `Conduct virtual laboratory investigation for ${detectedTitle}`,
      'Record accurate measurements and experimental observations on the virtual bench',
      'Analyze data, plot graphs, and answer standard KCSE examination questions'
    ],
    estimatedDurationMinutes: 45,
    simulationType,
    apparatus: apparatusFound,
    procedures: parsedProcedures,
    answerSheet,
    simulationConfig: {
      initialTemperature: 22.0,
      maxTemperature: 50.0,
      colorBefore,
      colorAfter: colorAfter || 'Observed Reaction State',
      colorHexBefore,
      colorHexAfter: colorHexAfter || '#e0f2fe',
      expectedObservation,
      expectedGas,
      precipitateName
    }
  };
}

// POST /api/experiments/:id/clone - Clone an experiment for teacher customization
router.post('/:id/clone', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorTeacher } = req.body;
  try {
    const source = store.experiments.find(e => e.id === id);
    if (!source) {
      return res.status(404).json({ error: 'Source experiment not found' });
    }

    const cloned: ExperimentSpec = {
      ...source,
      id: `exp-custom-${Date.now().toString(36)}`,
      title: `Copy of ${source.title}`,
      ownerType: 'teacher',
      schoolId: authorTeacher?.schoolId || null,
      teacherId: authorTeacher?.id || null,
      authorName: authorTeacher?.name || 'Science Teacher',
      clonedFrom: source.id,
      status: 'draft'
    };

    store.experiments.unshift(cloned);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').insert([experimentToDb(cloned)]);
      }
    }

    return res.status(201).json(cloned);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments/:id/promote - Promote an experiment to school-tier
router.post('/:id/promote', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { schoolId } = req.body;
  try {
    const exp = store.experiments.find(e => e.id === id);
    if (!exp) return res.status(404).json({ error: 'Experiment not found' });

    const schoolExp: ExperimentSpec = {
      ...exp,
      id: `exp-school-${Date.now().toString(36)}`,
      ownerType: 'school',
      schoolId: schoolId,
      title: `[School Approved] ${exp.title}`,
      status: 'published'
    };

    store.experiments.unshift(schoolExp);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').insert([experimentToDb(schoolExp)]);
      }
    }

    return res.status(201).json(schoolExp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
