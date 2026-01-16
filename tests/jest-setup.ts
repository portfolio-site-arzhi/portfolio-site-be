import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getPrisma } from "../src/config";

process.env.NODE_ENV = "test";

const rootDir = process.cwd();
const envTestingPath = path.join(rootDir, ".env.testing");
const altEnvTestingPath = path.join(rootDir, "env.testing");

if (fs.existsSync(envTestingPath)) {
  dotenv.config({ path: envTestingPath, override: false });
} else if (fs.existsSync(altEnvTestingPath)) {
  dotenv.config({ path: altEnvTestingPath, override: false });
}

afterAll(async () => {
  const prisma = getPrisma();
  await prisma.$disconnect();
});
