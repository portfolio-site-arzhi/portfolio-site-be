export interface Certification {
  id: number;
  name: string;
  name_en: string;
  issuing_organization: string;
  issue_date: Date;
  description: string | null;
  description_en: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface CertificationLandingItem {
  id: number;
  sort_order: number;
  name: {
    id: string;
    en: string;
  };
  issuing_organization: string;
  issue_date: string;
  description: {
    id: string | null;
    en: string | null;
  };
}

