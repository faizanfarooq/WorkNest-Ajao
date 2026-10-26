import { api } from './api';
import type { StudentProfile } from './types';

/** The signed-in student's profile. Shared by every page that uses the ['profile'] query. */
export const fetchProfile = () => api<{ profile: StudentProfile }>('/profile/me').then((r) => r.profile);

/** What a complete profile has, in the order the home page progress bar shows it. */
export function profileSteps(p: StudentProfile) {
  return [
    { done: !!p.resume, label: 'Upload your resume' },
    { done: p.skills.length >= 3, label: 'Add at least 3 skills' },
    { done: !!p.headline, label: 'Write a headline' },
    { done: !!p.university, label: 'Add your university' },
    { done: !!p.degree, label: 'Add your degree' },
    { done: !!p.city, label: 'Add your city' },
    { done: !!p.bio, label: 'Write a short bio' },
    { done: !!(p.links?.github || p.links?.linkedin || p.links?.portfolio), label: 'Add a GitHub, LinkedIn or portfolio link' },
  ];
}
