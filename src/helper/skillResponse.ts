import type { Skill } from "../model";

export const toSkillResponse = (skill: Skill) => ({
  id: skill.id,
  name: skill.name,
  display_order: skill.display_order,
  is_active: skill.is_active,
  created_at: skill.created_at,
  updated_at: skill.updated_at,
  skills: skill.skills.map((skillItem) => ({
    id: skillItem.id,
    skill_group_id: skillItem.skill_group_id,
    name: skillItem.name,
    display_order: skillItem.display_order,
    created_at: skillItem.created_at,
    updated_at: skillItem.updated_at,
  })),
});
