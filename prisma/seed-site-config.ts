import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL wajib diisi di .env untuk menjalankan seed site configurations");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const siteConfigs = [
    {
      type: "system",
      locale: null,
      values: {
        primary_color: "#1976D2",
        secondary_color: "#424242",
      },
    },
    {
      type: "home",
      locale: null,
      values: {
        name: "Ardiansyah Pratama",
        position: "Full Stack Developer",
      },
    },
    {
      type: "home",
      locale: "id",
      values: {
        description:
          "Berpengalaman membangun aplikasi web yang performan dan skalabel dengan teknologi modern.",
      },
    },
    {
      type: "home",
      locale: "en",
      values: {
        description: "Passionate developer with 5+ years experience...",
      },
    },
    {
      type: "about",
      locale: null,
      values: {
        email: "ardiansyah@example.com",
      },
    },
    {
      type: "about",
      locale: "id",
      values: {
        about_me: "I am a software developer specializing in...",
      },
    },
    {
      type: "about",
      locale: "en",
      values: {
        about_me: "I am a software developer specializing in...",
      },
    },
    {
      type: "footer",
      locale: null,
      values: {
        github: "https://github.com/ardiansyah",
        linkedin: "https://linkedin.com/in/ardiansyah",
        instagram: "https://instagram.com/ardiansyah",
      },
    },
  ] as const;

  for (const config of siteConfigs) {
    await prisma.siteConfiguration.deleteMany({
      where: {
        type: config.type,
        locale: config.locale,
      },
    });

    for (const [key, value] of Object.entries(config.values)) {
      await prisma.siteConfiguration.create({
        data: {
          type: config.type,
          locale: config.locale,
          key,
          value: String(value),
          created_by: 0,
          updated_by: 0,
        },
      });
    }
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Gagal menjalankan seed site configurations:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
