import type { Request, Response } from "express";
import { ZodError } from "zod";
import { UserService } from "../services/userService";
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserStatus,
  validateUserIdParam,
} from "../validation/userValidation";
import { logger } from "../config";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (_req: Request, res: Response) => {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json({
        data: users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
        })),
      });
    } catch (error) {
      handleUnexpectedError(res, error, logger, "List users error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validateUserIdParam(req.params);
      const user = await this.userService.getUserById(id);

      res.status(200).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          USER_NOT_FOUND: {
            status: 404,
            messages: ["Pengguna tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get user detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const input = validateCreateUser(req.body);

      const user = await this.userService.createUser({
        email: input.email,
        name: input.name,
        status: typeof input.status === "boolean" ? input.status : undefined,
      });
      res.status(201).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          USER_ALREADY_EXISTS: {
            status: 400,
            messages: ["Email sudah terdaftar"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Create user error");
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = validateUserIdParam(req.params);
      const input = validateUpdateUser(req.body);
      const user = await this.userService.updateUser(id, {
        name: input.name,
      });

      res.status(200).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          USER_NOT_FOUND: {
            status: 404,
            messages: ["Pengguna tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update user error");
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = validateUserIdParam(req.params);
      const input = validateUpdateUserStatus(req.body);
      const user = await this.userService.updateUserStatus(id, input.status);

      res.status(200).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          USER_NOT_FOUND: {
            status: 404,
            messages: ["Pengguna tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update user status error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validateUserIdParam(req.params);
      await this.userService.deleteUser(id);

      res.status(200).json({
        message: "User berhasil dihapus",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          USER_NOT_FOUND: {
            status: 404,
            messages: ["Pengguna tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Delete user error");
    }
  };
}
