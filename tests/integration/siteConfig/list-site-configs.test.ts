import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("GET /site-configs", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan list site config yang kosong", async () => {
    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("mengembalikan list site config yang ada", async () => {
    await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        system: {
          primary_color: "#FF0000",
          secondary_color: "#00FF00",
        },
        home: {
          status_file: 0,
          id: {
            name: "John Doe",
            position: "Software Engineer",
            description: "Full stack developer",
          },
        },
      });

    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "system",
          locale: null,
        }),
        expect.objectContaining({
          type: "home",
          locale: "id",
        }),
      ]),
    );
  });

  it("mengembalikan list site config dengan multi-language", async () => {
    await request(app)
      .post("/site-configs/bulk")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        home: {
          status_file: 0,
          id: {
            name: "John Doe",
            position: "Software Engineer",
            description: "Full stack developer",
          },
          en: {
            name: "John Doe EN",
            position: "Software Engineer",
            description: "Full stack developer EN",
          },
        },
      });

    const response = await request(app)
      .get("/site-configs")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "home",
          locale: "id",
        }),
        expect.objectContaining({
          type: "home",
          locale: "en",
        }),
      ]),
    );
  });
});
