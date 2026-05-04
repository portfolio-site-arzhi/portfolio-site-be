import PDFDocument = require("pdfkit");

export type PdfDocument = PDFKit.PDFDocument;

const DEFAULT_MARGINS = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
};

export const createPdfBuffer = async (
  options: {
    title: string;
    subject?: string;
    author?: string;
    keywords?: string[];
  },
  render: (doc: PdfDocument) => void,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: DEFAULT_MARGINS,
      compress: false,
    });
    const chunks: Buffer[] = [];

    doc.info.Title = options.title;
    doc.info.Subject = options.subject ?? options.title;
    doc.info.Author = options.author ?? "Portfolio CMS";
    doc.info.Keywords = options.keywords?.join(", ") ?? "";

    doc.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);

    render(doc);
    doc.end();
  });

export const ensurePdfSpace = (doc: PdfDocument, estimatedHeight = 24): void => {
  const maxY = doc.page.height - doc.page.margins.bottom;

  if (doc.y + estimatedHeight > maxY) {
    doc.addPage();
  }
};

export const writePdfTitle = (
  doc: PdfDocument,
  title: string,
  subtitle?: string | null,
): void => {
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#111111").text(title);

  if (subtitle) {
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(11).fillColor("#444444").text(subtitle);
  }

  doc.moveDown(0.8);
};

export const writePdfSectionTitle = (doc: PdfDocument, title: string): void => {
  ensurePdfSpace(doc, 36);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#111111")
    .text(title, { paragraphGap: 4 });
  const lineY = doc.y;

  doc
    .save()
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .lineWidth(0.8)
    .strokeColor("#333333")
    .stroke()
    .restore();

  doc.moveDown(0.6);
};

export const writePdfParagraph = (
  doc: PdfDocument,
  value: string | null | undefined,
  options?: {
    fontName?: "Helvetica" | "Helvetica-Bold" | "Helvetica-Oblique";
    fontSize?: number;
    paragraphGap?: number;
  },
): void => {
  if (!value) {
    return;
  }

  ensurePdfSpace(doc, 30);
  doc
    .font(options?.fontName ?? "Helvetica")
    .fontSize(options?.fontSize ?? 10.5)
    .fillColor("#111111")
    .text(value, {
      paragraphGap: options?.paragraphGap ?? 6,
      lineGap: 2,
      align: "left",
    });
};

export const writePdfBulletList = (
  doc: PdfDocument,
  items: string[],
): void => {
  const filteredItems = items.map((item) => item.trim()).filter(Boolean);

  for (const item of filteredItems) {
    ensurePdfSpace(doc, 22);
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor("#111111")
      .text(`- ${item}`, {
        indent: 10,
        paragraphGap: 4,
        lineGap: 2,
      });
  }
};

export const writePdfImage = (
  doc: PdfDocument,
  source: string | Buffer | null | undefined,
  options?: {
    fit?: [number, number];
    align?: "center" | "right";
    valign?: "center" | "bottom";
    spacingAfter?: number;
  },
): boolean => {
  if (!source) {
    return false;
  }

  const fit = options?.fit ?? [
    doc.page.width - doc.page.margins.left - doc.page.margins.right,
    220,
  ];

  ensurePdfSpace(doc, fit[1] + 18);

  try {
    doc.image(source, {
      fit,
      align: options?.align ?? "center",
      valign: options?.valign ?? "center",
    });
  } catch {
    return false;
  }

  if (options?.spacingAfter) {
    doc.moveDown(options.spacingAfter);
  }
  return true;
};

export type PdfTextBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bullets";
      items: string[];
    };

export const parsePdfTextBlocks = (value: string): PdfTextBlock[] => {
  const lines = value.split("\n").map((line) => line.trim());
  const blocks: PdfTextBlock[] = [];
  let paragraphLines: string[] = [];
  let bulletItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines = [];
  };

  const flushBullets = () => {
    if (!bulletItems.length) {
      return;
    }

    blocks.push({
      type: "bullets",
      items: [...bulletItems],
    });
    bulletItems = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushBullets();
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      bulletItems.push(line.slice(2).trim());
      continue;
    }

    flushBullets();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushBullets();

  return blocks;
};

export const writePdfDivider = (
  doc: PdfDocument,
  options?: {
    color?: string;
    lineWidth?: number;
    spacingBefore?: number;
    spacingAfter?: number;
  },
): void => {
  const spacingBefore = options?.spacingBefore ?? 0.25;
  const spacingAfter = options?.spacingAfter ?? 0.45;
  const estimatedHeight = 20;
  const maxY = doc.page.height - doc.page.margins.bottom;

  if (doc.y + estimatedHeight > maxY) {
    doc.addPage();
    return;
  }

  if (spacingBefore > 0) {
    doc.moveDown(spacingBefore);
  }

  const lineY = doc.y;

  doc
    .save()
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .lineWidth(options?.lineWidth ?? 0.6)
    .strokeColor(options?.color ?? "#D0D0D0")
    .stroke()
    .restore();

  if (spacingAfter > 0) {
    doc.moveDown(spacingAfter);
  }
};

export const writePdfRichText = (
  doc: PdfDocument,
  value: string | null | undefined,
  options?: {
    fontSize?: number;
    paragraphGap?: number;
  },
): void => {
  if (!value) {
    return;
  }

  const blocks = parsePdfTextBlocks(value);

  if (!blocks.length) {
    return;
  }

  for (const block of blocks) {
    if (block.type === "bullets") {
      writePdfBulletList(doc, block.items);
      continue;
    }

    writePdfParagraph(doc, block.text, options);
  }
};
