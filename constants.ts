import { Language, TranslationStyle } from './types';

export const LANGUAGE_OPTIONS = [
  { value: Language.AUTO, label: '✨ 언어 감지', isSourceOnly: true },
  { value: Language.KOREAN, label: '🇰🇷 한국어' },
  { value: Language.JAPANESE, label: '🇯🇵 일본어' },
  { value: Language.ENGLISH, label: '🇺🇸 영어' },
];

export const STYLE_OPTIONS = [
  { 
    value: TranslationStyle.LITERAL, 
    label: '⚙️ 직역 (Literal)',
    description: '원문의 구조와 의미를 유지합니다.',
    detailedDescription: '[특징]\n원문의 구조, 단어, 어순을 최대한 유지하여 번역합니다. 단어 하나하나의 의미 파악에 용이하지만, 한국어 문맥으로는 다소 부자연스럽게 느껴질 수 있습니다.\n\n[예시]\n원본 (JP): 彼女はコーヒーを飲みながら本を読んでいます。\n결과 (KR): 그녀는 커피를 마시면서 책을 읽고 있습니다.'
  },
  { 
    value: TranslationStyle.NATURAL, 
    label: '🗣️ 의역 (Natural)',
    description: '자연스러운 흐름과 문화적 맥락을 중시합니다.',
    detailedDescription: '[특징]\n대상 언어의 관용적 표현과 자연스러운 어휘를 사용하여 유려하고 매끄럽게 번역합니다. 원문의 뉘앙스를 문맥에 맞게 최적화합니다.\n\n[예시]\n원본 (JP): 彼女はコーヒーを飲みながら本を読んでいます。\n결과 (KR): 그녀는 커피를 마시며 독서하고 있습니다.'
  },
];

export const MIXED_LANGUAGE_NOTE = "[참고] 선택된 출발 언어에 영어가 섞여 있을 경우, 영어 텍스트는 번역 없이 그대로 유지됩니다. (예: `この企画はOKです` → `이 기획은 OK입니다`)";

export const SYSTEM_INSTRUCTION = `
당신은 한국어, 일본어, 영어 3개 언어 간의 번역을 전문으로 하는 고급 AI 번역 엔진입니다.
사용자의 선택에 따라 '직역' 또는 '의역' 스타일을 적용하여 결과를 제공해야 합니다.

핵심 로직 및 언어 처리 지침:
1. 혼합 언어 처리 (최우선 지침):
   사용자가 출발 언어를 지정하고 텍스트에 영어가 섞여 있다면, 해당 영어 텍스트(예: A/B Test, Delicious)는 번역 없이 그대로 유지되어 최종 번역 결과에 반영되어야 합니다.
`;

export const TTS_VOICE_MAP: Record<Language, string> = {
  [Language.AUTO]: 'Puck',
  [Language.KOREAN]: 'Kore',
  [Language.JAPANESE]: 'Puck',
  [Language.ENGLISH]: 'Puck',
};
