# WorkNest Ajao - Backend REST API Architecture

A complete, modular, and secure backend REST API server in Node.js, Express.js, and MongoDB (via Mongoose) built for the Pakistani career platform **WorkNest Ajao**.

WorkNest Ajao connects fresh Computer Science and IT graduates in Pakistan (especially low-GPA graduates) with local tech startups and global remote clients for paid virtual internships and micro-tasks based purely on portfolio proof-of-work.

---

## 🛠 Technology Stack
- **Server Runtime:** Node.js & Express.js
- **Database & ORM:** MongoDB & Mongoose ORM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs (Salt rounds: 10)
- **AI Code Review:** `@google/genai` (Gemini 3.8 Flash model)
- **Security & Protection:** Helmet, CORS, Express-Rate-Limit, Low-GPA Recruiter Shield Middleware

---

## 📂 Architecture & Directory Structure
```
/
├── server.ts                    # Unified Full-Stack Express Server (hosts API + Vite SPA in dev)
├── server/
│   ├── db.ts                    # Universal DB adapter (MongoDB + in-memory Mongoose fallback)
│   ├── models/
│   │   ├── User.ts              # User schema with hideGpa shield & wallet balances
│   │   ├── Internship.ts        # Internship with escrow milestones & Pakistani tech hubs
│   │   ├── Application.ts       # Proof-of-work code submissions & AI audit results
│   │   └── Message.ts           # Candidate-to-founder direct messaging
│   ├── middleware/
│   │   └── auth.ts              # JWT verification, role restrictions & GPA mask filter
│   └── routes/
│       ├── auth.ts              # /api/auth (register, login, me, toggle-gpa-shield)
│       ├── internships.ts       # /api/internships (filters, details, apply, milestones)
│       ├── ai.ts                # /api/ai/audit-code (Gemini AI code review & CV bullets)
│       ├── chat.ts              # /api/chat (conversations & instant messaging)
│       ├── payments.ts          # /api/payments (escrow milestone release & withholding tax)
│       └── dev.ts               # /api/dev (database dump, status, reset)
└── backend/                     # Standalone CommonJS distribution for production MongoDB
    ├── server.js                # Pure Node.js / Express entrypoint
    ├── seed.js                  # Database seed script for MongoDB
    ├── models/                  # User.js, Internship.js, Application.js, Message.js
    ├── middleware/              # auth.js
    └── routes/                  # auth.js, internships.js, ai.js, chat.js, payments.js
```

---

## 🔐 Key Data Models

### 1. User (`User.js` / `User.ts`)
- `name`: String (Required)
- `email`: String (Unique, Lowercase, Required)
- `password`: String (Hashed with bcryptjs)
- `role`: Enum `['candidate', 'founder', 'admin']` (Default: `'candidate'`)
- `phone`: Pakistani telco string (`'+923004810928'`)
- `city`: Enum `['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Remote']`
- `university`: Enum `['UMT Lahore', 'FAST-NUCES', 'NUST', 'ITU', 'UET', 'COMSATS', 'NED', 'Air University', 'Other']`
- `gpa`: Number (Optional)
- `hideGpa`: Boolean (Default: `true` — Low-GPA Shield active)
- `verifiedPortfolioScore`: Number (0-100, Default: 0)
- `skills`: `[String]`
- `wallet`: `{ pkrBalance: Number, usdBalance: Number }`

### 2. Internship (`Internship.js` / `Internship.ts`)
- `title`: String
- `startupName`: String
- `founderId`: ObjectId (Ref: User)
- `city`: String (Default: `'Lahore'`)
- `area`: String (`'Johar Town'`, `'Gulberg'`, `'Arfa Software Technology Park'`)
- `isRemoteUsd`: Boolean (Default: `false`)
- `stipendPkr`: Number
- `stipendUsd`: Number
- `durationWeeks`: Number
- `techStack`: `[String]`
- `type`: Enum `['Full Internship', '3-Day Micro-Task']`
- `milestones`: Array of `{ title, percentage, amountPkr, amountUsd, status: ['Pending', 'In Progress', 'In Review', 'Released'] }`

### 3. Application (`Application.js` / `Application.ts`)
- `internshipId`: ObjectId (Ref: Internship)
- `candidateId`: ObjectId (Ref: User)
- `status`: Enum `['Applied', 'Shortlisted', 'Accepted', 'Rejected', 'Completed']`
- `githubRepoUrl`: String
- `submittedCode`: String
- `aiAuditResult`: `{ score, feedback, cvBullets, securityChecks, suggestions }`

### 4. Message (`Message.js` / `Message.ts`)
- `senderId`: ObjectId (Ref: User)
- `receiverId`: ObjectId (Ref: User)
- `text`: String
- `read`: Boolean
- `timestamp`: Date

---

## 📡 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register candidate or founder |
| `POST` | `/api/auth/login` | Public | Login with credentials, returns JWT token & user |
| `GET` | `/api/auth/me` | Protected | Get current profile (GPA shielded if viewing candidates) |
| `PUT` | `/api/auth/toggle-gpa-shield` | Candidate | Toggle `hideGpa` boolean |

### Internships & Marketplace (`/api/internships`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internships` | Public | List internships with query filters (`?city=Lahore&techStack=React&type=Micro-Task&isRemoteUsd=true`) |
| `GET` | `/api/internships/:id` | Public | Fetch single internship details with milestone breakdown |
| `POST` | `/api/internships` | Founder | Create a new internship with milestone escrow |
| `POST` | `/api/internships/:id/apply` | Candidate | Submit GitHub repo link & code snippet |
| `GET` | `/api/internships/:id/applications` | Founder | View candidate submissions for an internship |

### AI Code Audit (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/audit-code` | Public | Automated AST & code review using Gemini 3.8 Flash, generating resume bullet points |

### Direct Founder-Candidate Chat (`/api/chat`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/chat/conversation/:recipientId` | Protected | Fetch conversation history and mark as read |
| `POST` | `/api/chat/send` | Protected | Send instant candidate-to-founder message |

### Milestone Escrow & Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/release-milestone` | Founder | Release escrow milestone funds to candidate wallet with Pakistani withholding tax receipt |
| `GET` | `/api/payments/wallet` | Protected | View current candidate or founder wallet balance and withdrawal channels |

---

## 🧪 Testing with cURL Examples

### 1. Candidate Login (Muhammad Faizan Farooq)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faizanfarooq810@gmail.com","password":"password123"}'
```

### 2. Toggle Low-GPA Shield
```bash
curl -X PUT http://localhost:3000/api/auth/toggle-gpa-shield \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"hideGpa": true}'
```

### 3. Filter Lahore Internships
```bash
curl "http://localhost:3000/api/internships?city=Lahore&techStack=Node.js"
```

### 4. AI Code Audit Submission
```bash
curl -X POST http://localhost:3000/api/ai/audit-code \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "targetRole": "Full-Stack Engineer",
    "codeSnippet": "async function reconcileLedger(payer, payee, amount) { if (amount <= 0) throw new Error(\"Invalid\"); return { settled: true }; }"
  }'
```

### 5. Release Escrow Milestone
```bash
curl -X POST http://localhost:3000/api/payments/release-milestone \
  -H "Authorization: Bearer <FOUNDER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "internshipId": "66f5a1b2c3d4e5f6a7b8c911",
    "milestoneIndex": 1,
    "candidateId": "66f5a1b2c3d4e5f6a7b8c901"
  }'
```
