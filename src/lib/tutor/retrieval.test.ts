import { describe, expect, it } from 'vitest';
import { retrieveRelevantChunks, type TutorChunk } from './retrieval';

const chunks: TutorChunk[] = [
  { id: 'a', materialId: 'material-a', chunkIndex: 0, material: { title: 'Cell biology' }, content: 'The mitochondrion produces ATP through oxidative phosphorylation.' },
  { id: 'b', materialId: 'material-a', chunkIndex: 1, material: { title: 'Cell biology' }, content: 'The cell membrane regulates transport into and out of the cell.' },
];

describe('tutor lexical retrieval', () => {
  it('ranks matching owned excerpts for a concept question', () => {
    const results = retrieveRelevantChunks('How does a mitochondrion produce ATP?', chunks);
    expect(results[0]?.id).toBe('a');
    expect(results[0]?.score).toBeGreaterThan(0);
  });

  it('returns no sources when the question terms do not occur in the material', () => {
    expect(retrieveRelevantChunks('How do volcanic minerals crystallize?', chunks)).toEqual([]);
  });

  it('returns no sources for a stop-word-only question', () => {
    expect(retrieveRelevantChunks('What is this and that?', chunks)).toEqual([]);
  });
});
