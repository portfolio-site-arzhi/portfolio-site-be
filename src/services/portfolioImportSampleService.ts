import type { PortfolioImportPayload, PortfolioImportSampleFile } from "../model";

const PORTFOLIO_IMPORT_SAMPLE_CONTENT_TYPE = "application/json";

const PORTFOLIO_IMPORT_SAMPLE_PAYLOAD: PortfolioImportPayload = {
  portfolios: [
    {
      title: "Ecommerce Dashboard",
      description: "Dashboard analytics untuk toko online",
      description_en: "Analytics dashboard for ecommerce store",
      contribution: "<p>Membangun dashboard analytics</p>",
      contribution_en: "<p>Built analytics dashboard</p>",
      outcome: "<p>Meningkatkan conversion rate</p>",
      outcome_en: "<p>Improved conversion rate</p>",
      role: "Frontend Lead",
      live_url: "https://demo.example.com/ecommerce-dashboard",
      github_url: "https://github.com/example/ecommerce-dashboard",
      is_published: true,
      published_at: "2026-04-24T09:00:00.000Z",
      stacks: [{ name: "Vue 3" }, { name: "PostgreSQL" }],
    },
    {
      title: "Internal Notification Service",
      description: "Service internal untuk notifikasi multi channel",
      description_en: "Internal service for multi-channel notifications",
      contribution: "<p>Membangun arsitektur service dan queue worker</p>",
      contribution_en: "<p>Built service architecture and queue workers</p>",
      outcome: "<p>Mempercepat pengiriman notifikasi sistem</p>",
      outcome_en: "<p>Improved system notification delivery speed</p>",
      role: "Backend Engineer",
      github_url: "https://github.com/example/internal-notification-service",
      is_published: false,
      published_at: null,
      stacks: [{ name: "Node.js" }, { name: "Redis" }],
    },
  ],
};

export class PortfolioImportSampleService {
  createSampleFile(): PortfolioImportSampleFile {
    return {
      filename: "portfolios-import-sample.json",
      buffer: Buffer.from(JSON.stringify(PORTFOLIO_IMPORT_SAMPLE_PAYLOAD, null, 2)),
      contentType: PORTFOLIO_IMPORT_SAMPLE_CONTENT_TYPE,
    };
  }
}
