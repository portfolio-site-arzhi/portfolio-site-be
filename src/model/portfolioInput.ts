export interface PortfolioStackInput {
  name: string;
}

export interface CreatePortfolioInput {
  slug: string;
  title: string;
  description: string;
  descriptionEn: string | null;
  contribution: string | null;
  contributionEn: string | null;
  outcome: string | null;
  outcomeEn: string | null;
  image: string;
  role: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
  publishedAt: Date | null;
  stacks: PortfolioStackInput[];
  createdBy: number;
  updatedBy: number;
}

export interface UpdatePortfolioInput {
  slug?: string;
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
  stacks?: PortfolioStackInput[];
  updatedBy: number;
}

export interface PortfolioListQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}
