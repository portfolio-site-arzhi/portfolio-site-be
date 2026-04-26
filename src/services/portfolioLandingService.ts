import type {
  Portfolio,
  PortfolioLandingDetailItem,
  PortfolioLandingListItem,
} from "../model";
import { withBaseUrl } from "../helper/publicUrl";
import type { PortfolioRepository } from "../repository/contracts/portfolioRepository";
import { validatePortfolioExists } from "../validation/portfolioDomainValidation";

const mapPortfolioBase = (portfolio: Portfolio) => ({
  id: portfolio.id,
  slug: portfolio.slug,
  display_order: portfolio.display_order,
  title: portfolio.title,
  description: {
    id: portfolio.description,
    en: portfolio.description_en,
  },
  image: withBaseUrl(portfolio.image),
  role: portfolio.role,
  live_url: portfolio.live_url,
  github_url: portfolio.github_url,
});

export class PortfolioLandingService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  async listPublished(): Promise<PortfolioLandingListItem[]> {
    const portfolios = await this.portfolioRepository.findPublished();

    return portfolios.map((portfolio) => mapPortfolioBase(portfolio));
  }

  async getPublishedBySlug(slug: string): Promise<PortfolioLandingDetailItem> {
    const portfolio = await this.portfolioRepository.findPublishedBySlug(slug);
    const existingPortfolio = validatePortfolioExists(portfolio);

    return {
      ...mapPortfolioBase(existingPortfolio),
      stacks: existingPortfolio.stacks.map((stack) => ({
        id: stack.id,
        display_order: stack.display_order,
        name: stack.name,
      })),
      contribution: {
        id: existingPortfolio.contribution,
        en: existingPortfolio.contribution_en,
      },
      outcome: {
        id: existingPortfolio.outcome,
        en: existingPortfolio.outcome_en,
      },
    };
  }
}
