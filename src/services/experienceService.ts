import type { Experience } from "../model";
import type { ExperienceRepository } from "../repository/contracts/experienceRepository";
import {
  throwExperienceNotFoundIfPrismaError,
  validateExperienceDeleted,
  validateExperienceExists,
} from "../validation/experienceDomainValidation";
import { sanitizeWysiwygHtml } from "../helper/htmlSanitizer";

export class ExperienceService {
  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async listExperiences(params?: {
    search?: string;
  }): Promise<Experience[]> {
    return this.experienceRepository.findAll({
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
    });
  }

  async getExperienceById(id: number): Promise<Experience> {
    const experience = await this.experienceRepository.findById(id);
    return validateExperienceExists(experience);
  }

  async createExperience(input: {
    isPublished: boolean;
    roleId: string;
    roleEn: string;
    companyName: string;
    companyUrl: string | null;
    startDate: Date | null;
    endDate: Date | null;
    isCurrent: boolean;
    descriptionId: string;
    descriptionEn: string;
    skills: { skillName: string }[];
  }): Promise<Experience> {
    const maxSort = await this.experienceRepository.getMaxSort();
    const nextSort = maxSort + 1;

    return this.experienceRepository.createExperience({
      sort: nextSort,
      isPublished: input.isPublished,
      roleId: input.roleId,
      roleEn: input.roleEn,
      companyName: input.companyName,
      companyUrl: input.companyUrl,
      startDate: input.startDate,
      endDate: input.endDate,
      isCurrent: input.isCurrent,
      descriptionId: sanitizeWysiwygHtml(input.descriptionId),
      descriptionEn: sanitizeWysiwygHtml(input.descriptionEn),
      skills: input.skills,
      createdBy: 0,
      updatedBy: 0,
    });
  }

  async updateExperience(
    id: number,
    input: {
      isPublished?: boolean;
      roleId?: string;
      roleEn?: string;
      companyName?: string;
      companyUrl?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
      isCurrent?: boolean;
      descriptionId?: string;
      descriptionEn?: string;
      skills?: { skillName: string }[];
    },
  ): Promise<Experience> {
    try {
      const updated = await this.experienceRepository.updateExperience(id, {
        ...(typeof input.isPublished === "boolean" ? { isPublished: input.isPublished } : {}),
        ...(typeof input.roleId === "string" ? { roleId: input.roleId } : {}),
        ...(typeof input.roleEn === "string" ? { roleEn: input.roleEn } : {}),
        ...(typeof input.companyName === "string" ? { companyName: input.companyName } : {}),
        ...(typeof input.companyUrl !== "undefined" ? { companyUrl: input.companyUrl } : {}),
        ...(typeof input.startDate !== "undefined" ? { startDate: input.startDate } : {}),
        ...(typeof input.endDate !== "undefined" ? { endDate: input.endDate } : {}),
        ...(typeof input.isCurrent === "boolean" ? { isCurrent: input.isCurrent } : {}),
        ...(typeof input.descriptionId === "string"
          ? { descriptionId: sanitizeWysiwygHtml(input.descriptionId) }
          : {}),
        ...(typeof input.descriptionEn === "string"
          ? { descriptionEn: sanitizeWysiwygHtml(input.descriptionEn) }
          : {}),
        ...(Array.isArray(input.skills) ? { skills: input.skills } : {}),
        updatedBy: 0,
      });

      return validateExperienceExists(updated);
    } catch (error) {
      throwExperienceNotFoundIfPrismaError(error);
      throw error;
    }
  }

  async importExperiences(input: {
    experiences: Array<{
      isPublished: boolean;
      roleId: string;
      roleEn: string;
      companyName: string;
      companyUrl: string | null;
      startDate: Date | null;
      endDate: Date | null;
      isCurrent: boolean;
      descriptionId: string;
      descriptionEn: string;
      skills: { skillName: string }[];
    }>;
  }): Promise<Experience[]> {
    const maxSort = await this.experienceRepository.getMaxSort();
    const createdExperiences: Experience[] = [];

    for (const [index, experience] of input.experiences.entries()) {
      const createdExperience = await this.experienceRepository.createExperience({
        sort: maxSort + index + 1,
        isPublished: experience.isPublished,
        roleId: experience.roleId,
        roleEn: experience.roleEn,
        companyName: experience.companyName,
        companyUrl: experience.companyUrl,
        startDate: experience.startDate,
        endDate: experience.endDate,
        isCurrent: experience.isCurrent,
        descriptionId: sanitizeWysiwygHtml(experience.descriptionId),
        descriptionEn: sanitizeWysiwygHtml(experience.descriptionEn),
        skills: experience.skills,
        createdBy: 0,
        updatedBy: 0,
      });

      createdExperiences.push(createdExperience);
    }

    return createdExperiences;
  }

  async deleteExperience(id: number): Promise<void> {
    const deleted = await this.experienceRepository.deleteExperience(id);
    validateExperienceDeleted(deleted);
  }

  async updateExperienceSort(ids: number[]): Promise<void> {
    try {
      await this.experienceRepository.updateSort(ids, 0);
    } catch (error) {
      throwExperienceNotFoundIfPrismaError(error);
      throw error;
    }
  }
}
