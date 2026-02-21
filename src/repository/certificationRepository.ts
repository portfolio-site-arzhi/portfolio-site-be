import { getPrisma } from "../config";
import type {
  Certification,
  CertificationListQueryParams,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "../model";
import type { CertificationRepository } from "./contracts/certificationRepository";

export class PrismaCertificationRepository implements CertificationRepository {
  private readonly prisma = getPrisma();

  async getMaxSortOrder(): Promise<number> {
    const result = await this.prisma.certification.findFirst({
      orderBy: [{ sort_order: "desc" }, { id: "desc" }],
      select: { sort_order: true },
    });

    return result?.sort_order ?? 0;
  }

  findAll(params?: CertificationListQueryParams): Promise<Certification[]> {
    const { skip, take, search } = params ?? {};

    const options: Parameters<typeof this.prisma.certification.findMany>[0] = {
      orderBy: [{ sort_order: "asc" }, { id: "desc" }],
    };

    if (typeof search === "string" && search) {
      options.where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { name_en: { contains: search, mode: "insensitive" } },
          { issuing_organization: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (typeof skip === "number") {
      options.skip = skip;
    }

    if (typeof take === "number") {
      options.take = take;
    }

    return this.prisma.certification.findMany(options) as Promise<Certification[]>;
  }

  findById(id: number): Promise<Certification | null> {
    return this.prisma.certification.findUnique({
      where: { id },
    }) as Promise<Certification | null>;
  }

  findActive(): Promise<Certification[]> {
    return this.prisma.certification.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { id: "desc" }],
    }) as Promise<Certification[]>;
  }

  createCertification(input: CreateCertificationInput): Promise<Certification> {
    const {
      name,
      nameEn,
      issuingOrganization,
      issueDate,
      description,
      descriptionEn,
      sortOrder,
      isActive,
      createdBy,
      updatedBy,
    } = input;

    return this.prisma.certification.create({
      data: {
        name,
        name_en: nameEn,
        issuing_organization: issuingOrganization,
        issue_date: issueDate,
        description,
        description_en: descriptionEn,
        sort_order: sortOrder,
        is_active: isActive,
        created_by: createdBy,
        updated_by: updatedBy,
      },
    }) as Promise<Certification>;
  }

  updateCertification(id: number, input: UpdateCertificationInput): Promise<Certification> {
    const {
      name,
      nameEn,
      issuingOrganization,
      issueDate,
      description,
      descriptionEn,
      isActive,
      updatedBy,
    } = input;

    return this.prisma.certification.update({
      where: { id },
      data: {
        ...(typeof name === "string" ? { name } : {}),
        ...(typeof nameEn === "string" ? { name_en: nameEn } : {}),
        ...(typeof issuingOrganization === "string"
          ? { issuing_organization: issuingOrganization }
          : {}),
        ...(issueDate instanceof Date ? { issue_date: issueDate } : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
        ...(typeof descriptionEn !== "undefined" ? { description_en: descriptionEn } : {}),
        ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
        updated_by: updatedBy,
      },
    }) as Promise<Certification>;
  }

  async deleteCertification(id: number): Promise<number> {
    const result = await this.prisma.certification.deleteMany({ where: { id } });
    return result.count;
  }

  async updateSort(ids: number[], updatedBy: number): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.certification.update({
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

