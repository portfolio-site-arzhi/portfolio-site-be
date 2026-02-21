export interface SkillItemInput {
  name: string;
}

export interface SkillListQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}

export interface CreateSkillInput {
  name: string;
  displayOrder: number;
  isActive: boolean;
  skills: SkillItemInput[];
  createdBy: number;
  updatedBy: number;
}

export interface UpdateSkillInput {
  name?: string;
  isActive?: boolean;
  skills?: SkillItemInput[];
  updatedBy: number;
}
