import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

describe("POST /site-configs/bulk", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan 401 jika belum login", async () => {
    const response = await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("menyimpan semua konfigurasi landing (system, home, about, footer) dalam satu request", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", [cookie])
      .send({
        system: {
          primary_color: "#1976D2",
          secondary_color: "#42A5F5",
        },
        home: {
          status_file: 0,
          value: {
            name: "Nama Anda",
            position: "Full Stack Developer",
            description: {
              id: "Deskripsi profil singkat dalam bahasa Indonesia",
              en: "Short profile description in English",
            },
          },
        },
        about: {
          value: {
            about_me: {
              id: "Tentang saya...",
              en: "About me...",
            },
            email: "id@example.com",
            address: "Jakarta, Indonesia",
          },
        },
        footer: {
          value: {
            github: "https://github.com/user-id",
            linkedin: "https://linkedin.com/in/user-id",
            instagram: "https://instagram.com/user-id",
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Konfigurasi situs berhasil diperbarui");
    expect(response.body.data.system).toEqual({
      primary_color: "#1976D2",
      secondary_color: "#42A5F5",
    });
    expect(response.body.data.home).toEqual({
      name: "Nama Anda",
      position: "Full Stack Developer",
      description: {
        id: "Deskripsi profil singkat dalam bahasa Indonesia",
        en: "Short profile description in English",
      },
    });
    expect(response.body.data.about).toEqual({
      about_me: {
        id: "Tentang saya...",
        en: "About me...",
      },
      email: "id@example.com",
      address: "Jakarta, Indonesia",
    });
    expect(response.body.data.footer).toEqual({
      github: "https://github.com/user-id",
      linkedin: "https://linkedin.com/in/user-id",
      instagram: "https://instagram.com/user-id",
    });
  });

  it("mengembalikan 400 jika about dikirim tanpa address", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", [cookie])
      .send({
        about: {
          value: {
            about_me: {
              id: "Tentang saya...",
              en: "About me...",
            },
            email: "id@example.com",
          },
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("Address is required");
  });
});
