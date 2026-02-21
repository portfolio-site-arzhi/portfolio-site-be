import type { Education } from "../model";
import type { EducationRepository } from "../repository/contracts/educationRepository";
import {
  throwEducationNotFoundIfPrismaError,
  validateEducationDeleted,
  validateEducationExists,
} from "../validation/educationDomainValidation";
import { sanitizeWysiwygHtml } from "../helper/htmlSanitizer";

export class EducationService {
  constructor(private readonly educationRepository: EducationRepository) {}

  async listEducations(params?: { search?: string }): Promise<Education[]> {
    return this.educationRepository.findAll({
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
    });
  }

  async getEducationById(id: number): Promise<Education> {
    const education = await this.educationRepository.findById(id);
    return validateEducationExists(education);
  }

  async createEducation(input: {
    institutionName: string;
    degree: string;
    degreeEn: string;
    fieldOfStudy: string;
    fieldOfStudyEn: string;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
    descriptionEn: string | null;
    location: string | null;
    isActive: boolean;
  }): Promise<Education> {
    const maxSortOrder = await this.educationRepository.getMaxSortOrder();
    const nextSortOrder = maxSortOrder + 1;

    return this.educationRepository.createEducation({
      institutionName: input.institutionName,
      degree: input.degree,
      degreeEn: input.degreeEn,
      fieldOfStudy: input.fieldOfStudy,
      fieldOfStudyEn: input.fieldOfStudyEn,
      startDate: input.startDate,
      endDate: input.endDate,
      description: typeof input.description === "string" ? sanitizeWysiwygHtml(input.description) : null,
      descriptionEn: typeof input.descriptionEn === "string"
        ? sanitizeWysiwygHtml(input.descriptionEn)
        : null,
      location: input.location,
      sortOrder: nextSortOrder,
      isActive: input.isActive,
      createdBy: 0,
      updatedBy: 0,
    });
  }

  async updateEducation(
    id: number,
    input: {
      institutionName?: string;
      degree?: string;
      degreeEn?: string;
      fieldOfStudy?: string;
      fieldOfStudyEn?: string;
      startDate?: Date;
      endDate?: Date | null;
      description?: string | null;
      descriptionEn?: string | null;
      location?: string | null;
      isActive?: boolean;
    },
  ): Promise<Education> {
    try {
      const updated = await this.educationRepository.updateEducation(id, {
        ...(typeof input.institutionName === "string"
          ? { institutionName: input.institutionName }
          : {}),
        ...(typeof input.degree === "string" ? { degree: input.degree } : {}),
        ...(typeof input.degreeEn === "string" ? { degreeEn: input.degreeEn } : {}),
        ...(typeof input.fieldOfStudy === "string"
          ? { fieldOfStudy: input.fieldOfStudy }
          : {}),
        ...(typeof input.fieldOfStudyEn === "string"
          ? { fieldOfStudyEn: input.fieldOfStudyEn }
          : {}),
        ...(input.startDate instanceof Date ? { startDate: input.startDate } : {}),
        ...(typeof input.endDate !== "undefined" ? { endDate: input.endDate } : {}),
        ...(typeof input.description !== "undefined"
          ? {
              description:
                typeof input.description === "string"
                  ? sanitizeWysiwygHtml(input.description)
                  : null,
            }
          : {}),
        ...(typeof input.descriptionEn !== "undefined"
          ? {
              descriptionEn:
                typeof input.descriptionEn === "string"
                  ? sanitizeWysiwygHtml(input.descriptionEn)
                  : null,
            }
          : {}),
        ...(typeof input.location !== "undefined" ? { location: input.location } : {}),
        ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
        updatedBy: 0,
      });

      return validateEducationExists(updated);
    } catch (error) {
      throwEducationNotFoundIfPrismaError(error);
      throw error;
    }
  }

  async deleteEducation(id: number): Promise<void> {
    const deleted = await this.educationRepository.deleteEducation(id);
    validateEducationDeleted(deleted);
  }

  async updateEducationSort(ids: number[]): Promise<void> {
    try {
      await this.educationRepository.updateSort(ids, 0);
    } catch (error) {
      throwEducationNotFoundIfPrismaError(error);
      throw error;
    }
  }
}

