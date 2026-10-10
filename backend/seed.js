require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Internship = require('./models/Internship');
const Application = require('./models/Application');
const Message = require('./models/Message');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/worknest_ajao';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[WorkNest Seed] Connected to MongoDB at:', MONGODB_URI);

    // Clear existing collections
    await User.deleteMany({});
    await Internship.deleteMany({});
    await Application.deleteMany({});
    await Message.deleteMany({});
    console.log('[WorkNest Seed] Cleared existing records.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Candidate: Muhammad Faizan Farooq
    const faizan = await User.create({
      name: 'Muhammad Faizan Farooq',
      email: 'faizanfarooq810@gmail.com',
      password: hashedPassword,
      role: 'candidate',
      phone: '+923004810928',
      city: 'Lahore',
      university: 'FAST-NUCES',
      gpa: 2.4, // Low GPA
      hideGpa: true, // WorkNest Low-GPA Shield Active
      verifiedPortfolioScore: 92,
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'Tailwind CSS', 'Docker'],
      wallet: { pkrBalance: 65000, usdBalance: 250 },
    });
    console.log('✅ Candidate Seeded: Muhammad Faizan Farooq (GPA Shield Active, Score: 92%)');

    // 2. Founder 1: Fintech Startup Founder (Johar Town)
    const founder1 = await User.create({
      name: 'Zubair Tariq',
      email: 'zubair@finflow.pk',
      password: hashedPassword,
      role: 'founder',
      phone: '+923214567890',
      city: 'Lahore',
      area: 'Johar Town',
      university: 'FAST-NUCES',
      hideGpa: false,
      verifiedPortfolioScore: 98,
      skills: ['Fintech', 'Double-entry Accounting', 'Node.js', 'PostgreSQL'],
      wallet: { pkrBalance: 500000, usdBalance: 5000 },
    });

    // 3. Founder 2: HealthTech / SaaS Founder (Gulberg)
    const founder2 = await User.create({
      name: 'Dr. Ayesha Malik',
      email: 'ayesha@sehatcloud.io',
      password: hashedPassword,
      role: 'founder',
      phone: '+923334567891',
      city: 'Lahore',
      area: 'Gulberg III',
      university: 'NUST',
      hideGpa: false,
      verifiedPortfolioScore: 95,
      skills: ['HIPAA', 'FHIR API', 'Node.js', 'MongoDB', 'Microservices'],
      wallet: { pkrBalance: 750000, usdBalance: 8000 },
    });

    // 4. Founder 3: Software Export House (Arfa Software Technology Park)
    const founder3 = await User.create({
      name: 'Khurram Shahzad',
      email: 'khurram@vanguardapps.co',
      password: hashedPassword,
      role: 'founder',
      phone: '+923014567892',
      city: 'Lahore',
      area: 'Arfa Software Technology Park, Ferozepur Road',
      university: 'ITU',
      hideGpa: false,
      verifiedPortfolioScore: 99,
      skills: ['Cloud Architecture', 'AWS', 'Next.js', 'Distributed Systems'],
      wallet: { pkrBalance: 1200000, usdBalance: 15000 },
    });
    console.log('✅ Founders Seeded: Zubair Tariq (Johar Town), Dr. Ayesha Malik (Gulberg), Khurram Shahzad (Arfa Park)');

    // 3. Internships in Lahore & 1 Remote USD Track
    // Internship 1 (Johar Town Fintech)
    const internship1 = await Internship.create({
      title: 'Full-Stack Node.js & React Junior Engineer (Fintech Escrow Pipeline)',
      startupName: 'FinFlow Pakistan',
      founderId: founder1._id,
      city: 'Lahore',
      area: 'Johar Town',
      isRemoteUsd: false,
      stipendPkr: 55000,
      stipendUsd: 0,
      durationWeeks: 8,
      techStack: ['Node.js', 'React', 'MongoDB', 'Express', 'JWT'],
      type: 'Full Internship',
      milestones: [
        {
          title: 'M1: Multi-tenant JWT Auth & User Permissions',
          percentage: 25,
          amountPkr: 13750,
          amountUsd: 0,
          status: 'Released',
          receiptRef: 'WN-PK-TX-88210',
        },
        {
          title: 'M2: Double-entry Ledger Engine & Reconciliation API',
          percentage: 35,
          amountPkr: 19250,
          amountUsd: 0,
          status: 'In Progress',
        },
        {
          title: 'M3: JazzCash / Nayapay Webhook Integrations',
          percentage: 40,
          amountPkr: 22000,
          amountUsd: 0,
          status: 'Pending',
        },
      ],
    });

    // Internship 2 (Gulberg HealthTech)
    const internship2 = await Internship.create({
      title: 'SaaS Backend Microservices & Health Data API Developer',
      startupName: 'SehatCloud HealthTech',
      founderId: founder2._id,
      city: 'Lahore',
      area: 'Gulberg III',
      isRemoteUsd: false,
      stipendPkr: 60000,
      stipendUsd: 0,
      durationWeeks: 6,
      techStack: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
      type: 'Full Internship',
      milestones: [
        {
          title: 'M1: Patient Health Record Data Vault',
          percentage: 40,
          amountPkr: 24000,
          amountUsd: 0,
          status: 'Released',
          receiptRef: 'WN-PK-TX-88244',
        },
        {
          title: 'M2: Doctor Teleconsultation WebSocket Gateway',
          percentage: 60,
          amountPkr: 36000,
          amountUsd: 0,
          status: 'In Review',
        },
      ],
    });

    // Internship 3 (3-Day Micro-Task in Johar Town)
    const internship3 = await Internship.create({
      title: '3-Day Micro-Task: Fix Slow MongoDB Aggregation & Indexing',
      startupName: 'FinFlow Pakistan',
      founderId: founder1._id,
      city: 'Lahore',
      area: 'Johar Town',
      isRemoteUsd: false,
      stipendPkr: 15000,
      stipendUsd: 0,
      durationWeeks: 1,
      techStack: ['MongoDB', 'Node.js', 'Query Optimization'],
      type: '3-Day Micro-Task',
      milestones: [
        {
          title: 'Index Optimization & Benchmark PR',
          percentage: 100,
          amountPkr: 15000,
          amountUsd: 0,
          status: 'In Progress',
        },
      ],
    });

    // Internship 4 (Remote USD Track managed from Arfa Park)
    const internship4 = await Internship.create({
      title: 'Global Remote Junior Full-Stack Engineer (US Startup Pipeline)',
      startupName: 'Vanguard Software Global',
      founderId: founder3._id,
      city: 'Lahore',
      area: 'Arfa Software Technology Park, Ferozepur Road',
      isRemoteUsd: true,
      stipendPkr: 140000,
      stipendUsd: 500,
      durationWeeks: 12,
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind', 'Next.js'],
      type: 'Full Internship',
      milestones: [
        {
          title: 'Sprint 1: Asynchronous Task Runner & S3 Uploads',
          percentage: 30,
          amountPkr: 42000,
          amountUsd: 150,
          status: 'Released',
          receiptRef: 'WN-US-TX-90112',
        },
        {
          title: 'Sprint 2: Real-time Analytics WebSocket Dash',
          percentage: 35,
          amountPkr: 49000,
          amountUsd: 175,
          status: 'In Review',
        },
        {
          title: 'Sprint 3: End-to-end Integration & CI/CD',
          percentage: 35,
          amountPkr: 49000,
          amountUsd: 175,
          status: 'Pending',
        },
      ],
    });
    console.log('✅ Internships & Micro-tasks Seeded (3 Lahore PKR Tracks + 1 Arfa Park Remote $500/mo Track)');

    // 4. Application
    await Application.create({
      internshipId: internship1._id,
      candidateId: faizan._id,
      status: 'Accepted',
      githubRepoUrl: 'https://github.com/faizanfarooq/finflow-ledger-core',
      submittedCode: '// ACID Double-entry transferFunds function in Node.js',
      aiAuditResult: {
        score: 94,
        feedback: 'Excellent transaction boundary isolation, atomic session rollback handling, and strict input validation.',
        cvBullets: [
          'Architected an ACID-compliant double-entry settlement engine handling high-volume concurrent wallet balances in MongoDB',
          'Implemented defensive multi-tenant token verification with zero GPA prejudice, achieving 94% AST code audit score',
        ],
      },
    });

    // 5. Messages
    await Message.create({
      senderId: founder1._id,
      receiverId: faizan._id,
      text: 'Salam Faizan! Your GitHub submission for FinFlow was reviewed. Your transaction rollback logic is exceptional. Welcome aboard!',
      read: true,
    });
    await Message.create({
      senderId: faizan._id,
      receiverId: founder1._id,
      text: 'Walaikum Assalam Zubair bhai! Thank you so much. Milestone 1 PR is ready.',
      read: true,
    });

    console.log('🎉 [WorkNest Seed Complete] Successfully seeded WorkNest Ajao MongoDB database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
