import type { Skill } from "../model";
import type { SkillRepository } from "../repository/contracts/skillRepository";
import {
  throwSkillDomainErrorIfPrismaError,
  validateSkillDeleted,
  validateSkillExists,
} from "../validation/skillDomainValidation";

export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async listSkills(params?: { search?: string }): Promise<Skill[]> {
    return this.skillRepository.findSkills({
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
    });
  }

  async getSkillById(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findSkillById(id);
    return validateSkillExists(skill);
  }

  async createSkill(input: {
    name: string;
    isActive: boolean;
    skills: { name: string }[];
  }): Promise<Skill> {
    const maxSort = await this.skillRepository.getMaxSort();
    const nextSort = maxSort + 1;

    return this.skillRepository.createSkill({
      name: input.name,
      displayOrder: nextSort,
      isActive: input.isActive,
      skills: input.skills,
      createdBy: 0,
      updatedBy: 0,
    });
  }

  async updateSkill(
    id: number,
    input: {
      name?: string;
      isActive?: boolean;
      skills?: { name: string }[];
    },
  ): Promise<Skill> {
    try {
      const updated = await this.skillRepository.updateSkill(id, {
        ...(typeof input.name === "string" ? { name: input.name } : {}),
        ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
        ...(Array.isArray(input.skills) ? { skills: input.skills } : {}),
        updatedBy: 0,
      });

      return validateSkillExists(updated);
    } catch (error) {
      throwSkillDomainErrorIfPrismaError(error);
      throw error;
    }
  }

  async deleteSkill(id: number): Promise<void> {
    try {
      const deleted = await this.skillRepository.deleteSkill(id);
      validateSkillDeleted(deleted);
    } catch (error) {
      throwSkillDomainErrorIfPrismaError(error);
      throw error;
    }
  }

  async updateSkillSort(ids: number[]): Promise<void> {
    try {
      await this.skillRepository.updateSort(ids, 0);
    } catch (error) {
      throwSkillDomainErrorIfPrismaError(error);
      throw error;
    }
  }
}
