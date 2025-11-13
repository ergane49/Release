
import { GoogleGenAI } from "@google/genai";
import { Language, TranslationStyle, GlossaryTerm } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to construct the prompt based on user selection
const buildPrompt = (text: string, source: Language, target: Language, style: TranslationStyle, glossary: GlossaryTerm[]): string => {
  let styleInstruction = "";
  
  if (style === TranslationStyle.LITERAL) {
    styleInstruction = `
    스타일 선택: ⚙️ 직역 (Literal)
    당신은 현재 **출발 언어의 원문 구조와 단어의 의미를 훼손하지 않는** 번역가입니다. 
    번역할 텍스트의 어순과 표현을 **대상 언어의 문법 허용 범위 내에서 최대한 직역**하십시오. 
    원문의 전문 용어와 고유 명사는 그대로 유지하고, 문장 단위의 구조적 변화는 최소화하십시오.`;
  } else {
    styleInstruction = `
    스타일 선택: 🗣️ 의역 (Natural)
    당신은 현재 **대상 언어의 화자가 자연스럽게 이해할 수 있는** 번역가입니다. 
    번역할 텍스트를 **대상 언어의 관용적인 표현, 자연스러운 어투, 그리고 문화적 맥락에 맞게 유려하게 의역**하십시오. 
    불필요한 직역을 피하고, 문맥에 맞는 적절한 어휘를 사용하여 매끄럽게 만드십시오.`;
  }

  const sourceInstruction = source === Language.AUTO ? "출발 언어를 자동으로 감지하십시오." : `출발 언어: ${source}.`;

  // Glossary Injection
  let glossaryInstruction = "";
  if (glossary && glossary.length > 0) {
    const glossaryItems = glossary
      .filter(term => term.source.trim() && term.target.trim())
      .map((term, index) => `${index + 1}. ${term.source} -> ${term.target}`)
      .join('\n');

    if (glossaryItems) {
      glossaryInstruction = `
      ### 사용자 정의 용어 사전 규칙 (Glossary) ###
      아래 목록은 사용자 정의 용어 사전 규칙입니다. 이 규칙은 **다른 모든 번역 스타일 지시보다 우선**하며, 번역 본문 전체에 걸쳐 철저히 준수되어야 합니다.
      
      **[용어 사전 목록 시작]**
      ${glossaryItems}
      **[용어 사전 목록 끝]**
      `;
    }
  }

  return `
    ${sourceInstruction}
    도착 언어: ${target}.
    
    ${glossaryInstruction}

    ${styleInstruction}
    
    번역할 텍스트:
    "${text}"
    
    오직 번역된 텍스트만 출력하십시오. 설명이나 주석을 덧붙이지 마십시오.
  `;
};

export const translateText = async (
  text: string,
  source: Language,
  target: Language,
  style: TranslationStyle,
  glossary: GlossaryTerm[] = []
): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const prompt = buildPrompt(text, source, target, style, glossary);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "번역에 실패했습니다.";
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', 
              data: base64Image,
            },
          },
          {
            text: "이미지 내의 모든 텍스트를 있는 그대로 추출해 주세요. 오직 추출된 텍스트만 반환하십시오.",
          },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("OCR error:", error);
    throw error;
  }
};
