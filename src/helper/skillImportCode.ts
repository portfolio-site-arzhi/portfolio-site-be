const MAX_SKILL_IMPORT_CODE_LENGTH = 100;

const trimCodeToLength = (code: string, maxLength: number): string =>
  code.slice(0, maxLength).replace(/-+$/g, "");

export const normalizeSkillImportRelationCode = (value: string): string =>
  value.replace(/\s+/g, "").toLowerCase();

const normalizeSkillImportCode = (value: string): string => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return trimCodeToLength(normalized || "skill-group", MAX_SKILL_IMPORT_CODE_LENGTH);
};

export const createSkillImportCode = (
  name: string,
  usedCodes: Set<string>,
): string => {
  const baseCode = normalizeSkillImportCode(name) || "skill-group";
  let sequence = 1;
  let candidate = baseCode;

  while (usedCodes.has(candidate)) {
    sequence += 1;
    const suffix = `-${sequence}`;
    candidate = `${trimCodeToLength(baseCode, MAX_SKILL_IMPORT_CODE_LENGTH - suffix.length)}${suffix}`;
  }

  usedCodes.add(candidate);
  return candidate;
};
