export interface ExperienceImportSkillItem {
  skill_name: string;
}

export interface ExperienceImportItem {
  is_published: boolean;
  role_id: string;
  role_en: string;
  company_name: string;
  company_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description_id: string;
  description_en: string;
  skills: ExperienceImportSkillItem[];
}

export interface ExperienceImportPayload {
  experiences: ExperienceImportItem[];
}

export interface ExperienceImportUploadFile {
  buffer: Buffer;
  originalname: string;
}

export interface ExperienceImportSampleFile {
  filename: string;
  buffer: Buffer;
  contentType: string;
}
