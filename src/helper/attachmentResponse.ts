import type { Response } from "express";

export const sendAttachmentBuffer = (
  res: Response,
  params: {
    filename: string;
    buffer: Buffer;
    contentType: string;
  },
): void => {
  res.attachment(params.filename);
  res.type(params.contentType);
  res.status(200).send(params.buffer);
};
