# NewsVerify System Architecture

```
[ User Browser / Client ]
           │
           ▼
[ React 19 Frontend (Vite) ]
  ├── Landing Page (Interactive Demo)
  ├── User / Admin Dashboards (Recharts)
  ├── Multi-Signal News Analysis & URL Scraper Preview
  ├── Claim Decomposition & Knowledge Base Retrieval
  └── Explainable AI (XAI) Attribution Cards
           │
           ▼  (REST API / JWT Bearer)
[ Node.js + Express 4 Backend ]
  ├── SSRF Defense Layer (DNS check, blocks private IPs & metadata APIs)
  ├── Native Machine Learning Inference Engine (Pure TypeScript)
  │     ├── TF-IDF Vectorizer (Sublinear scaling, unigrams + bigrams)
  │     └── Logistic Regression Classifier (Exported parameters)
  ├── NLP Claim Extraction & Wikipedia Knowledge Cross-Referencing
  ├── Linguistic Manipulation Scorer (Sensationalism & Clickbait Grammars)
  ├── Multi-Factor Composite Risk Calibration Engine
  └── Data Access Layer (Mongoose ODM / Auto-Fallback Local Store)
           │
           ▼
[ MongoDB Database / Local JSON Store ]
```

## Security & SSRF Protection
The URL extraction service strictly prevents Server-Side Request Forgery (SSRF) vulnerabilities:
1. Validates schema: permits strictly `http://` and `https://`.
2. Blocks forbidden hostnames: `localhost`, `.local`, `.internal`.
3. Resolves DNS asynchronously prior to connection.
4. Checks IPv4 and IPv6 addresses against restricted subnets:
   - Loopback: `127.0.0.0/8`, `::1`
   - Private RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-local and Cloud metadata: `169.254.0.0/16`
   - Carrier-grade NAT: `100.64.0.0/10`
   - Unspecified: `0.0.0.0`, `::`
5. Enforces payload boundaries (5MB maximum) and a hard 8,000ms socket timeout.
