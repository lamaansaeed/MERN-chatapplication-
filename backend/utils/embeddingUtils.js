const { cosineSimilarity } = require("ml-distance");

// Function to calculate cosine similarity
exports.cosineSimilarity = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same length for comparison.");
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    normA += embedding1[i] ** 2;
    normB += embedding2[i] ** 2;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
