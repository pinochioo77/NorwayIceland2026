# 挪威冰岛旅行网页

这是一个面向同行伙伴查看的 React + TypeScript 单页行程工具。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5173`。

## 构建

```bash
npm run build
```

产物在 `dist/`。Vite 已设置 `base: './'`，适合部署到 GitHub Pages 的仓库子路径。

## 数据来源

- `plan.md`：校准后的主行程。
- `北欧冰岛行程总表.xlsx`：装备、待办、费用、自驾备注和图片素材。
- `public/assets/trip/`：从 Excel 中导出的首版图片。

发布公开版本前，建议再次确认 Excel 图片来源是否适合公开分享。
