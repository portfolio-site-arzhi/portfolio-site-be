import type { Certification } from "../model";
import type { CertificationRepository } from "../repository/contracts/certificationRepository";
import {
  throwCertificationNotFoundIfPrismaError,
  validateCertificationDeleted,
  validateCertificationExists,
} from "../validation/certificationDomainValidation";
import { sanitizeWysiwygHtml } from "../helper/htmlSanitizer";

export class CertificationService {
  constructor(private readonly certificationRepository: CertificationRepository) {}

  async listCertifications(params?: { search?: string }): Promise<Certification[]> {
    return this.certificationRepository.findAll({
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
    });
  }

  async getCertificationById(id: number): Promise<Certification> {
    const certification = await this.certificationRepository.findById(id);
    return validateCertificationExists(certification);
  }

  async createCertification(input: {
    name: string;
    nameEn: string;
    issuingOrganization: string;
    issueDate: Date;
    description: string | null;
    descriptionEn: string | null;
    isActive: boolean;
  }): Promise<Certification> {
    const maxSortOrder = await this.certificationRepository.getMaxSortOrder();
    const nextSortOrder = maxSortOrder + 1;

    return this.certificationRepository.createCertification({
      name: input.name,
      nameEn: input.nameEn,
      issuingOrganization: input.issuingOrganization,
      issueDate: input.issueDate,
      description: typeof input.description === "string" ? sanitizeWysiwygHtml(input.description) : null,
      descriptionEn: typeof input.descriptionEn === "string"
        ? sanitizeWysiwygHtml(input.descriptionEn)
        : null,
      sortOrder: nextSortOrder,
      isActive: input.isActive,
      createdBy: 0,
      updatedBy: 0,
    });
  }

  async updateCertification(
    id: number,
    input: {
      name?: string;
      nameEn?: string;
      issuingOrganization?: string;
      issueDate?: Date;
      description?: string | null;
      descriptionEn?: string | null;
      isActive?: boolean;
    },
  ): Promise<Certification> {
    try {
      const updated = await this.certificationRepository.updateCertification(id, {
        ...(typeof input.name === "string" ? { name: input.name } : {}),
        ...(typeof input.nameEn === "string" ? { nameEn: input.nameEn } : {}),
        ...(typeof input.issuingOrganization === "string"
          ? { issuingOrganization: input.issuingOrganization }
          : {}),
        ...(input.issueDate instanceof Date ? { issueDate: input.issueDate } : {}),
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
        ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
        updatedBy: 0,
      });

      return validateCertificationExists(updated);
    } catch (error) {
      throwCertificationNotFoundIfPrismaError(error);
      throw error;
    }
  }

  async deleteCertification(id: number): Promise<void> {
    const deleted = await this.certificationRepository.deleteCertification(id);
    validateCertificationDeleted(deleted);
  }

  async updateCertificationSort(ids: number[]): Promise<void> {
    try {
      await this.certificationRepository.updateSort(ids, 0);
    } catch (error) {
      throwCertificationNotFoundIfPrismaError(error);
      throw error;
    }
  }
}

