import type { ResponseLocale, UserSuccessMessageKey } from "../model";

const USER_SUCCESS_MESSAGES: Record<
  UserSuccessMessageKey,
  Record<ResponseLocale, string>
> = {
  USER_CREATED_SUCCESS: {
    id: "User berhasil dibuat",
    en: "User created successfully",
  },
  USER_UPDATED_SUCCESS: {
    id: "User berhasil diperbarui",
    en: "User updated successfully",
  },
  USER_STATUS_UPDATED_SUCCESS: {
    id: "Status user berhasil diperbarui",
    en: "User status updated successfully",
  },
  USER_DELETED_SUCCESS: {
    id: "User berhasil dihapus",
    en: "User deleted successfully",
  },
};

export const getUserSuccessMessage = (
  locale: ResponseLocale,
  key: UserSuccessMessageKey,
): string => {
  return USER_SUCCESS_MESSAGES[key][locale];
};
