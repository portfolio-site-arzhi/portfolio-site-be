export interface PortfolioStack {
  id: number;
  portfolio_id: number;
  name: string;
  display_order: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface Portfolio {
  id: number;
  slug: string;
  title: string;
  description: string;
  description_en: string | null;
  contribution: string | null;
  contribution_en: string | null;
  outcome: string | null;
  outcome_en: string | null;
  image: string | null;
  role: string | null;
  live_url: string | null;
  github_url: string | null;
  display_order: number;
  is_published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  stacks: PortfolioStack[];
}

export interface PortfolioSlugLookup {
  id: number;
  slug: string;
}

export interface PortfolioLandingListItem {
  id: number;
  slug: string;
  display_order: number;
  title: string;
  description: {
    id: string;
    en: string | null;
  };
  image: string | null;
  role: string | null;
  live_url: string | null;
  github_url: string | null;
}

export interface PortfolioLandingDetailItem extends PortfolioLandingListItem {
  stacks: {
    id: number;
    display_order: number;
    name: string;
  }[];
  contribution: {
    id: string | null;
    en: string | null;
  };
  outcome: {
    id: string | null;
    en: string | null;
  };
}
