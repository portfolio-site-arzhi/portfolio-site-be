import type { ExperienceImportPayload, ExperienceImportSampleFile } from "../model";

const EXPERIENCE_IMPORT_SAMPLE_CONTENT_TYPE = "application/json";

const EXPERIENCE_IMPORT_SAMPLE_PAYLOAD: ExperienceImportPayload = {
  experiences: [
    {
      is_published: true,
      role_id: "Senior Frontend Developer",
      role_en: "Senior Frontend Developer",
      company_name: "Tech Solutions Inc.",
      company_url: "https://example.com",
      start_date: "2023-07-01",
      end_date: null,
      is_current: true,
      description_id: "<p>Memimpin migrasi frontend dan meningkatkan performa aplikasi.</p>",
      description_en: "<p>Led the frontend migration and improved application performance.</p>",
      skills: [{ skill_name: "TypeScript" }, { skill_name: "Vue.js" }],
    },
    {
      is_published: false,
      role_id: "Backend Developer",
      role_en: "Backend Developer",
      company_name: "API Works",
      company_url: null,
      start_date: "2021-01-01",
      end_date: "2023-06-01",
      is_current: false,
      description_id: "<p>Membangun API internal dan optimasi query database.</p>",
      description_en: "<p>Built internal APIs and optimized database queries.</p>",
      skills: [{ skill_name: "Node.js" }, { skill_name: "PostgreSQL" }],
    },
  ],
};

export class ExperienceImportSampleService {
  createSampleFile(): ExperienceImportSampleFile {
    return {
      filename: "experiences-import-sample.json",
      buffer: Buffer.from(JSON.stringify(EXPERIENCE_IMPORT_SAMPLE_PAYLOAD, null, 2)),
      contentType: EXPERIENCE_IMPORT_SAMPLE_CONTENT_TYPE,
    };
  }
}
