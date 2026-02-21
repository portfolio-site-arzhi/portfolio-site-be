export interface SkillItem {
  id: number;
  skill_group_id: number;
  name: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface Skill {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  skills: SkillItem[];
}

export interface SkillLandingItem {
  id: number;
  display_order: number;
  name: {
    id: string;
    en: string;
  };
}

export interface SkillLandingGroupItem {
  id: number;
  display_order: number;
  name: {
    id: string;
    en: string;
  };
  skills: SkillLandingItem[];
}
