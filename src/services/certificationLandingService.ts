import type { CertificationLandingItem } from "../model";
import type { CertificationRepository } from "../repository/contracts/certificationRepository";

const formatDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

export class CertificationLandingService {
  constructor(private readonly certificationRepository: CertificationRepository) {}

  async listActive(): Promise<CertificationLandingItem[]> {
    const certifications = await this.certificationRepository.findActive();

    return certifications.map((certification) => ({
      id: certification.id,
      sort_order: certification.sort_order,
      name: {
        id: certification.name,
        en: certification.name_en,
      },
      issuing_organization: certification.issuing_organization,
      issue_date: formatDateOnly(certification.issue_date),
      description: {
        id: certification.description,
        en: certification.description_en,
      },
    }));
  }
}

