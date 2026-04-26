import type {
  CertificationLandingItem,
  EducationLandingItem,
  ExperienceLandingItem,
  PdfExportResult,
  ResponseLocale,
  SkillLandingGroupItem,
} from "../model";
import { htmlToPlainText } from "../helper/htmlToPlainText";
import { pickLocalizedValue } from "../helper/localizedText";
import {
  createPdfBuffer,
  writePdfBulletList,
  writePdfParagraph,
  writePdfRichText,
  writePdfSectionTitle,
  writePdfTitle,
} from "../helper/pdfDocument";
import { CertificationLandingService } from "./certificationLandingService";
import { EducationLandingService } from "./educationLandingService";
import { ExperienceLandingService } from "./experienceLandingService";
import { SiteConfigLandingService } from "./siteConfigLandingService";
import { SkillLandingService } from "./skillLandingService";

const formatDateRange = (params: {
  startDate: string | null;
  endDate: string | null;
  isCurrent?: boolean;
}): string => {
  const { startDate, endDate, isCurrent } = params;
  const start = startDate ?? "N/A";
  const end = isCurrent ? "Present" : endDate ?? "Present";
  return `${start} - ${end}`;
};

const joinNonEmpty = (values: Array<string | null | undefined>): string =>
  values.map((value) => value?.trim()).filter(Boolean).join(" | ");

const buildSummaryParagraphs = (
  locale: ResponseLocale,
  params: {
    homeDescription: { id: string | null; en: string | null } | null;
    aboutMe: { id: string | null; en: string | null } | null;
  },
): string[] => {
  const summaryValues = [
    params.homeDescription ? pickLocalizedValue(locale, params.homeDescription) : null,
    params.aboutMe ? pickLocalizedValue(locale, params.aboutMe) : null,
  ]
    .map((value) => htmlToPlainText(value))
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(summaryValues));
};

const buildExperienceLines = (
  locale: ResponseLocale,
  experience: ExperienceLandingItem,
): string[] => {
  const description = htmlToPlainText(pickLocalizedValue(locale, experience.description));
  const skills =
    experience.skills.length > 0
      ? `Skills: ${experience.skills.map((skill) => skill.skill_name).join(", ")}`
      : null;

  return [description, skills].filter((value): value is string => Boolean(value));
};

const buildEducationLines = (
  locale: ResponseLocale,
  education: EducationLandingItem,
): string[] => {
  const degree = pickLocalizedValue(locale, education.degree);
  const fieldOfStudy = pickLocalizedValue(locale, education.field_of_study);
  const description = htmlToPlainText(pickLocalizedValue(locale, education.description));
  const header = joinNonEmpty([degree, fieldOfStudy]);
  const details = joinNonEmpty([
    formatDateRange({
      startDate: education.start_date,
      endDate: education.end_date,
    }),
    education.location,
  ]);

  return [header, details, description].filter((value): value is string => Boolean(value));
};

const buildCertificationLines = (
  locale: ResponseLocale,
  certification: CertificationLandingItem,
): string[] => {
  const title = pickLocalizedValue(locale, certification.name);
  const description = htmlToPlainText(pickLocalizedValue(locale, certification.description));

  return [
    joinNonEmpty([title, certification.issuing_organization, certification.issue_date]),
    description,
  ].filter((value): value is string => Boolean(value));
};

const buildSkillLines = (skillGroups: SkillLandingGroupItem[]): string[] =>
  skillGroups
    .map((group) => {
      const items = group.skills.map((skill) => skill.name.id).join(", ");
      return items ? `${group.name.id}: ${items}` : group.name.id;
    })
    .filter(Boolean);

export class CvPdfExportService {
  constructor(
    private readonly siteConfigLandingService: SiteConfigLandingService,
    private readonly experienceLandingService: ExperienceLandingService,
    private readonly educationLandingService: EducationLandingService,
    private readonly certificationLandingService: CertificationLandingService,
    private readonly skillLandingService: SkillLandingService,
  ) {}

  async exportPdf(locale: ResponseLocale): Promise<PdfExportResult> {
    const [siteConfig, experiences, educations, certifications, skills] =
      await Promise.all([
        this.siteConfigLandingService.getLandingPageData(),
        this.experienceLandingService.listPublished(),
        this.educationLandingService.listActive(),
        this.certificationLandingService.listActive(),
        this.skillLandingService.listActive(),
      ]);

    const filename = `cv-ats-${locale}.pdf`;
    const displayName = siteConfig.home?.name ?? "Curriculum Vitae";
    const summaryParagraphs = buildSummaryParagraphs(locale, {
      homeDescription: siteConfig.home?.description ?? null,
      aboutMe: siteConfig.about?.about_me ?? null,
    });

    const buffer = await createPdfBuffer(
      {
        title: `CV ATS - ${displayName}`,
        subject: "ATS friendly curriculum vitae export",
        keywords: ["cv", "ats", "resume", locale],
      },
      (doc) => {
        const primaryContact = joinNonEmpty([
          siteConfig.home?.position ?? null,
          siteConfig.about?.email ?? null,
          siteConfig.about?.address ?? null,
        ]);
        const socialLinks = joinNonEmpty([
          siteConfig.footer?.linkedin ? `LinkedIn: ${siteConfig.footer.linkedin}` : null,
          siteConfig.footer?.github ? `GitHub: ${siteConfig.footer.github}` : null,
        ]);

        writePdfTitle(
          doc,
          displayName,
          primaryContact,
        );

        writePdfParagraph(doc, socialLinks, {
          fontSize: 9.5,
          paragraphGap: 10,
        });

        if (summaryParagraphs.length > 0) {
          writePdfSectionTitle(doc, "Professional Summary");
          for (const paragraph of summaryParagraphs) {
            writePdfRichText(doc, paragraph);
          }
        }

        if (skills.length > 0) {
          writePdfSectionTitle(doc, "Core Skills");
          writePdfBulletList(doc, buildSkillLines(skills));
        }

        if (experiences.length > 0) {
          writePdfSectionTitle(doc, "Professional Experience");
          for (const experience of experiences) {
            writePdfParagraph(
              doc,
              `${pickLocalizedValue(locale, experience.role) ?? "Role"} - ${experience.company_name}`,
              { fontSize: 11, paragraphGap: 2 },
            );
            writePdfRichText(
              doc,
              joinNonEmpty([
                formatDateRange({
                  startDate: experience.start_date,
                  endDate: experience.end_date,
                  isCurrent: experience.is_current,
                }),
                experience.company_url,
              ]),
              { fontSize: 9.5, paragraphGap: 4 },
            );
            for (const line of buildExperienceLines(locale, experience)) {
              writePdfRichText(doc, line);
            }
            doc.moveDown(0.2);
          }
        }

        if (educations.length > 0) {
          writePdfSectionTitle(doc, "Education");
          for (const education of educations) {
            writePdfRichText(doc, education.institution_name, {
              fontSize: 11,
              paragraphGap: 2,
            });
            for (const line of buildEducationLines(locale, education)) {
              writePdfRichText(doc, line);
            }
            doc.moveDown(0.2);
          }
        }

        if (certifications.length > 0) {
          writePdfSectionTitle(doc, "Certifications");
          for (const certification of certifications) {
            for (const line of buildCertificationLines(locale, certification)) {
              writePdfRichText(doc, line);
            }
            doc.moveDown(0.2);
          }
        }
      },
    );

    return {
      filename,
      buffer,
    };
  }
}
