export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  status?: boolean;
  googleId?: string | null;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateUserInput {
  name?: string;
  status?: boolean;
  googleId?: string | null;
  password?: string;
  updatedBy: number;
}

export type UserOrderField = "email" | "name" | "status" | "created_at" | "updated_at";

export interface UserListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  orderField?: UserOrderField;
  orderDir?: "asc" | "desc";
}

export interface UserRepositoryFindAllParams {
  skip?: number;
  take?: number;
  search?: string;
  orderField?: UserOrderField;
  orderDir?: "asc" | "desc";
}
