import { PDFParse } from 'pdf-parse';

export interface ExtractedPdf {
  text: string;
  pageCount: number;
}

export async function extractPdf(bytes: Uint8Array): Promise<ExtractedPdf> {
  const parser = new PDFParse({ data: bytes });
  try {
    const textResult = await parser.getText();
    const info = await parser.getInfo();
    const text = textResult.text.replaceAll('\0', '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return { text, pageCount: info.total };
  } finally {
    await parser.destroy();
  }
}

export function splitDocumentText(text: string, maxCharacters = 1800, overlap = 180): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxCharacters, text.length);
    if (end < text.length) {
      const paragraphEnd = text.lastIndexOf('\n\n', end);
      const sentenceEnd = text.lastIndexOf('. ', end);
      const boundary = Math.max(paragraphEnd, sentenceEnd);
      if (boundary > start + Math.floor(maxCharacters / 2)) end = boundary + (boundary === sentenceEnd ? 1 : 0);
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}
