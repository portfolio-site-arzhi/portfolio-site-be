import fs from "fs";
import path from "path";
import { ISiteConfigRepository } from "../repository/contracts/ISiteConfigRepository";
import {
  SiteConfigData,
  HomeConfigValue,
  CreateSiteConfigInput as CreateSiteConfigModelInput,
} from "../model/siteConfig";
import type { BulkSiteConfigInput } from "../validation/siteConfigValidation";

export class SiteConfigService {
  constructor(private siteConfigRepository: ISiteConfigRepository) {}

  async findAll(): Promise<SiteConfigData[]> {
    const data = await this.siteConfigRepository.findAll();

    const baseUrl = process.env.BASEURL;
    if (!baseUrl) {
      return data;
    }

    const normalizeBaseUrl = baseUrl.replace(/\/+$/, "");

    const addBaseUrlToPhoto = (photo?: string): string | undefined => {
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

    return data.map((config) => {
      if (config.type !== "home") {
        return config;
      }

      const value = config.value as HomeConfigValue;
      const photoWithBase = addBaseUrlToPhoto(value.photo);

      if (!photoWithBase || photoWithBase === value.photo) {
        return config;
      }

      return {
        ...config,
        value: {
          ...value,
          photo: photoWithBase,
        },
      };
    });
  }

  async create(input: CreateSiteConfigModelInput): Promise<SiteConfigData> {
    return await this.siteConfigRepository.create(input);
  }

  async bulkUpsertLandingConfigs(
    input: BulkSiteConfigInput,
    options: {
      homePhotoFilename: string | undefined;
    },
  ): Promise<void> {
    const existingConfigs = await this.siteConfigRepository.findAll();
    const existingHomeBase = existingConfigs.find(
      (c) => c.type === "home" && c.locale === null,
    );
    const existingHomeId = existingConfigs.find(
      (c) => c.type === "home" && c.locale === "id",
    );
    const existingHomeEn = existingConfigs.find(
      (c) => c.type === "home" && c.locale === "en",
    );
    const existingHomeBaseValue = existingHomeBase
      ? (existingHomeBase.value as HomeConfigValue)
      : null;
    const existingHomeIdValue = existingHomeId
      ? (existingHomeId.value as HomeConfigValue)
      : null;
    const existingHomeEnValue = existingHomeEn
      ? (existingHomeEn.value as HomeConfigValue)
      : null;
    const existingPhoto =
      existingHomeBaseValue?.photo ??
      existingHomeIdValue?.photo ??
      existingHomeEnValue?.photo ??
      undefined;

    if (input.system) {
      await this.siteConfigRepository.create({
        type: "system",
        locale: undefined,
        value: input.system,
        createdBy: 0,
        updatedBy: 0,
      });
    }

    const homeStatusFile = input.home?.status_file ?? 0;
    const homeValue = input.home?.value;

    const baseName =
      homeValue?.name ?? existingHomeBaseValue?.name ?? existingHomeIdValue?.name ?? "";
    const basePosition =
      homeValue?.position ??
      existingHomeBaseValue?.position ??
      existingHomeIdValue?.position ??
      "";

    let newPhotoPath: string | undefined;

    if (homeStatusFile === 1) {
      if (options.homePhotoFilename) {
        const photoPath = `/uploads/profile/${options.homePhotoFilename}`;
        newPhotoPath = photoPath;
      } else {
        newPhotoPath = undefined;
      }
    } else {
      newPhotoPath = existingPhoto;
    }

    const baseHomeValue: Record<string, unknown> = {
      name: baseName,
      position: basePosition,
    };

    if (newPhotoPath) {
      baseHomeValue.photo = newPhotoPath;
    }

    await this.siteConfigRepository.create({
      type: "home",
      locale: undefined,
      value: baseHomeValue,
      createdBy: 0,
      updatedBy: 0,
    });

    const idHomeDescription = homeValue?.description.id;
    const enHomeDescription = homeValue?.description.en;

    if (idHomeDescription) {
      await this.siteConfigRepository.create({
        type: "home",
        locale: "id",
        value: {
          description: idHomeDescription,
        },
        createdBy: 0,
        updatedBy: 0,
      });
    }

    if (enHomeDescription) {
      await this.siteConfigRepository.create({
        type: "home",
        locale: "en",
        value: {
          description: enHomeDescription,
        },
        createdBy: 0,
        updatedBy: 0,
      });
    }

    if (homeStatusFile === 1 && existingPhoto) {
      const oldPhotoPath = existingPhoto;

      const prefix = "/uploads/profile/";
      if (oldPhotoPath.startsWith(prefix)) {
        const relativePath = oldPhotoPath.replace(/^\/+/, "");
        const fullPath = path.join(process.cwd(), relativePath);

        if (!newPhotoPath || newPhotoPath !== oldPhotoPath) {
          try {
            fs.unlinkSync(fullPath);
          } catch (error) {
            if (
              !(
                error instanceof Error &&
                "code" in error &&
                (error as { code?: unknown }).code === "ENOENT"
              )
            ) {
            }
          }
        }
      }
    }

    if (input.about?.value) {
      const aboutValue = input.about.value;

      await this.siteConfigRepository.create({
        type: "about",
        locale: undefined,
        value: {
          email: aboutValue.email,
        },
        createdBy: 0,
        updatedBy: 0,
      });

      await this.siteConfigRepository.create({
        type: "about",
        locale: "id",
        value: {
          about_me: aboutValue.about_me.id,
        },
        createdBy: 0,
        updatedBy: 0,
      });

      await this.siteConfigRepository.create({
        type: "about",
        locale: "en",
        value: {
          about_me: aboutValue.about_me.en,
        },
        createdBy: 0,
        updatedBy: 0,
      });
    }

    if (input.footer?.value) {
      await this.siteConfigRepository.create({
        type: "footer",
        locale: undefined,
        value: input.footer.value,
        createdBy: 0,
        updatedBy: 0,
      });
    }
  }
}
