export type RankedCandidate<T> = T & { matchScore: number };

export function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denominator) {
    return 0;
  }

  return dot / denominator;
}

export function rankBySimilarity<T extends { embedding: number[] }>(
  sourceEmbedding: number[],
  candidates: T[],
  limit = 10,
): RankedCandidate<T>[] {
  return candidates
    .map((candidate) => ({
      ...candidate,
      matchScore: cosineSimilarity(sourceEmbedding, candidate.embedding),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}