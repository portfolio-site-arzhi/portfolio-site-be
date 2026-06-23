import type { Experience } from "../model";

const formatDateOnly = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

export const toExperienceResponse = (experience: Experience) => ({
  id: experience.id,
  sort: experience.sort,
  is_published: experience.is_published,
  role_id: experience.role_id,
  role_en: experience.role_en,
  company_name: experience.company_name,
  company_url: experience.company_url,
  start_date: formatDateOnly(experience.start_date),
  end_date: formatDateOnly(experience.end_date),
  is_current: experience.is_current,
  description_id: experience.description_id,
  description_en: experience.description_en,
  skills: experience.skills.map((skill) => ({
    id: skill.id,
    skill_name: skill.skill_name,
    sort: skill.sort,
  })),
  created_at: experience.created_at,
  updated_at: experience.updated_at,
});
