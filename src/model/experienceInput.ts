export interface ExperienceSkillInput {
  skillName: string;
}

export interface CreateExperienceInput {
  sort: number;
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
  skills: ExperienceSkillInput[];
  createdBy: number;
  updatedBy: number;
}

export interface UpdateExperienceInput {
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
  skills?: ExperienceSkillInput[];
  updatedBy: number;
}

export interface ExperienceListQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}
