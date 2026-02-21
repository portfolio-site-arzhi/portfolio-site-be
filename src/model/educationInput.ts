export interface CreateEducationInput {
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
  sortOrder: number;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateEducationInput {
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
  updatedBy: number;
}

export interface EducationListQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}

