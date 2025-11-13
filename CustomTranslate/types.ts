export enum Language {
  AUTO = '언어 감지',
  KOREAN = '한국어',
  JAPANESE = '일본어',
  ENGLISH = '영어',
}

export enum TranslationStyle {
  LITERAL = 'Literal (직역)',
  NATURAL = 'Natural (의역)',
}

export enum AppMode {
  TEXT = 'text',
  IMAGE = 'image',
}

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  sourceLang: Language;
  targetLang: Language;
  originalText: string;
  translatedText: string;
  style: TranslationStyle;
}

export interface TranslationRequest {
  text: string;
  sourceLang: Language;
  targetLang: Language;
  style: TranslationStyle;
  glossary?: GlossaryTerm[];
}

export type LoadingState = 'idle' | 'translating' | 'extracting_text' | 'speaking';
