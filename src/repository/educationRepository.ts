import { getPrisma } from "../config";
import type {
  CreateEducationInput,
  Education,
  EducationListQueryParams,
  UpdateEducationInput,
} from "../model";
import type { EducationRepository } from "./contracts/educationRepository";

export class PrismaEducationRepository implements EducationRepository {
  private readonly prisma = getPrisma();

  async getMaxSortOrder(): Promise<number> {
    const result = await this.prisma.education.findFirst({
      orderBy: [{ sort_order: "desc" }, { id: "desc" }],
      select: { sort_order: true },
    });

    return result?.sort_order ?? 0;
  }

  findAll(params?: EducationListQueryParams): Promise<Education[]> {
    const { skip, take, search } = params ?? {};

    const options: Parameters<typeof this.prisma.education.findMany>[0] = {
      orderBy: [{ sort_order: "asc" }, { id: "desc" }],
    };

    if (typeof search === "string" && search) {
      options.where = {
        OR: [
          { institution_name: { contains: search, mode: "insensitive" } },
          { degree: { contains: search, mode: "insensitive" } },
          { degree_en: { contains: search, mode: "insensitive" } },
          { field_of_study: { contains: search, mode: "insensitive" } },
          { field_of_study_en: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (typeof skip === "number") {
      options.skip = skip;
    }

    if (typeof take === "number") {
      options.take = take;
    }

    return this.prisma.education.findMany(options) as Promise<Education[]>;
  }

  findById(id: number): Promise<Education | null> {
    return this.prisma.education.findUnique({
      where: { id },
    }) as Promise<Education | null>;
  }

  findActive(): Promise<Education[]> {
    return this.prisma.education.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { id: "desc" }],
    }) as Promise<Education[]>;
  }

  createEducation(input: CreateEducationInput): Promise<Education> {
    const {
      institutionName,
      degree,
      degreeEn,
      fieldOfStudy,
      fieldOfStudyEn,
      startDate,
      endDate,
      description,
      descriptionEn,
      location,
      sortOrder,
      isActive,
      createdBy,
      updatedBy,
    } = input;

    return this.prisma.education.create({
      data: {
        institution_name: institutionName,
        degree,
        degree_en: degreeEn,
        field_of_study: fieldOfStudy,
        field_of_study_en: fieldOfStudyEn,
        start_date: startDate,
        end_date: endDate,
        description,
        description_en: descriptionEn,
        location,
        sort_order: sortOrder,
        is_active: isActive,
        created_by: createdBy,
        updated_by: updatedBy,
      },
    }) as Promise<Education>;
  }

  async updateEducation(id: number, input: UpdateEducationInput): Promise<Education> {
    const {
      institutionName,
      degree,
      degreeEn,
      fieldOfStudy,
      fieldOfStudyEn,
      startDate,
      endDate,
      description,
      descriptionEn,
      location,
      isActive,
      updatedBy,
    } = input;

    return this.prisma.education.update({
      where: { id },
      data: {
        ...(typeof institutionName === "string" ? { institution_name: institutionName } : {}),
        ...(typeof degree === "string" ? { degree } : {}),
        ...(typeof degreeEn === "string" ? { degree_en: degreeEn } : {}),
        ...(typeof fieldOfStudy === "string" ? { field_of_study: fieldOfStudy } : {}),
        ...(typeof fieldOfStudyEn === "string" ? { field_of_study_en: fieldOfStudyEn } : {}),
        ...(startDate instanceof Date ? { start_date: startDate } : {}),
        ...(typeof endDate !== "undefined" ? { end_date: endDate } : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
        ...(typeof descriptionEn !== "undefined" ? { description_en: descriptionEn } : {}),
        ...(typeof location !== "undefined" ? { location } : {}),
        ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        updated_by: updatedBy,
      },
    }) as Promise<Education>;
  }

  async deleteEducation(id: number): Promise<number> {
    const result = await this.prisma.education.deleteMany({ where: { id } });
    return result.count;
  }

  async updateSort(ids: number[], updatedBy: number): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.education.update({
          where: { id },
          data: {
            sort_order: index + 1,
            updated_by: updatedBy,
          },
        }),
      ),
    );
  }
}

