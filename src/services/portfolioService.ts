import fs from "fs";
import path from "path";
import type { Portfolio, PortfolioCreateServiceInput } from "../model";
import { sanitizeWysiwygHtml } from "../helper/htmlSanitizer";
import { createSlugCandidate, createSlugFromTitle } from "../helper/slug";
import type { PortfolioRepository } from "../repository/contracts/portfolioRepository";
import {
  throwPortfolioDomainErrorIfPrismaError,
  validatePortfolioDeleted,
  validatePortfolioExists,
} from "../validation/portfolioDomainValidation";

const PORTFOLIO_UPLOAD_PREFIX = "/uploads/portfolio/";

const removePortfolioImageFile = (image: string | null | undefined): void => {
  if (!image || !image.startsWith(PORTFOLIO_UPLOAD_PREFIX)) {
    return;
  }

  const relativePath = image.replace(/^\/+/, "");
  const fullPath = path.join(process.cwd(), relativePath);

  try {
    fs.unlinkSync(fullPath);
  } catch {
    return;
  }
};

const MAX_SLUG_ATTEMPTS = 100;

const sanitizeOptionalHtml = (value: string | null): string | null =>
  typeof value === "string" ? sanitizeWysiwygHtml(value) : null;

export class PortfolioService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  private async generateUniqueSlug(
    title: string,
    options?: { excludeId?: number },
  ): Promise<string> {
    const baseSlug = createSlugFromTitle(title);

    for (let sequence = 1; sequence <= MAX_SLUG_ATTEMPTS; sequence += 1) {
      const candidate = createSlugCandidate(baseSlug, sequence);
      const existingPortfolio = await this.portfolioRepository.findBySlug(candidate);

      if (!existingPortfolio || existingPortfolio.id === options?.excludeId) {
        return candidate;
      }
    }

    throw new Error("PORTFOLIO_SLUG_ALREADY_EXISTS");
  }

  private async createPortfolioRecord(
    input: PortfolioCreateServiceInput,
    displayOrder: number,
  ): Promise<Portfolio> {
    const slug = await this.generateUniqueSlug(input.title);

    return this.portfolioRepository.createPortfolio({
      slug,
      title: input.title,
      description: input.description,
      descriptionEn: input.descriptionEn,
      contribution: sanitizeOptionalHtml(input.contribution),
      contributionEn: sanitizeOptionalHtml(input.contributionEn),
      outcome: sanitizeOptionalHtml(input.outcome),
      outcomeEn: sanitizeOptionalHtml(input.outcomeEn),
      image: input.image,
      role: input.role,
      liveUrl: input.liveUrl,
      githubUrl: input.githubUrl,
      displayOrder,
      isPublished: input.isPublished,
      publishedAt: input.publishedAt,
      stacks: input.stacks,
      createdBy: 0,
      updatedBy: 0,
    });
  }

  async listPortfolios(params?: { search?: string }): Promise<Portfolio[]> {
    return this.portfolioRepository.findAll({
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
    });
  }

  async getPortfolioById(id: number): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findById(id);
    return validatePortfolioExists(portfolio);
  }

  async createPortfolio(input: PortfolioCreateServiceInput): Promise<Portfolio> {
    try {
      const maxDisplayOrder = await this.portfolioRepository.getMaxDisplayOrder();
      return await this.createPortfolioRecord(input, maxDisplayOrder + 1);
    } catch (error) {
      throwPortfolioDomainErrorIfPrismaError(error);
      throw error;
    }
  }

  async importPortfolios(input: {
    portfolios: PortfolioCreateServiceInput[];
  }): Promise<Portfolio[]> {
    try {
      const maxDisplayOrder = await this.portfolioRepository.getMaxDisplayOrder();
      const createdPortfolios: Portfolio[] = [];

      for (const [index, portfolio] of input.portfolios.entries()) {
        const createdPortfolio = await this.createPortfolioRecord(
          portfolio,
          maxDisplayOrder + index + 1,
        );
        createdPortfolios.push(createdPortfolio);
      }

      return createdPortfolios;
    } catch (error) {
      throwPortfolioDomainErrorIfPrismaError(error);
      throw error;
    }
  }

  async updatePortfolio(
    id: number,
    input: {
      title?: string;
      description?: string;
      descriptionEn?: string | null;
      contribution?: string | null;
      contributionEn?: string | null;
      outcome?: string | null;
      outcomeEn?: string | null;
      image?: string | null;
      role?: string | null;
      liveUrl?: string | null;
      githubUrl?: string | null;
      isPublished?: boolean;
      publishedAt?: Date | null;
      stacks?: { name: string }[];
    },
  ): Promise<Portfolio> {
    try {
      const existingPortfolio = await this.portfolioRepository.findById(id);
      const portfolio = validatePortfolioExists(existingPortfolio);
      const slug =
        typeof input.title === "string" && input.title !== portfolio.title
          ? await this.generateUniqueSlug(input.title, { excludeId: id })
          : undefined;

      const updated = await this.portfolioRepository.updatePortfolio(id, {
        ...(typeof slug === "string" ? { slug } : {}),
        ...(typeof input.title === "string" ? { title: input.title } : {}),
        ...(typeof input.description === "string" ? { description: input.description } : {}),
        ...(typeof input.descriptionEn !== "undefined"
          ? { descriptionEn: input.descriptionEn }
          : {}),
        ...(typeof input.contribution !== "undefined"
          ? { contribution: sanitizeOptionalHtml(input.contribution) }
          : {}),
        ...(typeof input.contributionEn !== "undefined"
          ? { contributionEn: sanitizeOptionalHtml(input.contributionEn) }
          : {}),
        ...(typeof input.outcome !== "undefined"
          ? { outcome: sanitizeOptionalHtml(input.outcome) }
          : {}),
        ...(typeof input.outcomeEn !== "undefined"
          ? { outcomeEn: sanitizeOptionalHtml(input.outcomeEn) }
          : {}),
        ...(typeof input.image !== "undefined" ? { image: input.image } : {}),
        ...(typeof input.role !== "undefined" ? { role: input.role } : {}),
        ...(typeof input.liveUrl !== "undefined" ? { liveUrl: input.liveUrl } : {}),
        ...(typeof input.githubUrl !== "undefined" ? { githubUrl: input.githubUrl } : {}),
        ...(typeof input.isPublished === "boolean" ? { isPublished: input.isPublished } : {}),
        ...(typeof input.publishedAt !== "undefined" ? { publishedAt: input.publishedAt } : {}),
        ...(Array.isArray(input.stacks) ? { stacks: input.stacks } : {}),
        updatedBy: 0,
      });

      const validatedUpdated = validatePortfolioExists(updated);

      if (
        typeof input.image !== "undefined" &&
        portfolio.image &&
        portfolio.image !== validatedUpdated.image
      ) {
        removePortfolioImageFile(portfolio.image);
      }

      return validatedUpdated;
    } catch (error) {
      throwPortfolioDomainErrorIfPrismaError(error);
      throw error;
    }
  }

  async deletePortfolio(id: number): Promise<void> {
    const existingPortfolio = await this.portfolioRepository.findById(id);
    const portfolio = validatePortfolioExists(existingPortfolio);
    const deleted = await this.portfolioRepository.deletePortfolio(id);
    validatePortfolioDeleted(deleted);
    removePortfolioImageFile(portfolio.image);
  }

  async updatePortfolioSort(ids: number[]): Promise<void> {
    try {
      await this.portfolioRepository.updateSort(ids, 0);
    } catch (error) {
      throwPortfolioDomainErrorIfPrismaError(error);
      throw error;
    }
  }
}
