export interface TutorChunk {
  id: string;
  materialId: string;
  content: string;
  chunkIndex: number;
  material: { title: string };
}

export interface RetrievedTutorChunk extends TutorChunk {
  score: number;
}

const stopWords = new Set(['a', 'about', 'after', 'again', 'against', 'also', 'an', 'and', 'are', 'as', 'at', 'been', 'before', 'being', 'between', 'but', 'by', 'could', 'does', 'for', 'from', 'have', 'how', 'in', 'into', 'is', 'it', 'its', 'just', 'more', 'most', 'of', 'on', 'or', 'other', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'there', 'these', 'they', 'this', 'through', 'to', 'under', 'very', 'was', 'what', 'when', 'where', 'which', 'while', 'who', 'why', 'with', 'would', 'yang', 'dan', 'dari', 'dengan', 'untuk', 'pada', 'adalah', 'atau', 'dalam', 'tidak', 'juga', 'oleh', 'sebagai']);

function tokenize(value: string): string[] {
  return (value.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []).filter((term) => !stopWords.has(term));
}

export function retrieveRelevantChunks(question: string, chunks: TutorChunk[], limit = 5): RetrievedTutorChunk[] {
  const terms = [...new Set(tokenize(question))];
  if (terms.length === 0) return [];

  return chunks.map((chunk) => {
    const frequency = new Map<string, number>();
    for (const term of tokenize(chunk.content)) frequency.set(term, (frequency.get(term) ?? 0) + 1);
    const matchingTerms = terms.filter((term) => frequency.has(term));
    const score = matchingTerms.reduce((total, term) => total + 1 + Math.log1p(frequency.get(term) ?? 0), 0) / terms.length;
    return { ...chunk, score };
  }).filter((chunk) => chunk.score > 0).sort((left, right) => right.score - left.score).slice(0, limit);
}
