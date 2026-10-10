import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from './modules/auth/models.ts';
import { CompanyModel } from './modules/companies/model.ts';
import { storeFile } from './modules/files/gridfs.ts';
import { InternshipModel } from './modules/internships/model.ts';
import { monthlyPkr } from '../shared/pay.ts';
import { StudentProfileModel } from './modules/profiles/model.ts';
import { ApplicationModel } from './modules/applications/model.ts';
import {
  COMPANIES,
  DEMO_APPLICATION,
  DEMO_PASSWORD,
  DEMO_RESUME_PDF,
  DEMO_STUDENT,
  INTERNSHIPS,
  companySlug,
  employerEmail,
} from '../shared/seed-data.ts';

export { DEMO_PASSWORD };

const DEMO_RESUME = Buffer.from(DEMO_RESUME_PDF);
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
    const slug = companySlug(c.name);
    const owner = await UserModel.create({
      name: `${c.name} Hiring`,
      email: employerEmail(i, slug),
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
    name: DEMO_STUDENT.name,
    email: DEMO_STUDENT.email,
    role: 'student',
    passwordHash,
  });
  const { resumeFileName } = DEMO_STUDENT;
  const resumeId = await storeFile(DEMO_RESUME, resumeFileName, 'application/pdf', String(student._id));
  await StudentProfileModel.create({
    userId: student._id,
    ...DEMO_STUDENT.profile,
    resume: { fileId: resumeId, fileName: resumeFileName, size: DEMO_RESUME.length, uploadedAt: new Date() },
  });

  // One application already in progress so both dashboards have something to show.
  const target = internships[DEMO_APPLICATION.internshipIndex];
  await ApplicationModel.create({
    internshipId: target._id,
    companyId: target.companyId,
    studentId: student._id,
    status: 'reviewing',
    coverLetter: DEMO_APPLICATION.coverLetter,
    resume: { fileId: resumeId, fileName: resumeFileName },
    history: [
      { status: 'applied', by: student._id, at: daysFromNow(-2) },
      { status: 'reviewing', by: companies[0].owner._id, at: daysFromNow(-1) },
    ],
  });
  await InternshipModel.updateOne({ _id: target._id }, { $inc: { applicationCount: 1 } });

  console.log(`[seed] ${companies.length} companies, ${internships.length} internships, 1 student`);
  console.log(`[seed] demo logins (password "${DEMO_PASSWORD}"): ${DEMO_STUDENT.email}, ${employerEmail(0, "")}`);
}
