export function assertSiteConfigGroupNotEmpty(
  configs: {
    id: number;
    type: string;
    locale: string | null;
    key: string;
    value: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
  }[],
): asserts configs is [
  {
    id: number;
    type: string;
    locale: string | null;
    key: string;
    value: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
  },
  ...{
    id: number;
    type: string;
    locale: string | null;
    key: string;
    value: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
  }[]
] {
  if (configs.length === 0) {
    throw new Error("SITE_CONFIG_EMPTY_GROUP");
  }
}
