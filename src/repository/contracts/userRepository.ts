import type { CreateUserInput, UpdateUserInput, User } from "../../model";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: number, input: UpdateUserInput): Promise<User>;
  deleteUser(id: number): Promise<number>;
}
