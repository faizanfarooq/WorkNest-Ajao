import { 
  CandidateProfile, 
  Startup, 
  InternshipProject, 
  ChatThread, 
  ChatMessage, 
  DocumentPortalItem, 
  InterviewBooking, 
  ReviewTestimonial,
  MicroTask,
  RemoteJob,
  RemoteReadinessScore,
  MobileAlert,
  PeerReviewSquad
} from '../types';

export const CURRENT_GRADUATE: CandidateProfile = {
  id: 'cand-faizan-farooq',
  name: 'Muhammad Faizan Farooq',
  email: 'faizanfarooq810@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  graduationStatus: 'Recent CS Graduate (Seeking First Role)',
  degreeInfo: 'B.S. in Computer Science (Class of 2025)',
  university: 'FAST-NUCES Lahore',
  graduationYear: 2025,
  bio: 'Fresh CS graduate from FAST-NUCES Lahore specializing in Full-Stack Web Engineering (React, Next.js, Node.js, Python FastAPI, PostgreSQL). Blocked by rigid corporate GPA cutoffs (2.4 CGPA) despite shipping production-grade microservices and real-time ledger engines. Through WorkNest Ajao, I build verified production software for Pakistani startups and global remote teams.',
  location: 'Lahore, Pakistan (Johar Town / Gulberg • Open to Global Remote)',
  githubHandle: 'faizanfarooq-dev',
  linkedinUrl: 'linkedin.com/in/faizanfarooq810',
  portfolioUrl: 'faizanfarooq.dev',
  overallMatchRating: 96,
  completedMilestonesCount: 4,
  hideGpaFromRecruiter: true,
  portfolioReliabilityScore: 96,
  activeInternshipsCount: 1,
  remoteApplicationsCount: 3,
  unplacedGraduateStory: 'Sent 130+ applications on LinkedIn and Rozee.pk to corporate software houses in Johar Town and Islamabad, only to get automatically rejected because my CGPA was 2.4. WorkNest Ajao bypassed the GPA filter by verifying my Raast webhook architecture and full-stack React dashboards. I completed 2 paid milestones (PKR 55,000 earned in escrow) and am now interviewing with US/EU remote teams.',
  peerReviewSquads: [
    {
      id: 'squad-01',
      title: 'Raast Webhook Idempotency & Concurrency Stress Test',
      reviewerName: 'Bilal Siddiqui',
      reviewerRole: 'Senior Staff Engineer at Devsinc & FAST Alum',
      reviewerUni: 'FAST-NUCES \'19',
      status: 'Review Completed',
      score: 98,
      feedbackSummary: 'Faizan implemented Redis distributed locking cleanly. Zero double-spends under 2,000 simulated parallel webhook bursts. Ready for live fintech production.',
      githubPrUrl: 'https://github.com/faizanfarooq-dev/raast-webhook-engine/pull/4',
      date: 'Sep 12, 2026'
    },
    {
      id: 'squad-02',
      title: 'Offline-First Vector Clock Reconciliation Logic',
      reviewerName: 'Zubair Akram',
      reviewerRole: 'Lead Distributed Systems Architect',
      reviewerUni: 'NUST Islamabad \'20',
      status: 'Review Completed',
      score: 95,
      feedbackSummary: 'Exceptional handling of network partitions for retail merchants. Far superior to average campus final year projects.',
      githubPrUrl: 'https://github.com/faizanfarooq-dev/b2b-offline-sync/pull/2',
      date: 'Sep 15, 2026'
    }
  ],
  skills: [
    { name: 'React & Next.js', category: 'Frontend', verifiedLevel: 'Verified Production', score: 96, evidenceProject: 'FinTech Merchant Settlement Portal' },
    { name: 'Python & FastAPI', category: 'Languages', verifiedLevel: 'Verified Production', score: 95, evidenceProject: 'Raast Automated Settlement Webhook Engine' },
    { name: 'Node.js & Express', category: 'Backend & DBs', verifiedLevel: 'Verified Production', score: 94, evidenceProject: 'B2B Wholesale Offline-First Inventory Sync' },
    { name: 'PostgreSQL & Redis', category: 'Backend & DBs', verifiedLevel: 'Verified Production', score: 92, evidenceProject: 'High-Concurrency Ledger DB' },
    { name: 'Docker & AWS', category: 'Cloud & DevOps', verifiedLevel: 'Verified Advanced', score: 90, evidenceProject: 'Containerized Microservices on Hetzner & AWS' },
    { name: 'Tailwind CSS & TypeScript', category: 'Frontend', verifiedLevel: 'Verified Production', score: 97, evidenceProject: 'WorkNest Ajao Design System & Dashboards' },
  ],
  verifiedBadges: [
    {
      id: 'badge-fintech-pk-01',
      title: 'Raast & Fintech Payment Protocols',
      issuer: 'WorkFest AI Verifier',
      category: 'System Architecture',
      level: 'Production-Grade',
      score: 96,
      earnedAt: '2026-08-14',
      verificationHash: '0x8f3c...b291'
    },
    {
      id: 'badge-clean-code-02',
      title: 'Clean Idiomatic TypeScript & React',
      issuer: 'WorkFest AI Verifier',
      category: 'Clean Code',
      level: 'Production-Grade',
      score: 95,
      earnedAt: '2026-08-20',
      verificationHash: '0x4d1a...9e10'
    },
    {
      id: 'badge-docker-03',
      title: 'Global Remote Asynchronous Collaboration',
      issuer: 'WorkFest AI Verifier',
      category: 'Cloud Reliability',
      level: 'High-Competency',
      score: 92,
      earnedAt: '2026-09-02',
      verificationHash: '0x7a2f...c318'
    }
  ],
  projects: [
    {
      id: 'proj-raast-webhook',
      title: 'Raast Real-Time Payment Ingestion & Reconciliation Service',
      description: 'High-concurrency webhook ingestion service built in Python (FastAPI) and Redis Streams, processing State Bank of Pakistan Raast instant payment notifications with zero double-spends.',
      techStack: ['Python', 'FastAPI', 'Redis Streams', 'PostgreSQL', 'Docker'],
      repoUrl: 'https://github.com/faizanfarooq-dev/raast-webhook-engine',
      liveUrl: 'https://raast-demo.faizanfarooq.dev',
      architectureHighlights: [
        'Idempotent transaction deduplication with sub-millisecond Redis locking',
        'HMAC SHA-256 signature verification matching State Bank of Pakistan specs',
        'Automated database migration scripts with 94% unit test coverage'
      ],
      complexityScore: 96,
      aiVerified: true,
      aiVerificationDate: '2026-08-14',
      codeMetrics: {
        linesOfCode: 3850,
        testCoverage: '94.5%',
        cicdConfigured: true,
        dockerized: true
      }
    },
    {
      id: 'proj-retail-sync',
      title: 'B2B Wholesale Offline-First Inventory Sync Gateway',
      description: 'Node.js & TypeScript backend for Pakistani retail distributors, enabling grocery merchants in Shahrah-e-Faisal Karachi to synchronize orders during cellular outages.',
      techStack: ['TypeScript', 'Node.js', 'PostgreSQL', 'BullMQ', 'Docker'],
      repoUrl: 'https://github.com/faizanfarooq-dev/b2b-offline-sync',
      architectureHighlights: [
        'Vector clocks for resolving offline order updates without data collision',
        'Optimized SQL queries reducing database locks during bulk morning checkouts',
        'Deployed with Docker Compose and automated health check alarms'
      ],
      complexityScore: 92,
      aiVerified: true,
      aiVerificationDate: '2026-08-20',
      codeMetrics: {
        linesOfCode: 2940,
        testCoverage: '91.2%',
        cicdConfigured: true,
        dockerized: true
      }
    }
  ]
};

export const STARTUPS: Startup[] = [
  {
    id: 'startup-finflow',
    name: 'FinFlow Pakistan',
    tagline: 'Next-generation instant payment rails & merchant checkout for Pakistani SMEs',
    logo: '💳',
    location: 'Gulberg III, Lahore, Pakistan',
    industry: 'FinTech & Banking Infrastructure',
    stage: 'Seed (Backed by Sarmayacar)',
    teamSize: '14 Engineers',
    founderName: 'Tariq Masood',
    founderRole: 'Founder & CTO',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    founderBio: 'Ex-Systems Ltd Senior Architect & FAST Alum. I never look at college transcripts or CGPAs. In real fintech outages, your git commit discipline and concurrency handling matter 100x more than university exams.',
    remotePolicy: 'Hybrid (Gulberg Lahore) or 100% Virtual PK'
  },
  {
    id: 'startup-khyber',
    name: 'KhyberLogix Systems',
    tagline: 'Healthcare diagnostic APIs & electronic medical records for Pakistani clinics',
    logo: '🏥',
    location: 'Blue Area, Islamabad, Pakistan',
    industry: 'HealthTech & Applied AI',
    stage: 'Series A ($1.8M Raised)',
    teamSize: '18 Engineers',
    founderName: 'Engr. Zainab Noor',
    founderRole: 'Co-Founder & VP of Engineering',
    founderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    founderBio: 'Former NUST faculty & HealthTech lead. We actively seek recent CS/IT grads who didn’t get absorbed by legacy corporate firms. If you write clean Python services, we pay top Pakistani milestone stipends in PKR.',
    remotePolicy: 'Virtual / Remote across Pakistan'
  },
  {
    id: 'startup-bazaarsync',
    name: 'BazaarSync B2B',
    tagline: 'Wholesale retail ordering & supply chain logistics platform for FMCG',
    logo: '📦',
    location: 'Shahrah-e-Faisal, Karachi, Pakistan',
    industry: 'E-Commerce & Supply Chain Tech',
    stage: 'Seed ($850K Raised)',
    teamSize: '11 Engineers',
    founderName: 'Daniyal Ahmed',
    founderRole: 'Co-Founder & Head of Product',
    founderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    founderBio: 'NED Karachi CS Alum. Our philosophy: give hungry graduates real-world code ownership on day one. We disburse guaranteed PKR milestone escrow directly to local Pakistani bank accounts.',
    remotePolicy: 'Hybrid (Karachi) / Remote PK'
  },
  {
    id: 'startup-arfacloud',
    name: 'ArfaCloud DevOps',
    tagline: 'Managed Kubernetes & automated CI/CD deployment pipelines for local software houses',
    logo: '☁️',
    location: 'Arfa Software Technology Park, Lahore, Pakistan',
    industry: 'DevOps & Cloud Infrastructure',
    stage: 'Bootstrapped & Profitable',
    teamSize: '9 Engineers',
    founderName: 'Usman Malik',
    founderRole: 'Principal Cloud Architect',
    founderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    founderBio: 'UET Lahore graduate. We specialize in turning theoretical CS concepts into cloud-native engineering. Zero GPA bias—we hire based purely on automated Docker & test suite audits.',
    remotePolicy: 'On-site Arfa Tower or Remote PK'
  },
  {
    id: 'startup-peshawarai',
    name: 'Peshawar AI Speech Labs',
    tagline: 'Urdu & regional Pashto speech recognition pipelines for tele-health centers',
    logo: '🎙️',
    location: 'University Town, Peshawar, Pakistan',
    industry: 'Applied AI & Voice NLP',
    stage: 'Grant-backed & Pre-Seed',
    teamSize: '8 Engineers',
    founderName: 'Dr. Shahbaz Khan',
    founderRole: 'Chief Scientist & Founder',
    founderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    founderBio: 'Peshawar University professor & AI researcher. Empowering graduates from KPK and northern Pakistan with high-value AI pipeline experience and transparent PKR milestone stipends.',
    remotePolicy: '100% Virtual / Remote Milestones'
  },
  {
    id: 'startup-indusagri',
    name: 'Indus AgriTech Solutions',
    tagline: 'IoT soil moisture telemetry and automated canal irrigation gateways',
    logo: '🌱',
    location: 'D-Ground, Faisalabad, Pakistan',
    industry: 'AgriTech & IoT Systems',
    stage: 'Seed ($500K Raised)',
    teamSize: '7 Engineers',
    founderName: 'Ayesha Farooq',
    founderRole: 'Founder & Managing Director',
    founderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    founderBio: 'Agriculture technology pioneer. We partner with CS/IT graduates from UAF, COMSATS, and NUST to digitize Pakistani farmland using modern Python/FastAPI microservices.',
    remotePolicy: 'Hybrid / Remote PK'
  }
];

export const INTERNSHIP_PROJECTS: InternshipProject[] = [
  {
    id: 'project-fin-01',
    startupId: 'startup-finflow',
    startup: STARTUPS[0],
    title: 'Full-Stack React/Node Developer - Raast Settlement Portal',
    track: 'CS Backend & Distributed Systems',
    summary: 'Build and deploy an automated reconciliation dashboard for Pakistani merchants processing instant State Bank of Pakistan Raast QR transactions.',
    objective: 'Engineer a secure Node.js service connecting to Bank 1Link/Raast sandbox endpoints, featuring real-time transaction webhook handling, idempotency checks, and a React merchant dashboard.',
    durationWeeks: 6,
    commitmentHours: '15-20 hrs/week (Flexible Milestones)',
    stipendTotal: 'PKR 55,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Tailwind CSS'],
    preferredSkills: ['Redis', 'Docker', 'State Bank Raast Specs'],
    graduatePriority: true,
    activeApplicantsCount: 12,
    spotsAvailable: 2,
    outcomeExperience: 'Shipped a mission-critical fintech settlement portal with direct mentorship from an ex-Systems Ltd Senior Architect. Full code audit verified on WorkNest with formal recommendation letter.',
    milestones: [
      {
        id: 'fin-ms-1',
        stepNumber: 1,
        title: 'Raast Webhook Ingestion & Idempotent Schema Design',
        description: 'Design the PostgreSQL ledger schema and implement HMAC SHA-256 webhook validation for instant Raast transaction notifications.',
        targetDuration: 'Weeks 1-2',
        payoutAmount: 'PKR 25,000',
        status: 'approved',
        deliverablesSummary: ['PostgreSQL Schema Migration scripts', 'HMAC Webhook verification middleware', 'Automated Postman test suite with 25 test cases'],
        submission: {
          prUrl: 'https://github.com/finflow-pk/merchant-portal/pull/8',
          demoUrl: 'https://loom.com/share/demo-raast-webhook-lahore',
          architectureNotes: 'Implemented distributed locks via Redis to eliminate race conditions during simultaneous 1Link payment retries.',
          submittedAt: '2026-09-08'
        },
        founderFeedback: {
          approved: true,
          rating: 5,
          comment: 'Fantastic work Hamza! Clean async handling for incoming webhooks. Your code passed all audit benchmarks without any security flags. Escrow stipend released to your bank account.',
          reviewedAt: '2026-09-10'
        }
      },
      {
        id: 'fin-ms-2',
        stepNumber: 2,
        title: 'React Merchant Settlement Dashboard & Export Engine',
        description: 'Develop responsive React analytics UI with transaction filtering, daily PKR revenue graphs, and CSV/PDF export for Pakistani tax filings.',
        targetDuration: 'Weeks 3-4',
        payoutAmount: 'PKR 30,000',
        status: 'in_progress',
        deliverablesSummary: ['React components with Tailwind', 'Date-range transaction filtering with server-side pagination', 'Zero memory leak test confirmation']
      }
    ]
  },
  {
    id: 'project-khy-02',
    startupId: 'startup-khyber',
    startup: STARTUPS[1],
    title: 'Python/Django Backend Developer - Clinical Records API',
    track: 'Backend Engineering & Cloud',
    summary: 'Develop RESTful electronic medical records microservices compliant with international FHIR specifications for private Pakistani hospitals.',
    objective: 'Build Django REST Framework endpoints for patient diagnostics, lab reports, and doctor scheduling with JWT authentication and audit logging.',
    durationWeeks: 6,
    commitmentHours: '15-20 hrs/week',
    stipendTotal: 'PKR 50,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['Python', 'Django REST Framework', 'PostgreSQL', 'Git', 'Unit Testing'],
    preferredSkills: ['Celery', 'Redis', 'Docker'],
    graduatePriority: true,
    activeApplicantsCount: 9,
    spotsAvailable: 2,
    outcomeExperience: 'Engineered clinical REST APIs under direct guidance of NUST faculty and VP of Engineering. Received high-praise testimonial on the Pakistan Wall of Fame.',
    milestones: [
      {
        id: 'khy-ms-1',
        stepNumber: 1,
        title: 'Patient EMR Model Schema & JWT RBAC Auth',
        description: 'Build role-based access control (Doctor, Receptionist, Lab Tech) with Django Guardian and JWT refresh token flows.',
        targetDuration: 'Weeks 1-3',
        payoutAmount: 'PKR 25,000',
        status: 'pending',
        deliverablesSummary: ['Django ORM models', 'Pytest test suite with 90%+ branch coverage', 'Swagger OpenAPI documentation']
      },
      {
        id: 'khy-ms-2',
        stepNumber: 2,
        title: 'Lab Report Ingestion & Background PDF Generator',
        description: 'Integrate Celery worker for asynchronous PDF report rendering with hospital QR codes for digital verification.',
        targetDuration: 'Weeks 4-6',
        payoutAmount: 'PKR 25,000',
        status: 'pending',
        deliverablesSummary: ['Celery background tasks', 'WeasyPrint PDF template', 'Docker Compose deployment config']
      }
    ]
  },
  {
    id: 'project-baz-03',
    startupId: 'startup-bazaarsync',
    startup: STARTUPS[2],
    title: 'Flutter Mobile App Developer - Retailer B2B Catalog',
    track: 'Mobile App Engineering',
    summary: 'Build cross-platform Flutter application for Karachi neighborhood grocery shopkeepers (kiryana stores) to order wholesale supplies.',
    objective: 'Implement an offline-capable mobile ordering app with Hive local caching, Urdu language localization, and push notifications for delivery dispatch.',
    durationWeeks: 5,
    commitmentHours: '15-18 hrs/week',
    stipendTotal: 'PKR 45,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['Flutter', 'Dart', 'State Management (Bloc/Provider)', 'REST APIs'],
    preferredSkills: ['Hive/SQLite', 'Urdu Localization', 'FCM Push Notifications'],
    graduatePriority: true,
    activeApplicantsCount: 14,
    spotsAvailable: 3,
    outcomeExperience: 'Developed production-grade Flutter app used by 450+ retail merchants in Karachi. Real-world mobile app store contribution on your CV.',
    milestones: [
      {
        id: 'baz-ms-1',
        stepNumber: 1,
        title: 'B2B Wholesale Catalog & Offline Hive Sync',
        description: 'Create responsive catalog UI with category filtering, search bar, and local SQLite/Hive caching for low-connectivity markets.',
        targetDuration: 'Weeks 1-2',
        payoutAmount: 'PKR 20,000',
        status: 'pending',
        deliverablesSummary: ['Flutter project with Bloc state management', 'Offline catalog cache sync', 'Smooth 60fps scrolling list']
      },
      {
        id: 'baz-ms-2',
        stepNumber: 2,
        title: 'Urdu Localization & Cart Checkout Flow',
        description: 'Support dual English/Urdu interface toggle, bulk item quantity counters, and WhatsApp order invoice sharing.',
        targetDuration: 'Weeks 3-5',
        payoutAmount: 'PKR 25,000',
        status: 'pending',
        deliverablesSummary: ['Bilingual string assets', 'Cart state persistency', 'WhatsApp Business API intent trigger']
      }
    ]
  },
  {
    id: 'project-arfa-04',
    startupId: 'startup-arfacloud',
    startup: STARTUPS[3],
    title: 'SQA Engineer - Automated API & E2E Testing Suite',
    track: 'Software Quality & Automation',
    summary: 'Design automated regression testing pipelines using Cypress and Playwright for Lahore SaaS software houses.',
    objective: 'Write comprehensive automated integration test scripts covering user authentication, data billing, and load testing for microservices.',
    durationWeeks: 4,
    commitmentHours: '15 hrs/week',
    stipendTotal: 'PKR 40,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['Software Quality Assurance', 'JavaScript / TypeScript', 'Postman / Newman', 'Cypress or Playwright'],
    preferredSkills: ['GitHub Actions CI', 'JMeter Load Testing', 'SQL'],
    graduatePriority: true,
    activeApplicantsCount: 8,
    spotsAvailable: 2,
    outcomeExperience: 'Set up end-to-end testing pipeline at Arfa Software Technology Park. Built automated CI gates preventing critical production defects.',
    milestones: [
      {
        id: 'arfa-ms-1',
        stepNumber: 1,
        title: 'API Integration Test Suite & Newman CI Automation',
        description: 'Build 50+ automated REST API tests verifying edge error codes, rate limiting, and response payload schemas.',
        targetDuration: 'Weeks 1-2',
        payoutAmount: 'PKR 20,000',
        status: 'pending',
        deliverablesSummary: ['Postman/Newman collection repository', 'GitHub Actions workflow integration', 'Bug defect report']
      },
      {
        id: 'arfa-ms-2',
        stepNumber: 2,
        title: 'E2E Browser Automation & Performance Benchmark',
        description: 'Implement Playwright scripts for critical user checkout journeys and execute JMeter load test simulating 500 concurrent sessions.',
        targetDuration: 'Weeks 3-4',
        payoutAmount: 'PKR 20,000',
        status: 'pending',
        deliverablesSummary: ['Playwright test scripts', 'JMeter performance telemetry report', 'Final SQA verification sign-off']
      }
    ]
  },
  {
    id: 'project-pesh-05',
    startupId: 'startup-peshawarai',
    startup: STARTUPS[4],
    title: 'AI/ML Pipelines Intern - Urdu Speech Data Processing',
    track: 'AI & Data Engineering',
    summary: 'Build preprocessing and tokenization pipelines for fine-tuning open-source Whisper speech models on Pakistani regional dialects.',
    objective: 'Construct automated audio cleaning, silence removal, and phoneme alignment pipelines in Python for clinical transcription.',
    durationWeeks: 6,
    commitmentHours: '18-20 hrs/week',
    stipendTotal: 'PKR 65,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['Python', 'PyTorch / HuggingFace', 'NumPy / Pandas', 'Audio Processing (Librosa)'],
    preferredSkills: ['Whisper ASR', 'Docker', 'Linux / Bash scripting'],
    graduatePriority: true,
    activeApplicantsCount: 16,
    spotsAvailable: 1,
    outcomeExperience: 'Contributed directly to cutting-edge regional AI models in Peshawar. Co-author status on open-source model release and high-paying AI credentials.',
    milestones: [
      {
        id: 'pesh-ms-1',
        stepNumber: 1,
        title: 'Audio Pipeline Cleanser & Dataset Chunking',
        description: 'Process 200 hours of Urdu voice recordings, removing background noise and aligning text transcripts.',
        targetDuration: 'Weeks 1-3',
        payoutAmount: 'PKR 30,000',
        status: 'pending',
        deliverablesSummary: ['Librosa data pipeline', 'HuggingFace Dataset format export', 'Data validation metrics summary']
      },
      {
        id: 'pesh-ms-2',
        stepNumber: 2,
        title: 'Whisper Fine-Tuning & Evaluation Harness',
        description: 'Run parameter-efficient LoRA fine-tuning on regional Urdu dialect test sets, recording Word Error Rate (WER).',
        targetDuration: 'Weeks 4-6',
        payoutAmount: 'PKR 35,000',
        status: 'pending',
        deliverablesSummary: ['Model checkpoints repository', 'WER benchmark report', 'FastAPI real-time inference endpoint']
      }
    ]
  },
  {
    id: 'project-ind-06',
    startupId: 'startup-indusagri',
    startup: STARTUPS[5],
    title: 'IoT FastAPI Backend Intern - Crop Moisture Telemetry',
    track: 'IoT & Embedded Cloud',
    summary: 'Build high-performance telemetry ingestion server receiving sensor data from smart agricultural probes across Faisalabad & Punjab.',
    objective: 'Implement an asynchronous FastAPI service collecting temperature, soil moisture, and canal flow data with automated alert triggers.',
    durationWeeks: 4,
    commitmentHours: '15 hrs/week',
    stipendTotal: 'PKR 35,000',
    stipendModel: 'Milestone-based Escrow in PKR',
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL / TimescaleDB', 'MQTT basics'],
    preferredSkills: ['Redis', 'SMS Gateway Integration', 'Docker'],
    graduatePriority: true,
    activeApplicantsCount: 6,
    spotsAvailable: 2,
    outcomeExperience: 'Connected real hardware telemetry to modern cloud backends for Punjab agriculture. Tangible production impact on Pakistani food security.',
    milestones: [
      {
        id: 'ind-ms-1',
        stepNumber: 1,
        title: 'MQTT & HTTP Sensor Telemetry Ingestion Engine',
        description: 'Develop FastAPI endpoints capable of handling 2,000 sensor telemetry packets per minute with TimescaleDB time-series indexing.',
        targetDuration: 'Weeks 1-2',
        payoutAmount: 'PKR 15,000',
        status: 'pending',
        deliverablesSummary: ['FastAPI ingestion service', 'TimescaleDB hypertable setup', 'Simulated sensor packet generator']
      },
      {
        id: 'ind-ms-2',
        stepNumber: 2,
        title: 'Alerting Rules Engine & Twilio/Telenor SMS Integration',
        description: 'Implement automated rule triggers notifying farmers via SMS when canal water drops below critical thresholds.',
        targetDuration: 'Weeks 3-4',
        payoutAmount: 'PKR 20,000',
        status: 'pending',
        deliverablesSummary: ['Rule evaluation background worker', 'Local SMS gateway webhook', 'Production staging deployment']
      }
    ]
  }
];

export const MICRO_TASKS: MicroTask[] = [
  {
    id: 'mt-01',
    title: 'Fix Redis Connection Leak in FastAPI Raast Ingestion Worker',
    startupName: 'FinFlow Pakistan (Gulberg, Lahore)',
    startupLogo: '💳',
    category: 'Backend Optimization',
    durationDays: 2,
    payoutPkr: 8000,
    payoutUsd: 29,
    difficulty: 'Intermediate',
    techStack: ['Python', 'FastAPI', 'Redis', 'Docker'],
    deliverable: 'Refactor async connection pool lifecycle in lifespan handler, verify with 1,000 requests.',
    spotsLeft: 1,
    status: 'open'
  },
  {
    id: 'mt-02',
    title: 'Urdu I18n Toggle & Nastaliq Font Rendering for React Dashboard',
    startupName: 'BazaarSync B2B (Karachi)',
    startupLogo: '📦',
    category: 'Frontend UI/UX',
    durationDays: 3,
    payoutPkr: 10000,
    payoutUsd: 36,
    difficulty: 'Beginner',
    techStack: ['React', 'Tailwind CSS', 'i18next', 'Typography'],
    deliverable: 'Add Urdu language toggle with RTL support and Jameel Noori Nastaliq CSS typography.',
    spotsLeft: 2,
    status: 'open'
  },
  {
    id: 'mt-03',
    title: 'Containerize Celery Worker with Redis Sentinel Health Alarms',
    startupName: 'KhyberLogix Systems (Islamabad)',
    startupLogo: '🏥',
    category: 'DevOps & Reliability',
    durationDays: 3,
    payoutPkr: 12000,
    payoutUsd: 43,
    difficulty: 'Advanced',
    techStack: ['Docker', 'Celery', 'Redis Sentinel', 'Bash'],
    deliverable: 'Production Dockerfile + docker-compose with automated failover healthcheck script.',
    spotsLeft: 1,
    status: 'open'
  },
  {
    id: 'mt-04',
    title: 'Postman Newman Automated Test Suite for 1Link Sandbox QR API',
    startupName: 'ArfaCloud DevOps (Lahore)',
    startupLogo: '☁️',
    category: 'QA Automation',
    durationDays: 2,
    payoutPkr: 7500,
    payoutUsd: 27,
    difficulty: 'Beginner',
    techStack: ['Postman', 'Newman', 'Node.js', 'CI/CD'],
    deliverable: 'JSON test collection with 30 assertions for payment edge cases and schema validation.',
    spotsLeft: 3,
    status: 'open'
  },
  {
    id: 'mt-05',
    title: 'Build Telemetry Hypertable & TimescaleDB Retention Policy',
    startupName: 'Indus AgriTech (Faisalabad)',
    startupLogo: '🌱',
    category: 'Database Architecture',
    durationDays: 3,
    payoutPkr: 11000,
    payoutUsd: 40,
    difficulty: 'Intermediate',
    techStack: ['PostgreSQL', 'TimescaleDB', 'SQL'],
    deliverable: 'Migration scripts setting up daily hypertable chunks and 90-day automated compression.',
    spotsLeft: 2,
    status: 'open'
  },
  {
    id: 'mt-06',
    title: 'Next.js 15 Server Actions with Postgres Full-Text Search',
    startupName: 'Peshawar AI Speech Labs',
    startupLogo: '🎙️',
    category: 'Full-Stack Modern Web',
    durationDays: 3,
    payoutPkr: 14000,
    payoutUsd: 50,
    difficulty: 'Advanced',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind'],
    deliverable: 'Server action query pipeline with debounced instant search and Urdu stemming query.',
    spotsLeft: 1,
    status: 'open'
  }
];

export const GLOBAL_REMOTE_JOBS: RemoteJob[] = [
  {
    id: 'rj-01',
    title: 'Junior Full-Stack Developer (Next.js & Node.js)',
    companyName: 'HyperMatrix Cloud (San Francisco / Remote)',
    companyCountry: 'US',
    companyLogo: '⚡',
    salaryUsdMonthly: 1600,
    salaryPkrEquivalent: 444800,
    techStack: ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    workType: 'Async-First Remote',
    timezoneRequirement: '3-4 hours EST overlap (5 PM - 9 PM PKT)',
    experienceLevel: 'Entry-Level / Fresh Graduate',
    featured: true,
    applicantsCount: 18,
    description: 'HyperMatrix builds AI infrastructure telemetry tools. We actively recruit talented Pakistani CS graduates who prove their coding discipline through verified GitHub repos and automated AST audits.',
    requirements: [
      'Strong proficiency in TypeScript and modern React hooks',
      'Solid grasp of SQL indexing and REST/GraphQL API design',
      'Excellent written English for asynchronous Slack/Linear updates',
      'No US visa needed: 100% remote contractor via W-8BEN (1% PSEB tax regime in Pakistan)'
    ],
    hiringManager: 'Alex Chen (VP of Engineering)'
  },
  {
    id: 'rj-02',
    title: 'Junior Python / FastAPI Cloud Engineer',
    companyName: 'NordicDev FinTech (Stockholm / Remote)',
    companyCountry: 'EU',
    companyLogo: '❄️',
    salaryUsdMonthly: 1850,
    salaryPkrEquivalent: 514300,
    techStack: ['Python', 'FastAPI', 'Redis', 'PostgreSQL', 'Docker'],
    workType: '100% Remote',
    timezoneRequirement: 'CET/GMT overlap (1 PM - 7 PM PKT)',
    experienceLevel: 'Entry-Level / Fresh Graduate',
    featured: true,
    applicantsCount: 24,
    description: 'European banking integration specialist. We value raw algorithmic fundamentals and concurrency management over degree credentials or past years of experience.',
    requirements: [
      'Hands-on experience with FastAPI, Pydantic v2, and async Python',
      'Understanding of idempotent webhooks and race-condition prevention',
      'Familiarity with Git branching and Dockerized microservices'
    ],
    hiringManager: 'Freja Lindqvist (Head of Backend Systems)'
  },
  {
    id: 'rj-03',
    title: 'Junior Mobile Application Developer (Flutter & Dart)',
    companyName: 'CloudScale Gulf Solutions (Dubai, UAE / Remote)',
    companyCountry: 'UAE / Gulf',
    companyLogo: '🌴',
    salaryUsdMonthly: 1400,
    salaryPkrEquivalent: 389200,
    techStack: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
    workType: '100% Remote',
    timezoneRequirement: 'GST overlap (1 hour time difference with PKT)',
    experienceLevel: 'Entry-Level / Fresh Graduate',
    featured: false,
    applicantsCount: 15,
    description: 'Rapidly growing GCC logistics platform. Near-zero timezone difference with Pakistan makes Pakistani engineers our top recruitment priority.',
    requirements: [
      'Clean state management (Bloc, Riverpod, or Provider)',
      'Experience with offline data caching and push notifications',
      'Smooth 60fps animations and responsive mobile layouts'
    ],
    hiringManager: 'Kareem Mansoor (CTO)'
  },
  {
    id: 'rj-04',
    title: 'Junior DevOps & CI/CD Platform Associate',
    companyName: 'Veloce Systems UK (London / Remote)',
    companyCountry: 'UK',
    companyLogo: '🇬🇧',
    salaryUsdMonthly: 1500,
    salaryPkrEquivalent: 417000,
    techStack: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Linux'],
    workType: 'Async-First Remote',
    timezoneRequirement: 'GMT overlap (4 hours behind PKT)',
    experienceLevel: 'Junior (0-1 yrs)',
    featured: false,
    applicantsCount: 11,
    description: 'Automate build and deployment pipelines for UK e-commerce businesses. Perfect role for Pakistani graduates with strong Linux command line and cloud container skills.',
    requirements: [
      'Writing multi-stage production Dockerfiles',
      'Configuring automated GitHub Actions CI/CD matrix tests',
      'Basic knowledge of AWS or DigitalOcean droplet architectures'
    ],
    hiringManager: 'David Sterling (DevOps Principal)'
  },
  {
    id: 'rj-05',
    title: 'Junior AI/LLM Data Pipeline Associate',
    companyName: 'Cortex Labs (Toronto / Remote)',
    companyCountry: 'Canada',
    companyLogo: '🍁',
    salaryUsdMonthly: 1700,
    salaryPkrEquivalent: 472600,
    techStack: ['Python', 'LangChain', 'LlamaIndex', 'PostgreSQL pgvector'],
    workType: 'Async-First Remote',
    timezoneRequirement: 'Flexible Async (2 hrs weekly sync)',
    experienceLevel: 'Entry-Level / Fresh Graduate',
    featured: true,
    applicantsCount: 31,
    description: 'Build Retrieval-Augmented Generation (RAG) pipelines and vector search indexing. We test candidates purely through code evaluation challenges.',
    requirements: [
      'Experience with embeddings and chunking strategies',
      'Comfortable writing evaluation benchmarks and regression tests',
      'Proactive asynchronous communication and documentation skills'
    ],
    hiringManager: 'Elena Rostova (Lead AI Architect)'
  }
];

export const REMOTE_READINESS_METRICS: RemoteReadinessScore = {
  overallScore: 92,
  timezoneCompatibilityScore: 95,
  asyncCommScore: 90,
  englishTechFluencyScore: 94,
  gitCicdScore: 89,
  readyStatus: 'Global Remote Ready'
};

export const MOBILE_ALERTS: MobileAlert[] = [
  {
    id: 'alert-01',
    telco: 'Jazz',
    sender: 'JazzCash-Alert',
    message: 'Dear Customer, Rs. 25,000.00 received in your account from FinFlow Escrow (Ref: MS1-RAAST-902). Your balance is Rs. 58,400. Tax deducted under SBP PSEB IT regime: Rs. 0.',
    timestamp: 'Yesterday, 02:45 PM',
    type: 'escrow_deposit'
  },
  {
    id: 'alert-02',
    telco: 'Zong',
    sender: 'WorkNest-Alert',
    message: 'WorkNest Ajao: Technical Interview scheduled with Tariq Masood (CTO FinFlow) for Sep 23 at 04:00 PM PKT. Google Meet link: meet.google.com/wfa-lahore-finflow',
    timestamp: 'Today, 10:15 AM',
    type: 'interview_scheduled'
  },
  {
    id: 'alert-03',
    telco: 'WhatsApp',
    sender: 'WorkNest Ajao WhatsApp',
    message: '🎉 Congratulations Faizan! Your Raast Webhook repository passed the AI Code Quality Audit with a 96% Reliability Score! 3 international recruiters from US & UAE have viewed your profile.',
    timestamp: 'Today, 11:30 AM',
    type: 'code_verified'
  },
  {
    id: 'alert-04',
    telco: 'Telenor',
    sender: 'WorkNest-Alert',
    message: 'HyperMatrix Cloud (US) has viewed your verified Proof-of-Work portfolio and extended an invitation to apply for their Junior Full-Stack Remote role ($1,600/month).',
    timestamp: 'Today, 01:10 PM',
    type: 'remote_offer'
  }
];

export const PAKISTAN_TESTIMONIALS: ReviewTestimonial[] = [
  {
    id: 'rev-00-faizan',
    type: 'graduate',
    name: 'Muhammad Faizan Farooq',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Junior Full-Stack Engineer',
    university: 'FAST-NUCES Lahore (CS \'25)',
    originalGpa: '2.40 CGPA',
    location: 'Lahore (Johar Town / Gulberg)',
    companyName: 'FinFlow Pakistan & HyperMatrix US',
    companyCategory: 'FinTech & Global Remote Web',
    stipendEarnedPkr: 'Rs. 55,000 Milestone + $1,600/mo Remote Offer',
    projectCompleted: 'Raast Webhook & React Settlement Dashboard',
    hiredOutcome: 'Transitioned to Global Remote Full-Stack Dev ($1,600/mo)',
    rating: 5,
    testimonialQuote: 'Having a 2.4 CGPA felt like an insurmountable wall in Lahore when applying through standard corporate job portals. WorkNest Ajao’s AI skill auditor verified my full-stack repository with a 96% reliability score. I delivered the Raast settlement milestone in 3 weeks, was paid Rs. 55,000 on time into my HBL account, and leveraged that verified credential to unlock an interview for a $1,600/month remote role with a US team!',
    verifiedTechBadges: ['React & Next.js', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker'],
    date: 'Featured Graduate'
  },
  {
    id: 'rev-01',
    type: 'graduate',
    name: 'Hamza Sheikh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Junior Backend Engineer',
    university: 'FAST-NUCES Lahore (CS \'24)',
    originalGpa: '2.34 CGPA',
    location: 'Lahore (Johar Town)',
    companyName: 'FinFlow Pakistan / Devsinc Partner',
    companyCategory: 'Fintech Startup Squad',
    stipendEarnedPkr: 'Rs. 55,000 in Milestones',
    projectCompleted: 'Raast Webhook Ingestion Engine',
    hiredOutcome: 'Offered Full-Time at Rs. 145,000/mo',
    rating: 5,
    testimonialQuote: 'Graduated from FAST with a 2.34 CGPA and spent 4 months getting rejected by automated filters at every major software house in Lahore. WorkNest Ajao gave me a shot based on my GitHub code. I finished the Raast payment integration milestone in 3 weeks, earned Rs. 55,000 in escrow, and the CTO hired me full-time before the internship even concluded.',
    verifiedTechBadges: ['Python FastAPI', 'Redis Streams', 'PostgreSQL', 'Docker'],
    date: '2 weeks ago'
  },
  {
    id: 'rev-02',
    type: 'founder',
    name: 'Tariq Masood',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Founder & CTO',
    location: 'Gulberg III, Lahore',
    companyName: 'FinFlow Pakistan',
    companyCategory: 'Fintech Payments Platform',
    projectCompleted: 'Merchant QR Reconciliation Service',
    hiredOutcome: 'Hired 4 WorkNest Fresh Graduates',
    rating: 5,
    testimonialQuote: 'We used to filter by 3.5+ GPA candidates from top universities. Half of them could not write a basic SQL query or resolve a git merge conflict. Through WorkNest Ajao, we hired 4 fresh grads who had 2.2 to 2.6 GPAs—their code audit scores were in the 90s, and they shipped our core Raast microservice with zero regressions.',
    verifiedTechBadges: ['Zero GPA Bias', 'Escrow Paid', 'Production Hires'],
    date: '3 weeks ago'
  },
  {
    id: 'rev-03',
    type: 'graduate',
    name: 'Fatima Zahra',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Healthcare Cloud Developer',
    university: 'NUST Islamabad (SE \'25)',
    originalGpa: '2.55 CGPA',
    location: 'Islamabad (Blue Area)',
    companyName: 'KhyberLogix Systems',
    companyCategory: 'HealthTech Systems',
    stipendEarnedPkr: 'Rs. 50,000 in Milestones',
    projectCompleted: 'Clinical Diagnostic REST APIs',
    hiredOutcome: 'Permanent Remote Offer',
    rating: 5,
    testimonialQuote: 'In Pakistan, if you are a woman fresh graduate without 2 years of prior experience, landing a technical development role is doubly hard. WorkNest Ajao’s AI verifier validated my Django unit test coverage and matched me with an Islamabad HealthTech startup. I was paid on time in PKR via direct bank transfer.',
    verifiedTechBadges: ['Django REST', 'PostgreSQL', 'Pytest', 'JWT Auth'],
    date: '1 month ago'
  },
  {
    id: 'rev-04',
    type: 'graduate',
    name: 'Zeeshan Qureshi',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Flutter Mobile App Engineer',
    university: 'NED University Karachi (IT \'24)',
    originalGpa: '2.40 CGPA',
    location: 'Karachi (Shahrah-e-Faisal)',
    companyName: 'BazaarSync B2B',
    companyCategory: 'Wholesale Commerce',
    stipendEarnedPkr: 'Rs. 45,000 in Milestones',
    projectCompleted: 'Retailer Offline Ordering App',
    hiredOutcome: 'Promoted to Mobile Lead',
    rating: 5,
    testimonialQuote: 'Most internship platforms offer unpaid coffee-fetcher roles. WorkNest Ajao was the first platform where the contract explicitly guaranteed Rs. 45,000 in escrow for delivering real Flutter code. Today that app is used by hundreds of grocery stores across Karachi.',
    verifiedTechBadges: ['Flutter', 'Hive Caching', 'Urdu I18n', 'Bloc State'],
    date: '1 month ago'
  },
  {
    id: 'rev-05',
    type: 'founder',
    name: 'Haris Farooq',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'VP of Engineering',
    location: 'Shahrah-e-Faisal, Karachi',
    companyName: 'Systems Ltd Partner Incubator',
    companyCategory: 'Enterprise Software Hub',
    projectCompleted: 'Cloud Migration & Automation',
    hiredOutcome: '100% Milestone Completion',
    rating: 5,
    testimonialQuote: 'The post-graduation unemployment paradox in Pakistan is heartbreaking—thousands of smart IT kids are sitting idle because job postings demand 3 years of experience for junior jobs. WorkNest Ajao bridges that chasm with milestone contracts that protect both the startup and the fresh graduate.',
    verifiedTechBadges: ['Mentorship First', 'Fair PKR Pay', 'Verified Code'],
    date: '2 months ago'
  },
  {
    id: 'rev-06',
    type: 'graduate',
    name: 'Asad Ullah',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps & SQA Specialist',
    university: 'UET Lahore (CS \'24)',
    originalGpa: '2.62 CGPA',
    location: 'Lahore (Arfa Tower)',
    companyName: 'ArfaCloud DevOps',
    companyCategory: 'Cloud Infra Hub',
    stipendEarnedPkr: 'Rs. 40,000 in Milestones',
    projectCompleted: 'Automated Postman/Newman CI Pipeline',
    hiredOutcome: 'Full-time Cloud Ops Engineer',
    rating: 5,
    testimonialQuote: 'I graduated from UET with a decent final year project, but HR reps at campus job fairs immediately set aside any resume under a 3.0 GPA. On WorkNest Ajao, my Docker scripts were audited by AI in 60 seconds and scored 92/100. Usman Bhai at Arfa Tower called me the next day.',
    verifiedTechBadges: ['Docker', 'Newman', 'GitHub Actions', 'Linux Bash'],
    date: '2 months ago'
  },
  {
    id: 'rev-07',
    type: 'graduate',
    name: 'Maryam Rauf',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Urdu Speech NLP Intern',
    university: 'COMSATS Islamabad (CS \'25)',
    originalGpa: '2.71 CGPA',
    location: 'Islamabad / Peshawar',
    companyName: 'Peshawar AI Speech Labs',
    companyCategory: 'Applied AI Hub',
    stipendEarnedPkr: 'Rs. 65,000 in Milestones',
    projectCompleted: 'Whisper Audio Dialect Preprocessing',
    hiredOutcome: 'Accepted to Sponsored AI M.S.',
    rating: 5,
    testimonialQuote: 'WorkNest Ajao connected me with real researchers in Peshawar working on Urdu voice transcription. I earned Rs. 65,000 across 2 milestones and used the verified PDF certificate on my LinkedIn, which got me noticed by international AI researchers.',
    verifiedTechBadges: ['PyTorch', 'HuggingFace', 'Whisper ASR', 'Python'],
    date: '3 months ago'
  },
  {
    id: 'rev-08',
    type: 'founder',
    name: 'Engr. Zainab Noor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'VP of Engineering',
    location: 'Blue Area, Islamabad',
    companyName: 'KhyberLogix Systems',
    companyCategory: 'HealthTech Platform',
    projectCompleted: 'FastAPI Microservice Migration',
    hiredOutcome: 'Converted 3 Interns',
    rating: 5,
    testimonialQuote: 'The quality of code submitted by graduates on WorkNest Ajao is higher than what we see from senior applicants on traditional job boards, because the AI verifier filters out copy-pasted resumes. We are proud to support Pakistani tech youth with fair PKR milestone pay.',
    verifiedTechBadges: ['Verified PRs', 'PKT Standard Time', 'Top Talent'],
    date: '3 months ago'
  }
];

export const CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-finflow',
    startupId: 'startup-finflow',
    startupName: 'FinFlow Pakistan',
    founderName: 'Tariq Masood (CTO)',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    projectId: 'project-fin-01',
    projectTitle: 'Raast Settlement Portal (Gulberg III, Lahore)',
    lastMessageText: 'The HMAC signature verification looks rock solid Faizan. Milestone 1 Rs. 25,000 escrow is disbursed!',
    lastMessageTimestamp: '10:45 AM',
    unreadCount: 0
  },
  {
    id: 'thread-hypermatrix',
    startupId: 'startup-hypermatrix',
    startupName: 'HyperMatrix Cloud (San Francisco / Remote)',
    founderName: 'Alex Chen (VP Eng)',
    founderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    projectId: 'rj-01',
    projectTitle: 'Junior Full-Stack Dev ($1,600/mo Remote)',
    lastMessageText: 'Hi Faizan, loved your Next.js & Raast webhook architecture. When can we do a 20-min async sync over Meet?',
    lastMessageTimestamp: 'Today 01:15 PM',
    unreadCount: 1
  },
  {
    id: 'thread-khyber',
    startupId: 'startup-khyber',
    startupName: 'KhyberLogix Systems',
    founderName: 'Engr. Zainab Noor (VP Eng)',
    founderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    projectId: 'project-khy-02',
    projectTitle: 'Clinical Records API (Blue Area, Islamabad)',
    lastMessageText: 'Can you hop on a quick Google Meet at 3:30 PM PKT to review the Celery background worker setup?',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 1
  },
  {
    id: 'thread-bazaarsync',
    startupId: 'startup-bazaarsync',
    startupName: 'BazaarSync B2B',
    founderName: 'Daniyal Ahmed',
    founderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    projectId: 'project-baz-03',
    projectTitle: 'Flutter Retailer App (Shahrah-e-Faisal, Karachi)',
    lastMessageText: 'Checked your offline Hive sync branch. The vector clock reconciliation works smoothly.',
    lastMessageTimestamp: 'Sep 18',
    unreadCount: 0
  }
];

export const CHAT_MESSAGES_MAP: Record<string, ChatMessage[]> = {
  'thread-finflow': [
    {
      id: 'msg-ff-1',
      threadId: 'thread-finflow',
      senderId: 'founder-tariq',
      senderName: 'Tariq Masood (CTO)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Salam Faizan! I saw your WorkNest AI verified submission for the Raast webhook ingestion service. Great to see FAST graduates getting straight into high-concurrency systems.',
      timestamp: 'Sep 08, 10:14 AM'
    },
    {
      id: 'msg-ff-2',
      threadId: 'thread-finflow',
      senderId: 'cand-faizan-farooq',
      senderName: 'Muhammad Faizan Farooq',
      senderRole: 'candidate',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Walaikum Assalam Tariq Bhai! Thank you. I implemented Redis distributed locks to prevent double-spending when 1Link retries instant payment notifications under heavy load.',
      timestamp: 'Sep 08, 10:20 AM',
      codeSnippet: {
        language: 'python',
        code: `@router.post("/v1/raast/webhook")
async def handle_raast_notification(
    payload: RaastPayload,
    x_signature: str = Header(...)
):
    # Verify HMAC SHA-256 against State Bank specs
    if not verify_hmac(payload.raw_bytes, x_signature, SECRET_KEY):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Acquire Redis distributed lock for 30 seconds
    lock_key = f"lock:raast:{payload.transaction_reference}"
    async with redis.lock(lock_key, timeout=30):
        return await process_idempotent_payment(payload)`
      }
    },
    {
      id: 'msg-ff-3',
      threadId: 'thread-finflow',
      senderId: 'founder-tariq',
      senderName: 'Tariq Masood (CTO)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'The HMAC signature verification looks rock solid Faizan. Milestone 1 Rs. 25,000 escrow is disbursed! Let us start on Milestone 2 React dashboard.',
      timestamp: '10:45 AM'
    }
  ],
  'thread-hypermatrix': [
    {
      id: 'msg-hm-1',
      threadId: 'thread-hypermatrix',
      senderId: 'founder-alex',
      senderName: 'Alex Chen (VP Eng)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: 'Hi Faizan, our tech team reviewed your AST Code Audit and GitHub repos for the Raast payment gateway. We are impressed by your async Redis locking logic. We have a Junior Full-Stack Remote role open at $1,600/month (approx PKR 444,000). Are you available for a 20-min intro chat this week?',
      timestamp: 'Today, 01:10 PM'
    },
    {
      id: 'msg-hm-2',
      threadId: 'thread-hypermatrix',
      senderId: 'cand-faizan-farooq',
      senderName: 'Muhammad Faizan Farooq',
      senderRole: 'candidate',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Hello Alex! Thank you so much for reaching out. Yes, absolutely! I am based in Lahore, Pakistan (PKT, UTC+5) and I have complete 4-hour daily overlap with US Eastern Standard Time (5 PM - 9 PM PKT). My W-8BEN and PSEB tax documentation are already verified in the Document Vault.',
      timestamp: 'Today, 01:14 PM'
    },
    {
      id: 'msg-hm-3',
      threadId: 'thread-hypermatrix',
      senderId: 'founder-alex',
      senderName: 'Alex Chen (VP Eng)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: 'That is awesome! Let us schedule via the WorkNest PKT scheduler for tomorrow at 6:00 PM PKT (9:00 AM EST). Excited to speak with you!',
      timestamp: 'Today, 01:15 PM'
    }
  ],
  'thread-khyber': [
    {
      id: 'msg-kh-1',
      threadId: 'thread-khyber',
      senderId: 'founder-zainab',
      senderName: 'Engr. Zainab Noor (VP Eng)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      text: 'Hi Faizan, we are impressed by your portfolio projects. We need someone who can work on clinical diagnostics microservices in Islamabad.',
      timestamp: 'Sep 17, 02:15 PM'
    },
    {
      id: 'msg-kh-2',
      threadId: 'thread-khyber',
      senderId: 'founder-zainab',
      senderName: 'Engr. Zainab Noor (VP Eng)',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      text: 'Can you hop on a quick Google Meet at 3:30 PM PKT to review the Celery background worker setup?',
      timestamp: 'Yesterday, 04:30 PM'
    }
  ],
  'thread-bazaarsync': [
    {
      id: 'msg-bz-1',
      threadId: 'thread-bazaarsync',
      senderId: 'founder-daniyal',
      senderName: 'Daniyal Ahmed',
      senderRole: 'founder',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      text: 'Salam! Checked your offline Hive sync branch. The vector clock reconciliation works smoothly for Karachi merchants.',
      timestamp: 'Sep 18, 11:00 AM'
    }
  ]
};

export const DOCUMENT_PORTAL_ITEMS: DocumentPortalItem[] = [
  {
    id: 'doc-secp-01',
    title: 'SECP Virtual Internship Agreement - FinFlow Pakistan',
    type: 'internship_contract',
    startupName: 'FinFlow Pakistan (Gulberg, Lahore)',
    fileSize: '412 KB',
    uploadedDate: '2026-09-01',
    status: 'signed_by_both',
    confidentiality: 'Mutual Agreement',
    hashDigest: 'sha256-9a4f7e2b810c9d3e5b6a718290f1e2d3c4b5a697880e123456789abcdef01234'
  },
  {
    id: 'doc-nda-02',
    title: 'Mutual Non-Disclosure Agreement (Fintech Banking IP & Raast Rails)',
    type: 'nda',
    startupName: 'FinFlow Pakistan (Gulberg, Lahore)',
    fileSize: '298 KB',
    uploadedDate: '2026-09-02',
    status: 'signed_by_both',
    confidentiality: 'Confidential Startup IP',
    hashDigest: 'sha256-7c3d1e9b284a6f0e5d4c3b2a10987654321fedcba9876543210abcdef9876543'
  },
  {
    id: 'doc-ms1-cert-03',
    title: 'Milestone 1 Verified Sign-Off & Escrow Disbursal (PKR 25,000)',
    type: 'experience_verification',
    startupName: 'FinFlow Pakistan (Gulberg, Lahore)',
    fileSize: '520 KB',
    uploadedDate: '2026-09-10',
    status: 'verified_issued',
    confidentiality: 'Public Verifiable Credential',
    hashDigest: 'sha256-3b9e4a1c7d2f8e0b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a'
  },
  {
    id: 'doc-spec-04',
    title: 'Milestone 2 Specification: React Merchant Dashboard & Tax Export',
    type: 'milestone_spec',
    startupName: 'FinFlow Pakistan (Gulberg, Lahore)',
    fileSize: '345 KB',
    uploadedDate: '2026-09-12',
    status: 'awaiting_candidate_sign',
    confidentiality: 'Mutual Agreement',
    hashDigest: 'sha256-f8e7d6c5b4a3928170e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
  }
];

export const UPCOMING_INTERVIEWS: InterviewBooking[] = [
  {
    id: 'interview-01',
    startupId: 'startup-finflow',
    startupName: 'FinFlow Pakistan',
    founderName: 'Tariq Masood',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    projectTitle: 'Milestone 2 Architecture Review & Tax Filing APIs',
    date: 'Sep 23, 2026',
    time: '04:00 PM',
    timezone: 'PKT (Pakistan Standard Time, UTC+5)',
    durationMinutes: 30,
    platform: 'Google Meet',
    meetUrl: 'https://meet.google.com/wfa-lahore-finflow',
    agenda: 'Review frontend React state architecture, server-side pagination for transaction lists, and PDF report generation for Pakistani tax filers.',
    status: 'upcoming'
  },
  {
    id: 'interview-02',
    startupId: 'startup-khyber',
    startupName: 'KhyberLogix Systems',
    founderName: 'Engr. Zainab Noor',
    founderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    projectTitle: 'Clinical Diagnostic REST APIs Technical Discussion',
    date: 'Sep 24, 2026',
    time: '03:30 PM',
    timezone: 'PKT (Pakistan Standard Time, UTC+5)',
    durationMinutes: 45,
    platform: 'Google Meet',
    meetUrl: 'https://meet.google.com/wfa-isb-khyber',
    agenda: 'Technical walkthrough of Django REST Framework models, Celery worker orchestration, and hospital RBAC permissions.',
    status: 'upcoming'
  }
];

export const SAMPLE_PORTFOLIO_SUBMISSIONS = [
  {
    id: 'sample-fastapi-raast',
    title: 'Python FastAPI - Raast Idempotent Webhook Processor',
    language: 'python',
    snippet: `@router.post("/v1/payments/raast-webhook", status_code=200)
async def process_raast_webhook(
    request: Request,
    x_signature: str = Header(..., alias="X-SBP-Signature"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    Validates State Bank of Pakistan (SBP) Raast instant payment notification.
    Enforces idempotency using Redis distributed locks and atomic ledger writes.
    """
    raw_body = await request.body()
    
    # 1. Cryptographic HMAC verification against Raast public key
    if not verify_hmac_sha256(raw_body, x_signature, settings.RAAST_SECRET_KEY):
        logger.warning(f"Signature mismatch for Raast webhook: {x_signature}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid HMAC Signature")

    payload = json.loads(raw_body)
    tx_ref = payload.get("TransactionReference")
    
    # 2. Acquire Redis distributed lock for 45 seconds to prevent race condition
    lock_key = f"lock:raast:tx:{tx_ref}"
    async with redis_client.lock(lock_key, timeout=45, blocking_timeout=5):
        # 3. Check for existing ledger entry (Zero Double-Spend guarantee)
        existing = await db.execute(select(LedgerEntry).where(LedgerEntry.tx_reference == tx_ref))
        if existing.scalar_one_or_none():
            logger.info(f"Duplicate Raast notification received for tx {tx_ref}. Acknowledged safely.")
            return {"status": "SUCCESS", "message": "Already Reconciled"}

        # 4. Atomic balance increment & audit ledger commit
        entry = LedgerEntry(
            tx_reference=tx_ref,
            amount_pkr=Decimal(str(payload["Amount"])),
            sender_iban=payload["SenderIBAN"],
            status="SETTLED",
            settled_at=datetime.utcnow()
        )
        db.add(entry)
        await db.commit()

    return {"status": "SUCCESS", "tx_reference": tx_ref}`
  },
  {
    id: 'sample-node-ts',
    title: 'Node.js TypeScript - B2B Inventory Sync & Vector Clock',
    language: 'typescript',
    snippet: `export class InventorySyncService {
  constructor(
    private readonly dbPool: Pool,
    private readonly redisClient: Redis,
    private readonly eventQueue: BullMQ.Queue
  ) {}

  /**
   * Resolves concurrent offline updates from Karachi retail shopkeepers
   * using Lamport vector clocks and optimistic concurrency control.
   */
  async reconcileOfflineOrder(
    merchantId: string,
    orderPayload: OfflineOrderPayload,
    clientVectorClock: Record<string, number>
  ): Promise<ReconciliationResult> {
    const client = await this.dbPool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      // Fetch current server inventory version
      const { rows } = await client.query(
        'SELECT sku, available_qty, version FROM inventory WHERE merchant_id = $1 FOR UPDATE',
        [merchantId]
      );

      const conflicts: OrderConflict[] = [];
      for (const item of orderPayload.items) {
        const stock = rows.find(r => r.sku === item.sku);
        if (!stock || stock.available_qty < item.requestedQty) {
          conflicts.push({ sku: item.sku, available: stock?.available_qty ?? 0 });
        }
      }

      if (conflicts.length > 0) {
        await client.query('ROLLBACK');
        return { status: 'PARTIAL_STOCK_CONFLICT', conflicts };
      }

      // Deduct items atomically and update vector clocks
      for (const item of orderPayload.items) {
        await client.query(
          'UPDATE inventory SET available_qty = available_qty - $1, version = version + 1 WHERE sku = $2 AND merchant_id = $3',
          [item.requestedQty, item.sku, merchantId]
        );
      }

      await client.query('COMMIT');
      return { status: 'COMMITTED', orderId: orderPayload.orderId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}`
  },
  {
    id: 'sample-go-concurrency',
    title: 'Go (Golang) - Redis Sentinel Cache Invalidation Mesh',
    language: 'go',
    snippet: `package cachemesh

import (
	"context"
	"fmt"
	"sync"
	"time"
	"github.com/redis/go-redis/v9"
)

type EdgeCacheNode struct {
	mu          sync.RWMutex
	localStore  map[string][]byte
	sentinel    *redis.Client
	pubsub      *redis.PubSub
}

func (n *EdgeCacheNode) InvalidateOnNotification(ctx context.Context) {
	ch := n.pubsub.Channel()
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			n.mu.Lock()
			delete(n.localStore, msg.Payload)
			n.mu.Unlock()
		}
	}
}`
  }
];
