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

