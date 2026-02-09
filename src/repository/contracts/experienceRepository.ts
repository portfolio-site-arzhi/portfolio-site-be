import type {
  CreateExperienceInput,
  Experience,
  ExperienceListQueryParams,
  UpdateExperienceInput,
} from "../../model";

export interface ExperienceRepository {
  getMaxSort(): Promise<number>;
  findAll(params?: ExperienceListQueryParams): Promise<Experience[]>;
  findById(id: number): Promise<Experience | null>;
  findPublished(): Promise<Experience[]>;
  createExperience(input: CreateExperienceInput): Promise<Experience>;
  updateExperience(id: number, input: UpdateExperienceInput): Promise<Experience>;
  deleteExperience(id: number): Promise<number>;
  updateSort(ids: number[], updatedBy: number): Promise<void>;
}
