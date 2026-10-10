import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, type IUser } from './models/User.ts';
import { Internship, type IInternship } from './models/Internship.ts';
import { Application, type IApplication } from './models/Application.ts';
import { Message, type IMessage } from './models/Message.ts';

export interface IDbState {
  isMongooseConnected: boolean;
  users: any[];
  internships: any[];
  applications: any[];
  messages: any[];
}

export const state: IDbState = {
  isMongooseConnected: false,
  users: [],
  internships: [],
  applications: [],
  messages: [],
};

// Generates MongoDB-compatible 24-char hex ObjectIDs
export const generateObjectId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

const DEFAULT_MONGODB_URI = "mongodb+srv://wk2048_db_user:wk123456@cluster0.wray9yc.mongodb.net/worknest_ajao?retryWrites=true&w=majority";

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  // Prevent unhandled error events from crashing the process
  mongoose.connection.on('error', () => {
    // Suppress unhandled connection emitter warnings
  });

  try {
    console.log('[WorkNest DB] Connecting to live MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('[WorkNest DB] Live MongoDB Atlas cluster connected successfully!');
    state.isMongooseConnected = true;

    // Seed Atlas database if empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[WorkNest DB] Seeding initial data into live MongoDB Atlas...');
        await seedAtlasDatabase();
      }
    } catch {
      // Non-fatal if count/seed fails
    }
    return true;
  } catch (err: any) {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error
    }
    console.log('[WorkNest DB] Operating with high-performance In-Memory Mongoose Compatible Store.');
    state.isMongooseConnected = false;
    await seedDefaultData();
    return false;
  }
};

const getSeedData = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const faizanId = '66f5a1b2c3d4e5f6a7b8c901';
  const faizanUser = {
    _id: faizanId,
    name: 'Muhammad Faizan Farooq',
    email: 'faizanfarooq810@gmail.com',
    password: hashedPassword,
    role: 'candidate',
    phone: '+923004810928',
    city: 'Lahore',
    university: 'FAST-NUCES',
    gpa: 2.4,
    hideGpa: true,
    verifiedPortfolioScore: 92,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'Tailwind CSS', 'Docker'],
    wallet: {
      pkrBalance: 65000,
      usdBalance: 250,
    },
    createdAt: new Date('2026-08-15T10:00:00Z'),
  };

  const founder1Id = '66f5a1b2c3d4e5f6a7b8c902';
  const founder1 = {
    _id: founder1Id,
    name: 'Zubair Tariq',
    email: 'zubair@finflow.pk',
    password: hashedPassword,
    role: 'founder',
    phone: '+923214567890',
    city: 'Lahore',
    area: 'Johar Town',
    university: 'FAST-NUCES',
    startupName: 'FinFlow Pakistan',
    hideGpa: false,
    verifiedPortfolioScore: 98,
    skills: ['Fintech', 'Double-entry Accounting', 'Node.js', 'PostgreSQL'],
    wallet: { pkrBalance: 500000, usdBalance: 5000 },
    createdAt: new Date('2026-07-01T10:00:00Z'),
  };

  const founder2Id = '66f5a1b2c3d4e5f6a7b8c903';
  const founder2 = {
    _id: founder2Id,
    name: 'Dr. Ayesha Malik',
    email: 'ayesha@sehatcloud.io',
    password: hashedPassword,
    role: 'founder',
    phone: '+923334567891',
    city: 'Lahore',
    area: 'Gulberg III',
    university: 'NUST',
    startupName: 'SehatCloud HealthTech',
    hideGpa: false,
    verifiedPortfolioScore: 95,
    skills: ['HIPAA', 'FHIR API', 'Node.js', 'MongoDB', 'Microservices'],
    wallet: { pkrBalance: 750000, usdBalance: 8000 },
    createdAt: new Date('2026-07-10T10:00:00Z'),
  };

  const founder3Id = '66f5a1b2c3d4e5f6a7b8c904';
  const founder3 = {
    _id: founder3Id,
    name: 'Khurram Shahzad',
    email: 'khurram@vanguardapps.co',
    password: hashedPassword,
    role: 'founder',
    phone: '+923014567892',
    city: 'Lahore',
    area: 'Arfa Software Technology Park, Ferozepur Road',
    university: 'ITU',
    startupName: 'Vanguard Software Global',
    hideGpa: false,
    verifiedPortfolioScore: 99,
    skills: ['Cloud Architecture', 'AWS', 'Next.js', 'Distributed Systems'],
    wallet: { pkrBalance: 1200000, usdBalance: 15000 },
    createdAt: new Date('2026-06-20T10:00:00Z'),
  };

  const internship1Id = '66f5a1b2c3d4e5f6a7b8c911';
  const internship1 = {
    _id: internship1Id,
    title: 'Full-Stack Node.js & React Junior Engineer (Fintech Escrow Pipeline)',
    startupName: 'FinFlow Pakistan',
    founderId: founder1Id,
    city: 'Lahore',
    area: 'Johar Town',
    isRemoteUsd: false,
    stipendPkr: 55000,
    stipendUsd: 0,
    durationWeeks: 8,
    techStack: ['Node.js', 'React', 'MongoDB', 'Express', 'JWT'],
    type: 'Full Internship',
    description: 'Work with Lahore fintech engineering lead on idempotent settlement transaction vaults, webhooks, and sub-second payment reconciliations.',
    requirements: ['Solid JS/TS fundamentals', 'Understanding of REST principles', 'Portfolio project proof-of-work'],
    milestones: [
      {
        _id: '66f5a1b2c3d4e5f6a7b8c921',
        title: 'M1: Multi-tenant JWT Auth & User Permissions',
        percentage: 25,
        amountPkr: 13750,
        amountUsd: 0,
        status: 'Released',
        completedAt: new Date('2026-09-01T12:00:00Z'),
        receiptRef: 'WN-PK-TX-88210',
      },
      {
        _id: '66f5a1b2c3d4e5f6a7b8c922',
        title: 'M2: Double-entry Ledger Engine & Reconciliation API',
        percentage: 35,
        amountPkr: 19250,
        amountUsd: 0,
        status: 'In Progress',
      },
      {
        _id: '66f5a1b2c3d4e5f6a7b8c923',
        title: 'M3: JazzCash / Nayapay Webhook Integrations',
        percentage: 40,
        amountPkr: 22000,
        amountUsd: 0,
        status: 'Pending',
      },
    ],
    createdAt: new Date('2026-08-20T10:00:00Z'),
  };

  const internship2Id = '66f5a1b2c3d4e5f6a7b8c912';
  const internship2 = {
    _id: internship2Id,
    title: 'SaaS Backend Microservices & Health Data API Developer',
    startupName: 'SehatCloud HealthTech',
    founderId: founder2Id,
    city: 'Lahore',
    area: 'Gulberg III',
    isRemoteUsd: false,
    stipendPkr: 60000,
    stipendUsd: 0,
    durationWeeks: 6,
    techStack: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
    type: 'Full Internship',
    description: 'Develop distributed health telemetry pipelines and real-time appointment schedulers for Pakistani clinic networks.',
    requirements: ['Node.js/Express mastery', 'Experience with schema design in MongoDB', 'Clean modular architecture'],
    milestones: [
      {
        _id: '66f5a1b2c3d4e5f6a7b8c924',
        title: 'M1: Patient Health Record Data Vault',
        percentage: 40,
        amountPkr: 24000,
        amountUsd: 0,
        status: 'Released',
        completedAt: new Date('2026-09-10T15:00:00Z'),
        receiptRef: 'WN-PK-TX-88244',
      },
      {
        _id: '66f5a1b2c3d4e5f6a7b8c925',
        title: 'M2: Doctor Teleconsultation WebSocket Gateway',
        percentage: 60,
        amountPkr: 36000,
        amountUsd: 0,
        status: 'In Review',
      },
    ],
    createdAt: new Date('2026-08-25T11:00:00Z'),
  };

  const internship3Id = '66f5a1b2c3d4e5f6a7b8c913';
  const internship3 = {
    _id: internship3Id,
    title: '3-Day Micro-Task: Fix Slow MongoDB Aggregation & Indexing',
    startupName: 'FinFlow Pakistan',
    founderId: founder1Id,
    city: 'Lahore',
    area: 'Johar Town',
    isRemoteUsd: false,
    stipendPkr: 15000,
    stipendUsd: 0,
    durationWeeks: 1,
    techStack: ['MongoDB', 'Node.js', 'Query Optimization'],
    type: '3-Day Micro-Task',
    description: 'High-priority task to resolve a 4.2-second slow aggregation query on transaction search pipelines and implement compound indexes.',
    requirements: ['Knowledge of MongoDB aggregation pipelines', 'Index profiling knowledge', 'Proof of benchmark PR'],
    milestones: [
      {
        _id: '66f5a1b2c3d4e5f6a7b8c926',
        title: 'Index Optimization & Benchmark PR',
        percentage: 100,
        amountPkr: 15000,
        amountUsd: 0,
        status: 'In Progress',
      },
    ],
    createdAt: new Date('2026-09-15T09:00:00Z'),
  };

  const internship4Id = '66f5a1b2c3d4e5f6a7b8c914';
  const internship4 = {
    _id: internship4Id,
    title: 'Global Remote Junior Full-Stack Engineer (US Startup Pipeline)',
    startupName: 'Vanguard Software Global',
    founderId: founder3Id,
    city: 'Lahore',
    area: 'Arfa Software Technology Park, Ferozepur Road',
    isRemoteUsd: true,
    stipendPkr: 140000,
    stipendUsd: 500,
    durationWeeks: 12,
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind', 'Next.js'],
    type: 'Full Internship',
    description: 'Work with our Lahore-based US offshore delivery squad. Earn direct USD foreign remittances via Wise/Payoneer with PSEB 0.25% export tax compliance.',
    requirements: ['Fluent English communication for asynchronous Standups', 'Git PR fluency', 'Strong React + Express skills'],
    milestones: [
      {
        _id: '66f5a1b2c3d4e5f6a7b8c927',
        title: 'Sprint 1: Asynchronous Task Runner & S3 Uploads',
        percentage: 30,
        amountPkr: 42000,
        amountUsd: 150,
        status: 'Released',
        completedAt: new Date('2026-09-05T14:30:00Z'),
        receiptRef: 'WN-US-TX-90112',
      },
      {
        _id: '66f5a1b2c3d4e5f6a7b8c928',
        title: 'Sprint 2: Real-time Analytics WebSocket Dash',
        percentage: 35,
        amountPkr: 49000,
        amountUsd: 175,
        status: 'In Review',
      },
      {
        _id: '66f5a1b2c3d4e5f6a7b8c929',
        title: 'Sprint 3: End-to-end Integration & CI/CD',
        percentage: 35,
        amountPkr: 49000,
        amountUsd: 175,
        status: 'Pending',
      },
    ],
    createdAt: new Date('2026-08-10T08:00:00Z'),
  };

  const application1 = {
    _id: '66f5a1b2c3d4e5f6a7b8c931',
    internshipId: internship1Id,
    candidateId: faizanId,
    status: 'Accepted',
    githubRepoUrl: 'https://github.com/faizanfarooq/finflow-ledger-core',
    submittedCode: `// Multi-tenant Token & Double-entry Transaction Invariant Check
export async function transferFunds(payerId, receiverId, amountPkr) {
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
    aiAuditResult: {
      score: 94,
      feedback: 'Excellent transaction boundary isolation, atomic session rollback handling, and strict input validation.',
      cvBullets: [
        'Architected an ACID-compliant double-entry settlement engine handling high-volume concurrent wallet balances in MongoDB',
        'Implemented defensive multi-tenant token verification with zero GPA prejudice, achieving 94% AST code audit score',
      ],
      securityChecks: [
        'Atomic transaction boundary: VERIFIED',
        'Strict positive balance constraints: PASSED',
        'Timing-safe signature verification: PASSED',
      ],
      suggestions: [
        'Add distributed idempotency keys in Redis to handle network retries safely',
        'Include OpenTelemetry metric histograms on ledger latency',
      ],
    },
    coverNote: 'Salam Zubair bhai! I am Muhammad Faizan Farooq. Although my academic GPA was 2.4, my GitHub showcases battle-tested Node.js transaction engines and clean modular code ready for production.',
    createdAt: new Date('2026-08-22T14:00:00Z'),
  };

  const messages = [
    {
      _id: '66f5a1b2c3d4e5f6a7b8c941',
      senderId: founder1Id,
      receiverId: faizanId,
      text: 'Salam Faizan! We reviewed your GitHub submission for the FinFlow double-entry ledger. Your transaction rollback logic is sharper than candidates with 3.8 GPAs. Welcome to the team!',
      read: true,
      timestamp: new Date('2026-08-23T11:00:00Z'),
    },
    {
      _id: '66f5a1b2c3d4e5f6a7b8c942',
      senderId: faizanId,
      receiverId: founder1Id,
      text: 'Walaikum Assalam Zubair bhai! Thank you so much. Milestone 1 (JWT auth & tenant scopes) is completed and PR is opened for review.',
      read: true,
      timestamp: new Date('2026-08-28T16:20:00Z'),
    },
    {
      _id: '66f5a1b2c3d4e5f6a7b8c943',
      senderId: founder1Id,
      receiverId: faizanId,
      text: 'Terrific work! I have just approved Milestone 1. PKR 13,750 has been released from escrow into your WorkNest wallet. Keep up the high standard on Milestone 2!',
      read: true,
      timestamp: new Date('2026-09-01T12:05:00Z'),
    },
  ];

  return {
    users: [faizanUser, founder1, founder2, founder3],
    internships: [internship1, internship2, internship3, internship4],
    applications: [application1],
    messages,
  };
};

export const seedDefaultData = async () => {
  if (state.users.length > 0) return;
  const data = await getSeedData();
  state.users = data.users;
  state.internships = data.internships;
  state.applications = data.applications;
  state.messages = data.messages;
  console.log('[WorkNest DB] Default in-memory seed data initialized.');
};

export const seedAtlasDatabase = async () => {
  try {
    const data = await getSeedData();
    for (const u of data.users) {
      await User.updateOne({ email: u.email }, { $setOnInsert: u }, { upsert: true });
    }
    for (const i of data.internships) {
      await Internship.updateOne({ title: i.title, startupName: i.startupName }, { $setOnInsert: i }, { upsert: true });
    }
    for (const a of data.applications) {
      await Application.updateOne({ candidateId: a.candidateId, internshipId: a.internshipId }, { $setOnInsert: a }, { upsert: true });
    }
    for (const m of data.messages) {
      await Message.updateOne({ senderId: m.senderId, receiverId: m.receiverId, text: m.text }, { $setOnInsert: m }, { upsert: true });
    }
    console.log('[WorkNest DB] MongoDB Atlas seeded with initial users, internships, and chat data.');
  } catch (err) {
    console.error('[WorkNest DB] Atlas seeding notice:', err);
  }
};

/**
 * Universal dbStore interface that transparently executes against MongoDB Atlas or In-Memory store
 */
export const dbStore = {
  // Users
  async findUserByEmail(email: string) {
    if (state.isMongooseConnected) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return state.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    if (state.isMongooseConnected) {
      return await User.findById(id);
    }
    return state.users.find(u => String(u._id) === String(id)) || null;
  },

  async createUser(userData: any) {
    if (state.isMongooseConnected) {
      return await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
      });
    }
    const newUser = {
      _id: generateObjectId(),
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
    };
    state.users.push(newUser);
    return newUser;
  },

  async updateUserById(id: string, update: any) {
    if (state.isMongooseConnected) {
      return await User.findByIdAndUpdate(id, update, { new: true });
    }
    const idx = state.users.findIndex(u => String(u._id) === String(id));
    if (idx === -1) return null;
    state.users[idx] = { ...state.users[idx], ...update };
    return state.users[idx];
  },

  // Internships
  async findInternships(query: { city?: string; techStack?: string; type?: string; isRemoteUsd?: boolean }) {
    if (state.isMongooseConnected) {
      const filter: any = {};
      if (query.city) filter.city = new RegExp(query.city, 'i');
      if (query.techStack) filter.techStack = { $in: [new RegExp(query.techStack, 'i')] };
      if (query.type) filter.type = query.type;
      if (query.isRemoteUsd !== undefined) filter.isRemoteUsd = query.isRemoteUsd;

      const items = await Internship.find(filter)
        .populate('founderId', 'name email city startupName area')
        .lean();

      return items.map((item: any) => ({
        ...item,
        founder: item.founderId,
      }));
    }

    return state.internships
      .filter(item => {
        if (query.city && !item.city.toLowerCase().includes(query.city.toLowerCase())) {
          return false;
        }
        if (query.techStack) {
          const match = item.techStack.some((tech: string) => tech.toLowerCase().includes(query.techStack!.toLowerCase()));
          if (!match) return false;
        }
        if (query.type && item.type !== query.type) {
          return false;
        }
        if (query.isRemoteUsd !== undefined && item.isRemoteUsd !== query.isRemoteUsd) {
          return false;
        }
        return true;
      })
      .map(item => {
        const founder = state.users.find(u => String(u._id) === String(item.founderId));
        return {
          ...item,
          founder: founder
            ? {
                _id: founder._id,
                name: founder.name,
                email: founder.email,
                city: founder.city,
                area: founder.area,
                startupName: founder.startupName || item.startupName,
              }
            : null,
        };
      });
  },

  async findInternshipById(id: string) {
    if (state.isMongooseConnected) {
      const item: any = await Internship.findById(id)
        .populate('founderId', 'name email city startupName area')
        .lean();
      if (!item) return null;
      return {
        ...item,
        founder: item.founderId,
      };
    }
    const item = state.internships.find(i => String(i._id) === String(id));
    if (!item) return null;
    const founder = state.users.find(u => String(u._id) === String(item.founderId));
    return {
      ...item,
      founder: founder
        ? {
            _id: founder._id,
            name: founder.name,
            email: founder.email,
            city: founder.city,
            area: founder.area,
            startupName: founder.startupName || item.startupName,
          }
        : null,
    };
  },

  async createInternship(internshipData: any) {
    if (state.isMongooseConnected) {
      return await Internship.create(internshipData);
    }
    const newInternship = {
      _id: generateObjectId(),
      ...internshipData,
      milestones: (internshipData.milestones || []).map((m: any) => ({
        _id: generateObjectId(),
        status: 'Pending',
        ...m,
      })),
      createdAt: new Date(),
    };
    state.internships.unshift(newInternship);
    return newInternship;
  },

  async updateInternshipById(id: string, update: any) {
    if (state.isMongooseConnected) {
      return await Internship.findByIdAndUpdate(id, update, { new: true });
    }
    const idx = state.internships.findIndex(i => String(i._id) === String(id));
    if (idx === -1) return null;
    state.internships[idx] = { ...state.internships[idx], ...update };
    return state.internships[idx];
  },

  // Applications
  async createApplication(appData: any) {
    if (state.isMongooseConnected) {
      return await Application.create(appData);
    }
    const newApp = {
      _id: generateObjectId(),
      ...appData,
      status: appData.status || 'Applied',
      createdAt: new Date(),
    };
    state.applications.push(newApp);
    return newApp;
  },

  async findApplicationsByInternshipId(internshipId: string) {
    if (state.isMongooseConnected) {
      return await Application.find({ internshipId })
        .populate('candidateId', 'name email phone university verifiedPortfolioScore hideGpa skills')
        .lean();
    }
    return state.applications
      .filter(a => String(a.internshipId) === String(internshipId))
      .map(a => {
        const candidate = state.users.find(u => String(u._id) === String(a.candidateId));
        return {
          ...a,
          candidate: candidate
            ? {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                university: candidate.university,
                verifiedPortfolioScore: candidate.verifiedPortfolioScore,
                hideGpa: candidate.hideGpa,
                skills: candidate.skills,
              }
            : null,
        };
      });
  },

  // Messages
  async findMessagesBetween(user1Id: string, user2Id: string) {
    if (state.isMongooseConnected) {
      return await Message.find({
        $or: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      }).sort({ timestamp: 1 }).lean();
    }

    return state.messages
      .filter(
        m =>
          (String(m.senderId) === String(user1Id) && String(m.receiverId) === String(user2Id)) ||
          (String(m.senderId) === String(user2Id) && String(m.receiverId) === String(user1Id))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async createMessage(msgData: any) {
    if (state.isMongooseConnected) {
      return await Message.create(msgData);
    }
    const newMsg = {
      _id: generateObjectId(),
      ...msgData,
      read: false,
      timestamp: new Date(),
    };
    state.messages.push(newMsg);
    return newMsg;
  },

  async markMessagesAsRead(senderId: string, receiverId: string) {
    if (state.isMongooseConnected) {
      return await Message.updateMany(
        { senderId, receiverId, read: false },
        { $set: { read: true } }
      );
    }
    state.messages.forEach(m => {
      if (String(m.senderId) === String(senderId) && String(m.receiverId) === String(receiverId)) {
        m.read = true;
      }
    });
  },

  // Raw state export for live admin/inspector inspection
  async getState() {
    if (state.isMongooseConnected) {
      const [users, internships, applications, messages] = await Promise.all([
        User.find().select('-password').lean(),
        Internship.find().lean(),
        Application.find().lean(),
        Message.find().lean(),
      ]);
      return {
        isMongooseConnected: true,
        counts: {
          users: users.length,
          internships: internships.length,
          applications: applications.length,
          messages: messages.length,
        },
        users,
        internships,
        applications,
        messages,
      };
    }

    return {
      isMongooseConnected: false,
      counts: {
        users: state.users.length,
        internships: state.internships.length,
        applications: state.applications.length,
        messages: state.messages.length,
      },
      users: state.users.map(u => {
        const { password, ...safe } = u;
        return safe;
      }),
      internships: state.internships,
      applications: state.applications,
      messages: state.messages,
    };
  },

  async resetData() {
    if (state.isMongooseConnected) {
      await Promise.all([
        User.deleteMany({}),
        Internship.deleteMany({}),
        Application.deleteMany({}),
        Message.deleteMany({}),
      ]);
      return seedAtlasDatabase();
    }
    state.users = [];
    state.internships = [];
    state.applications = [];
    state.messages = [];
    return seedDefaultData();
  },
};