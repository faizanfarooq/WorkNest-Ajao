import { slugify } from '../../lib/http.ts';
import { CompanyModel } from './model.ts';

export async function uniqueCompanySlug(name: string, excludeId?: unknown) {
  const base = slugify(name) || 'company';
  let slug = base;
  for (let n = 2; await CompanyModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}
