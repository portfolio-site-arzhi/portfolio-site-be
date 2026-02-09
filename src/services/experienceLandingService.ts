import type {
  ExperienceLandingItem,
} from "../model";
import type { ExperienceRepository } from "../repository/contracts/experienceRepository";

const formatDateOnly = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

export class ExperienceLandingService {
  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async listPublished(): Promise<ExperienceLandingItem[]> {
    const experiences = await this.experienceRepository.findPublished();

    return experiences.map((experience) => ({
      id: experience.id,
      sort: experience.sort,
      role: {
        id: experience.role_id,
        en: experience.role_en,
      },
      company_name: experience.company_name,
      company_url: experience.company_url,
      start_date: formatDateOnly(experience.start_date),
      end_date: formatDateOnly(experience.end_date),
      is_current: experience.is_current,
      description: {
        id: experience.description_id,
        en: experience.description_en,
      },
      skills: experience.skills.map((skill) => ({
        id: skill.id,
        skill_name: skill.skill_name,
        sort: skill.sort,
      })),
    }));
  }
}
