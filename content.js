/* =====================================================================
   SITE CONTENT — edit this file to change any text, files, demos or
   features. Layout/behaviour lives in app.js, look & feel in styles.css
   (colour tokens are at the top of styles.css under :root).
   ===================================================================== */

/* Helper: F(name, kind, tag, date, size, extra)
   kind = statement | sheet | chart | pie | notice | ticker | receipt | memo */
const F = (name, kind, tag, date, size, extra = {}) => ({ name, kind, tag, date, size, ...extra });

window.SITE = {
  brand: {
    name: "FINANSYS",
    wordmark: ["FINAN", "SYS"],          // two-tone logotype: first part ivory, second part gold
    mark: "assets/finansys-mark.png",    // gold "F" mark (transparent PNG)
    tagline: "Where Financial Strategy Meets Systemic Automation",
  },

  nav: {
    login: { label: "Client login", href: "#" },
    cta:   { label: "Book a consultation", href: "#cta" },
  },

  hero: {
    // tagline — the second part is set in the serif accent with the hand-drawn underline
    titleLead: "Where Financial Strategy Meets",
    titleAccent: "Systemic Automation.",
    subtitle: "",        // optional line under the headline (empty = hidden)
    primary: null,       // hero buttons removed; "Book a consultation" lives in the top nav
    secondary: null,
    scrollHint: "",            // no scroll cue (the film itself invites the scroll)
  },

  /* Hero scroll scene — real photography + a real-time 3D laptop (laptop3d.js).
     Photos are free-licence Unsplash images, loaded from Unsplash's CDN.
     To self-host: save them into /assets and change the paths below. */
  stage: {
    // "photo" = real photographed laptop with the app mapped onto its screen (docs3d.js)
    // "3d"    = real-time 3D laptop over heroImage (laptop3d.js)
    heroMode: "video",
    // "video" = scroll-scrubbed frames from the brand film (frames 1–143: desk → laptop turns → documents swirl)
    heroVideo: {
      frames: "assets/hero-hd/{w}/f_{n}.webp",   // remastered HD frames; {w} = 1920 (desktop) or 1024 (phones)  // {n} → 001, 002, … (new intro clip spliced into the swirl)
      count: 141,
      size: [1280, 620],                         // frame width, height (px)
      laptop: { top: 0.38, bottom: 0.92, width: 0.36, centerX: 0.5 },  // laptop in frame 1, as fractions
      settle: 48,                                // first ~2s are the still desk shot; they get a shorter scroll
    },
    heroPhoto: {
      src: "https://images.unsplash.com/photo-1779444480590-9bf6f021d5d4?auto=format&fit=crop&w=2400&q=85",
      ratio: 1.5,                                   // photo width / height
      // laptop screen corners as fractions of the photo: top-left, top-right, bottom-right, bottom-left
      screen: [[0.2881, 0.2793], [0.6731, 0.2783], [0.6775, 0.6401], [0.2850, 0.6401]],
      laptop: { top: 0.268, bottom: 0.797, centerX: 0.481 },
      keyboard: [0.29, 0.655, 0.38, 0.075],          // x, y, w, h — where the screen light spills
      // soft patches that hide brand marks in the photo: box = [x, y, w, h] fractions
      covers: [
        { box: [0.457, 0.642, 0.046, 0.0145], bg: "#020202", round: "2px", blur: 1 },
        { box: [0.9205, 0.7985, 0.0215, 0.0245], bg: "linear-gradient(rgb(114,101,93), rgb(80,71,66))", round: "50%", blur: 2 },
      ],
    },
    heroImage: "https://images.unsplash.com/photo-1510851896000-498520af2236?auto=format&fit=crop&w=2400&q=80",
    deskImage: "assets/desk-marble-hd.jpg",          // marble desk from the brand film (heading removed)
    screenImage: "assets/screen-ui.png",   // what the 3D laptop screen shows (capture: index.html?capture=screen)
    docsAtlas: "assets/docs-atlas.png",    // textures of the flying documents (capture: index.html?capture=docs)
    credits: [
    ],
  },

  /* Sidebar of the demo app window */
  app: {
    main: [
      { label: "Home", icon: "home" },
      { label: "Portfolio", icon: "briefcase" },
      { label: "Advisor", icon: "bot", ai: true },
    ],
    folders: ["Annual Reports", "Investments", "Board Packs", "Tax & Compliance", "Bank Statements"],
  },

  /* Window shown inside the hero monitor */
  heroWindow: {
    folder: "Annual Reports",
    side: "Portfolio",
    view: "grid",
    files: [
      F("FY2025 Audited Accounts.pdf", "statement", "Audit", "28 Sep 2025", "4.2 MB"),
      F("Revenue by Project.xlsx", "sheet", "Model", "02 Sep 2025", "1.1 MB"),
      F("Cash Flow FY25.chart", "chart", "Cash", "30 Jun 2025", "220 KB", { label: "Cash flow" }),
      F("Asset Allocation.chart", "pie", "Portfolio", "15 Aug 2025", "180 KB", { label: "Allocation" }),
      F("Board Memo - Q4.pdf", "memo", "Board", "11 Jul 2025", "640 KB"),
      F("Sec 122 Notice.pdf", "notice", "Tax", "19 Sep 2025", "380 KB"),
      F("NVLT Holding.tick", "ticker", "Equity", "Live", "-", { symbol: "NVLT", change: "+2.4%" }),
      F("FY2024 Audited Accounts.pdf", "statement", "Audit", "26 Sep 2024", "3.9 MB"),
      F("Vendor Payment 0912.pdf", "receipt", "AP", "12 Sep 2025", "90 KB"),
      F("Debt Schedule.xlsx", "sheet", "Debt", "01 Sep 2025", "760 KB"),
      F("Margin Trend.chart", "chart", "Analysis", "05 Sep 2025", "210 KB", { label: "Gross margin" }),
      F("Investment Policy.pdf", "memo", "Policy", "03 Mar 2025", "1.4 MB"),
    ],
    agent: {
      prompt: "How did we do this year vs last year?",
      steps: ["Reading 12 files in Annual Reports", "Comparing FY2025 vs FY2024"],
      answer: "Revenue rose **14.8%** to **PKR 18.6bn** and operating cash flow turned positive at **PKR 2.1bn**. Margins dipped 1.2 pts on construction costs. I'd watch that next quarter.",
      cites: ["FY2025 Audited Accounts.pdf", "FY2024 Audited Accounts.pdf"],
    },
  },

  /* Scroll-pinned "desk" search scene. Group 0 = intro cards (no query). */
  discover: {
    heading: ["Make better", "financial decisions."],
    placeholder: "Search your finances…",
    indexed: "searched 2,418 documents",
    density: { desktop: 48, phone: 22 },   // cards on the desk per scene (curated cards first, then fillers below)
    // on-topic filler cards per group (index matches groups below); "default" is used for any group not listed
    fill: {
      0: [{ kind: "statement", label: "Balance sheet" }, { kind: "statement", label: "P&L" }, { kind: "chart", label: "Revenue" },
          { kind: "chart", label: "EBITDA" }, { kind: "sheet" }, { kind: "pie", label: "Allocation" }, { kind: "memo", label: "Board memo" },
          { kind: "receipt" }, { kind: "notice", label: "Tax notice" }, { kind: "ticker", symbol: "NVLT", change: "+2.4%" },
          { kind: "ticker", symbol: "GILT27", change: "+0.3%" }, { kind: "memo", label: "Monthly report" }, { kind: "chart", label: "Cash flow" }],
      1: [{ kind: "chart", label: "Cash flow" }, { kind: "chart", label: "Q3 variance" }, { kind: "chart", label: "Opex" },
          { kind: "sheet" }, { kind: "statement", label: "Cash flow stmt" }, { kind: "memo", label: "Variance note" },
          { kind: "receipt" }, { kind: "chart", label: "Receivables" }, { kind: "pie", label: "Spend mix" }],
      2: [{ kind: "notice", label: "Sec 122" }, { kind: "notice", label: "Sales tax" }, { kind: "notice", label: "Withholding" },
          { kind: "notice", label: "Sec 176" }, { kind: "notice", label: "Sec 161" }, { kind: "statement", label: "Assessment" },
          { kind: "memo", label: "Reply draft" }, { kind: "sheet" }, { kind: "receipt" }],
      3: [{ kind: "ticker", symbol: "PKCEM", change: "+1.1%" }, { kind: "ticker", symbol: "AGRI5", change: "+0.6%" },
          { kind: "ticker", symbol: "MERIDN", change: "+0.9%" }, { kind: "ticker", symbol: "TXT10", change: "+1.8%" },
          { kind: "ticker", symbol: "SOLRX", change: "-0.4%" }, { kind: "ticker", symbol: "GILT27", change: "+0.3%" },
          { kind: "chart", label: "Dividends" }, { kind: "pie", label: "Yield mix" }, { kind: "memo", label: "Screen notes" }],
    },
    groups: [
      { query: "", cards: [
        { kind: "statement", label: "Balance sheet" }, { kind: "chart", label: "Revenue" },
        { kind: "ticker", symbol: "NVLT", change: "+2.4%" }, { kind: "notice", label: "Tax notice" },
        { kind: "pie", label: "Allocation" }, { kind: "sheet" }, { kind: "receipt" },
        { kind: "memo", label: "Board memo" }, { kind: "chart", label: "EBITDA" },
        { kind: "ticker", symbol: "GILT27", change: "+0.3%" }, { kind: "statement", label: "P&L" },
        { kind: "sheet" },
      ]},
      { query: "Strategic Financial Leadership",
        caption: ["Board-level direction", "Budgeting", "Capital planning", "Performance reporting"],
        cards: [
        { kind: "chart", label: "Q3 cash flow" }, { kind: "sheet" }, { kind: "chart", label: "Budget vs actual" },
        { kind: "statement", label: "Cash flow stmt" }, { kind: "chart", label: "Working capital" },
        { kind: "memo", label: "Variance note" }, { kind: "sheet" }, { kind: "receipt" },
      ]},
      { query: "A decade of architecting financial strategies and engineering the systems that execute them.",
        caption: ["10+ years", "Strategy designed", "Systems built to run it"],
        cards: [
        { kind: "notice", label: "Sec 122" }, { kind: "notice", label: "Sales tax" },
        { kind: "notice", label: "Withholding" }, { kind: "memo", label: "Reply draft" },
        { kind: "statement", label: "Assessment" }, { kind: "notice", label: "Sec 176" },
        { kind: "sheet" },
      ]},
      { query: "We align corporate finance with intelligent ERP automation.",
        caption: ["Corporate finance × ERP", "Automated close", "Reporting", "Controls"],
        cards: [
        { kind: "ticker", symbol: "PKCEM", change: "+1.1%" }, { kind: "ticker", symbol: "AGRI5", change: "+0.6%" },
        { kind: "ticker", symbol: "SOLRX", change: "-0.4%" }, { kind: "pie", label: "Yield mix" },
        { kind: "ticker", symbol: "MERIDN", change: "+0.9%" }, { kind: "chart", label: "Dividends" },
        { kind: "ticker", symbol: "TXT10", change: "+1.8%" }, { kind: "memo", label: "Screen notes" },
      ]},
    ],
  },

  /* Showcase panels — each gets its own interactive app window */
  showcase: [
    {
      note: "",          // handwritten note above the heading (empty = none)
      lead: "Your complete financial", accent: "backbone", tail: ".",
      perfect: ["Annual Reports", "Audit Files", "General Ledgers"],
      wall: "radial-gradient(80% 70% at 0% 0%, #243048 0%, transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(168,140,110,.35) 0%, transparent 60%), #0E1422",
      window: {
        folder: "Annual Reports", view: "grid",
        files: [
          F("FY2025 Audited Accounts.pdf", "statement", "Audit", "28 Sep 2025", "4.2 MB"),
          F("FY2024 Audited Accounts.pdf", "statement", "Audit", "26 Sep 2024", "3.9 MB"),
          F("FY2023 Audited Accounts.pdf", "statement", "Audit", "29 Sep 2023", "3.6 MB"),
          F("FY2022 Audited Accounts.pdf", "statement", "Audit", "30 Sep 2022", "3.4 MB"),
          F("FY2021 Audited Accounts.pdf", "statement", "Audit", "27 Sep 2021", "3.1 MB"),
          F("10-Year Ratio Analysis.xlsx", "sheet", "Model", "02 Oct 2025", "1.8 MB"),
          F("Revenue Trend.chart", "chart", "Analysis", "02 Oct 2025", "200 KB", { label: "Revenue" }),
          F("Margin Trend.chart", "chart", "Analysis", "02 Oct 2025", "210 KB", { label: "Gross margin" }),
          F("Auditor Management Letter.pdf", "memo", "Audit", "30 Sep 2025", "540 KB"),
          F("Segment Mix.chart", "pie", "Analysis", "02 Oct 2025", "160 KB", { label: "Segments" }),
          F("Trial Balance Jun-25.xlsx", "sheet", "GL", "15 Jul 2025", "2.3 MB"),
          F("FY2020 Audited Accounts.pdf", "statement", "Audit", "30 Sep 2020", "2.9 MB"),
        ],
        agent: {
          prompt: "Summarise revenue and margin trends across the last 5 years.",
          steps: ["Reading 12 files in Annual Reports", "Extracting income statements", "Normalising restated years", "Building trend table"],
          answer: "Revenue grew at a **12.4% CAGR** from FY2021 to FY2025, reaching **PKR 18.6bn**. Gross margin peaked at **41%** in FY2021 and has compressed to **34%**, driven by construction costs. FY2023 includes a one-off impairment of **PKR 640m**. Excluding it, net margin held at 9-11%.",
          cites: ["FY2025 Audited Accounts.pdf", "FY2021 Audited Accounts.pdf", "10-Year Ratio Analysis.xlsx"],
        },
      },
    },
    {
      note: "or this",
      lead: "Build forecasts from your entire", accent: "portfolio", tail: ".",
      perfect: ["Cash-flow Planning", "Scenario Modelling", "Budgeting"],
      wall: "linear-gradient(135deg, #07090f 0%, #0E1422 45%, #182132 100%)",
      window: {
        folder: "Investments", view: "list",
        files: [
          F("Cash Flow Forecast FY27.xlsx", "sheet", "Forecast", "01 Oct 2026", "2.1 MB"),
          F("Rate Scenarios.chart", "chart", "Scenario", "29 Sep 2026", "190 KB", { label: "Rate scenarios" }),
          F("Debt Schedule.xlsx", "sheet", "Debt", "15 Sep 2026", "760 KB"),
          F("Asset Allocation.chart", "pie", "Portfolio", "15 Sep 2026", "180 KB", { label: "Allocation" }),
          F("T-Bill Ladder.xlsx", "sheet", "Fixed income", "10 Sep 2026", "420 KB"),
          F("GILT27 Position.tick", "ticker", "Bond", "Live", "-", { symbol: "GILT27", change: "+0.3%" }),
          F("Project Collections.chart", "chart", "Receivables", "05 Sep 2026", "230 KB", { label: "Collections" }),
          F("Capex Plan 2027.xlsx", "sheet", "Budget", "28 Aug 2026", "1.3 MB"),
          F("Liquidity Policy.pdf", "memo", "Policy", "12 Mar 2026", "820 KB"),
          F("Facility Agreement.pdf", "statement", "Debt", "02 Feb 2026", "2.7 MB"),
        ],
        agent: {
          prompt: "Project cash flow for the next 12 months under a 200 bp rate cut.",
          steps: ["Reading 10 files in Investments", "Loading debt schedule & T-bill ladder", "Re-pricing floating facilities", "Running 12-month projection"],
          answer: "With a **200 bp cut**, finance cost falls by about **PKR 310m** over 12 months and the cash low point improves from **PKR 0.9bn** (Feb) to **PKR 1.2bn**. T-bill income drops **PKR 95m**, so the net benefit is roughly **PKR 215m**. Consider locking 30% of the ladder at today's yields.",
          cites: ["Cash Flow Forecast FY27.xlsx", "Debt Schedule.xlsx", "T-Bill Ladder.xlsx"],
        },
      },
    },
    {
      note: "or maybe",
      lead: "Create intelligent", accent: "memos & summaries", tail: ".",
      perfect: ["Board Packs", "Research Notes", "Client Reviews"],
      wall: "radial-gradient(70% 60% at 85% 0%, rgba(168,140,110,.28) 0%, transparent 60%), linear-gradient(160deg, #182132 0%, #0E1422 60%, #07090f 100%)",
      window: {
        folder: "Board Packs", view: "gallery",
        files: [
          F("Land Acquisition - Lahore.pdf", "memo", "Board", "22 Sep 2026", "1.6 MB"),
          F("Valuation Report.pdf", "statement", "Valuation", "18 Sep 2026", "5.4 MB"),
          F("IRR Model.xlsx", "sheet", "Model", "20 Sep 2026", "980 KB"),
          F("Sales Absorption.chart", "chart", "Market", "17 Sep 2026", "210 KB", { label: "Absorption" }),
          F("Funding Mix.chart", "pie", "Funding", "20 Sep 2026", "150 KB", { label: "Funding" }),
          F("Legal Due Diligence.pdf", "memo", "Legal", "14 Sep 2026", "2.2 MB"),
          F("Q3 Board Minutes.pdf", "memo", "Board", "30 Jul 2026", "540 KB"),
          F("Site Survey Invoice.pdf", "receipt", "AP", "09 Sep 2026", "80 KB"),
        ],
        agent: {
          prompt: "Draft a one-page investment memo on the Lahore land acquisition.",
          steps: ["Reading 8 files in Board Packs", "Pulling valuation & IRR outputs", "Checking legal DD for red flags", "Drafting memo"],
          answer: "**Recommendation: proceed, subject to title clearance.** Purchase price of **PKR 4.8bn** sits 6% below the independent valuation. Base-case project IRR is **21.3%** (downside 15.8%). Funding: 55% equity, 45% facility. Key risk: two title chains still open in legal DD. Draft saved as *Investment Memo - Lahore.docx*.",
          cites: ["Valuation Report.pdf", "IRR Model.xlsx", "Legal Due Diligence.pdf"],
        },
      },
    },
    {
      note: "even this",
      lead: "Screen by sector, risk,", accent: "return", tail: " and more.",
      perfect: ["Portfolio Screening", "Asset Discovery", "Rebalancing"],
      wall: "linear-gradient(160deg, #0E1422 0%, #182132 55%, #243048 100%)",
      window: {
        folder: "Investments", view: "grid",
        files: [
          F("PKCEM.tick", "ticker", "Cement", "Live", "-", { symbol: "PKCEM", change: "+1.1%" }),
          F("AGRI5.tick", "ticker", "Fertiliser", "Live", "-", { symbol: "AGRI5", change: "+0.6%" }),
          F("SOLRX.tick", "ticker", "Energy", "Live", "-", { symbol: "SOLRX", change: "-0.4%" }),
          F("MERIDN.tick", "ticker", "Banking", "Live", "-", { symbol: "MERIDN", change: "+0.9%" }),
          F("TXT10.tick", "ticker", "Textiles", "Live", "-", { symbol: "TXT10", change: "+1.8%" }),
          F("NVLT.tick", "ticker", "Property", "Live", "-", { symbol: "NVLT", change: "+2.4%" }),
          F("GILT27.tick", "ticker", "Bond", "Live", "-", { symbol: "GILT27", change: "+0.3%" }),
          F("Sector Weights.chart", "pie", "Portfolio", "01 Oct 2026", "140 KB", { label: "Sectors" }),
          F("Dividend History.chart", "chart", "Income", "01 Oct 2026", "190 KB", { label: "Dividends" }),
          F("Risk Report Sep-26.xlsx", "sheet", "Risk", "30 Sep 2026", "1.2 MB"),
          F("Investment Policy.pdf", "memo", "Policy", "03 Mar 2026", "1.4 MB"),
          F("CPT21.tick", "ticker", "Chemicals", "Live", "-", { symbol: "CPT21", change: "-1.2%" }),
        ],
        agent: {
          prompt: "Show holdings with beta under 0.8 and dividend yield above 6%.",
          steps: ["Scanning 12 holdings", "Joining risk report & dividend history", "Applying filters"],
          answer: "**3 holdings match:** **AGRI5** (beta 0.52, yield 9.1%), **PKCEM** (beta 0.71, yield 7.4%) and **MERIDN** (beta 0.78, yield 11.2%). Together they are **18%** of the portfolio, under the 25% income-sleeve target, so there's room to add.",
          cites: ["AGRI5.tick", "PKCEM.tick", "MERIDN.tick", "Risk Report Sep-26.xlsx"],
        },
      },
    },
    {
      note: "and this",
      lead: "Read complex", accent: "tax notices", tail: " and contracts.",
      perfect: ["Tax Notices", "Loan Agreements", "Prospectuses"],
      wall: "radial-gradient(70% 60% at 0% 100%, rgba(168,140,110,.3) 0%, transparent 60%), linear-gradient(135deg, #182132 0%, #0E1422 100%)",
      window: {
        folder: "Tax & Compliance", view: "column",
        files: [
          F("Sec 122 Notice - TY2023.pdf", "notice", "Income tax", "19 Sep 2026", "380 KB"),
          F("Sales Tax Show-Cause.pdf", "notice", "Sales tax", "11 Sep 2026", "290 KB"),
          F("Withholding Audit Sec 161.pdf", "notice", "WHT", "02 Sep 2026", "310 KB"),
          F("Assessment Order TY2022.pdf", "statement", "Income tax", "14 Jun 2026", "1.1 MB"),
          F("Tax Computation FY25.xlsx", "sheet", "Working", "30 Sep 2025", "880 KB"),
          F("Reply Draft - Sec 122.docx", "memo", "Draft", "24 Sep 2026", "120 KB"),
          F("Facility Agreement.pdf", "statement", "Contract", "02 Feb 2026", "2.7 MB"),
          F("Tax Exposure.chart", "chart", "Summary", "25 Sep 2026", "160 KB", { label: "Exposure" }),
        ],
        agent: {
          prompt: "What does the Section 122 notice ask for, and when is it due?",
          steps: ["Reading Sec 122 Notice - TY2023.pdf", "Cross-checking tax computation", "Checking prior assessment orders"],
          answer: "The notice proposes amending the TY2023 assessment by **PKR 212m**, mainly disallowing advertising expenses and an inventory write-down. Response is due **18 Oct 2026**. Our computation supports **PKR 148m** of the disallowed items with invoices, and I've added them to the reply draft.",
          cites: ["Sec 122 Notice - TY2023.pdf", "Tax Computation FY25.xlsx", "Reply Draft - Sec 122.docx"],
        },
      },
    },
    {
      note: "on autopilot",
      lead: "Tag and reconcile", accent: "transactions", tail: " automatically.",
      perfect: ["Bookkeeping", "Bank Reconciliation", "Workflow Automation"],
      wall: "radial-gradient(80% 70% at 100% 0%, #243048 0%, transparent 60%), #07090f",
      window: {
        folder: "Bank Statements", view: "list",
        files: [
          F("Current A/c - Sep 2026.pdf", "statement", "Matched", "01 Oct 2026", "820 KB"),
          F("Collections A/c - Sep 2026.pdf", "statement", "Matched", "01 Oct 2026", "1.4 MB"),
          F("USD A/c - Sep 2026.pdf", "statement", "To review", "01 Oct 2026", "310 KB"),
          F("GL Cash Ledger Sep-26.xlsx", "sheet", "GL", "02 Oct 2026", "2.6 MB"),
          F("Bank Charges 0930.pdf", "receipt", "To review", "30 Sep 2026", "60 KB"),
          F("Payroll Transfer 0928.pdf", "receipt", "Matched", "28 Sep 2026", "70 KB"),
          F("Vendor Payment 0912.pdf", "receipt", "Matched", "12 Sep 2026", "90 KB"),
          F("Reconciliation Sep-26.xlsx", "sheet", "Draft", "02 Oct 2026", "540 KB"),
          F("Daily Cash Position.chart", "chart", "Cash", "02 Oct 2026", "180 KB", { label: "Cash position" }),
        ],
        agent: {
          prompt: "Reconcile September bank statements against the GL.",
          steps: ["Reading 3 bank statements", "Matching 1,301 lines to the GL", "Classifying exceptions", "Tagging files"],
          answer: "Matched **1,284 of 1,301** lines (**98.7%**). 17 exceptions: 11 timing differences, 4 bank charges not yet booked (**PKR 38,400**), and 2 possible duplicate vendor payments. I've tagged them *To review* and prepared the journal entries.",
          cites: ["Reconciliation Sep-26.xlsx", "Bank Charges 0930.pdf", "GL Cash Ledger Sep-26.xlsx"],
        },
      },
    },
  ],

  /* "What we do" — pinned stack of service screens (rendered by services.js).
     Each screen: heading (lead + serif accent), tagline, sub-services list, and a chart/diagram (viz).
     Chart figures are illustrative. Set services to null to fall back to the old showcase panels above. */
  services: {
    lead: "Your complete financial", accent: "backbone", tail: ".",
    sub: "Four disciplines, one partner. Scroll to move through what we do.",
    items: [
      {
        title: "Financial Advisory & Strategy", short: "Advisory & Strategy", icon: "briefcase",
        lead: "Financial Advisory &", accent: "Strategy",
        tagline: "Architecting the financial roadmap for sustainable corporate growth and capital optimization.",
        items: [
          { t: "Comprehensive Business Planning", d: "Development of multi-year operational cash flow business plans and strategic growth frameworks." },
          { t: "Advanced Financial Modeling", d: "Accurate business valuation, synergy analysis, and capital structuring." },
          { t: "Bankable Feasibility Studies", d: "Pre-feasibility and deep-dive market assessments for new ventures and project expansions." },
          { t: "Executive KPI & Analytics", d: "Designing high-level Power BI dashboards to visualize performance metrics and monitor financial health." },
        ],
        viz: "plan",
        data: {
          title: "Five-year cash flow plan", unit: "PKR m",
          years: ["FY26", "FY27", "FY28", "FY29", "FY30"],
          series: [
            { name: "Operating cash flow", values: [820, 1040, 1310, 1580, 1890] },
            { name: "Free cash flow", values: [310, 450, 640, 860, 1120] },
          ],
          kpis: [["Project IRR", "21.3%"], ["NPV", "PKR 4.2bn"], ["DSCR", "1.8×"], ["Payback", "4.6 yrs"]],
        },
      },
      {
        title: "Corporate Structuring & Transaction Advisory", short: "Structuring & Transactions", icon: "share",
        lead: "Corporate Structuring &", accent: "Transaction Advisory",
        tagline: "Engineering the legal and financial architecture for major corporate moves, setups, and shifts.",
        items: [
          { t: "Entity Formation & Setup", d: "End-to-end registration for Companies and Associations of Persons (AOPs), coupled with ongoing corporate governance." },
          { t: "Mergers, Acquisitions (M&A) & JVs", d: "Strategic structuring, partner identification, and negotiation for Joint Ventures and acquisitions." },
          { t: "Transaction Advisory", d: "Deep-dive financial due diligence and liability verification prior to deal closures." },
          { t: "REIT Registrations", d: "End-to-end regulatory compliance, advisory, and structuring for Real Estate Investment Trusts." },
        ],
        viz: "structure",
        data: {
          title: "Group structure", unit: "post-transaction",
          parent: ["Group HoldCo", "Governance & treasury"],
          children: [["Operating Co.", "Private limited"], ["Joint Venture", "60 / 40 with partner"], ["REIT SPV", "Real estate trust"]],
          focus: 1,
          steps: [["Screening", "done"], ["Due diligence", "done"], ["Negotiation", "now"], ["Closing", "next"]],
        },
      },
      {
        title: "System Implementations & Intelligent Automation", short: "Systems & Automation", icon: "sync",
        lead: "System Implementations &", accent: "Intelligent Automation",
        tagline: "Deploying the digital nervous system required to automate and scale complex financial operations.",
        items: [
          { t: "SAP ERP Implementations", d: "End-to-end deployment specializing in SAP S/4HANA (FICO) and enterprise resource planning architecture." },
          { t: "Digital Invoicing Integration", d: "Implementation of automated e-invoicing systems within SAP and existing ERP architectures, integrated with FBR and PRA, for frictionless, scalable billing." },
          { t: "Legacy Data Reconciliation", d: "Secure migration, auditing, and reconciliation of historical financial data into modern ERP environments." },
          { t: "Post-Merger System Integration", d: "Seamlessly merging the financial systems and reporting structures of combining entities following M&A activity." },
          { t: "Automated Financial Workflows", d: "Reengineering traditional accounting processes into intelligent, automated digital workflows." },
        ],
        viz: "systems",
        data: {
          title: "Finance data flow", unit: "live",
          meters: [["GL balances migrated", 100], ["Open items reconciled", 96], ["Vendor & customer masters", 100], ["Workflows automated", 82]],
        },
      },
      {
        title: "Corporate Taxation & Regulatory Compliance", short: "Tax & Compliance", icon: "shield",
        lead: "Corporate Taxation &", accent: "Regulatory Compliance",
        tagline: "Protecting corporate assets through rigorous tax planning and uncompromising statutory compliance.",
        items: [
          { t: "Strategic Tax Planning", d: "Structuring corporate operations to optimize tax efficiency and minimize exposure." },
          { t: "Digital Invoicing Compliance", d: "Structuring e-invoicing workflows to ensure real-time reporting alignment with FBR and PRA and strict adherence to statutory tax authority mandates." },
          { t: "Statutory Filings & Management", d: "Overseeing all ongoing tax calculations, records, and mandatory corporate filings." },
          { t: "Regulatory Approvals", d: "Securing necessary clearances and ensuring strict adherence to regional and national compliance frameworks." },
          { t: "Corporate Liability Verification", d: "Comprehensive auditing of tax liabilities and regulatory obligations to ensure complete financial transparency." },
        ],
        viz: "tax",
        data: {
          title: "Compliance calendar", unit: "FY2026",
          months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          now: 3,                                   // index of the current month (Oct)
          rows: [["Withholding statements", "monthly"], ["Sales tax returns", "monthly"], ["Advance tax", [2, 5, 8, 11]], ["Annual return", [2]]],
          etr: [["Before structuring", 31], ["After structuring", 26]],
        },
      },
    ],
  },

  features: {
    lead: "Everything you'd expect from an advisor,",
    accent: "and then some.",
    items: [
      { icon: "sync",    title: "Bank & Broker Sync",  vis: "sync",     text: "Connect bank accounts, brokers and your ERP. Balances and positions refresh on their own." },
      { icon: "layers",  title: "Long Context",        vis: "context",  wide: true, text: "Review a decade of statements in one conversation, and run several analyses side by side." },
      { icon: "history", title: "Full Audit Trail",    vis: "versions", tall: true, text: "Every figure, file and decision is versioned. Roll back to any point right from the UI." },
      { icon: "share",   title: "Client Portal Sharing", vis: "share",  text: "Share a read-only view with family, auditors or lenders in one click." },
      { icon: "sliders", title: "Flexible Views",      vis: "views",    text: "Sort, group and filter holdings by sector, risk, currency or any custom property." },
      { icon: "users",   title: "Shared Workspaces",   vis: "team",     text: "Work with your CFO, accountant and advisor with role-based permissions and live updates." },
      { icon: "eyeoff",  title: "Hide from AI",        vis: "toggle",   text: "One switch keeps sensitive files out of search and analysis, always." },
      { icon: "tag",     title: "Rich Properties",     vis: "props",    wide: true, text: "Tag holdings and documents with risk score, tax lot, maturity, beneficiary and more." },
      { icon: "shield",  title: "Privacy & Security",  vis: "shield",   text: "Your data is encrypted on device, in transit and at rest, on privacy-first infrastructure." },
      { icon: "wifioff", title: "Offline Ready",       vis: "offline",  text: "Keep working offline. Changes sync the moment you're back." },
      { icon: "cursor",  title: "Fluent UI",           vis: "peek",     text: "Press space to peek at any file. Right-click, drag and multi-select like a native app." },
      { icon: "chat",    title: "Joint Advisory Sessions", vis: "chat", soon: true, text: "Invite your advisor into a live conversation with the AI, so everyone sees the same numbers." },
    ],
  },

  cta: {
    title: "Your next financial decision,",
    accent: "made clearer.",
    text: "We onboard new clients every week. Book a discovery call and see it working on your own numbers.",
    primary:   { label: "Book a consultation", href: "mailto:hello@example.com?subject=Consultation" },
    secondary: { label: "Join our community", href: "#" },
  },

  footer: {
    links: [
      { label: "Support", href: "#" }, { label: "Privacy", href: "#" },
      { label: "Disclosures", href: "#" }, { label: "Contact", href: "mailto:hello@example.com" },
    ],
    disclaimer: "Demo content. Figures, tickers and documents shown are illustrative and do not constitute investment, tax or legal advice. Past performance is not a guide to future returns.",
  },

  /* Replies when a visitor types into a demo advisor chat (keyword match). */
  agentReplies: [
    { match: ["tax", "notice", "fbr", "122", "assessment"], reply: "I'd read every notice in **Tax & Compliance**, extract the section, amount and deadline, and draft a reply with supporting invoices attached. Nothing is filed without your sign-off." },
    { match: ["cash", "liquidity", "flow", "forecast"], reply: "I'd combine your bank feeds, receivables and debt schedule into a **13-week and 12-month cash forecast**, then flag the lowest point and what moves it." },
    { match: ["invest", "stock", "portfolio", "risk", "return", "dividend"], reply: "I'd screen your holdings against your investment policy (risk, concentration and income targets) and suggest a rebalance for your advisor to review." },
    { match: ["retire", "pension", "saving", "goal"], reply: "We'd map your goals to a **target savings rate** and allocation, then track progress monthly with a plain-English update." },
    { match: ["loan", "debt", "interest", "rate", "kibor"], reply: "I'd re-price every facility under different rate paths and show the impact on finance cost, covenants and cash headroom." },
  ],
  agentFallback: "In the live product I'd read the files in this folder and answer with citations. This demo uses sample responses. Book a consultation to see it on your own numbers.",
};
