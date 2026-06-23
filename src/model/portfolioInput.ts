export interface PortfolioStackInput {
  name: string;
}

export interface PortfolioCreatePayloadInput {
  title: string;
  description: string;
  description_en?: string | null | undefined;
  contribution?: string | null | undefined;
  contribution_en?: string | null | undefined;
  outcome?: string | null | undefined;
  outcome_en?: string | null | undefined;
  image?: string | null | undefined;
  role?: string | null | undefined;
  live_url?: string | null | undefined;
  github_url?: string | null | undefined;
  is_published: boolean;
  published_at?: string | null | undefined;
  stacks: PortfolioStackInput[];
}

export interface PortfolioCreateServiceInput {
  title: string;
  description: string;
  descriptionEn: string | null;
  contribution: string | null;
  contributionEn: string | null;
  outcome: string | null;
  outcomeEn: string | null;
  image: string | null;
  role: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  stacks: PortfolioStackInput[];
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
  image: string | null;
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
