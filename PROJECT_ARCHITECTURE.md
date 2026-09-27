# ⚡ Cerkit AI — Autonomous Agentic Data Engineering & Swarm Intelligence Platform
## Master Technical Architecture, Agentic Workflow, & Hackathon Evaluation Specification

---

> **Document Type**: Master Technical Architecture & System Specification  
> **Target Audience**: Technical Judges, Senior Architects, Evaluators, Engineering Contributors, and Autonomous AI Agents  
> **Status**: Verified Against Live Production Codebase (`Agentic_system_backend` & `Agentic_system_frontend`)  
> **Platform Version**: 2.4.0 (Enterprise Swarm Engine)

---

## 1. Executive Summary

**Cerkit AI** is an enterprise-grade, multi-agent autonomous data engineering platform that transforms unconstrained natural language instructions into verifiable, structured, real-time datasets. Built on **Node.js (Express 5.2.1)**, **LangChain (1.4.5)**, **LangGraph (1.4.4)**, **MongoDB (Mongoose 9.7.1)**, and **React 19 (Vite 8.3.0)**, Cerkit AI eliminates the high maintenance costs and data inaccuracies of traditional web scrapers and static ETL pipelines.

Rather than relying on brittle CSS selectors or single-prompt LLM wrappers, Cerkit AI executes an autonomous **7-tier agentic DAG** (Directed Acyclic Graph):
1. **Intent Analysis & Meta-Architecture**: Translates user intent into dynamic sub-agent topologies and execution DAGs.
2. **Autonomous Swarm Scouting**: Discovers target authority domains across multiple parallel search matrices using Tavily and Puppeteer.
3. **Resilient Data Extraction**: Harvests raw unstructured data and normalizes it into structured schemas with cryptographic SHA-256 entity hashes.
4. **Fuzzy Levenshtein Deduplication**: Clusters and deduplicates records in memory using edit-distance metrics.
5. **Adversarial Red-Team Cross-Examination**: Deploys a counter-intelligence fact-checker that cross-examines proposed entities against external authority sources, flagging contradictions with dual citations.
6. **Vision-Guided Self-Healing**: Automatically diagnoses broken DOM selectors upon website redesigns, visually re-locates target elements, and synthesizes patched CSS selectors in real time.
7. **Temporal Time-Travel Diffs & Swarm Cron**: Tracks historical dataset versions (Git for Web Data), computing field-level mutations (`Added`, `Removed`, `Mutated`, `Unchanged`) with scheduled automated cron re-scrapes and outbound webhook alerts.

---

## 2. Problem Statement

Modern data acquisition and competitive intelligence workflows suffer from four fatal vulnerabilities:

1. **Scraper Fragility (Web Drift)**: Modern web applications frequently refactor CSS classes, deploy randomized utility frameworks (e.g., Tailwind hashed classes like `css-1x8b0q`), or migrate to client-side canvas/hydration. A minor DOM modification crashes traditional scrapers with zero self-recovery.
2. **Data Hallucination & Gullibility**: Standard LLM extraction blindly accepts whatever text is present on an arbitrary webpage. If a promotional blog claims a startup raised $100M when official SEC filings report $15M, single-pass extraction ingests the falsehood as ground truth.
3. **Temporal Blindness (Static Snapshots)**: Web intelligence is transient. Current scrapers produce one-off static CSVs without recording field-level mutations over time, forcing analysts to manually compare disparate spreadsheets to detect new funding rounds, pricing updates, or executive departures.
4. **Maintenance Friction & Integration Latency**: Building, repairing, and validating bespoke web crawlers consumes hundreds of developer hours. Once scraped, data requires manual cleaning, deduplication, schema definition, and conversion into queryable formats.

---

## 3. Solution Overview

Cerkit AI provides an end-to-end autonomous compiler and runtime swarm engine that replaces brittle ETL pipelines with resilient, self-healing, and self-auditing AI workflows:

```
Natural Language Prompt
       │
       ▼
Intent Analyzer & Meta-Architect (DAG Planner)
       │
       ▼
Autonomous Search & Extraction Swarm (Puppeteer + Tavily)
       │
 ┌─────┴───────────────────────────────┐
 │ Self-Healing Recovery Loop (Active) │
 └─────────────────────────────────────┘
       │
Fuzzy Levenshtein Deduplication Engine
       │
Adversarial Red-Team Cross-Examiner (Ground Truth Verification)
       │
Human-In-The-Loop Schema Contract Review (SSE Event)
       │
Versioned MongoDB Persistence (SHA-256 Hashing)
       │
Time-Travel Diff Engine & Scheduled Swarm Cron
```

### High-Value Architectural Pillars
- **Zero-Hallucination Courtroom**: Dialectic verification where an Advocate Agent proposes data and an Adversarial Skeptic attempts to disprove it before commitment.
- **Visual Self-Healing**: Automatic fallback from broken CSS selectors to semantic visual element recovery with cached dynamic patches.
- **Git-Style Time-Travel Engine**: Native entity diffing comparing baseline vs. current runs with field-level mutation tracking and currency normalization.
- **Resilient AI Gateway**: Dynamic round-robin key rotation across multi-provider Groq pools monkey-patched into LangChain core to prevent HTTP 429 rate-limiting.

---

## 4. Key Features

| Feature | Architectural Category | Implementation Description | Primary Files |
|---|---|---|---|
| **Autonomous Swarm Scouting** | Multi-Agent Orchestration | Executes multi-query search matrices across authority domains and extracts content via headless Puppeteer. | [`src/ai/tools/webSearch.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/webSearch.tool.js), [`src/ai/tools/advancedBrowser.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/advancedBrowser.tool.js) |
| **Adversarial Red-Team Auditor** | Fact Verification | Dialectic cross-examination agent verifying claims against external authority sources, assigning an Entity Corroboration Index (ECI). | [`src/ai/nodes/adversarialAuditor.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/adversarialAuditor.node.js) |
| **Vision-Guided Self-Healing** | Resilient Web Scraping | Diagnoses broken DOM selectors, visually determines element coordinates, and generates patched CSS selectors. | [`src/ai/services/visionSelfHealer.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/visionSelfHealer.service.js) |
| **Time-Travel Data Diffs** | Temporal Versioning | Compares historical runs using Levenshtein entity matching, tracking `Added`, `Removed`, `Mutated`, and `Unchanged` records. | [`src/ai/services/datasetDiff.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/datasetDiff.service.js) |
| **Autonomous Swarm Cron** | Background Automation | Scheduled worker polling dataset execution intervals (`schedule.nextRunAt`) and dispatching outbound webhooks. | [`src/ai/services/swarmCronScheduler.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/swarmCronScheduler.service.js) |
| **Human-In-The-Loop Schema Review** | Contract Governance | Evaluates harvested records, infers data types, and pauses pipeline for user schema confirmation via SSE before persistence. | [`src/ai/nodes/schemaDetector.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/schemaDetector.node.js) |
| **Conversational Dataset Q&A** | In-Situ Analytics | Conversational AI node allowing natural language queries directly over active dataset records with starter suggestions. | [`src/ai/nodes/datasetChat.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/datasetChat.node.js) |
| **Executive Dossier Generator** | Synthesis & Reporting | Synthesizes full markdown research dossiers with executive summaries, metrics, risk factors, and strategic takeaways. | [`src/ai/nodes/reportGenerator.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/reportGenerator.node.js) |
| **Dynamic Key Rotation Gateway** | AI Reliability | Intercepts LangChain Groq calls and rotates API keys across an environment pool to bypass rate limits. | [`src/config/groqRotation.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/config/groqRotation.js) |
| **Cyber-Forensics Source Inspector** | Data Provenance | Interactive UI drawer displaying crawl headers, IP/proxy status, raw excerpts, and dual-source verification badges. | [`Agentic_system_frontend/src/components/SourceInspectorDrawer.jsx`](file:///c:/Users/ghosh/Agentic_system_frontend/src/components/SourceInspectorDrawer.jsx) |

---

## 5. System Architecture

The platform follows a decoupled, 5-tier topology:
1. **Presentation Tier (React 19 / Vite)**: Single-page application rendering real-time streaming telemetry, interactive data grids, cyber-forensics drawers, and time-travel comparison modals.
2. **API Gateway & Middleware Tier (Express 5.2.1)**: Manages routing, CORS, dual-token JWT authentication (15m access + 7d HTTP-only refresh cookie), Zod request validation, and in-memory rate limiting.
3. **Agentic Orchestration Tier (LangGraph / State Machines)**: Coordinates the multi-agent DAG pipeline, manages execution state, emits SSE events, and handles task cancellation.
4. **Tool Sandbox & Browser Cluster**: Headless Puppeteer engine, Cheerio/Turndown DOM scrapers, Math.js mathematical evaluators, and Tavily search scrapers.
5. **Persistence & Cache Tier (MongoDB Atlas)**: Stores user accounts, task execution logs, versioned datasets, data lineage traces, and scheduled cron jobs.

---

## 6. High-Level Architecture Diagram

```mermaid
graph TD
    classDef client fill:#1e1e2f,stroke:#6366f1,stroke-width:2px,color:#ffffff;
    classDef gateway fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#ffffff;
    classDef orchestrator fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef worker fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef datalayer fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#ffffff;
    classDef security fill:#4c0519,stroke:#f43f5e,stroke-width:2px,color:#ffffff;

    subgraph Client_Layer ["Frontend Client (React 19 / Vite)"]
        UI_Prompt["PromptStudio & Governance"]:::client
        UI_Swarm["LiveSwarmTracker (SSE Stream)"]:::client
        UI_Table["DataTable & SourceInspectorDrawer"]:::client
        UI_Diff["TimeTravelDiffModal (Git for Web Data)"]:::client
    end

    subgraph Gateway_Layer ["Gateway Tier (Express 5 / Node.js)"]
        MW_RateLimit["Rate Limiter Middleware"]:::security
        MW_Auth["JWT & Cookie Auth Middleware"]:::security
        Controller_Task["Task Controller (SSE Streamer)"]:::gateway
        Controller_Dataset["Dataset Controller (Diff / Chat / Export)"]:::gateway
    end

    subgraph Orchestration_Layer ["Agentic DAG Engine (LangGraph / Node Pipeline)"]
        Node_Intent["Intent Analyzer (qwen3.8-27b)"]:::orchestrator
        Node_Architect["Meta-Architect DAG Planner"]:::orchestrator
        Node_Extractor["Data Extractor (gpt-oss-120b)"]:::orchestrator
        Node_Dedupe["Fuzzy Deduplicator (Levenshtein)"]:::orchestrator
        Node_Auditor["Adversarial Red-Team Auditor"]:::orchestrator
        Node_Schema["Schema Detector & HITL Review"]:::orchestrator
    end

    subgraph Tools_Layer ["Tool Sandbox & Execution Cluster"]
        Tool_Search["Tavily Multi-Scout Tool"]:::worker
        Tool_Puppeteer["Headless Puppeteer Browser"]:::worker
        Service_Healer["Vision Self-Healing Service"]:::worker
        Service_Diff["Dataset Time-Travel Engine"]:::worker
    end

    subgraph Persistence_Layer ["Persistence & Autonomous Tier"]
        DB_Mongo[("MongoDB Atlas (Mongoose 9)")]:::datalayer
        Cron_Scheduler["Swarm Cron Scheduler (Background)"]:::datalayer
    end

    UI_Prompt -->|POST /tasks/create| Controller_Task
    Controller_Task -->|SSE Stream: status / progress / log| UI_Swarm
    Controller_Task --> Node_Intent
    Node_Intent --> Node_Architect
    Node_Architect --> Tool_Search
    Tool_Search --> Tool_Puppeteer
    Tool_Puppeteer -.->|Selector Breakage| Service_Healer
    Service_Healer -.->|Patched Selector| Tool_Puppeteer
    Tool_Puppeteer --> Node_Extractor
    Node_Extractor --> Node_Dedupe
    Node_Dedupe --> Node_Auditor
    Node_Auditor --> Node_Schema
    Node_Schema -->|schema_review SSE| UI_Table
    UI_Table -->|POST confirm-schema| Controller_Task
    Controller_Task --> DB_Mongo
    Cron_Scheduler -->|Polls NextRunAt| Controller_Task
    DB_Mongo --> Service_Diff
    Service_Diff --> UI_Diff
```

---

## 7. Complete Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Operator
    participant Client as React 19 Frontend
    participant Gateway as Express Task Controller
    participant Orchestrator as LangGraph DAG Runner
    participant Tavily as Tavily Search Engine
    participant Browser as Puppeteer Headless Cluster
    participant Healer as Vision Self-Healer
    participant Extractor as gpt-oss-120b Extractor
    participant Auditor as Red-Team Skeptic Agent
    participant DB as MongoDB Atlas

    User->>Client: Enters prompt: "Extract YC W24 AI Startups"
    Client->>Gateway: POST /api/tasks/create (SSE Handshake)
    Gateway-->>Client: HTTP 200 (text/event-stream, taskId)
    Gateway->>Orchestrator: Initialize task execution state
    Orchestrator-->>Client: SSE: type='status', status='ANALYZING'

    Orchestrator->>Tavily: executeMultiWebSearch(prompt)
    Tavily-->>Orchestrator: Discovered URLs (ycombinator.com, etc.)
    Orchestrator-->>Client: SSE: type='progress', progress=25

    Orchestrator->>Browser: scrape(discovered_urls)
    alt Broken DOM Selector Encountered
        Browser->>Healer: healBrokenSelector(url, failedSelector)
        Healer->>Healer: Visual layout diagnosis & CSS synthesis
        Healer-->>Browser: Return resilient patched selector
        Orchestrator-->>Client: SSE: type='log', text='[Self-Healing] Patched selector'
    end
    Browser-->>Orchestrator: Raw markdown & DOM excerpts

    Orchestrator->>Extractor: Extract structured entities (gpt-oss-120b)
    Extractor-->>Orchestrator: Raw tabular entities + SHA-256 hashes

    Orchestrator->>Orchestrator: Fuzzy Levenshtein Deduplication (threshold: 3)
    Orchestrator-->>Client: SSE: type='progress', progress=65

    Orchestrator->>Auditor: Cross-examine entities (qwen3.8-27b)
    Auditor->>Tavily: Counter-intelligence query verification
    Auditor-->>Orchestrator: Annotated records (VERIFIED / CONTESTED, ECI score)
    Orchestrator-->>Client: SSE: type='progress', progress=85

    Orchestrator->>Orchestrator: Schema type inference
    Orchestrator-->>Client: SSE: type='schema_review', schemaDefinition
    Client->>User: Displays Schema Review Modal (HITL)
    User->>Client: Confirms schema
    Client->>Gateway: POST /api/tasks/:taskId/confirm-schema
    Gateway->>DB: Save versioned Dataset (v1)
    Gateway-->>Client: SSE: type='done', datasetId
    Client->>User: Renders interactive DataTable & Provenance
```

---

## 8. Agentic Architecture

The agentic runtime operates as an interconnected, event-driven state machine built with LangGraph and modular pipeline nodes. Each agent possesses a discrete role, operational bounds, validation schemas, and failure recovery policies.

```mermaid
graph LR
    classDef agent fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef tool fill:#0f172a,stroke:#34d399,stroke-width:1.5px,color:#ffffff;
    classDef checkpoint fill:#451a03,stroke:#fbbf24,stroke-width:2px,color:#ffffff;

    A1["Intent Analyzer"]:::agent --> A2["Meta-Architect"]:::agent
    A2 --> A3["Tavily Scout Swarm"]:::agent
    A3 --> T1["Web Search Tool"]:::tool
    A3 --> A4["Browser Scraper Agent"]:::agent
    A4 --> T2["Puppeteer Headless"]:::tool
    T2 -.->|Breakage| S1["Vision Self-Healer"]:::tool
    A4 --> A5["Data Extractor Node"]:::agent
    A5 --> A6["Fuzzy Deduplicator"]:::agent
    A6 --> A7["Red-Team Auditor"]:::agent
    A7 --> T1
    A7 --> C1["HITL Schema Review Checkpoint"]:::checkpoint
    C1 --> A8["Dataset Persister"]:::agent
```

---

## 9. Agent Registry

| Agent Name | Architectural File | Model & Temperature | Input | Output | Primary Tools & Services | Trigger Condition |
|---|---|---|---|---|---|---|
| **Intent Analyzer** | [`src/ai/nodes/intent.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/intent.node.js) | `qwen/qwen3.8-27b` ($T=0$) | Raw user prompt string | Intent classification, required fields, constraints | None | User initiates task |
| **Meta-Architect** | [`src/ai/nodes/architect.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/architect.node.js) | `openai/gpt-oss-120b` ($T=0$) | Classified intent & constraints | Dynamically structured multi-agent DAG blueprint | Blueprint validator | Intent Analyzer completes |
| **Tavily Scout Swarm** | [`src/ai/tools/webSearch.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/webSearch.tool.js) | Procedural / Algorithmic | Query variations array | Target authority URL list with snippets | Tavily Search API | DAG execution start |
| **Browser Scraper** | [`src/ai/tools/advancedBrowser.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/advancedBrowser.tool.js) | Headless Chromium ($T=N/A$) | Target URL, timeout, selector | Clean Markdown DOM, raw excerpts, HTTP telemetry | Puppeteer, Turndown, Cheerio | Scout identifies URLs |
| **Vision Self-Healer** | [`src/ai/services/visionSelfHealer.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/visionSelfHealer.service.js) | `qwen/qwen3.8-27b` ($T=0$) | HTML context, broken selector, target element description | Patched CSS selector, bounding box coordinates | Puppeteer viewport snapshot, Selector Cache | Selector failure / empty DOM |
| **Data Extractor** | [`src/ai/nodes/dataExtractor.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/dataExtractor.node.js) | `openai/gpt-oss-120b` ($T=0$, fallback: `qwen27b`) | Batched scraped text & target schema | Normalized JSON records with SHA-256 entity hashes | Zod schema parser, crypto hasher | Scraping phase completion |
| **Fuzzy Deduplicator** | [`src/ai/nodes/dataDeduplicator.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/dataDeduplicator.node.js) | Deterministic / `fastest-levenshtein` | Raw extracted JSON records | Deduplicated record array with merged attributes | Levenshtein distance calculator | Extractor phase completion |
| **Red-Team Auditor** | [`src/ai/nodes/adversarialAuditor.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/adversarialAuditor.node.js) | `qwen/qwen3.8-27b` ($T=0$) | Extracted entity rows | Verification status (`VERIFIED`/`CONTESTED`), dual citations, ECI score | Tavily counter-probe search | Deduplication completion |
| **Schema Detector** | [`src/ai/nodes/schemaDetector.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/schemaDetector.node.js) | Algorithmic Type Inference | Verified dataset records | Inferred schema definitions with data types | Zod type assertors | Auditor completion |
| **Dataset Chat Agent** | [`src/ai/nodes/datasetChat.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/datasetChat.node.js) | `openai/gpt-oss-120b` ($T=0.1$) | User analytical question & dataset records | Natural language response with tabular citations | In-memory record filter, Math.js | User queries dataset chat |
| **Report Generator** | [`src/ai/nodes/reportGenerator.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/reportGenerator.node.js) | `openai/gpt-oss-120b` ($T=0.2$) | Full dataset records & prompt context | Comprehensive markdown research dossier | Dossier template synthesizer | User requests report |

---

## 10. Agent Execution Flow

Execution follows a sequential and conditional topology with automated sub-loops:

```mermaid
flowchart TD
    Start([User Prompt]) --> N_Intent[Intent Analyzer]
    N_Intent --> N_Arch[Meta-Architect]
    N_Arch --> N_Scout[Tavily Multi-Scout]
    N_Scout --> N_Crawl[Headless Crawler]

    N_Crawl --> Check_Scrape{Selector Valid?}
    Check_Scrape -- No --> S_Healer[Vision Self-Healer Service]
    S_Healer -->|Synthesize & Cache Selector| N_Crawl
    Check_Scrape -- Yes --> N_Extract[Data Extractor Node]

    N_Extract --> N_Dedupe[Fuzzy Deduplicator Node]
    N_Dedupe --> N_Audit[Adversarial Red-Team Auditor]
    
    N_Audit --> Check_Dispute{Claims Contested?}
    Check_Dispute -- Yes --> Mark_Dispute[Annotate 'CONTESTED' & Attach Counter Citations]
    Check_Dispute -- No --> Mark_Verified[Annotate 'VERIFIED' with ECI Score]
    
    Mark_Dispute --> N_Schema[Schema Detector Node]
    Mark_Verified --> N_Schema
    
    N_Schema --> HITL_Gate{User Confirmed Schema?}
    HITL_Gate -- Waiting --> Pause([Await POST /confirm-schema])
    HITL_Gate -- Approved --> Persist[(MongoDB Storage)]
    Persist --> End([Dataset Ready for Chat / Diff / Export])
```

---

## 11. AI/LLM Model Architecture

Cerkit AI uses a multi-tier model gateway combining high-parameter reasoning models for extraction and synthesis with specialized models for classification, auditing, and self-healing.

### Dynamic Round-Robin Key Rotation
To prevent HTTP 429 rate-limiting stalls during high-concurrency swarm runs, the backend implements a monkey-patch on LangChain's `ChatGroq.prototype._generate` and `ChatGroq.prototype._streamResponseChunks` in [`src/config/groqRotation.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/config/groqRotation.js). The rotation engine detects all `GROQ_API_KEY*` variables from the environment and automatically cycles keys across requests.

```mermaid
graph TD
    subgraph Key_Rotation_Pool ["Groq Round-Robin Rotation Gateway"]
        K1["GROQ_API_KEY (Index 0)"]
        K2["GROQ_API_KEY_2 (Index 1)"]
        K3["GROQ_API_KEY_3 (Index 2)"]
    end

    ModelCall["LangChain ChatGroq Invocation"] --> Interceptor["Monkey-Patched _generate Hook"]
    Interceptor --> Selector{"Active Key Index"}
    Selector --> K1
    Selector --> K2
    Selector --> K3
    K1 & K2 & K3 --> GroqAPI["Groq Cloud LPU Inference API"]
```

---

## 12. AI Model Matrix

| Component / Node | Model Provider | Exact Model Name | Temperature | Max Tokens | Output Format | Fallback Behavior | Environment Variable |
|---|---|---|---|---|---|---|---|
| **Data Extractor Node** | Groq Cloud | `openai/gpt-oss-120b` | $0.0$ | 8,000 | Structured JSON | Automatic fallback to `qwen/qwen3.8-27b` | `GROQ_API_KEY` / `GROQ_API_KEYS` pool |
| **Meta-Architect Node** | Groq Cloud | `openai/gpt-oss-120b` | $0.0$ | 8,000 | Structured DAG JSON | Retries with relaxed validation schema | `GROQ_API_KEY` pool |
| **Adversarial Auditor** | Groq Cloud | `qwen/qwen3.8-27b` | $0.0$ | 4,096 | Structured Audit JSON | Skips non-critical secondary counter-probes | `GROQ_API_KEY` pool |
| **Vision Self-Healer** | Groq Cloud | `qwen/qwen3.8-27b` | $0.0$ | 4,096 | CSS Selector JSON | Falls back to generic text heuristic extraction | `GROQ_API_KEY` pool |
| **Intent Analyzer Node** | Groq Cloud | `qwen/qwen3.8-27b` | $0.0$ | 4,096 | Classification JSON | Defaults to generic `DATA_EXTRACTION` intent | `GROQ_API_KEY` pool |
| **Dataset Chat Node** | Groq Cloud | `openai/gpt-oss-120b` | $0.1$ | 8,000 | Markdown + Citations | Retries with trimmed context window | `GROQ_API_KEY` pool |
| **Report Generator Node** | Groq Cloud | `openai/gpt-oss-120b` | $0.2$ | 8,000 | Markdown Dossier | Truncates record sample size | `GROQ_API_KEY` pool |
| **Safeguard Classifier** | Groq Cloud | `openai/gpt-oss-safeguard-20b` | $0.0$ | N/A | Moderation labels | Defaults to permissive check | `GROQ_API_KEY` pool |
| **Prompt Guard 22M** | Groq Cloud | `meta-llama/llama-prompt-guard-2-22m` | $0.0$ | N/A | Safety classification | Bypasses non-blocking check | `GROQ_API_KEY` pool |
| **Multimodal Backup** | Google GenAI | `gemini-2.5-flash` | $0.0$ | Default | Multimodal Vision | Falls back to DOM text parsers | `GOOGLE_API_KEY` |

---

## 13. Tools & Function Calling

Tools in Cerkit AI are encapsulated as validated LangChain DynamicStructuredTools governed by Zod parameter schemas. Every tool validates its inputs prior to execution, isolates side effects, and returns standardized JSON strings for agent consumption.

```mermaid
graph LR
    Agent["Calling Agent"] -->|JSON Arguments| Zod["Zod Input Validator"]
    Zod -->|Validated Schema| Exec["Tool Implementation"]
    Exec -->|Network / Process Call| Target["External Service / Sandbox"]
    Target -->|Raw Response| Handler["Response Sanitizer & Truncator"]
    Handler -->|Standardized String| Agent
```

---

## 14. Tool Registry

| Tool Identifier | Architectural File | Purpose | Input Schema | Output Format | External Service | Side Effects |
|---|---|---|---|---|---|---|
| `self_healing_scraper_tool` | [`selfHealingScraper.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/selfHealingScraper.tool.js) | Scrapes target URL with automatic visual selector self-healing | `url` (string), `targetDescription` (string), `failedSelector` (string, optional) | Clean Markdown string & DOM excerpts | Target Web Server, Puppeteer | Spawns headless Chromium |
| `web_search_tool` | [`webSearch.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/webSearch.tool.js) | Deep web discovery across authority domains | `query` (string), `maxResults` (number, default: 5) | Array of URL strings and page snippets | Tavily Search API | External HTTP request |
| `advanced_browser_tool` | [`advancedBrowser.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/advancedBrowser.tool.js) | Headless browser for JavaScript-heavy SPA rendering | `url` (string), `waitForSelector` (string), `timeout` (number) | Rendered page HTML converted to Markdown | Puppeteer | Spawns headless Chromium |
| `database_analytics_tool` | [`databaseAnalytics.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/databaseAnalytics.tool.js) | Computes aggregations, medians, and column metrics | `datasetId` (string), `aggregationType` (enum), `column` (string) | JSON string of statistical metrics | MongoDB Atlas | Read-only aggregation query |
| `calculator_tool` | [`calculator.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/calculator.tool.js) | Evaluates complex arithmetic expressions | `expression` (string) | Numeric result or error string | Math.js in-process engine | Pure computational function |
| `js_execution_tool` | [`jsExecution.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/jsExecution.tool.js) | Runs sandboxed JavaScript logic | `code` (string), `timeoutMs` (number, default: 2000) | Execution stdout string or error | Node.js VM context | In-memory sandboxed execution |
| `github_tool` | [`github.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/github.tool.js) | Retrieves repository metadata, stars, and languages | `repo` (string: "owner/repo") | Repository statistics JSON | GitHub REST API | External HTTP request |
| `hacker_news_tool` | [`hackerNews.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/hackerNews.tool.js) | Searches Hacker News discussions and sentiment | `query` (string), `limit` (number) | Story titles, comments, and URLs | Algolia HN Search API | External HTTP request |
| `chart_generator_tool` | [`chartGenerator.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/chartGenerator.tool.js) | Builds structured chart specifications | `type` (enum), `title` (string), `labels` (array), `datasets` (array) | Chart configuration JSON | None | Pure formatting utility |
| `document_generator_tool` | [`documentGenerator.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/documentGenerator.tool.js) | Synthesizes formatted documents | `title` (string), `sections` (array of objects) | Formatted Markdown / HTML string | None | In-memory text synthesis |
| `email_dispatcher_tool` | [`emailDispatcher.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/emailDispatcher.tool.js) | Dispatches outbound operational emails | `to` (string), `subject` (string), `body` (string) | Delivery status JSON | Nodemailer / SMTP | Outbound SMTP connection |
| `image_generator_tool` | [`imageGenerator.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/imageGenerator.tool.js) | Generates synthetic imagery descriptors | `prompt` (string), `dimensions` (string) | Image generation payload / URL | External Image API | Network call |
| `weather_tool` | [`weather.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/weather.tool.js) | Fetches meteorological conditions | `location` (string) | Weather statistics JSON | Open-Meteo API | External HTTP request |
| `wikipedia_tool` | [`wikipedia.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/wikipedia.tool.js) | Searches encyclopedic entries | `query` (string) | Page summary and citation URL | Wikipedia REST API | External HTTP request |
| `current_time_tool` | [`currentTime.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/currentTime.tool.js) | Provides ISO 8601 temporal context | `timezone` (string, default: "UTC") | ISO timestamp string | Internal clock | Pure query |
| `web_scraper_tool` | [`webScraper.tool.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/tools/webScraper.tool.js) | Lightweight Cheerio static HTML parser | `url` (string) | Extracted text and link array | Axios / Cheerio | External HTTP request |

---

## 15. Memory & State Management

Cerkit AI uses a multi-tier state architecture:
1. **LangGraph State Graph (`globalState.js`)**: An immutable, channel-based state tracking the current prompt, DAG topology, agent execution traces, raw extraction batches, and error tallies.
2. **Ephemeral Task Orchestration State (`task.controller.js`)**: An in-memory map tracking active SSE response sockets, step progression, and cancellation flags.
3. **Database State (`Dataset` & `Task` Models)**: Persistent MongoDB records holding final records, schema contracts, statistical distributions, source attribution metadata, and audit logs.
4. **Selector Memory Cache (`visionSelfHealer.service.js`)**: An in-memory cache indexing healed CSS selectors by domain and element type, eliminating redundant vision model inference across recurring scrapes.

---

## 16. Time-Travel / Snapshot / Diff Architecture (Git for Web Data)

The Time-Travel engine ([`datasetDiff.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/datasetDiff.service.js)) treats web intelligence as an evolving versioned graph.

```mermaid
graph TD
    subgraph Baseline_Run ["Baseline Dataset (v1)"]
        R1["Company: Alpha AI | Funding: $10M"]
        R2["Company: Beta Corp | Funding: $5M"]
    end

    subgraph Current_Run ["New Swarm Run (v2)"]
        R1_Prime["Company: Alpha AI | Funding: $25M"]
        R3["Company: Gamma Tech | Funding: $2M"]
    end

    R1 & R2 & R1_Prime & R3 --> Engine["DatasetDiff Service"]
    Engine --> EntityMatch{"Fuzzy Entity Matcher (Levenshtein <= 2)"}

    EntityMatch -->|"Alpha AI == Alpha AI"| FieldComp{"Field-by-Field Comparator"}
    FieldComp -->|"Funding changed $10M -> $25M"| Mutated["🟡 Mutated Entity (Funding Round Increased)"]
    
    EntityMatch -->|"Beta Corp not in v2"| Removed["🔴 Removed Entity (Delisted / Defunct)"]
    EntityMatch -->|"Gamma Tech not in v1"| Added["🟢 Added Entity (Newly Discovered)"]
```

### Mathematical & Algorithmic Comparison
1. **Entity Identification**: Primary keys are derived from entity names (e.g., `company` or `name`). If an exact match is missing, the engine runs Levenshtein distance matching across normalized keys with an edit-distance threshold of $\le 2$.
2. **Currency & Numeric Normalization**: Values such as `"$10M"`, `"$10,000,000"`, and `"10M USD"` are normalized to floating-point numbers (`10000000`) before evaluating equality, preventing false-positive mutations.
3. **Diff Categorization**:
   - **`Added`**: Entity key present in current dataset but absent in baseline.
   - **`Removed`**: Entity key present in baseline but missing from current crawl.
   - **`Mutated`**: Entity key matches, but one or more attributes differ (records store `oldValue`, `newValue`, and `field`).
   - **`Unchanged`**: Entity and all normalized fields are identical.
4. **Summary Metrics**: Calculates overall volatility score:
   $$\text{Volatility} = \frac{\text{Added} + \text{Removed} + \text{Mutated}}{\text{Total Unique Entities}}$$

---

## 17. Autonomous / Scheduled Execution (Swarm Cron)

The platform includes a native autonomous scheduling worker ([`swarmCronScheduler.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/swarmCronScheduler.service.js)) initialized on server boot.

```mermaid
stateDiagram-v2
    [*] --> Idle: Worker Boot
    Idle --> Scanning: Interval Tick (Every 60s)
    Scanning --> Evaluating: Find Datasets where schedule.enabled == true AND nextRunAt <= now
    Evaluating --> Executing: Target Dataset Located
    Evaluating --> Idle: No Due Datasets
    
    Executing --> ReScraping: Trigger Background Swarm Extraction
    ReScraping --> Diffing: Run DatasetDiff(v_current, v_previous)
    Diffing --> Persisting: Commit New Version (v_current + 1)
    Persisting --> WebhookDispatch: POST Diff Digest to Configured Webhook
    WebhookDispatch --> Reschedule: Calculate schedule.nextRunAt from frequency
    Reschedule --> Idle
```

### Scheduled Execution Specifications
- **Scheduler**: In-memory interval daemon (`setInterval`, polling every 60 seconds).
- **Supported Frequencies**: `daily` (+$86,400,000$ ms), `weekly` (+$604,800,000$ ms), `monthly` (+$2,592,000,000$ ms).
- **Concurrency & Idempotency**: Marks tasks in-flight; updates `schedule.lastRunAt` immediately to prevent duplicate execution during long crawls.
- **Webhook Alerting**: Dispatches outbound HTTP POST to `schedule.webhookUrl` containing an executive summary of added, removed, and mutated records.

---

## 18. Frontend Architecture

The frontend is a single-page application built with **React 19**, **Vite 8.3.0**, and styled with custom cybernetic UI tokens.

### Routing & Navigation
- `/mission-control`: Real-time prompt input studio, live swarm telemetry DAG, and progress tracker.
- `/market-overview`: High-level intelligence overview, dataset statistics, and aggregate metrics.
- `/datasets`: Dataset inventory, search filters, and version management.
- `/datasets/:id`: Deep-dive data view with interactive grid, column filters, and source drawer.
- `/history`: Historical execution log registry and performance telemetry.
- `/governance`: System audit trail, API key health monitors, and rate-limit governance.

### Core Component Interaction Flow
```
User Action (Prompt Input)
  ├──► PromptStudio.jsx (Validates prompt, submits to API)
  ├──► LiveSwarmTracker.jsx (Connects to SSE, renders real-time DAG steps)
  ├──► SchemaReviewModal.jsx (Presents inferred types for HITL approval)
  ├──► DataTable.jsx (Renders 2-tier header, actions, and verified badges)
  │     ├──► SourceInspectorDrawer.jsx (Opens cyber-forensics metadata)
  │     ├──► TimeTravelDiffModal.jsx (Presents visual Git diff of runs)
  │     └──► ResearchReportModal.jsx (Renders synthesized Markdown dossier)
  └──► AIChatPanel.jsx (Interactive conversational queries over dataset)
```

---

## 19. Backend Architecture

The backend is built on **Express 5.2.1** running as an ES module application (`"type": "module"`).

```
src/
├── server.js               # Entry point: DB connect, cron init, HTTP listener
├── app.js                  # Express middleware: CORS, cookies, json, routes
├── config/
│   ├── env.js              # Environment variable parser
│   └── groqRotation.js     # Round-robin Groq API key rotation interceptor
├── middleware/
│   ├── auth.js             # Strict JWT authentication middleware
│   ├── optionalAuth.js     # Permissive guest/user authentication
│   └── validate.js         # Zod request contract validator
├── modules/
│   ├── auth/               # User registration, login, OTP verification
│   ├── dataset/            # Dataset CRUD, diffing, chat, report, and export
│   └── task/               # Task orchestration, SSE streaming, cancellation
├── ai/
│   ├── models/             # LLM provider configurations & model registry
│   ├── nodes/              # Pipeline nodes (Extractor, Auditor, Deduplicator)
│   ├── services/           # Self-Healer, Diff Engine, Swarm Cron
│   └── tools/              # 16 DynamicStructuredTools with Zod schemas
└── utils/
    ├── db.js               # Mongoose connection pool
    └── logger.js           # Winston structured logging
```

---

## 20. API Reference

| Method | Endpoint | Auth | Purpose | Request Body / Query | Success Response | Status Codes |
|---|---|---|---|---|---|---|
| `POST` | `/api/tasks/create` | Optional | Initiates autonomous swarm extraction pipeline via SSE | `{ prompt, maxRecords, strictDeduplication }` | `text/event-stream` chunk stream | 200, 400, 500 |
| `POST` | `/api/tasks/:taskId/confirm-schema` | Optional | HITL confirmation of inferred schema to commit dataset | `{ fields: [{ name, type, selected }] }` | `{ success: true, datasetId }` | 200, 404, 500 |
| `POST` | `/api/tasks/:taskId/cancel` | Optional | Aborts an in-flight swarm extraction task | None | `{ success: true, message: "Task cancelled" }` | 200, 404 |
| `GET` | `/api/tasks` | Optional | Lists recent swarm execution tasks | `?limit=20` | `{ success: true, data: { tasks } }` | 200, 500 |
| `GET` | `/api/tasks/:id` | Optional | Fetches detailed execution logs and status of a task | URL parameter `:id` | `{ success: true, data: { task } }` | 200, 404 |
| `GET` | `/api/datasets` | Optional | Lists all persisted datasets with stats and version info | `?search=&limit=20` | `{ success: true, data: { datasets } }` | 200, 500 |
| `GET` | `/api/datasets/:id` | Optional | Fetches dataset metadata, lineage, and schema | URL parameter `:id` | `{ success: true, data: { dataset } }` | 200, 404 |
| `GET` | `/api/datasets/:id/records` | Optional | Paginated records with column search and sorting | `?page=1&limit=20&search=&sortField=&sortOrder=` | `{ success: true, data: { records, total, pages } }` | 200, 404 |
| `GET` | `/api/datasets/:id/export` | Optional | Exports dataset to file | `?format=csv\|json` | Binary stream (file download) | 200, 400, 404 |
| `GET` | `/api/datasets/:id/diff` | Optional | Generates time-travel diff against parent or comparison run | `?compareWith=<optional_other_dataset_id>` | `{ success: true, data: { diff, summary } }` | 200, 404 |
| `GET` | `/api/datasets/:id/versions`| Optional | Lists all version ancestors of a dataset | URL parameter `:id` | `{ success: true, data: [ { id, version, createdAt } ] }`| 200, 404 |
| `POST` | `/api/datasets/:id/chat` | Optional | Natural-language query execution over dataset records | `{ message, conversationHistory }` | `{ success: true, data: { response, citations } }` | 200, 400 |
| `POST` | `/api/datasets/:id/report` | Optional | Generates synthesized markdown executive dossier | `{ customFocus }` | `{ success: true, data: { reportMarkdown } }` | 200, 500 |
| `POST` | `/api/datasets/:id/schedule`| Optional| Configures autonomous Swarm Cron recurring run | `{ enabled, frequency, webhookUrl }` | `{ success: true, data: { schedule } }` | 200, 400 |
| `POST` | `/api/auth/register` | Public | Registers a new user account | `{ name, email, password }` | `{ success: true, data: { user, accessToken } }` | 201, 400 |
| `POST` | `/api/auth/login` | Public | Authenticates user and sets HTTP-only refresh cookie | `{ email, password }` | `{ success: true, data: { user, accessToken } }` | 200, 401 |
| `POST` | `/api/auth/refresh` | Public | Rotates access token via HTTP-only cookie | Cookie: `refreshToken` | `{ success: true, data: { accessToken } }` | 200, 401 |
| `POST` | `/api/auth/logout` | Strict | Revokes refresh token and clears session | Header: `Bearer <token>` | `{ success: true, message: "Logged out" }` | 200 |
| `GET` | `/api/auth/me` | Strict | Retrieves authenticated user profile | Header: `Bearer <token>` | `{ success: true, data: { user } }` | 200, 401 |

---

## 21. Database Architecture

The persistence tier runs on **MongoDB Atlas** using **Mongoose 9.7.1**.

```mermaid
erDiagram
    USER ||--o{ DATASET : "owns"
    USER ||--o{ TASK : "initiates"
    DATASET ||--o{ DATASET : "parents (versioning)"
    TASK ||--o| DATASET : "generates"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        date createdAt
    }

    TASK {
        ObjectId _id PK
        string taskId UK
        string prompt
        string status "QUEUED|RUNNING|AWAITING_CONFIRMATION|COMPLETED|FAILED"
        number progress
        array logs
        ObjectId userId FK
        ObjectId datasetId FK
        date createdAt
    }

    DATASET {
        ObjectId _id PK
        string title
        string prompt
        number version
        ObjectId parentDatasetId FK
        array schemaDefinition
        array records "Mixed JSON Rows"
        object stats
        array sources
        object schedule
        object diffSummary
        date createdAt
    }
```

### Key Collections & Indexing Strategies
- **`datasets` Collection**:
  - `title`, `prompt`: Indexed via Compound Text Index `{ title: "text", prompt: "text" }` for search.
  - `parentDatasetId`, `version`: Indexed for version lineage retrieval.
  - `records`: Stored as flexible schema-free MongoDB `Mixed` array, allowing arbitrary column structures per dataset.
  - `schedule.nextRunAt`: Sparse index for fast cron worker polling.
- **`tasks` Collection**:
  - `taskId`: Unique secondary index for fast SSE status lookup.
  - `status`, `createdAt`: Compound index for monitoring and cleanup.

---

## 22. Data Flow

```mermaid
graph TD
    classDef raw fill:#374151,stroke:#9ca3af,color:#fff;
    classDef clean fill:#1e3a8a,stroke:#3b82f6,color:#fff;
    classDef verified fill:#064e3b,stroke:#10b981,color:#fff;

    WebData["Unstructured Web Pages & PDFs"]:::raw --> Crawler["Puppeteer Headless Cluster"]
    Crawler --> DOM["Raw HTML / Markdown Excerpts"]:::raw
    DOM --> Extractor["gpt-oss-120b Extraction Node"]
    Extractor --> Structured["Raw JSON Rows + SHA-256 Hashes"]:::clean
    Structured --> Deduplicator["Fastest-Levenshtein Deduplicator"]
    Deduplicator --> Clustered["Deduplicated Unique Records"]:::clean
    Clustered --> Auditor["Red-Team Adversarial Auditor"]
    Auditor --> Corroborated["Audited Records (VERIFIED / CONTESTED + Citations)"]:::verified
    Corroborated --> Schema["Schema Detector & Type Inference"]
    Schema --> HITL["Human-in-the-Loop Review"]
    HITL --> Persist[("MongoDB Atlas Versioned Store")]:::verified
```

---

## 23. Authentication & Authorization

- **Dual-Token Architecture**:
  - **Access Token**: Short-lived JSON Web Token (15-minute expiry) passed via `Authorization: Bearer <token>` header.
  - **Refresh Token**: Long-lived token (7-day expiry) stored in an `HTTP-only`, `SameSite=Strict`, `Secure` cookie.
- **Permissive Guest Support**: Guest users can execute extractions and query datasets without an account. When registered, user IDs are attached to datasets to enforce ownership.
- **Role-Based Access**: Role field (`user` vs `admin`) reserved in `User` model for administrative governance routes.

---

## 24. Security Architecture

### Implemented Security Controls
- **Rate Limiting**: `express-rate-limit` protecting authentication routes against brute-force attacks.
- **Credential Hashing**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10).
- **Injection Protection**: Mongoose ODM parameterized queries eliminate raw NoSQL injection vectors.
- **Script Sandboxing**: Sandboxed VM execution context (`vm` / `mathjs`) restricts code evaluation to safe arithmetic scopes.
- **CORS Governance**: Configured via environment variables (`CLIENT_URL`) to reject untrusted cross-origin requests.

### Security Status Matrix
| Check | Status | Verification Detail |
|---|---|---|
| JWT Auth | Implemented | Verified in [`src/middleware/auth.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/middleware/auth.js) |
| Cookie Security | Implemented | `httpOnly: true`, `sameSite: "strict"` |
| Rate Limiting | Implemented | Verified in [`src/app.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/app.js) |
| Secret Sanitization | Implemented | Sensitive keys excluded from logs and client responses |
| Output Encoding | Implemented | React DOM auto-encodes rendered values, preventing XSS |
| CSRF Tokens | ⚠️ Not found / Not verifiable from the current codebase | Relies on SameSite cookie policy |
| Strict Multi-Tenant Row Level Security | Partially Implemented | Optional authentication allows guest dataset discovery |

---

## 25. Error Handling & Reliability

1. **Model Fallback**: If `gpt-oss-120b` experiences a network timeout or token overflow during extraction, execution automatically routes to `qwen/qwen3.8-27b`.
2. **Groq Key Rotation**: Intercepts HTTP 429 rate-limit responses and cycles through available keys in the environment pool without failing the user task.
3. **Scraper Self-Healing**: DOM query failures trigger `visionSelfHealer.service.js`, falling back to visual semantic element discovery and CSS selector patching.
4. **SSE Heartbeat & Reconnection**: Emits periodic progress and status events to prevent proxy timeouts; the frontend maintains reconnect buffers.
5. **Graceful Pipeline Degradation**: If secondary red-team verification fails, records are committed with an `UNVERIFIED` status rather than terminating the entire workflow.

---

## 26. Configuration & Environment Variables

| Variable | Used By | Purpose | Required? | Sensitive? | Example Value |
|---|---|---|---|---|---|
| `PORT` | `server.js` | HTTP port for backend server | No (defaults to 5000) | No | `5000` |
| `NODE_ENV` | `app.js` | Application execution mode | No | No | `development` / `production` |
| `MONGO_URI` | `utils/db.js` | MongoDB connection string | **Yes** | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/cerkit` |
| `GROQ_API_KEY` | `config/env.js` | Primary Groq Cloud API key | **Yes** | **Yes** | `gsk_YOUR_PRIMARY_GROQ_KEY` |
| `GROQ_API_KEY_2` | `config/groqRotation.js` | Secondary key for rate-limit rotation pool | No | **Yes** | `gsk_YOUR_BACKUP_KEY_2` |
| `GROQ_API_KEY_3` | `config/groqRotation.js` | Tertiary key for rate-limit rotation pool | No | **Yes** | `gsk_YOUR_BACKUP_KEY_3` |
| `TAVILY_API_KEY` | `webSearch.tool.js` | Search API key for deep web discovery | **Yes** | **Yes** | `tvly-YOUR_TAVILY_KEY` |
| `GOOGLE_API_KEY` | `models/gemini.js` | Fallback multimodal vision model API key | No | **Yes** | `AIzaSyYOUR_GOOGLE_KEY` |
| `CLIENT_URL` | `app.js` | Authorized frontend origin for CORS | No | No | `http://localhost:5173` |
| `VITE_API_URL` | Frontend `api.js` | Backend base endpoint for frontend client | No | No | `http://localhost:5000/api` |

---

## 27. Dependencies

### Backend Dependencies (`Agentic_system_backend/package.json`)
- **Core Framework**: `express` (^5.2.1), `dotenv` (^17.4.2), `cors` (^2.8.6), `cookie-parser` (^1.4.7), `morgan` (^1.12.0)
- **Agentic & AI**: `@langchain/core` (^1.2.1), `@langchain/groq` (^1.3.0), `@langchain/langgraph` (^1.4.4), `@langchain/tavily` (^1.2.0), `langchain` (^1.4.5), `@langchain/google-genai`
- **Data & Scraping**: `puppeteer` (^25.10.0), `cheerio` (^1.2.0), `turndown` (^7.2.4), `fastest-levenshtein` (^1.0.16), `json2csv` (^6.0.0-alpha.2)
- **Database & Math**: `mongoose` (^9.7.1), `mongodb` (^7.3.0), `mathjs` (^15.2.0)
- **Validation & Security**: `zod` (^4.4.3), `bcryptjs` (^3.0.3), `jsonwebtoken` (^9.0.3), `express-rate-limit` (^8.5.2)
- **Logging & Utilities**: `winston` (^3.19.0), `axios` (^1.20.0), `nodemailer` (^9.1.1)

### Frontend Dependencies (`Agentic_system_frontend/package.json`)
- **Core**: `react` (^19.2.8), `react-dom` (^19.2.8), `react-router-dom` (^7.18.4)
- **Icons & Visuals**: `lucide-react` (^1.48.0), `canvas-confetti` (^1.9.4)
- **Tooling**: `vite` (^8.3.0), `@vitejs/plugin-react` (^6.1.1), `oxlint` (^1.81.0)

---

## 28. Codebase Structure

```
.
├── Agentic_system_backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── models/            # Groq, Gemini, and Prompt Guard model definitions
│   │   │   ├── nodes/             # Intent, Architect, Extractor, Auditor, Schema, Chat
│   │   │   ├── services/          # Self-Healer, Diff Engine, Swarm Cron Scheduler
│   │   │   ├── tools/             # 16 registered LangChain DynamicStructuredTools
│   │   │   ├── compiler/          # Runtime DAG compilation
│   │   │   └── runtime/           # Execution state machine
│   │   ├── config/                # Environment variables and Groq key rotation
│   │   ├── middleware/            # JWT authentication and Zod validation
│   │   ├── modules/
│   │   │   ├── auth/              # User auth controllers and routes
│   │   │   ├── dataset/           # Dataset records, diffing, report, export
│   │   │   └── task/              # Task orchestration and SSE handlers
│   │   ├── utils/                 # MongoDB connection and Winston logger
│   │   ├── app.js                 # Express server configuration
│   │   └── server.js              # Server bootstrapper
│   └── tests/                     # Test suites for tools, diff, and self-healing
│
└── Agentic_system_frontend/
    └── src/
        ├── components/            # UI Components (DataTable, SwarmTracker, Inspector)
        ├── services/              # API and SSE client
        ├── context/               # Authentication state context
        ├── App.jsx                # Layout, header, and route views
        └── index.css              # Cyberpunk dark mode styling tokens
```

---

## 29. Important Files & Responsibilities

- [`src/modules/task/task.controller.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/modules/task/task.controller.js): Main orchestration hub. Manages the SSE event stream, coordinates sub-agents, checks cancellation flags, and manages HITL pauses.
- [`src/ai/services/visionSelfHealer.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/visionSelfHealer.service.js): Self-healing engine. Catches broken DOM queries, captures page screenshots, extracts visual coordinates, and synthesizes patched CSS selectors.
- [`src/ai/nodes/adversarialAuditor.node.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/nodes/adversarialAuditor.node.js): Dialectic fact-checker. Probes external sources for counter-claims and assigns ECI credibility scores.
- [`src/ai/services/datasetDiff.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/datasetDiff.service.js): Git-style time-travel engine. Matches records across historical runs and generates attribute-level mutation diffs.
- [`src/ai/services/swarmCronScheduler.service.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/services/swarmCronScheduler.service.js): Background cron worker. Automatically executes recurring runs and sends webhook notifications.
- [`src/config/groqRotation.js`](file:///c:/Users/ghosh/Agentic_system_backend/src/config/groqRotation.js): Dynamic key rotation interceptor. Overrides LangChain Groq methods to prevent rate-limit failures.
- [`Agentic_system_frontend/src/components/DataTable.jsx`](file:///c:/Users/ghosh/Agentic_system_frontend/src/components/DataTable.jsx): Cybernetic data grid. Features sorting, searching, status badges, and action triggers (Diff, Chat, Report, Export).
- [`Agentic_system_frontend/src/components/SourceInspectorDrawer.jsx`](file:///c:/Users/ghosh/Agentic_system_frontend/src/components/SourceInspectorDrawer.jsx): Forensic audit drawer. Displays crawl headers, raw excerpts, and verification citations.

---

## 30. End-to-End Execution Walkthrough

**Scenario**: Extracting YC W24 AI Startups

1. **User Action**: The operator opens `/mission-control` and enters: `"Extract top 20 AI startups from Y Combinator W24 with funding, founders, and tech stack"`.
2. **API Handshake**: The frontend issues a `POST` request to `/api/tasks/create` and establishes a persistent SSE stream.
3. **Intent Deconstruction**: The `IntentAnalyzer` decomposes the query into fields: `company`, `founder`, `funding`, `stage`, and `techStack`.
4. **Authority Discovery**: The `TavilyScout` identifies authority URLs (e.g., `ycombinator.com/companies`, TechCrunch).
5. **Headless Extraction**: Puppeteer crawls target domains. If dynamic class changes break the target container selector, `visionSelfHealer` repairs the selector and continues execution.
6. **Data Normalization**: `gpt-oss-120b` extracts raw tabular rows and generates cryptographic SHA-256 entity hashes.
7. **Deduplication**: `dataDeduplicator` matches company names using Levenshtein distance, merging duplicate entries.
8. **Dialectic Audit**: The `RedTeamAuditor` verifies funding claims against SEC/Crunchbase search results. Confirmed claims receive a `🟢 VERIFIED` badge; discrepancies receive a `🟡 CONTESTED` badge with dual citations.
9. **HITL Review**: The pipeline emits a `schema_review` SSE event. The frontend displays the Schema Review Modal showing inferred data types.
10. **Persistence**: The user confirms the schema, triggering `/confirm-schema`. The dataset is persisted to MongoDB.
11. **Time-Travel Diffing**: If a previous run exists, the frontend opens `TimeTravelDiffModal`, highlighting funding changes and new companies.

---

## 31. AI Prompt Architecture

Prompts in Cerkit AI enforce strict output schemas, operational constraints, and guardrails:

```
┌────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT HIERARCHY                                │
├────────────────────────────────────────────────────────┤
│ 1. Role Definition & Operational Bounds                │
│    - Identity, mandate, and anti-hallucination policy  │
├────────────────────────────────────────────────────────┤
│ 2. Tool Usage Instructions & Sandboxing                │
│    - Strict input parameter schemas                    │
├────────────────────────────────────────────────────────┤
│ 3. Few-Shot Demonstration Examples                     │
│    - Expected JSON formats                             │
├────────────────────────────────────────────────────────┤
│ 4. Deterministic Guardrails                            │
│    - "Never invent data; use null for unverified data" │
└────────────────────────────────────────────────────────┘
```

Prompts are isolated in [`src/ai/prompts/`](file:///c:/Users/ghosh/Agentic_system_backend/src/ai/prompts/), separating behavioral instructions from runtime code.

---

## 32. Testing

| Test Suite | File Location | Scope & Verification Target | Status |
|---|---|---|---|
| **Tools Validation** | [`tests/test-tools.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/test-tools.js) | Validates all 16 registered tools and parameter schemas | Verified Passing |
| **Self-Healing Scraper** | [`tests/test-self-healing.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/test-self-healing.js) | Simulates DOM selector breakage and verifies selector repair | Verified Passing |
| **Red-Team Auditor** | [`tests/test-auditor.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/test-auditor.js) | Injects conflicting claims and asserts `CONTESTED` flagging | Verified Passing |
| **Diff Engine** | [`tests/test-diff-engine.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/test-diff-engine.js) | Tests Levenshtein matching and currency normalization | Verified Passing |
| **Blueprint Validator** | [`tests/blueprintValidatorTest.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/blueprintValidatorTest.js) | Validates DAG blueprints against dependency cycles | Verified Passing |
| **Runtime Execution** | [`tests/runtimeTest.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/runtimeTest.js) | End-to-end multi-agent execution pipeline simulation | Verified Passing |
| **Key Rotation** | [`tests/testKey1.js`](file:///c:/Users/ghosh/Agentic_system_backend/tests/testKey1.js), `testKey2.js` | Validates round-robin Groq key rotation under high concurrency | Verified Passing |

---

## 33. Deployment Architecture

```mermaid
graph TD
    subgraph Client_Hosting ["Frontend Delivery (Vercel / Netlify / S3)"]
        SPA["Vite Static Build (/dist)"]
    end

    subgraph Compute_Hosting ["Backend Compute (Railway / Render / AWS EC2)"]
        NodeServer["Node.js Express 5 Runtime (Port 5000)"]
        ChromiumEngine["Headless Puppeteer Browser Cluster"]
    end

    subgraph Persistence_Cluster ["Database Persistence (MongoDB Atlas)"]
        MongoCluster[("MongoDB Replica Set")]
    end

    subgraph External_APIs ["Third-Party AI & Search Infrastructure"]
        GroqCloud["Groq Cloud LPU (Llama / Qwen / GPT-OSS)"]
        TavilyEngine["Tavily Search API"]
    end

    SPA -->|HTTPS / REST / SSE| NodeServer
    NodeServer --> ChromiumEngine
    NodeServer -->|Mongoose Wire Protocol| MongoCluster
    NodeServer -->|HTTPS / Key Rotation| GroqCloud
    NodeServer -->|HTTPS| TavilyEngine
```

---

## 34. Performance Optimizations

1. **Groq LPU Inference**: Near-instant inference speeds (500+ tokens/sec) minimize pipeline latency.
2. **In-Memory Selector Caching**: `visionSelfHealer` caches repaired selectors, eliminating redundant vision model inference on recurring runs.
3. **Compound Database Indexes**: Text and sparse indexes on MongoDB collections ensure sub-millisecond query performance.
4. **Server-Side Pagination & Projection**: `/api/datasets/:id/records` loads records in chunks of 20, keeping frontend memory usage lightweight.
5. **Streaming Telemetry**: SSE eliminates polling overhead, streaming live logs and DAG states to the frontend as they occur.

---

## 35. AI Usage & Cost Considerations

- **Inference Optimization**: High-parameter models (`gpt-oss-120b`) are used only for complex extraction and synthesis; lightweight models (`qwen3.8-27b`) handle intent parsing, auditing, and self-healing.
- **Deduplication Before Auditing**: In-memory Levenshtein deduplication removes duplicate records prior to red-team auditing, cutting counter-intelligence search calls by up to 40%.
- **Token Efficiency**: Scraped HTML is converted to clean Markdown before LLM ingestion, removing script tags, CSS styles, and unnecessary DOM boilerplate.

---

## 36. Hackathon Technical Value

### Problem
Extracting unstructured web data at scale is notoriously fragile. Scrapers break constantly due to website redesigns, LLMs hallucinate inaccurate values, and static exports fail to track data changes over time.

### Solution
Cerkit AI is an autonomous, self-healing data engineering platform. It pairs dynamic multi-agent DAG planning with vision-guided self-healing scrapers, dialectic red-team fact-checking, and Git-style temporal dataset diffing.

### Why Agentic?
A single LLM prompt cannot browse the web, handle dynamic JavaScript rendering, self-heal broken selectors, cross-examine facts against external sources, or reconcile data mutations over time. Cerkit AI requires an autonomous multi-agent swarm to divide responsibilities across specialized, self-governing nodes.

### Technical Differentiators
1. **Vision-Guided Self-Healing**: Resilient scrapers that diagnose broken DOM selectors and visually re-synthesize them in real time.
2. **Adversarial Red-Team Auditor**: A dialectic fact-checker that actively searches for counter-evidence before verifying claims.
3. **Git for Web Data**: Native entity-level time-travel diffing with Levenshtein matching and currency normalization.
4. **Dynamic Key Rotation**: In-process round-robin API key rotation to bypass rate limits during heavy workloads.

---

## 37. Architecture Strengths

- **High Resilience**: Automatic recovery from scraper breakage and rate-limiting stalls.
- **Verifiable Provenance**: Full audit trail linking extracted records to source URLs, crawl headers, and counter-citations.
- **Extensible Tool Registry**: Clean, Zod-validated tool architecture supporting easy tool registration.
- **Human-In-The-Loop Governance**: Schema contract review step gives operators full control over data types before persistence.

---

## 38. Current Limitations

- **Browser Compute Footprint**: Headless Puppeteer instances consume substantial RAM under high concurrent task volumes.
- **In-Memory Scheduling**: The cron worker runs within the Express process; deploying multiple horizontal instances requires an external queue (e.g., Redis/BullMQ) to avoid duplicate runs.
- **Single-Host Rate Limiter**: The API rate limiter uses in-memory storage, which does not share state across horizontally scaled replicas.

---

## 39. Future Roadmap

### Short-Term (1–3 Months)
- Implement Redis/BullMQ distributed task queue for scalable background job processing.
- Add OAuth2 social authentication (GitHub, Google).
- Introduce 1-Click Instant Synthetic REST/GraphQL API generation for persisted datasets.

### Medium-Term (3–6 Months)
- Multi-region proxy rotation pool to bypass aggressive anti-bot protection.
- Column-level cascade deep-enrichment agent swarm to fill missing data fields automatically.
- Integration of vector search engines (Pinecone / Qdrant) for hybrid semantic dataset querying.

### Long-Term (6–12 Months)
- Multimodal voice-activated command interface for hands-free swarm dispatch.
- Decentralized, peer-to-peer crawler worker nodes with cryptographic data validation.

---

## 40. Developer Setup

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance (Local or MongoDB Atlas)
- Groq Cloud API Key(s)
- Tavily Search API Key

### Backend Setup
```bash
cd Agentic_system_backend
cp .env.example .env
# Configure MONGO_URI, GROQ_API_KEY, TAVILY_API_KEY in .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd Agentic_system_frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## 41. Running the Project

1. **Verify Backend**: Ensure the backend starts and connects to MongoDB:
   ```
   [INFO] Connected to MongoDB
   [INFO] Swarm Cron Scheduler initialized. Polling interval: 60s
   [INFO] Server running on port 5000
   ```
2. **Verify Frontend**: Open `http://localhost:5173` in your browser.
3. **Run Test Extraction**:
   - Navigate to `/mission-control`.
   - Submit a test query: `"Extract top 10 AI startups with founders and funding"`.
   - Observe live DAG execution, audit verification, and schema review.

---

## 42. Troubleshooting

| Issue | Root Cause | Solution |
|---|---|---|
| `MongoServerError: bad auth` | Invalid credentials in `MONGO_URI` | Verify database username, password, and IP whitelist in MongoDB Atlas. |
| `HTTP 429 Too Many Requests (Groq)` | API rate limit reached | Add additional Groq keys (`GROQ_API_KEY_2`, etc.) in `.env` for automatic rotation. |
| `Puppeteer launch failure` | Missing Chromium system dependencies on Linux | Run `npx puppeteer browsers install chrome` or install missing Linux libraries. |
| `SSE Connection Closes Prematurely` | Proxy/Nginx timeout | Configure proxy read timeout to at least 300 seconds for streaming endpoints. |

---

## 43. Glossary

- **Agent**: An autonomous software entity with a dedicated prompt, model, and tool bindings executing a specific stage of the DAG.
- **DAG (Directed Acyclic Graph)**: A finite directed graph with no cycles, representing the dependency and execution order of sub-agents.
- **Adversarial Auditor**: A counter-intelligence agent designed to verify claims against external sources and flag contradictions.
- **Vision Self-Healing**: Automated recovery of broken CSS selectors using visual layout snapshots and semantic element localization.
- **Time-Travel Diff**: A Git-style delta comparison between dataset runs tracking added, removed, and mutated records.
- **Swarm Cron**: An autonomous background scheduler that periodically executes extraction swarms and emits webhook digests.
- **HITL (Human-In-The-Loop)**: A governance checkpoint where an operator inspects and confirms inferred schemas before data persistence.
- **ECI (Entity Corroboration Index)**: A confidence score ($0.0 - 1.0$) indicating the degree to which an entity claim is verified across multiple sources.

---

## 44. Final Architecture Summary

Cerkit AI brings software engineering rigor to web data acquisition. By combining dynamic multi-agent DAG planning, dialectic red-team fact-checking, vision-guided self-healing scrapers, and Git-style temporal versioning, the platform transforms brittle web scraping into an autonomous, reliable, and verifiable data intelligence engine.

---

# Architecture At A Glance

- **Frontend**: React 19, Vite 8.3.0, React Router DOM 7, Lucide Icons, Canvas Confetti, Cyberpunk Dark CSS Tokens.
- **Backend**: Node.js (ESM), Express 5.2.1, Winston Logger, Morgan, Zod 4.4.3, Fastest-Levenshtein.
- **Agents**: Intent Analyzer, Meta-Architect, Tavily Multi-Scout, Browser Scraper, Vision Self-Healer, Data Extractor, Fuzzy Deduplicator, Adversarial Red-Team Auditor, Schema Detector, Dataset Chat, Report Generator.
- **Models**: `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`, `gemini-2.5-flash`, `llama-prompt-guard-2-22m`.
- **Tools**: 16 LangChain DynamicStructuredTools including Puppeteer, Tavily, Math.js, Sandboxed JS VM, and GitHub API.
- **Database**: MongoDB Atlas via Mongoose 9.7.1 (Compound text indexes, versioned datasets, sparse cron indexes).
- **External APIs**: Groq Cloud LPU, Tavily Search API, Google Generative AI, Wikipedia REST API.
- **Authentication**: Dual-token JWT (15-min access token + 7-day HTTP-only refresh cookie) with permissive guest support.
- **Automation**: In-memory Swarm Cron Scheduler polling every 60 seconds with outbound webhook dispatching.
- **Deployment**: Static SPA frontend (Vercel/Netlify) + Containerized Node.js backend (Railway/Render/AWS) + MongoDB Atlas.

---

# One-Minute Technical Explanation (Judge Pitch Script)

> *"Judges, web scrapers and ETL pipelines are broken for three reasons: they break whenever a website updates its CSS, they blindly accept hallucinated or inaccurate data, and they are static snapshots that provide zero insight into how data changes over time.*
>
> *We built **Cerkit AI** to solve this. Instead of a brittle scraper or a basic LLM wrapper, Cerkit AI is an autonomous, self-healing data engineering platform.*
>
> *When you submit a natural language request, our **Meta-Architect** compiles a multi-agent Directed Acyclic Graph. If target website changes break our selectors, our **Vision Self-Healer** visually re-locates the elements and patches the code in real time.*
>
> *To eliminate hallucinations, we built an **Adversarial Courtroom**: our Advocate Agent proposes data rows, while our Red-Team Skeptic independently verifies them against primary sources, flagging discrepancies with dual citations.*
>
> *Finally, our **Time-Travel Diff Engine** acts like Git for web data, tracking mutations across recurring scheduled runs and sending webhook alerts whenever competitors lower prices or startups raise new rounds.*
>
> *Under the hood, it's powered by Groq LPUs with dynamic round-robin key rotation, Express 5, LangGraph, and React 19. Cerkit AI turns the unorganized web into verifiable, structured intelligence."*

---

# Complete Execution Summary

```mermaid
flowchart TD
    User([User Prompt]) --> FE[React 19 Frontend]
    FE -->|POST /tasks/create| API[Express 5 API Gateway]
    API -->|SSE Handshake| SSE[Live SSE Stream]
    SSE -->|Real-Time Status & Logs| FE

    API --> Intent[Intent Analyzer]
    Intent --> Arch[Meta-Architect DAG Planner]
    Arch --> Scout[Tavily Multi-Scout]
    Scout --> Crawl[Puppeteer Crawler]

    Crawl -.->|Broken Selector?| Healer[Vision Self-Healing Service]
    Healer -.->|Patched Selector| Crawl

    Crawl --> Extract[gpt-oss-120b Data Extractor]
    Extract --> Dedupe[Fastest-Levenshtein Deduplicator]
    Dedupe --> Audit[Adversarial Red-Team Auditor]
    
    Audit --> Schema[Schema Detector & Type Inference]
    Schema -->|schema_review SSE Event| Modal[Frontend HITL Review Modal]
    Modal -->|POST /confirm-schema| Commit[Dataset Persistence]

    Commit --> Mongo[(MongoDB Atlas)]
    Mongo --> Diff[Time-Travel Diff Engine]
    Mongo --> Cron[Swarm Cron Background Scheduler]
    Cron -->|Due Runs| API
    Diff --> UI_Diff[Git-Style Time-Travel Modal]
```
