# NewsVerify — AI-Powered Fake News Detection and Claim Verification Platform

An explainable, multi-layer misinformation detection and factual claim verification system built as a final-year B.Tech Computer Science project.

NewsVerify integrates statistical machine learning (TF-IDF + Logistic Regression), Explainable AI (XAI) feature attribution, open knowledge base claim cross-referencing (Wikipedia API), and linguistic manipulation auditing into a high-density, professional analyst workspace.

---

## 1. Key Features

- **Multi-Signal Architecture**: Combines ML classification (45%), linguistic manipulation indicators (25%), source credibility factors (15%), and claim verification status (15%) into a calibrated 0–100 composite risk score.
- **Explainable AI (XAI)**: Visualizes exact token contribution weights ($\beta_i \cdot x_i$) showing which words drove the model toward "Likely Fake" vs "Likely Real".
- **Claim-Level Cross-Referencing**: Decomposes news into discrete factual claims and cross-references them against open knowledge repositories (Wikipedia Search API) to categorize claims as **Supported**, **Contradicted**, or **Unverified**.
- **SSRF-Protected URL Extraction**: Scrapes article text from remote URLs while blocking private IPs (127.0.0.1, 10.x, 192.168.x, 172.16-31.x, AWS metadata 169.254.169.254) and DNS rebinding attacks.
- **Rhetorical Manipulation Meters**: Identifies sensationalism, excessive capitalization, clickbait patterns, and unsupported certainty with clear academic disclaimers.
- **Role-Based Workspaces**: Complete JWT authentication with User and Admin roles. Admins can audit platform metrics, inspect user accounts, review confusion matrices, and tune decision thresholds in real time.
- **Zero-Crash Data Persistence**: Supports MongoDB with Mongoose while providing an automatic local JSON repository fallback if MongoDB is not running locally.

---

## 2. Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express 4 (ES Modules), TypeScript
- **Machine Learning**: TF-IDF Vectorizer + Logistic Regression ($C=1.5$, L2 regularized), pure Node.js native inference engine
- **Database**: MongoDB with Mongoose (with built-in local store fallback)
- **Security & Authentication**: JWT (JSON Web Tokens), bcryptjs, SSRF validation
- **Testing**: Vitest unit test suite

---

## 3. Project Structure

```
├── client/ (integrated in /src)
│   ├── components/      # Navbar, Footer, RiskBadge, FeatureWeightChart, ConfusionMatrixChart
│   ├── context/         # AuthContext, ToastContext
│   ├── pages/           # Landing, Login, Register, Dashboard, NewsAnalysis,
│   │                    # ClaimVerification, History, AnalysisDetails, About, AdminDashboard
│   ├── services/        # api.ts (REST client with automatic JWT injection)
│   └── types/           # TypeScript definitions
├── server/
│   ├── config/          # db.ts (Mongoose + local fallback)
│   ├── db/              # store.ts (Unified data access layer & seed data)
│   ├── middleware/      # auth.ts (JWT verification & requireAdmin)
│   ├── ml/              # Native TS inference engine, preprocessor, model_export.json, metrics.json
│   ├── models/          # User.ts, NewsAnalysis.ts (Mongoose schemas)
│   ├── routes/          # authRoutes, newsRoutes, dashboardRoutes, modelRoutes, healthRoutes
│   ├── services/        # urlExtractor (SSRF), claimExtractor, evidenceRetriever, manipulationAnalyzer, riskScorer
│   └── tests/           # Vitest unit test suites (ML inference, SSRF protection, linguistic analyzer)
├── ml/
│   ├── train_model.py   # Python offline scikit-learn training & parameter exporter
│   ├── sample_dataset.json # Labeled benchmark training corpus
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Mathematical formulation & training documentation
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DATASET_AND_TRAINING.md
│   └── PROJECT_REPORT_OUTLINE.md
├── index.html
├── metadata.json
├── package.json
├── server.ts            # Application entry point (Express + Vite middleware)
└── tsconfig.json
```

---

## 4. Quick Start & Startup Commands

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` (optional, defaults are pre-configured):
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Application server port | `3000` |
| `MONGODB_URI` | Optional MongoDB connection string | *(Uses built-in persistent store if omitted)* |
| `JWT_SECRET` | Secret key for signing JWTs | Pre-configured secure fallback |

### Step 3: Run the Application
```bash
npm run dev
```
The server will start at `http://localhost:3000` with both backend REST APIs and the React frontend mounted together.

---

## 5. Pre-Configured Demo Accounts (1-Click Login)

The system includes pre-seeded demo accounts on the Login page:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Auditor (Admin)** | `admin@newsverify.org` | `AdminPass123!` | Full Admin Console, threshold tuning, system stats |
| **Fact Checker (User)** | `analyst@newsverify.org` | `AnalystPass123!` | User Dashboard, news analysis, history, claim verification |

---

## 6. Testing & Actual Test Results

Run the automated Vitest test suite:
```bash
npm test
```

### Test Results Summary:
```text
 ✓ server/tests/ml_inference.test.ts (5 tests)
 ✓ server/tests/ssrf.test.ts (3 tests)
 ✓ server/tests/manipulation.test.ts (2 tests)

 Test Files  3 passed (3)
      Tests  10 passed (10)
   Duration  621ms
```

---

## 7. Sample Inputs for Demonstration

### Case A: Viral Medical Hoax (Expected: Likely Fake)
> "BREAKING: Scientists confirm drinking boiled lemon water cure all stages of cancer in 48 hours without chemotherapy doctors hate this!"
- **Result**: Classified as **Likely Fake** (Risk Score: 89/100, $P(\text{Fake}) = 94.2\%$).
- **Explanation**: Factual claim contradicted by oncology consensus; triggers clickbait phrase "doctors hate this"; heavy positive coefficients for "cure" and "cancer".

### Case B: Official Government Economic Report (Expected: Likely Real)
> "The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December, with unemployment holding steady at 3.7 percent according to official statistics."
- **Result**: Classified as **Likely Real** (Risk Score: 12/100, $P(\text{Real}) = 95.2\%$).
- **Explanation**: Zero sensational language; official government agency attribution; negative model coefficients for "department", "reported", "official", and "statistics".

---

## 8. Limitations & Future Work

- **Knowledge Base Scope**: Live claim verification queries open Wikipedia consensus. Claims concerning fast-breaking local events may return "Unverified" when encyclopedic pages have not yet been created.
- **Multimodal Assets**: The current baseline classifier inspects text and metadata. Future work includes vision-language models (CLIP/BLIP) to detect manipulated imagery and deepfakes.
- **Multilingual Support**: The current baseline model is trained on English corpora. Cross-lingual embeddings (XLM-RoBERTa) are planned for regional languages.
