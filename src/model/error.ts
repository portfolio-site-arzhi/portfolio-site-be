export interface ErrorResponseBody {
  errors: string[];
}

export type DomainErrorMapping = {
  [code: string]: {
    status: number;
    messages: string[];
  };
};

export type PrismaErrorWithCode = { code: string };
