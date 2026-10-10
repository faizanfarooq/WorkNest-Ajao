import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from './modules/auth/models.ts';
import { CompanyModel } from './modules/companies/model.ts';
import { storeFile } from './modules/files/gridfs.ts';
import { InternshipModel } from './modules/internships/model.ts';
import { monthlyPkr } from './modules/internships/service.ts';
import { StudentProfileModel } from './modules/profiles/model.ts';
import { ApplicationModel } from './modules/applications/model.ts';

export const DEMO_PASSWORD = 'Password123';

const COMPANIES = [
  {
    name: 'Ledgerly',
    tagline: 'Bookkeeping software for small businesses across Pakistan',
    industry: 'Fintech',
    city: 'Lahore',
    size: '11-50',
    about:
      'Ledgerly helps shop owners and small businesses keep their books, send invoices and reconcile bank payments from their phone. We are a small product team that ships weekly.',
  },
  {
    name: 'Shifa Health',
    tagline: 'Clinic management and telehealth for growing practices',
    industry: 'Healthtech',
    city: 'Islamabad',
    size: '51-200',
    about:
      'Shifa Health builds scheduling, patient records and video consultation tools used by clinics in twelve cities. Our engineering team works in small squads with clear ownership.',
  },
  {
    name: 'Rasta Logistics',
    tagline: 'Same-day delivery infrastructure for e-commerce',
    industry: 'Logistics',
    city: 'Karachi',
    size: '201-1000',
    about:
      'Rasta runs last-mile delivery for online stores. Interns work on routing, rider apps and the dashboards our operations team relies on every day.',
  },
  {
    name: 'Kitaab Labs',
    tagline: 'Learning apps for school students in Urdu and English',
    industry: 'Edtech',
    city: 'Lahore',
    size: '1-10',
    about:
      'Kitaab Labs makes bilingual learning apps for grades 1 to 10. We are a tiny team, so interns ship real features to real students from week one.',
  },
  {
    name: 'Northstar Studio',
    tagline: 'Product design and engineering for global startups',
    industry: 'Software services',
    city: 'Islamabad',
    size: '11-50',
    about:
      'Northstar is a remote-first studio building web and mobile products for startups in the US and Europe. We pay in USD and work asynchronously.',
  },
  {
    name: 'Fasal AI',
    tagline: 'Crop health insights from satellite and drone imagery',
    industry: 'Agritech',
    city: 'Faisalabad',
    size: '11-50',
    about:
      'Fasal AI gives farmers early warnings about crop disease and water stress. We combine computer vision with field data collected across Punjab and Sindh.',
  },
] as const;

type Seed = {
  company: number;
  title: string;
  skills: string[];
  mode: 'onsite' | 'hybrid' | 'remote';
  city?: string;
  pay: [number, 'PKR' | 'USD', 'month' | 'week' | 'total'] | null;
  weeks: number;
  daysAgo: number;
  deadlineInDays?: number;
  summary: string;
  requirements: string[];
  questions?: string[];
};

const INTERNSHIPS: Seed[] = [
  {
    company: 0,
    title: 'Frontend Engineering Intern (React)',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    mode: 'hybrid',
    city: 'Lahore',
    pay: [50000, 'PKR', 'month'],
    weeks: 12,
    daysAgo: 1,
    deadlineInDays: 21,
    summary:
      'Build the invoice editor and reporting screens used by thousands of small businesses. You will pair with a senior engineer, own small features end to end, and ship to production every week.',
    requirements: ['Comfortable with React and modern JavaScript', 'A project on GitHub you can walk us through', 'Available at least 4 days a week'],
    questions: ['Link a project you built with React and tell us what you would improve about it.'],
  },
  {
    company: 0,
    title: 'Backend Intern (Node.js & MongoDB)',
    skills: ['Node.js', 'MongoDB', 'REST APIs'],
    mode: 'onsite',
    city: 'Lahore',
    pay: [55000, 'PKR', 'month'],
    weeks: 12,
    daysAgo: 4,
    summary:
      'Work on the APIs behind bank reconciliation and payment reminders. You will write endpoints, background jobs and tests, and learn how we keep financial data correct.',
    requirements: ['Understanding of HTTP and REST', 'Some experience with a database', 'Curiosity about how money moves'],
  },
  {
    company: 1,
    title: 'Mobile Developer Intern (Flutter)',
    skills: ['Flutter', 'Dart', 'Firebase'],
    mode: 'onsite',
    city: 'Islamabad',
    pay: [60000, 'PKR', 'month'],
    weeks: 16,
    daysAgo: 2,
    deadlineInDays: 14,
    summary:
      'Help build the patient app that lets people book appointments, receive prescriptions and join video consultations. You will work closely with our designer and QA lead.',
    requirements: ['Built at least one Flutter or React Native app', 'Comfortable reading API docs', 'Good written English'],
    questions: ['Share a link to an app you built (store link, APK or repo).'],
  },
  {
    company: 1,
    title: 'QA & Test Automation Intern',
    skills: ['Testing', 'Playwright', 'JavaScript'],
    mode: 'hybrid',
    city: 'Islamabad',
    pay: [40000, 'PKR', 'month'],
    weeks: 12,
    daysAgo: 9,
    summary:
      'Write automated tests for our clinic dashboard and help us catch bugs before doctors do. Great fit if you like breaking things and explaining exactly how you broke them.',
    requirements: ['Attention to detail', 'Basic JavaScript', 'Clear bug reports'],
  },
  {
    company: 2,
    title: 'Data Analyst Intern',
    skills: ['SQL', 'Python', 'Excel', 'Power BI'],
    mode: 'onsite',
    city: 'Karachi',
    pay: [45000, 'PKR', 'month'],
    weeks: 12,
    daysAgo: 3,
    deadlineInDays: 10,
    summary:
      'Turn delivery data into decisions. You will build dashboards for the operations team, dig into late deliveries and present findings to city managers.',
    requirements: ['SQL joins and aggregations', 'Some Python or advanced Excel', 'Able to explain numbers to non-technical people'],
  },
  {
    company: 2,
    title: 'Operations & Supply Chain Intern',
    skills: ['Operations', 'Excel', 'Communication'],
    mode: 'onsite',
    city: 'Karachi',
    pay: [35000, 'PKR', 'month'],
    weeks: 8,
    daysAgo: 12,
    summary:
      'Spend time in our hubs and with our planning team to improve how parcels move through the network. Business, engineering and supply chain students are all welcome.',
    requirements: ['Final-year student or recent graduate', 'Comfortable working on site', 'Strong spreadsheet skills'],
  },
  {
    company: 2,
    title: 'Backend Engineering Intern (Go)',
    skills: ['Go', 'PostgreSQL', 'Docker'],
    mode: 'hybrid',
    city: 'Karachi',
    pay: [70000, 'PKR', 'month'],
    weeks: 24,
    daysAgo: 6,
    summary:
      'Join the routing team and work on the services that assign thousands of parcels to riders every hour. Previous Go experience is a plus but not required.',
    requirements: ['Strong fundamentals in any backend language', 'Data structures and algorithms', 'Interest in distributed systems'],
    questions: ['Describe a technical problem you solved that you are proud of.'],
  },
  {
    company: 3,
    title: 'Content & Curriculum Intern (Science)',
    skills: ['Content Writing', 'Urdu', 'Science'],
    mode: 'remote',
    pay: [25000, 'PKR', 'month'],
    weeks: 8,
    daysAgo: 5,
    summary:
      'Write short lessons and quiz questions for grade 6 to 8 science in Urdu and English. You will work with our teachers to make tricky topics simple.',
    requirements: ['Excellent written Urdu and English', 'Strong science background', 'Some tutoring experience is a plus'],
  },
  {
    company: 3,
    title: 'UI/UX Design Intern',
    skills: ['Figma', 'UI Design', 'User Research'],
    mode: 'remote',
    pay: null,
    weeks: 6,
    daysAgo: 15,
    summary:
      'A short, unpaid, portfolio-building internship. Redesign one flow in our app with mentorship from our lead designer, then see it shipped to students.',
    requirements: ['A Figma portfolio (student projects are fine)', 'About 10 hours a week'],
  },
  {
    company: 4,
    title: 'Remote Full-Stack Intern (Next.js)',
    skills: ['Next.js', 'React', 'Node.js', 'PostgreSQL'],
    mode: 'remote',
    pay: [400, 'USD', 'month'],
    weeks: 12,
    daysAgo: 0,
    deadlineInDays: 30,
    summary:
      'Work with a US client team on a SaaS product. You will join daily async standups, pick up tickets from the board and get code reviews from senior engineers.',
    requirements: ['Solid React and one backend framework', 'Confident written English', 'Reliable internet connection'],
    questions: ['Link your GitHub profile.', 'Which time zones can you overlap with?'],
  },
  {
    company: 4,
    title: 'Product Design Intern',
    skills: ['Figma', 'Prototyping', 'Design Systems'],
    mode: 'remote',
    pay: [300, 'USD', 'month'],
    weeks: 12,
    daysAgo: 7,
    summary:
      'Design screens and components for client products and help maintain our shared design system. You will present your work in weekly critiques.',
    requirements: ['A portfolio with at least two case studies', 'Comfort with auto layout and components in Figma'],
  },
  {
    company: 5,
    title: 'Machine Learning Intern (Computer Vision)',
    skills: ['Python', 'PyTorch', 'Computer Vision'],
    mode: 'hybrid',
    city: 'Faisalabad',
    pay: [65000, 'PKR', 'month'],
    weeks: 16,
    daysAgo: 2,
    deadlineInDays: 18,
    summary:
      'Train and evaluate models that spot crop disease in drone images. You will clean datasets, run experiments and write up what worked and what did not.',
    requirements: ['Python and NumPy', 'Trained at least one neural network', 'Good experiment hygiene'],
    questions: ['Tell us about a model you trained: the data, the metric and the result.'],
  },
  {
    company: 5,
    title: 'Field Research Intern',
    skills: ['Agriculture', 'Data Collection', 'Punjabi'],
    mode: 'onsite',
    city: 'Faisalabad',
    pay: [80000, 'PKR', 'total'],
    weeks: 6,
    daysAgo: 10,
    summary:
      'Visit partner farms, collect ground-truth data and interview farmers about how they use our alerts. Travel costs are covered.',
    requirements: ['Agriculture or environmental science student', 'Comfortable travelling within Punjab', 'Speaks Punjabi or Saraiki'],
  },
  {
    company: 0,
    title: 'Growth Marketing Intern',
    skills: ['Marketing', 'Social Media', 'Analytics'],
    mode: 'remote',
    pay: [30000, 'PKR', 'month'],
    weeks: 12,
    daysAgo: 20,
    summary:
      'Plan and run campaigns that bring new businesses to Ledgerly. You will write posts, run small experiments and report on what moved the numbers.',
    requirements: ['Strong writing in English and Urdu', 'Interest in startups', 'Basic spreadsheet skills'],
  },
];

// The smallest valid one-page PDF, so the demo student can apply right away.
const DEMO_RESUME = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 60>>stream\nBT /F1 24 Tf 72 700 Td (Ayesha Khan - Demo Resume) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

/** Loads demo data. Refuses to touch a database that already has users unless `reset` is true. */
export async function seed({ reset = false } = {}) {
  if (await UserModel.exists({})) {
    if (!reset) {
      console.log('[seed] database already has users; skipping. Use `npm run seed -- --reset` to wipe and reseed.');
      return;
    }
    await mongoose.connection.db!.dropDatabase();
    await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const companies = [];
  for (const [i, c] of COMPANIES.entries()) {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const owner = await UserModel.create({
      name: `${c.name} Hiring`,
      email: i === 0 ? 'employer@worknest.test' : `hiring@${slug}.test`,
      role: 'employer',
      passwordHash,
    });
    const company = await CompanyModel.create({
      ...c,
      slug,
      website: `https://${slug}.example.com`,
      ownerId: owner._id,
      members: [owner._id],
      verified: i < 4,
    });
    owner.companyId = company._id;
    await owner.save();
    companies.push({ company, owner });
  }

  const internships = [];
  for (const s of INTERNSHIPS) {
    const { company, owner } = companies[s.company];
    const pay = s.pay
      ? { paid: true, payAmount: s.pay[0], payCurrency: s.pay[1], payPeriod: s.pay[2] }
      : { paid: false, payAmount: 0, payCurrency: 'PKR' as const, payPeriod: 'month' as const };
    const publishedAt = daysFromNow(-s.daysAgo);
    internships.push(
      await InternshipModel.create({
        companyId: company._id,
        postedBy: owner._id,
        title: s.title,
        description: `${s.summary}\n\nAbout the team: ${company.about}`,
        requirements: s.requirements,
        skills: s.skills,
        mode: s.mode,
        city: s.city ?? '',
        ...pay,
        payMonthlyPkr: monthlyPkr({ ...pay, durationWeeks: s.weeks }),
        durationWeeks: s.weeks,
        openings: 1 + (s.title.length % 3),
        deadline: s.deadlineInDays ? daysFromNow(s.deadlineInDays) : undefined,
        questions: (s.questions ?? []).map((prompt) => ({ prompt, required: true })),
        status: 'open',
        publishedAt,
        createdAt: publishedAt,
        viewCount: 20 + s.title.length * 3,
      }),
    );
  }

  const student = await UserModel.create({
    name: 'Ayesha Khan',
    email: 'student@worknest.test',
    role: 'student',
    passwordHash,
  });
  const resumeId = await storeFile(DEMO_RESUME, 'Ayesha-Khan-Resume.pdf', 'application/pdf', String(student._id));
  await StudentProfileModel.create({
    userId: student._id,
    headline: 'Computer Science student who likes building web apps',
    university: 'University of the Punjab',
    degree: 'BS Computer Science',
    graduationYear: new Date().getFullYear() + 1,
    city: 'Lahore',
    bio: 'Third-year CS student. I have built a few full-stack projects with React and Node.js, including a library management system for my department.',
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Git'],
    gpa: 3.1,
    hideGpa: true,
    links: { github: 'https://github.com/example', linkedin: '', portfolio: '' },
    resume: { fileId: resumeId, fileName: 'Ayesha-Khan-Resume.pdf', size: DEMO_RESUME.length, uploadedAt: new Date() },
  });

  // One application already in progress so both dashboards have something to show.
  const target = internships[1];
  await ApplicationModel.create({
    internshipId: target._id,
    companyId: target.companyId,
    studentId: student._id,
    status: 'reviewing',
    coverLetter: 'I enjoy backend work and have built REST APIs with Express and MongoDB for two university projects.',
    resume: { fileId: resumeId, fileName: 'Ayesha-Khan-Resume.pdf' },
    history: [
      { status: 'applied', by: student._id, at: daysFromNow(-2) },
      { status: 'reviewing', by: companies[0].owner._id, at: daysFromNow(-1) },
    ],
  });
  await InternshipModel.updateOne({ _id: target._id }, { $inc: { applicationCount: 1 } });

  console.log(`[seed] ${companies.length} companies, ${internships.length} internships, 1 student`);
  console.log(`[seed] demo logins (password "${DEMO_PASSWORD}"): student@worknest.test, employer@worknest.test`);
}
