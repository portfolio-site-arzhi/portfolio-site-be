import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/helper/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL wajib diisi di .env untuk menjalankan seed");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const email = process.env.EMAIL_ADMIN;
  const passwordPlain = process.env.SEED_ADMIN_PASSWORD;

  if (!email) {
    console.error("EMAIL_ADMIN wajib diisi di .env untuk seeding admin user");
    process.exit(1);
  }

  if (!passwordPlain) {
    console.error(
      "SEED_ADMIN_PASSWORD wajib diisi di .env untuk seeding admin user",
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(passwordPlain);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      name: "Super Admin",
      updated_by: 0,
    },
    create: {
      email,
      password: passwordHash,
      name: "Super Admin",
      created_by: 0,
      updated_by: 0,
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Gagal menjalankan seed users:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
