import { getPrisma } from "../config";
import type {
  CreateSkillInput,
  Skill,
  SkillListQueryParams,
  UpdateSkillInput,
} from "../model";
import type { SkillRepository } from "./contracts/skillRepository";

export class PrismaSkillRepository implements SkillRepository {
  private readonly prisma = getPrisma();

  async getMaxSort(): Promise<number> {
    const result = await this.prisma.skillGroup.findFirst({
      orderBy: [{ display_order: "desc" }, { id: "desc" }],
      select: { display_order: true },
    });

    return result?.display_order ?? 0;
  }

  findSkills(params?: SkillListQueryParams): Promise<Skill[]> {
    const { skip, take, search } = params ?? {};

    const options: Parameters<typeof this.prisma.skillGroup.findMany>[0] = {
      include: {
        skills: {
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ display_order: "asc" }, { id: "asc" }],
    };

    if (typeof search === "string" && search) {
      options.where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          {
            skills: {
              some: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      };
    }

    if (typeof skip === "number") {
      options.skip = skip;
    }

    if (typeof take === "number") {
      options.take = take;
    }

    return this.prisma.skillGroup.findMany(options) as Promise<Skill[]>;
  }

  findSkillById(id: number): Promise<Skill | null> {
    return this.prisma.skillGroup.findUnique({
      where: { id },
      include: {
        skills: {
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
      },
    }) as Promise<Skill | null>;
  }

  findActiveSkills(): Promise<Skill[]> {
    return this.prisma.skillGroup.findMany({
      where: { is_active: true },
      include: {
        skills: {
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ display_order: "asc" }, { id: "asc" }],
    }) as Promise<Skill[]>;
  }

  createSkill(input: CreateSkillInput): Promise<Skill> {
    const { name, displayOrder, isActive, skills, createdBy, updatedBy } = input;

    return this.prisma.skillGroup.create({
      data: {
        name,
        display_order: displayOrder,
        is_active: isActive,
        created_by: createdBy,
        updated_by: updatedBy,
        skills: {
          create: skills.map((skill, index) => ({
            name: skill.name,
            display_order: index + 1,
            created_by: createdBy,
            updated_by: updatedBy,
          })),
        },
      },
      include: {
        skills: {
          orderBy: [{ display_order: "asc" }, { id: "asc" }],
        },
      },
    }) as Promise<Skill>;
  }

  async updateSkill(id: number, input: UpdateSkillInput): Promise<Skill> {
    const { name, isActive, skills, updatedBy } = input;

    return this.prisma.$transaction(async (tx) => {
      await tx.skillGroup.update({
        where: { id },
        data: {
          ...(typeof name === "string" ? { name } : {}),
          ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
          updated_by: updatedBy,
        },
      });

      if (Array.isArray(skills)) {
        await tx.skill.deleteMany({
          where: { skill_group_id: id },
        });

        if (skills.length) {
          await tx.skill.createMany({
            data: skills.map((skill, index) => ({
              skill_group_id: id,
              name: skill.name,
              display_order: index + 1,
              created_by: 0,
              updated_by: updatedBy,
            })),
          });
        }
      }

      const result = await tx.skillGroup.findUnique({
        where: { id },
        include: {
          skills: {
            orderBy: [{ display_order: "asc" }, { id: "asc" }],
          },
        },
      });

      return result as Skill;
    });
  }

  async deleteSkill(id: number): Promise<number> {
    const [, result] = await this.prisma.$transaction([
      this.prisma.skill.deleteMany({
        where: { skill_group_id: id },
      }),
      this.prisma.skillGroup.deleteMany({
        where: { id },
      }),
    ]);

    return result.count;
  }

  async updateSort(ids: number[], updatedBy: number): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.skillGroup.update({
          where: { id },
          data: {
            display_order: index + 1,
            updated_by: updatedBy,
          },
        }),
      ),
    );
  }
}
