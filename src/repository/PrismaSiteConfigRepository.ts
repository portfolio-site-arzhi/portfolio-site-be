import { PrismaClient } from "@prisma/client";
import {
  SiteConfigData,
  LandingPageResponse,
  CreateSiteConfigInput,
  SiteConfigType,
  Locale,
  SiteConfigValue,
  SystemConfigValue,
  HomeConfigValue,
  AboutConfigValue,
  FooterConfigValue,
  HomeLandingValue,
  AboutLandingValue,
  FooterLandingValue,
} from "../model/siteConfig";
import { ISiteConfigRepository } from "./contracts/ISiteConfigRepository";
import { assertSiteConfigGroupNotEmpty } from "../validation/siteConfigDomainValidation";

export class PrismaSiteConfigRepository implements ISiteConfigRepository {
  constructor(private prisma: PrismaClient) {}

  private mapGroupToDomain(configs: {
    id: number;
    type: string;
    locale: string | null;
    key: string;
    value: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
  }[]): SiteConfigData {
    assertSiteConfigGroupNotEmpty(configs);
    const first = configs[0]!;
    const value: Record<string, unknown> = {};

    for (const config of configs) {
      value[config.key] = config.value;
    }

    return {
      id: first.id,
      type: first.type as SiteConfigType,
      locale: first.locale as Locale | null,
      value: value as SiteConfigValue,
      created_at: first.created_at,
      updated_at: first.updated_at,
      created_by: first.created_by,
      updated_by: first.updated_by,
    };
  }

  async findAll(): Promise<SiteConfigData[]> {
    const rows = await this.prisma.siteConfiguration.findMany({
      orderBy: [
        { type: "asc" },
        { id: "asc" },
      ],
    });

    const groups = new Map<string, typeof rows>();

    for (const row of rows) {
      const key = `${row.type}::${row.locale ?? "null"}`;
      const group = groups.get(key);
      if (group) {
        group.push(row);
      } else {
        groups.set(key, [row]);
      }
    }

    return Array.from(groups.values()).map((group) =>
      this.mapGroupToDomain(
        group.map((c) => ({
          id: c.id,
          type: c.type,
          locale: c.locale,
          key: c.key,
          value: c.value,
          created_at: c.created_at,
          updated_at: c.updated_at,
          created_by: c.created_by,
          updated_by: c.updated_by,
        })),
      ),
    );
  }

  async create(input: CreateSiteConfigInput): Promise<SiteConfigData> {
    const locale = input.locale ?? null;

    const values = input.value ?? {};

    const createdConfigs = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.siteConfiguration.findMany({
        where: {
          type: input.type,
          locale,
        },
        orderBy: {
          id: "asc",
        },
      });
      const existingByKey = new Map(existing.map((row) => [row.key, row]));

      const rows: {
        id: number;
        type: string;
        locale: string | null;
        key: string;
        value: string;
        created_at: Date;
        updated_at: Date;
        created_by: number;
        updated_by: number;
      }[] = [];

      for (const [key, value] of Object.entries(values)) {
        const existingRow = existingByKey.get(key);
        if (existingRow) {
          const updated = await tx.siteConfiguration.update({
            where: { id: existingRow.id },
            data: {
              value: String(value),
              updated_by: input.updatedBy,
            },
          });
          rows.push({
            id: updated.id,
            type: updated.type,
            locale: updated.locale,
            key: updated.key,
            value: updated.value,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
            created_by: updated.created_by,
            updated_by: updated.updated_by,
          });
        } else {
          const created = await tx.siteConfiguration.create({
            data: {
              type: input.type,
              locale,
              key,
              value: String(value),
              created_by: input.createdBy,
              updated_by: input.updatedBy,
            },
          });
          rows.push({
            id: created.id,
            type: created.type,
            locale: created.locale,
            key: created.key,
            value: created.value,
            created_at: created.created_at,
            updated_at: created.updated_at,
            created_by: created.created_by,
            updated_by: created.updated_by,
          });
        }
      }

      for (const row of existing) {
        if (!(row.key in values)) {
          await tx.siteConfiguration.delete({
            where: { id: row.id },
          });
        }
      }

      rows.sort((a, b) => a.id - b.id);
      return rows;
    });

    return this.mapGroupToDomain(createdConfigs);
  }

  async getLandingPageData(): Promise<LandingPageResponse> {
    const allConfigs = await this.findAll();

    const systemConfig = allConfigs.find((c) => c.type === "system");

    const homeBaseConfig = allConfigs.find(
      (c) => c.type === "home" && c.locale === null,
    );
    const homeIdConfig = allConfigs.find(
      (c) => c.type === "home" && c.locale === "id",
    );
    const homeEnConfig = allConfigs.find(
      (c) => c.type === "home" && c.locale === "en",
    );

    const aboutBaseConfig = allConfigs.find(
      (c) => c.type === "about" && c.locale === null,
    );
    const aboutIdConfig = allConfigs.find(
      (c) => c.type === "about" && c.locale === "id",
    );
    const aboutEnConfig = allConfigs.find(
      (c) => c.type === "about" && c.locale === "en",
    );

    const footerConfig = allConfigs.find((c) => c.type === "footer");

    const system = systemConfig
      ? (systemConfig.value as SystemConfigValue)
      : null;

    const homeBaseValue = homeBaseConfig
      ? (homeBaseConfig.value as HomeConfigValue)
      : null;
    const homeIdValue = homeIdConfig
      ? (homeIdConfig.value as HomeConfigValue)
      : null;
    const homeEnValue = homeEnConfig
      ? (homeEnConfig.value as HomeConfigValue)
      : null;

    const home: HomeLandingValue | null =
      homeBaseValue || homeIdValue || homeEnValue
        ? {
            name: homeBaseValue?.name ?? "",
            position: homeBaseValue?.position ?? "",
            description: {
              id: homeIdValue?.description ?? null,
              en: homeEnValue?.description ?? null,
            },
            ...(homeBaseValue?.photo !== undefined
              ? {
                  photo: homeBaseValue.photo,
                }
              : {}),
          }
        : null;

    const aboutBaseValue = aboutBaseConfig
      ? (aboutBaseConfig.value as AboutConfigValue)
      : null;
    const aboutIdValue = aboutIdConfig
      ? (aboutIdConfig.value as AboutConfigValue)
      : null;
    const aboutEnValue = aboutEnConfig
      ? (aboutEnConfig.value as AboutConfigValue)
      : null;

    const about: AboutLandingValue | null =
      aboutBaseValue || aboutIdValue || aboutEnValue
        ? {
            about_me: {
              id: aboutIdValue?.about_me ?? null,
              en: aboutEnValue?.about_me ?? null,
            },
            email: aboutBaseValue?.email ?? "",
          }
        : null;

    const footerValue = footerConfig
      ? (footerConfig.value as FooterConfigValue)
      : null;

    const footer: FooterLandingValue | null = footerValue
      ? {
          ...(footerValue.github
            ? {
                github: footerValue.github,
              }
            : {}),
          ...(footerValue.linkedin
            ? {
                linkedin: footerValue.linkedin,
              }
            : {}),
          ...(footerValue.instagram
            ? {
                instagram: footerValue.instagram,
              }
            : {}),
        }
      : null;

    return {
      system,
      home,
      about,
      footer,
    };
  }
}
