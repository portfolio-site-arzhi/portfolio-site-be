export interface ExperienceSkill {
  id: number;
  experience_id: number;
  skill_name: string;
  sort: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface Experience {
  id: number;
  sort: number;
  is_published: boolean;
  role_id: string;
  role_en: string;
  company_name: string;
  company_url: string | null;
  start_date: Date | null;
  end_date: Date | null;
  is_current: boolean;
  description_id: string;
  description_en: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  skills: ExperienceSkill[];
}

export interface ExperienceLandingItem {
  id: number;
  sort: number;
  role: {
    id: string;
    en: string;
  };
  company_name: string;
  company_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: {
    id: string;
    en: string;
  };
  skills: {
    id: number;
    skill_name: string;
    sort: number;
  }[];
}
