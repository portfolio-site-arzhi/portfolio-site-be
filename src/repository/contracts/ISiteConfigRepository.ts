import {
  SiteConfigData,
  LandingPageResponse,
  CreateSiteConfigInput,
  SiteConfigType,
  Locale,
} from "../../model/siteConfig";

export interface ISiteConfigRepository {
  findAll(): Promise<SiteConfigData[]>;
  create(input: CreateSiteConfigInput): Promise<SiteConfigData>;
  getLandingPageData(): Promise<LandingPageResponse>;
}
