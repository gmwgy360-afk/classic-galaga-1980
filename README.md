<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8816fec4-49d3-4b44-9bd2-cc35b0220de2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 更新 main.classic-galaga-1980.pages.dev（手機可玩）

此專案在 Cloudflare 上為 **Git 連動**，要更新 **main.classic-galaga-1980.pages.dev** 請用 **Git 推送**，不要用 wrangler。

1. 將程式 **push 到已連接 classic-galaga-1980 的 Git 儲存庫的 main 分支**。
2. Cloudflare 會自動建置（`npm run build`）並部署。
3. 部署完成後：
   - 主站：**https://main.classic-galaga-1980.pages.dev**
   - 經典小蜜蜂（手機可玩）：**https://main.classic-galaga-1980.pages.dev/xmf-classic.html**

請確認 Cloudflare Pages 專案 **Build 設定**為：
- **Build command:** `npm run build`
- **Build output directory:** `dist`
