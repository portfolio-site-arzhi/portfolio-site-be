jest.mock("../../../src/helper/httpClient", () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { AxiosHeaders } from "axios";
import type { AxiosResponse } from "axios";
import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { httpClient } from "../../../src/helper/httpClient";
import { resetDatabase } from "../../utils/db";

const createAxiosResponse = <T>(
  data: T,
  status = 200,
): AxiosResponse<T> => ({
  data,
  status,
  statusText: status === 200 ? "OK" : "ERROR",
  headers: {},
  config: {
    headers: new AxiosHeaders(),
  },
});

describe("GET /auth/google/callback", () => {
  beforeEach(async () => {
    await resetDatabase();
    jest.resetAllMocks();

    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    process.env.GOOGLE_REDIRECT_URI =
      "http://localhost:9000/auth/google/callback";
    process.env.FRONTEND_URL = "";
    process.env.APP_FRONTEND_URL = "";
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("menolak login Google jika email belum terdaftar di tabel user", async () => {
    const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

    mockedHttpClient.post.mockResolvedValue(
      createAxiosResponse({ access_token: "google-access-token" }),
    );
    mockedHttpClient.get.mockResolvedValue(
      createAxiosResponse({
        id: "google-user-1",
        email: "new-user@example.com",
        name: "New User",
      }),
    );

    const response = await request(app)
      .get("/auth/google/callback")
      .query({ code: "google-auth-code" })
      .set("Accept", "application/json");

    expect(response.status).toBe(403);
    expect(response.body.errors).toContain("Akun Google belum terdaftar");

    const prisma = getPrisma();
    expect(await prisma.user.count()).toBe(0);
  });

  it("menghubungkan google_id ke user yang sudah terdaftar lalu login", async () => {
    const prisma = getPrisma();
    const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

    const existingUser = await prisma.user.create({
      data: {
        email: "existing-user@example.com",
        password: "dummy-password",
        name: "Existing User",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    mockedHttpClient.post.mockResolvedValue(
      createAxiosResponse({ access_token: "google-access-token" }),
    );
    mockedHttpClient.get.mockResolvedValue(
      createAxiosResponse({
        id: "google-user-2",
        email: existingUser.email,
        name: "Existing User Updated",
      }),
    );

    const response = await request(app)
      .get("/auth/google/callback")
      .query({ code: "google-auth-code" })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(typeof response.body.access_token).toBe("string");
    expect(response.body.user.email).toBe(existingUser.email);

    const updatedUser = await prisma.user.findUnique({
      where: { id: existingUser.id },
    });

    expect(updatedUser?.google_id).toBe("google-user-2");
    expect(updatedUser?.name).toBe("Existing User Updated");
  });
});
