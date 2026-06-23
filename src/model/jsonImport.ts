export interface JsonImportUploadFile {
  buffer: Buffer;
  originalname: string;
}

export interface JsonImportErrorConfig {
  invalidFileError: string;
  invalidJsonError: string;
}
