import type { PdfExportResult, Portfolio, ResponseLocale } from "../model";
import { htmlToPlainText } from "../helper/htmlToPlainText";
import { resolvePdfRenderableUploadPath } from "../helper/localUploadPath";
import { pickLocalizedString } from "../helper/localizedText";
import {
  createPdfBuffer,
  type PdfDocument,
  writePdfBulletList,
  writePdfImage,
  writePdfParagraph,
  writePdfRichText,
  writePdfSectionTitle,
  writePdfTitle,
} from "../helper/pdfDocument";
import { PortfolioService } from "./portfolioService";

const formatDateTime = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

const getPortfolioStatus = (portfolio: Portfolio): string =>
  portfolio.is_published ? "Published" : "Draft";

const writePortfolioImage = (
  doc: PdfDocument,
  imagePath: string | null,
): void => {
  const localPath = resolvePdfRenderableUploadPath(imagePath);
  if (!localPath) {
    return;
  }

  writePdfSectionTitle(doc, "Image");
  writePdfImage(doc, localPath, {
    fit: [doc.page.width - doc.page.margins.left - doc.page.margins.right, 220],
  });
};

export class PortfolioPdfExportService {
  constructor(private readonly portfolioService: PortfolioService) {}

  async exportPdf(locale: ResponseLocale): Promise<PdfExportResult> {
    const portfolios = await this.portfolioService.listPortfolios();
    const filename = `portfolio-detail-${locale}.pdf`;

    const buffer = await createPdfBuffer(
      {
        title: `Portfolio Detail Collection - ${locale.toUpperCase()}`,
        subject: "Detailed portfolio export for CMS",
        keywords: ["portfolio", "pdf", "cms", locale],
      },
      (doc) => {
      writePdfTitle(
          doc,
          "Portfolio Detail Collection",
          `Total projects: ${portfolios.length}`,
        );

        if (portfolios.length === 0) {
          writePdfParagraph(doc, "No portfolio data available.");
          return;
        }

        portfolios.forEach((portfolio, index) => {
          if (index > 0) {
            doc.addPage();
          }

          writePdfSectionTitle(doc, `${index + 1}. ${portfolio.title}`);
          writePdfParagraph(
            doc,
            [
              `Slug: ${portfolio.slug}`,
              `Status: ${getPortfolioStatus(portfolio)}`,
              `Display Order: ${portfolio.display_order}`,
            ].join(" | "),
            { fontSize: 9.5, paragraphGap: 4 },
          );

          writePdfParagraph(
            doc,
            [
              portfolio.role ? `Role: ${portfolio.role}` : null,
              portfolio.live_url ? `Live URL: ${portfolio.live_url}` : null,
              portfolio.github_url ? `GitHub URL: ${portfolio.github_url}` : null,
            ]
              .filter((value): value is string => Boolean(value))
              .join(" | "),
            { fontSize: 9.5, paragraphGap: 6 },
          );

          writePdfParagraph(
            doc,
            [
              portfolio.published_at
                ? `Published At: ${formatDateTime(portfolio.published_at)}`
                : null,
            ]
              .filter((value): value is string => Boolean(value))
              .join(" | "),
            { fontSize: 9.5, paragraphGap: 8 },
          );

          writePdfSectionTitle(doc, "Description");
          writePdfRichText(
            doc,
            htmlToPlainText(
              pickLocalizedString(
                locale,
                portfolio.description,
                portfolio.description_en,
              ),
            ) ?? "-",
          );

          writePdfSectionTitle(doc, "Contribution");
          writePdfRichText(
            doc,
            htmlToPlainText(
              pickLocalizedString(
                locale,
                portfolio.contribution,
                portfolio.contribution_en,
              ),
            ) ?? "-",
          );

          writePdfSectionTitle(doc, "Outcome");
          writePdfRichText(
            doc,
            htmlToPlainText(
              pickLocalizedString(locale, portfolio.outcome, portfolio.outcome_en),
            ) ?? "-",
          );

          writePdfSectionTitle(doc, "Stacks");
          writePdfBulletList(
            doc,
            portfolio.stacks.map((stack) => stack.name),
          );

          writePortfolioImage(doc, portfolio.image);
        });
      },
    );

    return {
      filename,
      buffer,
    };
  }
}
