import type {
  CreateEducationInput,
  Education,
  EducationListQueryParams,
  UpdateEducationInput,
} from "../../model";

export interface EducationRepository {
  getMaxSortOrder(): Promise<number>;
  findAll(params?: EducationListQueryParams): Promise<Education[]>;
  findById(id: number): Promise<Education | null>;
  findActive(): Promise<Education[]>;
  createEducation(input: CreateEducationInput): Promise<Education>;
  updateEducation(id: number, input: UpdateEducationInput): Promise<Education>;
  deleteEducation(id: number): Promise<number>;
  updateSort(ids: number[], updatedBy: number): Promise<void>;
}

