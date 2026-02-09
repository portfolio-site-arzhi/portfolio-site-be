import { getPrisma } from "../config";
import type {
  CreateExperienceInput,
  Experience,
  ExperienceListQueryParams,
  UpdateExperienceInput,
} from "../model";
import type { ExperienceRepository } from "./contracts/experienceRepository";

export class PrismaExperienceRepository implements ExperienceRepository {
  private readonly prisma = getPrisma();

  async getMaxSort(): Promise<number> {
    const result = await this.prisma.experience.findFirst({
      orderBy: [{ sort: "desc" }, { id: "desc" }],
      select: { sort: true },
    });
    return result?.sort ?? 0;
  }

  findAll(params?: ExperienceListQueryParams): Promise<Experience[]> {
    const { skip, take, search } = params ?? {};

    const options: Parameters<typeof this.prisma.experience.findMany>[0] = {
      include: {
        skills: {
          orderBy: [{ sort: "asc" }, { id: "desc" }],
        },
      },
      orderBy: [{ sort: "asc" }, { id: "desc" }],
    };

    if (typeof search === "string" && search) {
      options.where = {
        OR: [
          { role_id: { contains: search, mode: "insensitive" } },
          { role_en: { contains: search, mode: "insensitive" } },
          { company_name: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (typeof skip === "number") {
      options.skip = skip;
    }

    if (typeof take === "number") {
      options.take = take;
    }

    return this.prisma.experience.findMany(options) as Promise<Experience[]>;
  }

  findById(id: number): Promise<Experience | null> {
    return this.prisma.experience.findUnique({
      where: { id },
      include: {
        skills: {
          orderBy: [{ sort: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Experience | null>;
  }

  async findPublished(): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { is_published: true },
      orderBy: [{ sort: "asc" }, { id: "desc" }],
      include: {
        skills: {
          orderBy: [{ sort: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Experience[]>;
  }

  createExperience(input: CreateExperienceInput): Promise<Experience> {
    const {
      sort,
      isPublished,
      roleId,
      roleEn,
      companyName,
      companyUrl,
      startDate,
      endDate,
      isCurrent,
      descriptionId,
      descriptionEn,
      skills,
      createdBy,
      updatedBy,
    } = input;

    return this.prisma.experience.create({
      data: {
        sort,
        is_published: isPublished,
        role_id: roleId,
        role_en: roleEn,
        company_name: companyName,
        company_url: companyUrl,
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
        description_id: descriptionId,
        description_en: descriptionEn,
        created_by: createdBy,
        updated_by: updatedBy,
        skills: {
          create: skills.map((skill, index) => ({
            skill_name: skill.skillName,
            sort: index + 1,
            created_by: createdBy,
            updated_by: updatedBy,
          })),
        },
      },
      include: {
        skills: {
          orderBy: [{ sort: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Experience>;
  }

  async updateExperience(id: number, input: UpdateExperienceInput): Promise<Experience> {
    const {
      isPublished,
      roleId,
      roleEn,
      companyName,
      companyUrl,
      startDate,
      endDate,
      isCurrent,
      descriptionId,
      descriptionEn,
      skills,
      updatedBy,
    } = input;

    return this.prisma.$transaction(async (tx) => {
      const experience = await tx.experience.update({
        where: { id },
        data: {
          ...(typeof isPublished === "boolean" ? { is_published: isPublished } : {}),
          ...(typeof roleId === "string" ? { role_id: roleId } : {}),
          ...(typeof roleEn === "string" ? { role_en: roleEn } : {}),
          ...(typeof companyName === "string" ? { company_name: companyName } : {}),
          ...(typeof companyUrl !== "undefined" ? { company_url: companyUrl } : {}),
          ...(typeof startDate !== "undefined" ? { start_date: startDate } : {}),
          ...(typeof endDate !== "undefined" ? { end_date: endDate } : {}),
          ...(typeof isCurrent === "boolean" ? { is_current: isCurrent } : {}),
          ...(typeof descriptionId === "string" ? { description_id: descriptionId } : {}),
          ...(typeof descriptionEn === "string" ? { description_en: descriptionEn } : {}),
          updated_by: updatedBy,
        },
      });

      if (Array.isArray(skills)) {
        await tx.experienceSkill.deleteMany({
          where: { experience_id: id },
        });

        if (skills.length) {
          await tx.experienceSkill.createMany({
            data: skills.map((skill, index) => ({
              experience_id: id,
              skill_name: skill.skillName,
              sort: index + 1,
              created_by: 0,
              updated_by: updatedBy,
            })),
          });
        }
      }

      const result = await tx.experience.findUnique({
        where: { id: experience.id },
        include: {
          skills: {
            orderBy: [{ sort: "asc" }, { id: "desc" }],
          },
        },
      });

      return result as Experience;
    });
  }

  async deleteExperience(id: number): Promise<number> {
    const result = await this.prisma.experience.deleteMany({ where: { id } });
    return result.count;
  }

  async updateSort(ids: number[], updatedBy: number): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.experience.update({
          where: { id },
          data: {
            sort: index + 1,
            updated_by: updatedBy,
          },
        }),
      ),
    );
  }
}
