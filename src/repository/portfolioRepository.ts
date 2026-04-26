import { getPrisma } from "../config";
import type {
  CreatePortfolioInput,
  Portfolio,
  PortfolioListQueryParams,
  PortfolioSlugLookup,
  UpdatePortfolioInput,
} from "../model";
import type { PortfolioRepository } from "./contracts/portfolioRepository";

export class PrismaPortfolioRepository implements PortfolioRepository {
  private readonly prisma = getPrisma();

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.portfolio.findFirst({
      orderBy: [{ display_order: "desc" }, { id: "desc" }],
      select: { display_order: true },
    });

    return result?.display_order ?? 0;
  }

  findAll(params?: PortfolioListQueryParams): Promise<Portfolio[]> {
    const { skip, take, search } = params ?? {};

    const options: NonNullable<Parameters<typeof this.prisma.portfolio.findMany>[0]> = {
      include: {
        stacks: {
          orderBy: [{ display_order: "asc" }, { id: "desc" }],
        },
      },
      orderBy: [{ display_order: "asc" }, { id: "desc" }],
    };

    if (typeof search === "string" && search) {
      options.where = {
        OR: [
          { slug: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { description_en: { contains: search, mode: "insensitive" } },
          { role: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (typeof skip === "number") {
      options.skip = skip;
    }

    if (typeof take === "number") {
      options.take = take;
    }

    return this.prisma.portfolio.findMany(options) as unknown as Promise<Portfolio[]>;
  }

  findById(id: number): Promise<Portfolio | null> {
    return this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        stacks: {
          orderBy: [{ display_order: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Portfolio | null>;
  }

  findBySlug(slug: string): Promise<PortfolioSlugLookup | null> {
    return this.prisma.portfolio.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
      },
    });
  }

  findPublished(): Promise<Portfolio[]> {
    const now = new Date();

    return this.prisma.portfolio.findMany({
      where: {
        is_published: true,
        OR: [{ published_at: null }, { published_at: { lte: now } }],
      },
      include: {
        stacks: {
          orderBy: [{ display_order: "asc" }, { id: "desc" }],
        },
      },
      orderBy: [{ display_order: "asc" }, { id: "desc" }],
    }) as Promise<Portfolio[]>;
  }

  findPublishedBySlug(slug: string): Promise<Portfolio | null> {
    const now = new Date();

    return this.prisma.portfolio.findFirst({
      where: {
        slug,
        is_published: true,
        OR: [{ published_at: null }, { published_at: { lte: now } }],
      },
      include: {
        stacks: {
          orderBy: [{ display_order: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Portfolio | null>;
  }

  createPortfolio(input: CreatePortfolioInput): Promise<Portfolio> {
    const {
      slug,
      title,
      description,
      descriptionEn,
      contribution,
      contributionEn,
      outcome,
      outcomeEn,
      image,
      role,
      liveUrl,
      githubUrl,
      displayOrder,
      isPublished,
      publishedAt,
      stacks,
      createdBy,
      updatedBy,
    } = input;

    return this.prisma.portfolio.create({
      data: {
        slug,
        title,
        description,
        description_en: descriptionEn,
        contribution,
        contribution_en: contributionEn,
        outcome,
        outcome_en: outcomeEn,
        image,
        role,
        live_url: liveUrl,
        github_url: githubUrl,
        display_order: displayOrder,
        is_published: isPublished,
        published_at: publishedAt,
        created_by: createdBy,
        updated_by: updatedBy,
        stacks: {
          create: stacks.map((stack, index) => ({
            name: stack.name,
            display_order: index + 1,
            created_by: createdBy,
            updated_by: updatedBy,
          })),
        },
      },
      include: {
        stacks: {
          orderBy: [{ display_order: "asc" }, { id: "desc" }],
        },
      },
    }) as Promise<Portfolio>;
  }

  async updatePortfolio(id: number, input: UpdatePortfolioInput): Promise<Portfolio> {
    const {
      slug,
      title,
      description,
      descriptionEn,
      contribution,
      contributionEn,
      outcome,
      outcomeEn,
      image,
      role,
      liveUrl,
      githubUrl,
      isPublished,
      publishedAt,
      stacks,
      updatedBy,
    } = input;

    return this.prisma.$transaction(async (tx) => {
      await tx.portfolio.update({
        where: { id },
        data: {
          ...(typeof slug === "string" ? { slug } : {}),
          ...(typeof title === "string" ? { title } : {}),
          ...(typeof description === "string" ? { description } : {}),
          ...(typeof descriptionEn !== "undefined" ? { description_en: descriptionEn } : {}),
          ...(typeof contribution !== "undefined" ? { contribution } : {}),
          ...(typeof contributionEn !== "undefined"
            ? { contribution_en: contributionEn }
            : {}),
          ...(typeof outcome !== "undefined" ? { outcome } : {}),
          ...(typeof outcomeEn !== "undefined" ? { outcome_en: outcomeEn } : {}),
          ...(typeof image !== "undefined" ? { image } : {}),
          ...(typeof role !== "undefined" ? { role } : {}),
          ...(typeof liveUrl !== "undefined" ? { live_url: liveUrl } : {}),
          ...(typeof githubUrl !== "undefined" ? { github_url: githubUrl } : {}),
          ...(typeof isPublished === "boolean" ? { is_published: isPublished } : {}),
          ...(typeof publishedAt !== "undefined" ? { published_at: publishedAt } : {}),
          updated_by: updatedBy,
        },
      });

      if (Array.isArray(stacks)) {
        await tx.portfolioStack.deleteMany({
          where: { portfolio_id: id },
        });

        if (stacks.length) {
          await tx.portfolioStack.createMany({
            data: stacks.map((stack, index) => ({
              portfolio_id: id,
              name: stack.name,
              display_order: index + 1,
              created_by: 0,
              updated_by: updatedBy,
            })),
          });
        }
      }

      const result = await tx.portfolio.findUnique({
        where: { id },
        include: {
          stacks: {
            orderBy: [{ display_order: "asc" }, { id: "desc" }],
          },
        },
      });

      return result as Portfolio;
    });
  }

  async deletePortfolio(id: number): Promise<number> {
    const result = await this.prisma.portfolio.deleteMany({
      where: { id },
    });

    return result.count;
  }

  async updateSort(ids: number[], updatedBy: number): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.portfolio.update({
          where: { id },
          data: {
            display_order: index + 1,
            updated_by: updatedBy,
          },
        }),
      ),
    );
  }
}
