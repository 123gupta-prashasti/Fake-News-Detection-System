# NewsVerify API Documentation

Base URL: `http://localhost:3000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new analyst or auditor account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_1742000000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### `POST /api/auth/login`
Authenticates existing credentials and returns a JWT Bearer token.

**Request Body:**
```json
{
  "email": "analyst@newsverify.org",
  "password": "AnalystPass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_analyst_002",
    "name": "Alex Rivera (Fact Checker)",
    "email": "analyst@newsverify.org",
    "role": "user"
  }
}
```

---

### `GET /api/auth/me`
Retrieves authenticated user profile.
**Headers:** `Authorization: Bearer <token>`

---

## 2. News Analysis Endpoints

### `POST /api/news/analyze`
Executes multi-layer classification and claim verification on text input.
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "headline": "Optional Headline",
  "text": "Full text of article or claims...",
  "category": "health",
  "sourceUrl": "optional URL"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "analysis": {
    "_id": "ana_174200000",
    "prediction": "Likely Fake",
    "overallRiskScore": 88,
    "modelConfidence": 93,
    "featureContributions": [...],
    "linguisticIndicators": {...},
    "sourceAssessment": {...},
    "claims": [...],
    "reasons": [...]
  }
}
```

---

### `POST /api/news/analyze-url`
Fetches and audits an article from a web URL with SSRF protection.
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://apnews.com/article/example-story",
  "extractOnly": false
}
```

---

### `GET /api/news/history`
Returns all analyses belonging to the authenticated user.
**Headers:** `Authorization: Bearer <token>`

---

### `GET /api/news/:id`
Retrieves detailed dossier for an analysis by ID.
**Headers:** `Authorization: Bearer <token>`

---

### `DELETE /api/news/:id`
Deletes an analysis record. Users can only delete their own records; admins can delete any record.
**Headers:** `Authorization: Bearer <token>`

---

## 3. Dashboard & Model Endpoints

### `GET /api/dashboard/stats?scope=user|global`
Retrieves aggregate KPIs, category spread, and risk histogram.
**Headers:** `Authorization: Bearer <token>`

---

### `GET /api/model/metrics`
Public endpoint returning empirical evaluation metrics, confusion matrix, and feature coefficients.

---

### `POST /api/model/thresholds`
Updates classification decision thresholds. Restricted to `admin` role.
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "likely_real_max": 0.35,
  "likely_fake_min": 0.65
}
```

---

### `GET /api/health`
System health check indicating database mode and ML model status.
