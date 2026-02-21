import type {
  CreateSkillInput,
  Skill,
  SkillListQueryParams,
  UpdateSkillInput,
} from "../../model";

export interface SkillRepository {
  getMaxSort(): Promise<number>;
  findSkills(params?: SkillListQueryParams): Promise<Skill[]>;
  findSkillById(id: number): Promise<Skill | null>;
  findActiveSkills(): Promise<Skill[]>;
  createSkill(input: CreateSkillInput): Promise<Skill>;
  updateSkill(id: number, input: UpdateSkillInput): Promise<Skill>;
  deleteSkill(id: number): Promise<number>;
  updateSort(ids: number[], updatedBy: number): Promise<void>;
}
