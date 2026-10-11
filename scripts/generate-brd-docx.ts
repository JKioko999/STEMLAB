import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ShadingType,
  ImageRun
} from 'docx';

async function generateDocx() {
  console.log('Generating corporate BRD/DRD docx...');

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorderThin = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
  };

  function createHeaderCell(text: string, widthPercent: number = 25): TableCell {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: '1E293B' },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: 'FFFFFF',
              font: 'Calibri',
              size: 20, // 10pt
            }),
          ],
        }),
      ],
    });
  }

  function createDataCell(text: string, widthPercent: number = 25, isAlternate: boolean = false): TableCell {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: isAlternate ? 'F8FAFC' : 'FFFFFF' },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Calibri',
              size: 20, // 10pt
              color: '334155',
            }),
          ],
        }),
      ],
    });
  }

  function sectionHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
    return new Paragraph({
      heading: level,
      spacing: { before: 280, after: 120 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: 'Calibri',
          color: level === HeadingLevel.HEADING_1 ? '0F172A' : '2563EB',
        }),
      ],
    });
  }

  function subHeading(text: string): Paragraph {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: 'Calibri',
          color: '1E40AF',
        }),
      ],
    });
  }

  function bodyParagraph(text: string, boldPrefix?: string): Paragraph {
    const children: TextRun[] = [];
    if (boldPrefix) {
      children.push(
        new TextRun({
          text: boldPrefix + ' ',
          bold: true,
          font: 'Calibri',
          size: 22,
          color: '0F172A',
        })
      );
    }
    children.push(
      new TextRun({
        text,
        font: 'Calibri',
        size: 22, // 11pt
        color: '334155',
      })
    );
    return new Paragraph({
      spacing: { before: 60, after: 100, line: 276 },
      children,
    });
  }

  function bulletItem(text: string, boldPrefix?: string): Paragraph {
    const children: TextRun[] = [];
    if (boldPrefix) {
      children.push(
        new TextRun({
          text: boldPrefix + ' ',
          bold: true,
          font: 'Calibri',
          size: 22,
          color: '0F172A',
        })
      );
    }
    children.push(
      new TextRun({
        text,
        font: 'Calibri',
        size: 22,
        color: '334155',
      })
    );
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 40, after: 60 },
      children,
    });
  }

  function imageFigure(imageRelativePath: string, captionText: string, width: number = 550, height: number = 310): Paragraph[] {
    const fullPath = path.resolve(imageRelativePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[Docx Image] Warning: File not found at: ${fullPath}`);
      return [];
    }
    const buffer = fs.readFileSync(fullPath);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 60 },
        children: [
          new ImageRun({
            type: 'jpg',
            data: buffer,
            transformation: {
              width,
              height,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 200 },
        children: [
          new TextRun({
            text: captionText,
            italics: true,
            font: 'Calibri',
            size: 19, // 9.5 pt
            color: '64748B', // Slate-500
          }),
        ],
      }),
    ];
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
            color: '1E293B',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'STEM-SPARK-LAB | Corporate Business & Detailed Requirements Document (BRD / DRD)',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                  new TextRun({
                    text: ' | CONFIDENTIAL & PROPRIETARY',
                    size: 16,
                    color: '94A3B8',
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title Cover Section
          new Paragraph({
            spacing: { before: 720, after: 120 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'ENTERPRISE BUSINESS & DETAILED REQUIREMENTS DOCUMENT',
                bold: true,
                size: 36, // 18pt
                color: '0F172A',
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 240 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'STEM-SPARK-LAB: Next-Generation Virtual Science Laboratory & AI Experiment Engine',
                bold: true,
                size: 26, // 13pt
                color: '2563EB',
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 60, after: 480 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Standardized Practical Curriculum Platform aligned with KNEC / KCSE Practical Framework',
                italics: true,
                size: 20,
                color: '64748B',
                font: 'Calibri',
              }),
            ],
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Document Attribute', 35),
                  createHeaderCell('Specification Details', 65),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Document Identifier', 35, false),
                  createDataCell('BRD-DRD-STEM-SPARK-2026-V2.4', 65, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Project Sponsor', 35, true),
                  createDataCell('Ministry of Education / Science Curriculum Directorate & EdTech Consortium', 65, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Lead Systems Architect', 35, false),
                  createDataCell('Principal AI & Virtual Simulation Engineering Team', 65, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Current Status & Baseline', 35, true),
                  createDataCell('APPROVED - Production Architecture & Implementation Baseline v2.4', 65, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Target Target Platform', 35, false),
                  createDataCell('Web SPA / Progressive Responsive Canvas / Full-Stack Enterprise Cloud', 65, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Target Secondary Subjects', 35, true),
                  createDataCell('Chemistry (233/3), Physics (232/3), Biology (231/3) Practical Examinations', 65, true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 360 } }),

          // Executive Summary
          sectionHeading('1. Executive Summary & Business Case'),
          bodyParagraph(
            'In secondary educational systems across developing and emerging economies—exemplified by the Kenya Certificate of Secondary Education (KCSE)—over 74% of secondary schools lack adequately equipped physical science laboratories with sufficient reagents, calibrated burettes, analytical balances, pipettes, and safety containment. Consequently, tens of thousands of candidates sit for national practical science examinations (Chemistry Paper 3, Physics Paper 3, Biology Paper 3) having never independently operated a volumetric burette or observed quantitative acid-base endpoints.'
          ),
          bodyParagraph(
            'STEM-SPARK-LAB resolves this national educational disparity by delivering a high-fidelity, interactive, browser-based virtual science laboratory. The platform enables science educators to instantly convert unstructured teacher practical instructions, past exam papers, or handwritten notes into fully interactive, simulated laboratory workstations utilizing multimodal AI parsing. Students execute realistic hands-on experiments—calibrating apparatus, dispensing titrants, titrating to stoichiometric equivalence with live color indicators, recording multi-trial experimental tables, and submitting completed worksheets for automated algorithmic and heuristic grading.'
          ),
          ...imageFigure(
            'src/assets/images/science_lab_banner_1791271184391.jpg',
            'Figure 1.1: STEM-SPARK Virtual Science Laboratory — Universal Interactive Workbench Architecture and Apparatus Staging Area',
            540,
            300
          ),

          // User Roles & Stakeholder Ecosystem
          sectionHeading('2. Stakeholder Ecosystem & User Personas'),
          bodyParagraph(
            'The platform operates as an enterprise multi-tenant system serving five distinct user roles with strict Role-Based Access Control (RBAC):'
          ),

          subHeading('2.1 User Persona Matrix'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Role', 18),
                  createHeaderCell('Primary Persona', 22),
                  createHeaderCell('Core Responsibilities & Workflow', 40),
                  createHeaderCell('Access Permissions', 20),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Super Admin', 18, false),
                  createDataCell('Ministry / EdTech Platform Director', 22, false),
                  createDataCell('School provisioning, institutional licensing, curriculum master benchmark management, global audit logs.', 40, false),
                  createDataCell('Full System Access (Tenant isolation override)', 20, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('School Admin / HOD', 18, true),
                  createDataCell('Science Department Head / Principal', 22, true),
                  createDataCell('Teacher onboarding, class stream creation, student enrollment, department-wide pass rate analytics.', 40, true),
                  createDataCell('Institution Tenant Scope (CRUD within School)', 20, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Science Teacher', 18, false),
                  createDataCell('Chemistry / Physics / Bio Instructor', 22, false),
                  createDataCell('AI-powered experiment creation, apparatus configuration, assignment publishing, manual grade overrides, student feedback.', 40, false),
                  createDataCell('Class & Assignment Level Read/Write', 20, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Student Candidate', 18, true),
                  createDataCell('Form 1-4 Secondary School Learner', 22, true),
                  createDataCell('Experiment execution, burette tapping, pipette filling, recording observation data tables, answering structured theoretical questions.', 40, true),
                  createDataCell('Execution & Submission Scope', 20, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('External Auditor / KNEC Examiner', 18, false),
                  createDataCell('National Examiner / Quality Assurance', 22, false),
                  createDataCell('Standardized benchmarking, rubric verification, performance moderation, compliance reporting.', 40, false),
                  createDataCell('Read-Only Cross-Institution Analytics', 20, false),
                ],
              }),
            ],
          }),

          // End-to-End Business Flow
          sectionHeading('3. End-to-End Business Process Flows & User Journeys'),
          bodyParagraph(
            'The platform lifecycle is organized into three macro workflows spanning creation, interactive execution, and assessment intelligence. Each workflow step below includes architectural interface captures illustrating the software operational flow.'
          ),

          subHeading('3.1 Workflow A: Teacher AI Experiment Creation & Apparatus Synthesis'),
          bulletItem(
            'The teacher accesses the Experiment Studio and either types raw lab instructions, pastes past exam papers, or uploads past test sheets.',
            'Step 1 (Raw Input):'
          ),
          bulletItem(
            'The system dispatches the prompt payload to the server-side AI parsing engine with strict heuristic normalization. The engine resolves common student/teacher typographic errors (e.g., "burrete" -> Burette, "pippete" -> Pipette, "hydrotide" -> Hydroxide).',
            'Step 2 (AI Processing & Normalization):'
          ),
          bulletItem(
            'The parser extracts Reagents (Solution M, Solution N, Solid X), Glassware (50ml Burette, 25ml Pipette, Conical Flask, White Tile), and Safety Indicators (Methyl Orange).',
            'Step 3 (Apparatus Disambiguation):'
          ),
          bulletItem(
            'The engine establishes simulation parameters: SimulationType = "titration", Initial Flask Color = "Yellow (#eab308)", Endpoint Color = "Orange/Pink (#f97316)", Equivalence Volume = 24.50 cm3.',
            'Step 4 (Simulation Parameter Synthesis):'
          ),
          bulletItem(
            'A structured answer sheet and grading rubric are automatically generated with numerical tolerances (e.g. ±0.20 cm3 for titres, ±1.0 g/mol for RAM calculations).',
            'Step 5 (Assessment Blueprinting):'
          ),
          bulletItem(
            'The teacher reviews the generated workbench preview, fine-tunes any step or tolerance if needed, and publishes the assignment with a target due date.',
            'Step 6 (Review & Publishing):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_teacher_studio_1791560694991.jpg',
            'Figure 3.1: Workflow A — Teacher AI Experiment Creation Studio showing natural language input, automated apparatus disambiguation (50ml Burette, 25ml Bulb Pipette, Conical Flask, Methyl Orange), and live interactive simulation synthesis.',
            540,
            304
          ),

          subHeading('3.2 Workflow B: Student Interactive Virtual Lab Session'),
          bulletItem(
            'The student navigates to their student dashboard, selects the active assignment, and reviews safety guidelines and required apparatus.',
            'Step 1 (Pre-Lab Induction):'
          ),
          bulletItem(
            'The virtual laboratory renders the selected workbench (Universal Workbench or Dedicated Titration Rig). The apparatus rack displays only the relevant glassware and reagents.',
            'Step 2 (Workbench Assembly):'
          ),
          bulletItem(
            'The student operates the 25cm3 pipette to transfer 25.0 cm3 of Solution M (0.2M base) into the conical flask. The conical flask telemetry registers 25.0 mL.',
            'Step 3 (Pipetting & Flask Preparation):'
          ),
          bulletItem(
            'The student adds 2-3 drops of Methyl Orange indicator into the conical flask. The solution instantly turns bright alkaline Yellow (#eab308).',
            'Step 4 (Indicator Reaction):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_pipetting_step_1791560652846.jpg',
            'Figure 3.2: Workflow B (Steps 1–4) — Volumetric Pipetting of 25.0 cm³ Solution M (0.2M NaOH) with Safety Pipette Filler Bulb into Conical Flask and Addition of Methyl Orange Indicator (Yellow Alkaline Coloration).',
            540,
            304
          ),
          bulletItem(
            'The student fills the 50.0 cm3 glass burette with Solution N (dilute HCl) to the 0.00 cm3 meniscus graduation mark on the clamped retort stand.',
            'Step 5 (Burette Priming & Clamping):'
          ),
          bulletItem(
            'The student opens the stopcock (Rapid, Dropwise, or Micro-titration). Solution N flows into the conical flask on the white ceramic tile with realistic fluid vortex and swirling animation.',
            'Step 6 (Titration Execution):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_burette_setup_1791560633247.jpg',
            'Figure 3.3: Workflow B (Steps 5–6) — 50.0 cm³ Calibrated Glass Burette Clamped to Retort Stand, Filled with Solution N (dilute HCl), Conical Flask on White Ceramic Tile, and Interactive Stopcock Flow Controls (Slow, Dropwise, Fast).',
            540,
            304
          ),
          bulletItem(
            'At the stoichiometric equivalence point (approx. 24.50 cm3), the flask undergoes an instantaneous, permanent color shift to Orange / Salmon Pink (#f97316). If over-titrated, it turns distinct Magenta/Red.',
            'Step 7 (Endpoint Transition & Telemetry):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_endpoint_color_1791560664497.jpg',
            'Figure 3.4: Workflow B (Step 7) — Stoichiometric Equivalence Point Transition at 24.50 cm³, Observing Permanent Color Shift to Orange/Pink with Real-Time Telemetry HUD and Titration pH Curve.',
            540,
            304
          ),
          bulletItem(
            'The student clicks "Record in Table" to transfer current burette readings into Trial I. The student resets the flask and repeats the titration for Trial II and Trial III to establish concordant results within ±0.20 cm3.',
            'Step 8 (Multi-Trial Replication):'
          ),
          bulletItem(
            'The student enters theoretical calculation answers (Average titre volume, Moles of Acid, Moles of Base, Concentration of Solution N, RAM of element F in F2CO3).',
            'Step 9 (Calculation Completion):'
          ),
          bulletItem(
            'The student reviews the completed worksheet with all concordant trials and submits the experiment paper to the automated grading system.',
            'Step 10 (Final Submission):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_results_table_1791560685872.jpg',
            'Figure 3.5: Workflow B (Steps 8–10) — Multi-Trial Table I Recording (Concordant Titres within ±0.10 cm³), Average Titre Calculation, and Step-by-Step RAM Calculations (Molar Mass of F₂CO₃ and RAM of F = 23.0 Na).',
            540,
            304
          ),

          subHeading('3.3 Workflow C: Automated Algorithmic Evaluation & Gradebook Analytics'),
          bulletItem(
            'The backend attempts engine validates table completeness, concordancy (titre values within ±0.20 cm3 of each other), and calculation accuracy using the teacher rubric.',
            'Step 1 (Instant Marking):'
          ),
          bulletItem(
            'The student receives instant formative feedback, detailed step breakdown, and error analysis.',
            'Step 2 (Student Feedback):'
          ),
          bulletItem(
            'The teacher gradebook updates in real-time with class-wide averages, common misconceptions, and item difficulty discrimination indices.',
            'Step 3 (Teacher Telemetry):'
          ),
          ...imageFigure(
            'src/assets/images/workflow_teacher_analytics_1791560720875.jpg',
            'Figure 3.6: Workflow C — Teacher & Examiner Evaluation Dashboard: Auto-Graded Student Submission (94/100 Grade A), Concordancy Verification, Rubric Breakdown, and Class Telemetry.',
            540,
            304
          ),

          // Detailed Functional Requirements
          sectionHeading('4. Detailed Functional Requirements (FR)'),
          bodyParagraph(
            'This section enumerates explicit system behaviors, technical constraints, and algorithmic business logic required for production certification.'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Req ID', 15),
                  createHeaderCell('Feature Area', 25),
                  createHeaderCell('Functional Requirement Specification', 45),
                  createHeaderCell('Priority', 15),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-001', 15, false),
                  createDataCell('Typographic Disambiguation', 25, false),
                  createDataCell('The natural language parser must correctly identify apparatus and reagents despite common classroom spelling variations (e.g., "burrete", "buret", "pippete", "hydrotide", "methylorange").', 45, false),
                  createDataCell('P0 (Critical)', 15, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-002', 15, true),
                  createDataCell('Dynamic Apparatus Selection', 25, true),
                  createDataCell('The workbench must render only apparatus and reagents relevant to the active experiment. Extraneous lab items (e.g. Bunsen burner, boiling tube) must be suppressed when not specified in the protocol.', 45, true),
                  createDataCell('P0 (Critical)', 15, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-003', 15, false),
                  createDataCell('Burette Fluid Simulation', 25, false),
                  createDataCell('The simulation must support realistic fluid mechanics: stopcock flow rates (0.1 mL/s to 5.0 mL/s), meniscus curve rendering, graduation marks from 0.00 to 50.00 cm3, and liquid level depletion.', 45, false),
                  createDataCell('P0 (Critical)', 15, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-004', 15, true),
                  createDataCell('Dynamic Color Stoichiometry', 25, true),
                  createDataCell('Support standard indicator behavior: Methyl Orange (Yellow in alkali -> Orange at neutral pH 3.1-4.4 -> Pink in excess acid); Phenolphthalein (Pink -> Colorless); Universal Indicator (pH 1-14 spectral map).', 45, true),
                  createDataCell('P0 (Critical)', 15, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-005', 15, false),
                  createDataCell('KCSE Titration Table Engine', 25, false),
                  createDataCell('Automatically generate a 3-column multi-trial titration table (Initial Burette Reading, Final Burette Reading, Volume of Titrant Used) with automatic row computation and concordancy validation.', 45, false),
                  createDataCell('P0 (Critical)', 15, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-006', 15, true),
                  createDataCell('Rubric Tolerance Auto-Grading', 25, true),
                  createDataCell('Score student calculations against expected values using teacher-configured numerical tolerances (e.g. ±0.1 cm3 for titre, ±2% for concentration, ±1.0 g/mol for RAM). Provide partial credit for correct working steps.', 45, true),
                  createDataCell('P1 (High)', 15, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('FR-007', 15, false),
                  createDataCell('Export & Offline Capabilities', 25, false),
                  createDataCell('Enable export of lab records, experiment blueprints, and student answer sheets to PDF, Word (.docx), and CSV format. Support offline caching for low-bandwidth rural schools.', 45, false),
                  createDataCell('P1 (High)', 15, false),
                ],
              }),
            ],
          }),

          // Chemistry Domain Scientific Modeling
          sectionHeading('5. Scientific Chemistry Domain Model: Acid-Base & RAM Analysis'),
          bodyParagraph(
            'To guarantee absolute pedagogical and examiner compliance, the virtual laboratory implements the exact mathematical and physical chemistry models prescribed by national examination councils:'
          ),
          subHeading('5.1 The Standard Titration & Carbonate RAM Problem Formulation'),
          bodyParagraph(
            'Experimental Protocol Baseline: Solution M is 0.20 M Sodium Hydroxide (NaOH). Solution N is dilute Hydrochloric Acid (HCl) of unknown concentration. Solid X is 1.00 g of an unknown anhydrous metal carbonate F2CO3.'
          ),
          bulletItem(
            'Pipette Volume (V_base) = 25.00 cm3 = 0.0250 dm3',
            'Parameter 1:'
          ),
          bulletItem(
            'Molarity of Base (M_base) = 0.20 mol/dm3',
            'Parameter 2:'
          ),
          bulletItem(
            'Moles of NaOH used = M_base * V_base = 0.20 * 0.0250 = 0.0050 moles',
            'Calculation 1:'
          ),
          bulletItem(
            'Chemical Stoichiometry: HCl + NaOH -> NaCl + H2O (Mole Ratio = 1 : 1)',
            'Calculation 2:'
          ),
          bulletItem(
            'Moles of Acid (HCl) at equivalence = 0.0050 moles',
            'Calculation 3:'
          ),
          bulletItem(
            'Average Titre Volume (V_acid) = 24.50 cm3 = 0.0245 dm3',
            'Calculation 4:'
          ),
          bulletItem(
            'Molarity of Solution N (HCl) = Moles / V_acid = 0.0050 / 0.0245 = 0.2041 M',
            'Calculation 5:'
          ),
          bulletItem(
            'Determination of Relative Atomic Mass (RAM) of F in F2CO3: Solid X (1.00 g) reacts with standardised acid: F2CO3 + 2HCl -> 2FCl + CO2 + H2O. Moles of F2CO3 = 1/2 * (Moles of HCl). Molar Mass of F2CO3 = Mass / Moles = 1.00 / n. Formula mass: 2 * Ar(F) + 12 + 3(16) = M_molar. Hence Ar(F) = [M_molar - 60] / 2.',
            'Calculation 6:'
          ),

          // Technical Architecture & DRD
          sectionHeading('6. Technical Architecture & Detailed Design (DRD)'),
          bodyParagraph(
            'The system follows a modern full-stack enterprise architecture built for high availability, low latency, and offline resilience.'
          ),
          subHeading('6.1 Component Topology'),
          bulletItem(
            'Vite + React 19 SPA running in TypeScript, Tailwind CSS utility styling, Lucide scientific iconography, Motion fluid interaction layer.',
            'Frontend Client:'
          ),
          bulletItem(
            'InteractiveUniversalWorkbench.tsx (General chemistry, physics, biology apparatus), InteractiveTitrationWorkbench.tsx (High-precision volumetric burette simulation, multi-stopcock controls, live color mixing shaders).',
            'Simulation Canvas:'
          ),
          bulletItem(
            'Node.js / Express REST API proxy with strict rate limiting, schema validation, and session management.',
            'Application Server:'
          ),
          bulletItem(
            'Dual-mode hybrid data architecture. Primary: Supabase PostgreSQL relational database with row-level security (RLS). Fallback: In-memory structured seed store ensuring zero downtime during network isolation.',
            'Persistence Tier:'
          ),
          bulletItem(
            'Google Gemini multimodal integration via server-side SDK proxy with strict regex-assisted heuristic fallbacks for offline and zero-token resilience.',
            'AI Inference Engine:'
          ),

          subHeading('6.2 Entity-Relationship & Schema Architecture'),
          bodyParagraph(
            'The core relational model enforces strict multi-tenancy and auditability:'
          ),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Table / Entity', 25),
                  createHeaderCell('Key Attributes', 40),
                  createHeaderCell('Foreign Key Relationships & Constraints', 35),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('schools', 25, false),
                  createDataCell('id (UUID), name, code, county, created_at', 40, false),
                  createDataCell('Tenant boundary root entity', 35, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('users', 25, true),
                  createDataCell('id, school_id, email, role, full_name, knec_reg_no', 40, true),
                  createDataCell('FK -> schools.id; Role ENUM (admin, teacher, student)', 35, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('experiments', 25, false),
                  createDataCell('id, school_id, title, subject, simulation_type, steps, apparatus, answer_sheet, rubric', 40, false),
                  createDataCell('FK -> schools.id; JSONB attributes for steps & rubric', 35, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('assignments', 25, true),
                  createDataCell('id, experiment_id, class_id, teacher_id, due_date, status', 40, true),
                  createDataCell('FK -> experiments.id, classes.id, users.id', 35, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('student_attempts', 25, false),
                  createDataCell('id, assignment_id, student_id, student_data, total_score, max_score, status, graded_at', 40, false),
                  createDataCell('FK -> assignments.id, users.id; JSONB student_data', 35, false),
                ],
              }),
            ],
          }),

          // Non-Functional Requirements & Security
          sectionHeading('7. Non-Functional Requirements & Security Compliance'),
          bulletItem(
            'Workbench simulation frame rate must sustain >= 55 FPS on standard Intel Core i3 / Chromebook hardware without GPU acceleration.',
            'Performance & Latency (NFR-001):'
          ),
          bulletItem(
            'AI natural language parsing roundtrip must complete within 2.5 seconds on server endpoints, with instantaneous (<50ms) heuristic fallback.',
            'Throughput (NFR-002):'
          ),
          bulletItem(
            'Data Protection Act 2019 (Kenya) & GDPR compliance. Student identities and examination scripts are encrypted at rest (AES-256) and in transit (TLS 1.3).',
            'Data Security (NFR-003):'
          ),
          bulletItem(
            'Full tenant isolation. School A cannot query, view, or aggregate student attempts or proprietary teacher examination papers belonging to School B.',
            'Multi-Tenancy (NFR-004):'
          ),

          // RACI Matrix & Delivery Schedule
          sectionHeading('8. Corporate RACI Matrix & Implementation Roadmap'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Project Milestone / Phase', 35),
                  createHeaderCell('Responsible (R)', 20),
                  createHeaderCell('Accountable (A)', 15),
                  createHeaderCell('Consulted (C)', 15),
                  createHeaderCell('Informed (I)', 15),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Phase 1: Typo & Apparatus Disambiguation Engine', 35, false),
                  createDataCell('Senior AI Engineer', 20, false),
                  createDataCell('Tech Lead', 15, false),
                  createDataCell('Science HOD', 15, false),
                  createDataCell('Teachers', 15, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Phase 2: High-Fidelity Titration & Fluid Workbench', 35, true),
                  createDataCell('Frontend Simulation Eng', 20, true),
                  createDataCell('UX Architect', 15, true),
                  createDataCell('KNEC Examiner', 15, true),
                  createDataCell('Students', 15, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Phase 3: Multi-Trial Table & Concordancy Evaluator', 35, false),
                  createDataCell('Full-Stack Engineer', 20, false),
                  createDataCell('Lead Architect', 15, false),
                  createDataCell('Curriculum Lead', 15, false),
                  createDataCell('School HOD', 15, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Phase 4: Multi-Tenant RBAC & Auto-Grading Rollout', 35, true),
                  createDataCell('Cloud & DevOps Lead', 20, true),
                  createDataCell('Platform Director', 15, true),
                  createDataCell('MoE Auditors', 15, true),
                  createDataCell('All Users', 15, true),
                ],
              }),
            ],
          }),

          // Sign-off
          sectionHeading('9. Executive Document Sign-Off & Approvals'),
          bodyParagraph(
            'By signing below, the executive stakeholders confirm that this Business Requirements Document (BRD) and Detailed Requirements Document (DRD) accurately and exhaustively represent the operational, pedagogical, and technical expectations of the STEM-SPARK-LAB enterprise platform.'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderThin,
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Sign-off Authority', 30),
                  createHeaderCell('Name & Designation', 35),
                  createHeaderCell('Signature & Approval Date', 35),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Business Sponsor', 30, false),
                  createDataCell('Director of STEM Education & Digital Learning', 35, false),
                  createDataCell('APPROVED - 09/10/2026', 35, false),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Chief Technology Officer', 30, true),
                  createDataCell('VP of Platform & Simulation Engineering', 35, true),
                  createDataCell('APPROVED - 09/10/2026', 35, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Chief Academic Examiner', 30, false),
                  createDataCell('Senior Science Examination Lead (KNEC Chemistry)', 35, false),
                  createDataCell('APPROVED - 09/10/2026', 35, false),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '--- END OF FORMAL SPECIFICATION DOCUMENT ---',
                bold: true,
                size: 20,
                color: '94A3B8',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.resolve('public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Document generated successfully at: ${outPath} (${buffer.length} bytes)`);

  // Also sync src/utils/brdDocxBase64.ts for instant zero-latency in-memory client downloads
  const b64 = buffer.toString('base64');
  const b64Dir = path.resolve('src/utils');
  if (!fs.existsSync(b64Dir)) {
    fs.mkdirSync(b64Dir, { recursive: true });
  }
  const b64Path = path.join(b64Dir, 'brdDocxBase64.ts');
  fs.writeFileSync(
    b64Path,
    `// Auto-generated Base64-encoded corporate BRD/DRD document (.docx)\n// Generated with embedded high-resolution workflow diagrams and screenshots\nexport const BRD_DOCX_BASE64 =\n  '${b64}';\n`
  );
  console.log(`Updated Base64 docx cache at: ${b64Path} (base64 length: ${b64.length})`);
}

generateDocx().catch((err) => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
