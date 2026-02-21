export interface CreateCertificationInput {
  name: string;
  nameEn: string;
  issuingOrganization: string;
  issueDate: Date;
  description: string | null;
  descriptionEn: string | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateCertificationInput {
  name?: string;
  nameEn?: string;
  issuingOrganization?: string;
  issueDate?: Date;
  description?: string | null;
  descriptionEn?: string | null;
  isActive?: boolean;
  updatedBy: number;
}

export interface CertificationListQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}

