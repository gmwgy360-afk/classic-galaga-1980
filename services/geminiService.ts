
export interface LevelFlavor {
  waveName: string;
  battleQuote: string;
}

export const getLevelFlavor = async (level: number): Promise<LevelFlavor> => {
  try {
    const response = await fetch(`/api/level-flavor?level=${encodeURIComponent(level)}`);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
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
