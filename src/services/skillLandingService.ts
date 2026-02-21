import type { SkillLandingGroupItem } from "../model";
import type { SkillRepository } from "../repository/contracts/skillRepository";

export class SkillLandingService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async listActive(): Promise<SkillLandingGroupItem[]> {
    const groups = await this.skillRepository.findActiveSkills();

    return groups.map((group) => ({
      id: group.id,
      display_order: group.display_order,
      name: {
        id: group.name,
        en: group.name,
      },
      skills: group.skills.map((skill) => ({
        id: skill.id,
        display_order: skill.display_order,
        name: {
          id: skill.name,
          en: skill.name,
        },
      })),
    }));
  }
}
