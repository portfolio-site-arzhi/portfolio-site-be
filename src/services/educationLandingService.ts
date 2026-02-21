import type { EducationLandingItem } from "../model";
import type { EducationRepository } from "../repository/contracts/educationRepository";

const formatDateOnly = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

export class EducationLandingService {
  constructor(private readonly educationRepository: EducationRepository) {}

  async listActive(): Promise<EducationLandingItem[]> {
    const educations = await this.educationRepository.findActive();

    return educations.map((education) => ({
      id: education.id,
      sort_order: education.sort_order,
      institution_name: education.institution_name,
      degree: {
        id: education.degree,
        en: education.degree_en,
      },
      field_of_study: {
        id: education.field_of_study,
        en: education.field_of_study_en,
      },
      start_date: formatDateOnly(education.start_date) ?? "",
      end_date: formatDateOnly(education.end_date),
      description: {
        id: education.description,
        en: education.description_en,
      },
      location: education.location,
    }));
  }
}

