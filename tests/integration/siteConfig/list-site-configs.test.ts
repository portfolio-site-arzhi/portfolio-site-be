import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

describe("GET /site-configs", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan data landing yang kosong", async () => {
    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      system: null,
      home: null,
      about: null,
      footer: null,
    });
  });

  it("mengembalikan data landing yang ada", async () => {
    const { cookie } = await createAccessTokenCookie();
    await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", [cookie])
      .send({
        system: {
          primary_color: "#FF0000",
          secondary_color: "#00FF00",
        },
        home: {
          status_file: 0,
          value: {
            name: "John Doe",
            position: "Software Engineer",
            description: {
              id: "Full stack developer",
              en: "Full stack developer EN",
            },
          },
        },
      });

    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      system: {
        primary_color: "#FF0000",
        secondary_color: "#00FF00",
      },
      home: {
        name: "John Doe",
        position: "Software Engineer",
        description: {
          id: "Full stack developer",
          en: "Full stack developer EN",
        },
      },
      about: null,
      footer: null,
    });
  });

  it("mengembalikan data landing dengan multi-language (description, about_me)", async () => {
    const { cookie } = await createAccessTokenCookie();
    await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", [cookie])
      .send({
        home: {
          status_file: 0,
          value: {
            name: "John Doe",
            position: "Software Engineer",
            description: {
              id: "Full stack developer",
              en: "Full stack developer EN",
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
            address: "Bandung, Indonesia",
            whatsapp: "8121234567",
          },
        },
      });

    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data.home.description).toEqual({
      id: "Full stack developer",
      en: "Full stack developer EN",
    });
    expect(response.body.data.about).toEqual({
      about_me: {
        id: "Tentang saya...",
        en: "About me...",
      },
      email: "id@example.com",
      address: "Bandung, Indonesia",
      whatsapp: "8121234567",
    });
  });
});
