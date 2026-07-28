export type SiteConfigType = "system" | "home" | "about" | "footer";
export type Locale = "id" | "en";

export interface SystemConfigValue {
  primary_color: string;
  secondary_color: string;
}

export interface HomeConfigValue {
  name: string;
  position: string;
  description: string;
  photo?: string;
}

export interface AboutConfigValue {
  about_me: string;
  email: string;
  address: string;
  whatsapp?: string;
}

export interface FooterConfigValue {
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export type SiteConfigValue = SystemConfigValue | HomeConfigValue | AboutConfigValue | FooterConfigValue;

export interface CreateSiteConfigInput {
  type: SiteConfigType;
  locale: Locale | undefined;
  value: Record<string, unknown>;
  createdBy: number;
  updatedBy: number;
}

export interface SiteConfigData {
  id: number;
  type: SiteConfigType;
  locale: Locale | null;
  value: SiteConfigValue;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface LocalizedTextValue {
  id: string | null;
  en: string | null;
}

export interface HomeLandingValue {
  name: string;
  position: string;
  description: LocalizedTextValue;
  photo?: string;
}

export interface AboutLandingValue {
  about_me: LocalizedTextValue;
  email: string;
  address: string;
  whatsapp?: string;
}

export interface FooterLandingValue {
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface LandingPageResponse {
  system: SystemConfigValue | null;
  home: HomeLandingValue | null;
  about: AboutLandingValue | null;
  footer: FooterLandingValue | null;
}
