// app/lib/similarity/utils.ts

export function splitParagraphs(text: string): string[] {
    return text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 20);
  }
  
  export function splitSentences(text: string): string[] {
    // Memecah berdasarkan titik, tanda tanya, atau seru, diikuti spasi
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
  }
  
  export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Mengekstrak kata kunci utama untuk pencarian API
  export function extractKeywords(text: string): string {
    const clean = text.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    return clean.split(" ").slice(0, 12).join(" "); 
  }