import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  Send, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  Database, 
  Key, 
  Code2, 
  FileCode, 
  Layers,
  Sparkles,
  Lock,
  DollarSign
} from 'lucide-react';

interface EndpointPreset {
  id: string;
  name: string;
  category: 'Auth' | 'Internships' | 'AI Audit' | 'Chat' | 'Payments' | 'System';
  method: 'GET' | 'POST' | 'PUT';
  url: string;
  requiresAuth: boolean;
  defaultBody?: any;
  description: string;
}

const PRESETS: EndpointPreset[] = [
  {
    id: 'auth-login-candidate',
    name: 'Login Candidate (Muhammad Faizan Farooq)',
    category: 'Auth',
    method: 'POST',
    url: '/api/auth/login',
    requiresAuth: false,
    defaultBody: {
      email: 'faizanfarooq810@gmail.com',
      password: 'password123',
    },
    description: 'Authenticates candidate, returns JWT token and candidate profile with Low-GPA shield active.',
  },
  {
    id: 'auth-login-founder',
    name: 'Login Founder (Zubair Tariq - Johar Town Fintech)',
    category: 'Auth',
    method: 'POST',
    url: '/api/auth/login',
    requiresAuth: false,
    defaultBody: {
      email: 'zubair@finflow.pk',
      password: 'password123',
    },
    description: 'Authenticates founder, returns JWT token for releasing milestones and posting jobs.',
  },
  {
    id: 'auth-me',
    name: 'Get Current Authenticated User (/me)',
    category: 'Auth',
    method: 'GET',
    url: '/api/auth/me',
    requiresAuth: true,
    description: 'Fetches verified profile using Bearer JWT. Demonstrates GPA shield mask for non-self requests.',
  },
  {
    id: 'auth-toggle-shield',
    name: 'Toggle Low-GPA Shield',
    category: 'Auth',
    method: 'PUT',
    url: '/api/auth/toggle-gpa-shield',
    requiresAuth: true,
    defaultBody: {
      hideGpa: true,
    },
    description: 'Candidate switches visibility between academic GPA and Verified Portfolio Reliability Score.',
  },
  {
    id: 'internships-list',
    name: 'List Internships (Filtered by Lahore & Node.js)',
    category: 'Internships',
    method: 'GET',
    url: '/api/internships?city=Lahore&techStack=Node.js',
    requiresAuth: false,
    description: 'Lists active internships with populated founder info matching query filters.',
  },
  {
    id: 'internships-remote-usd',
    name: 'List USD Remote Pathway Track',
    category: 'Internships',
    method: 'GET',
    url: '/api/internships?isRemoteUsd=true',
    requiresAuth: false,
    description: 'Retrieves global remote track managed by Lahore software export house paying $500/month.',
  },
  {
    id: 'ai-audit-code',
    name: 'AI Code Review & AST Audit (Gemini 3.8 Flash)',
    category: 'AI Audit',
    method: 'POST',
    url: '/api/ai/audit-code',
    requiresAuth: false,
    defaultBody: {
      language: 'javascript',
      targetRole: 'Junior Full-Stack Developer',
      codeSnippet: `// ACID Double-entry transferFunds function in Node.js & MongoDB
async function transferFunds(payerId, receiverId, amountPkr) {
  if (amountPkr <= 0) throw new Error('Transfer amount must be strictly positive');
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Wallet.updateOne({ userId: payerId }, { $inc: { pkrBalance: -amountPkr } }, { session });
    await Wallet.updateOne({ userId: receiverId }, { $inc: { pkrBalance: amountPkr } }, { session });
    await session.commitTransaction();
    return { status: 'SETTLED', reference: 'PK-TX-' + Date.now() };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}`,
    },
    description: 'Executes AST & architectural evaluation via Gemini API. Generates code quality score and CV bullet points.',
  },
  {
    id: 'chat-conversation',
    name: 'Get Chat History with Candidate (Faizan Farooq)',
    category: 'Chat',
    method: 'GET',
    url: '/api/chat/conversation/66f5a1b2c3d4e5f6a7b8c901',
    requiresAuth: true,
    description: 'Retrieves chronological conversation thread and automatically marks unread messages as read.',
  },
  {
    id: 'chat-send',
    name: 'Send Instant Message to Founder',
    category: 'Chat',
    method: 'POST',
    url: '/api/chat/send',
    requiresAuth: true,
    defaultBody: {
      receiverId: '66f5a1b2c3d4e5f6a7b8c902',
      text: 'Salam Zubair bhai! Pull request for Milestone 2 is ready on GitHub with 100% test coverage.',
    },
    description: 'Sends direct chat message between candidate and founder.',
  },
  {
    id: 'payments-release-milestone',
    name: 'Release Milestone Escrow with Pakistani Tax Receipt',
    category: 'Payments',
    method: 'POST',
    url: '/api/payments/release-milestone',
    requiresAuth: true,
    defaultBody: {
      internshipId: '66f5a1b2c3d4e5f6a7b8c911',
      milestoneIndex: 1,
      candidateId: '66f5a1b2c3d4e5f6a7b8c901',
      paymentMethod: 'JazzCash / HBL Direct',
    },
    description: 'Founder releases escrow funds into candidate wallet with PSEB/FBR withholding tax deduction.',
  },
  {
    id: 'payments-wallet',
    name: 'Get Candidate Wallet Balance & Conversion Rates',
    category: 'Payments',
    method: 'GET',
    url: '/api/payments/wallet',
    requiresAuth: true,
    description: 'Fetches wallet balances (PKR & USD), real-time conversion rates, and JazzCash/Wise payout options.',
  },
  {
    id: 'dev-status',
    name: 'System Health & Database Statistics',
    category: 'System',
    method: 'GET',
    url: '/api/dev/status',
    requiresAuth: false,
    description: 'Checks database connectivity (MongoDB or in-memory Mongoose store) and record counts.',
  },
  {
    id: 'dev-dump',
    name: 'Database Collections Full Dump',
    category: 'System',
    method: 'GET',
    url: '/api/dev/dump',
    requiresAuth: false,
    description: 'Inspects all stored users, internships, applications, and chat messages in the database.',
  },
];

export const BackendApiExplorer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(PRESETS[0]);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [url, setUrl] = useState<string>('/api/auth/login');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Auto-fill preset
  const selectPreset = (preset: EndpointPreset) => {
    setSelectedPreset(preset);
    setMethod(preset.method);
    setUrl(preset.url);
    if (preset.defaultBody) {
      setRequestBody(JSON.stringify(preset.defaultBody, null, 2));
    } else {
      setRequestBody('');
    }
  };

  // Check health on mount
  useEffect(() => {
    fetch('/api/dev/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(() => {});

    // Try auto-logging in as candidate to get an initial token
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faizanfarooq810@gmail.com', password: 'password123' })
    })
      .then(r => r.json())
      .then(d => {
        if (d.token) setJwtToken(d.token);
      })
      .catch(() => {});
  }, []);

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseData(json);

      // If logging in or registering, automatically capture token!
      if (json.token) {
        setJwtToken(json.token);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message, note: 'Request failed to reach endpoint.' });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (responseData) {
      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev/reset-seed', { method: 'POST' });
      const data = await res.json();
      setResponseData(data);
      setResponseStatus(res.status);
      // Refresh status
      const statusRes = await fetch('/api/dev/status');
      setSystemStatus(await statusRes.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">WorkNest Ajao REST API Architecture</h1>
                <p className="text-slate-400 text-sm">
                  Node.js • Express • MongoDB / Mongoose ORM • JWT Auth • Gemini 3.8 Flash Code Review
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Fully interactive developer console and Swagger-style test suite for the WorkNest backend. All endpoints run live on the server with active Low-GPA Shield filtering and milestone escrow logic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-400">REST Server Active</span>
              </div>
              <div className="text-slate-400">
                DB Mode: <span className="text-slate-200 font-medium">{systemStatus?.database?.type || 'Mongoose Compatible Store'}</span>
              </div>
              <div className="text-slate-400">
                Users: <span className="text-slate-200">{systemStatus?.database?.counts?.users ?? 4}</span> | Internships: <span className="text-slate-200">{systemStatus?.database?.counts?.internships ?? 4}</span>
              </div>
            </div>

            <button
              onClick={handleResetDatabase}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset & Re-seed DB
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Endpoint Presets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-600" />
              API Endpoints & Presets
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select any pre-configured endpoint to load realistic Pakistani ecosystem payloads.
            </p>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => selectPreset(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-sm text-emerald-950 font-medium'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        preset.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        preset.method === 'POST' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {preset.method}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {preset.category}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 truncate">
                      {preset.name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 truncate">
                      {preset.url}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JWT Token Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                Active Bearer JWT Token
              </label>
              {jwtToken ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                  Authenticated
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded">
                  No Token
                </span>
              )}
            </div>
            <textarea
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              placeholder="Paste JWT token here or execute /api/auth/login to auto-populate"
              rows={3}
              className="w-full text-[11px] font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-slate-700"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Automatically included in `Authorization: Bearer` headers</span>
              {jwtToken && (
                <button
                  onClick={() => setJwtToken('')}
                  className="text-red-600 hover:underline"
                >
                  Clear Token
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Column: Request Form & Live Response */}
        <div className="lg:col-span-8 space-y-6">
          {/* Request Header Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedPreset.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedPreset.description}</p>
            </div>

            {/* URL Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-100 border border-slate-300 font-mono text-xs font-bold rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="/api/..."
                />
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Send Request
                  </>
                )}
              </button>
            </div>

            {/* Request Body Editor (for POST/PUT) */}
            {method !== 'GET' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    JSON Request Body:
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">application/json</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                  placeholder="{}"
                />
              </div>
            )}
          </div>

          {/* Response Console */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  HTTP Response Console
                </span>
                {responseStatus !== null && (
                  <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    Status: {responseStatus}
                  </span>
                )}
                {executionTime !== null && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {executionTime}ms
                  </span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={copyResponse}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-xs font-mono">Dispatched request to Express backend...</p>
              </div>
            ) : responseData ? (
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto max-h-[460px] p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 leading-relaxed">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Click &quot;Send Request&quot; above to inspect live REST API response from the Node.js server.
              </div>
            )}
          </div>

          {/* Architectural Notes Card */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              WorkNest Low-GPA Shield & Pakistani Settlement Rules Active
            </div>
            <ul className="list-disc list-inside space-y-1 text-emerald-900/80 pl-1 leading-relaxed">
              <li><strong>Zero GPA Discrimination:</strong> When a founder views candidate profiles, academic CGPA (e.g. 2.4) is automatically masked by the <code>protect</code> and <code>sanitizeUser</code> middleware, displaying only verified portfolio AST scores.</li>
              <li><strong>Automated Tax Shield:</strong> Milestone releases automatically calculate Pakistani withholding tax (2.5% local IT services vs 0.25% PSEB export concession) with official transaction receipt references.</li>
              <li><strong>Dual-Mode Database Adapter:</strong> Operates seamlessly with live MongoDB clusters via <code>MONGODB_URI</code> or auto-seeded in-memory Mongoose store during local preview.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
