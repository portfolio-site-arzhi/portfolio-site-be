import { ISiteConfigRepository } from "../repository/contracts/ISiteConfigRepository";
import { LandingPageResponse } from "../model/siteConfig";

export class SiteConfigLandingService {
  constructor(private siteConfigRepository: ISiteConfigRepository) {}

  async getLandingPageData(): Promise<LandingPageResponse> {
    const data = await this.siteConfigRepository.getLandingPageData();

    const baseUrl = process.env.BASEURL;
    if (!baseUrl) {
      return data;
    }

    const normalizeBaseUrl = baseUrl.replace(/\/+$/, "");

    const addBaseUrlToPhoto = (photo: string): string => {
      if (!photo) {
        return photo;
      }

      if (photo.startsWith("http://") || photo.startsWith("https://")) {
        return photo;
      }

      if (photo.startsWith("/")) {
        return `${normalizeBaseUrl}${photo}`;
      }

      return `${normalizeBaseUrl}/${photo}`;
    };

    const home: LandingPageResponse["home"] = data.home
      ? {
          ...data.home,
          ...(data.home.photo
            ? {
                photo: addBaseUrlToPhoto(data.home.photo),
              }
            : {}),
        }
      : data.home;

    return {
      ...data,
      home,
    };
  }
}
