import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

const INVALID_WHATSAPP_MESSAGE =
  "WhatsApp harus diawali 8, terdiri dari 9-12 digit, tanpa awalan 0, 62, atau +62";

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
            whatsapp: "8121234567",
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
      whatsapp: "8121234567",
    });
    expect(response.body.data.footer).toEqual({
      github: "https://github.com/user-id",
      linkedin: "https://linkedin.com/in/user-id",
      instagram: "https://instagram.com/user-id",
    });

    const whatsappConfig = await getPrisma().siteConfiguration.findFirst({
      where: {
        type: "about",
        locale: null,
        key: "whatsapp",
      },
      select: {
        value: true,
      },
    });
    expect(whatsappConfig?.value).toBe("8121234567");
  });

  it("mempertahankan nomor WhatsApp ketika payload berikutnya tidak mengirimkannya", async () => {
    const { cookie } = await createAccessTokenCookie();

    const initialResponse = await request(app)
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
            address: "Jakarta, Indonesia",
            whatsapp: "8121234567",
          },
        },
      });

    expect(initialResponse.status).toBe(200);

    const response = await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", [cookie])
      .send({
        about: {
          value: {
            about_me: {
              id: "Tentang saya diperbarui...",
              en: "About me updated...",
            },
            email: "id@example.com",
            address: "Bandung, Indonesia",
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.about).toEqual({
      about_me: {
        id: "Tentang saya diperbarui...",
        en: "About me updated...",
      },
      email: "id@example.com",
      address: "Bandung, Indonesia",
      whatsapp: "8121234567",
    });
  });

  it.each([
    ["awalan 0", "08121234567"],
    ["awalan 62", "628121234567"],
    ["awalan +62", "+628121234567"],
  ])("mengembalikan 400 untuk WhatsApp dengan %s", async (_case, whatsapp) => {
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
            address: "Jakarta, Indonesia",
            whatsapp,
          },
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain(INVALID_WHATSAPP_MESSAGE);
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
