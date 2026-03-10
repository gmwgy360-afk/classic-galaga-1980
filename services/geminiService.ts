
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface LevelFlavor {
  waveName: string;
  battleQuote: string;
}

export const getLevelFlavor = async (level: number): Promise<LevelFlavor> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `身為一位 1980 年代的台灣街機遊戲設計師，請為經典遊戲「小蜜蜂」的第 ${level} 關生成一個有復古感且熱血的標題和一句給玩家的戰鬥口號。標題應包含台灣元素或科幻感。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            waveName: { type: Type.STRING, description: '關卡標題，例如：虎尾基地保衛戰' },
            battleQuote: { type: Type.STRING, description: '戰鬥口號，例如：為了榮耀，一個都別放過！' }
          },
          required: ["waveName", "battleQuote"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      waveName: data.waveName || `第 ${level} 波進攻`,
      battleQuote: data.battleQuote || "全速迎擊！"
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      waveName: `第 ${level} 波`,
      battleQuote: "小心你的彈藥！"
    };
  }
};
