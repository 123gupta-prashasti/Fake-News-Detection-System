# Database Schema Documentation

NewsVerify supports persistent storage with **MongoDB & Mongoose**, alongside an automatic zero-config persistent JSON fallback store.

---

## 1. User Model (`User`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId / String | Yes | Unique Primary Key | User record identifier |
| `name` | String | Yes | Min length 2 | Full legal or display name |
| `email` | String | Yes | Unique, Lowercase | Valid email address used for authentication |
| `password` | String | Yes | Min length 6 | Salted bcrypt hash ($10$ rounds) |
| `role` | String | Yes | Enum: `['user', 'admin']` | Authorization level |
| `createdAt`| Date | Yes | Default: `Date.now` | Account creation timestamp |

---

## 2. NewsAnalysis Model (`NewsAnalysis`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId / String | Unique analysis record identifier |
| `userId` | String (Indexed) | Foreign key reference to User |
| `userEmail` | String | Cached email of analyst |
| `inputHeadline` | String (Optional) | User or extracted title |
| `rawInputText` | String | Original submission (text or URL) |
| `extractedText` | String | Cleaned textual content analyzed by NLP pipeline |
| `inputType` | String | `'text'` or `'url'` |
| `sourceUrl` | String (Optional) | Origin URL |
| `sourceDomain` | String (Optional) | Extracted domain host |
| `prediction` | String | `'Likely Real'` \| `'Suspicious / Needs Verification'` \| `'Likely Fake'` |
| `overallRiskScore` | Number | Composite risk score ($0$ to $100$) |
| `modelConfidence` | Number | Statistical model confidence ($0$ to $100\%$) |
| `mlProbabilityFake`| Number | Raw sigmoid probability $P(\text{Fake}) \in [0, 1]$ |
| `category` | String | Domain tag (`general`, `health`, `politics`, `science`, etc.) |
| `featureContributions`| Array | List of tokens with attribution weight ($\beta_i \cdot x_i$) and impact rating |
| `linguisticIndicators`| Object | Sensationalism, clickbait, excessive caps, and exclamation scores |
| `sourceAssessment`| Object | Domain governance, byline status, timestamp audit, and citations |
| `claims` | Array | Discrete factual claims, factuality score, status, and Wikipedia evidence |
| `reasons` | Array | Human-readable explainable rationale sentences |
| `createdAt` | Date (Indexed) | Timestamp of analysis execution |

---

## 3. Indexing Strategy
- `userId`: B-Tree index for rapid user-scoped history queries.
- `createdAt`: Descending compound index for chronological pagination.
- `prediction`: Index for analytical aggregation queries in the admin dashboard.
