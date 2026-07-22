// app/lib/similarity/types.ts

export interface PaperReference {
    title: string;
    authors: string;
    year: number | string;
    publisher: string;
    doi: string;
    url: string;
    similarity: number;
  }
  
  export interface SentenceMatch {
    text: string;
    similarity: number;
    source: string;
    paper: string;
  }
  
  export interface ParagraphMatch {
    id: number;
    text: string;
    similarity: number;
  }
  
  export interface SimilarityBreakdown {
    high: number;
    medium: number;
    low: number;
  }
  
  export interface SimilarityResponse {
    overallSimilarity: number;
    confidence: number;
    riskLevel: 'Sangat Aman' | 'Risiko Rendah' | 'Risiko Sedang' | 'Risiko Tinggi';
    analysis: string;
    recommendation: string[];
    paragraphs: ParagraphMatch[];
    sentences: SentenceMatch[];
    papers: PaperReference[];
    breakdown: SimilarityBreakdown;
  }