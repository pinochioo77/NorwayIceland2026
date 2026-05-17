# 挪威冰岛旅行网页

这是一个面向同行伙伴查看的 React + TypeScript 单页行程工具，适合部署到 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:5173`。

## 构建与发布前检查

```bash
npm run verify
```

`verify` 会先构建网页，再检查公开源码和构建产物中是否混入本地安全目录路径、邮箱、私人手机号、身份证号或疑似票据/订单号。

## 私有数据与公开数据

- 私有源文件放在本地安全目录中，该目录已被 `.gitignore` 忽略，不应进入 Git 或 GitHub Pages。
- Excel、原始票据 PDF/PNG、二维码、订单号、票号、确认号、姓名、邮箱、电话等不公开。
- 网页只保留公开安全的结构化摘要：日期、时间、地点、供应商、金额、集合点、注意事项和官方链接。
- 票据/预订的唯一真源是私有 Excel 的 `票据公开摘要` Sheet。
- 后续更新 Excel 后，运行 `npm run import:data` 生成公开 booking 数据，再运行 `npm run verify`。

## 部署

项目已使用相对资源路径配置，适合部署到 GitHub Pages 仓库子路径。
