import type {
  CreatePortfolioInput,
  Portfolio,
  PortfolioListQueryParams,
  PortfolioSlugLookup,
  UpdatePortfolioInput,
} from "../../model";

export interface PortfolioRepository {
  getMaxDisplayOrder(): Promise<number>;
  findAll(params?: PortfolioListQueryParams): Promise<Portfolio[]>;
  findById(id: number): Promise<Portfolio | null>;
  findBySlug(slug: string): Promise<PortfolioSlugLookup | null>;
  findPublished(): Promise<Portfolio[]>;
  findPublishedBySlug(slug: string): Promise<Portfolio | null>;
  createPortfolio(input: CreatePortfolioInput): Promise<Portfolio>;
  updatePortfolio(id: number, input: UpdatePortfolioInput): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<number>;
  updateSort(ids: number[], updatedBy: number): Promise<void>;
}
