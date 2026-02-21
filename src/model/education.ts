export interface Education {
  id: number;
  institution_name: string;
  degree: string;
  degree_en: string;
  field_of_study: string;
  field_of_study_en: string;
  start_date: Date;
  end_date: Date | null;
  description: string | null;
  description_en: string | null;
  location: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface EducationLandingItem {
  id: number;
  sort_order: number;
  institution_name: string;
  degree: {
    id: string;
    en: string;
  };
  field_of_study: {
    id: string;
    en: string;
  };
  start_date: string;
  end_date: string | null;
  description: {
    id: string | null;
    en: string | null;
  };
  location: string | null;
}

