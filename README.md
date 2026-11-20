# KANG BAO SHOES 康宝鞋业

KANG BAO SHOES 康宝鞋业 鞋履品牌展示网站，使用 React、TypeScript 和 Vite 构建，适合部署到 GitHub Pages。默认以英文展示，支持切换中文。联系电话：18968893710。

## 当前功能

- 默认英文，可切换中文，同时更新页面标题与语言属性。
- 商务鞋、休闲鞋、时尚鞋、凉鞋、拖鞋五类目录，覆盖全部 99 张新图片。
- 支持按分类或编号搜索、每批加载 12 张、产品详情和按鞋款生成合作需求清单。
- 页头与页脚使用提供的 KANGBAO 商标。
- 工艺介绍折叠面板、页内导航与移动端菜单。
- 合作需求清单预览及 UTF-8 文本下载。
- 品牌理念区包含合作方向、咨询按钮及联系电话；页脚和询单弹窗也提供 18968893710，点击可交由设备拨号。
- 隐私说明弹窗；表单内容仅在当前页面使用，不上传、不自动发送。

本项目是展示网站，不提供在线下单、支付、会员登录、库存或后台管理功能。

## 本地启动

推荐安装 Node.js 24；最低兼容版本为 Node.js 20.19 或 22.12。

```bash
npm install
npm run dev
```

打开终端显示的本地地址。修改 `src` 中的组件和样式后，页面会自动更新。

## 构建与预览

```bash
npm run build
npm run preview
```

构建先执行 TypeScript 检查，再生成 `dist/`。预览地址由终端显示。不要直接双击 `dist/index.html`，应通过本地 HTTP 服务或 GitHub Pages 查看。

## 发布到 GitHub Pages

如果只是发送给别人用电脑本地查看，可运行 `npm run build:offline`。
它会生成 `releases/KANG-BAO-SHOES-preview/`，将整个文件夹压缩后发送。
对方完整解压后双击 `index.html` 即可，不需要安装 Node.js。该离线版本使用普通脚本，包含全部图片与字体；不要把正常的 `dist/` 构建当作可双击的预览包，也不要只发送 HTML 文件。
离线包是生成时的固定版本；修改网站后需重新生成并发送。手机应用内预览不保证执行脚本，建议使用电脑浏览器。

1. 在 GitHub 创建仓库，把本项目文件推送到 `main` 分支。请一并提交 `package-lock.json`，不要提交 `node_modules`、`dist` 或 `.npm-cache`。
2. 打开仓库的 **Settings → Pages**，将 **Build and deployment → Source** 设置为 **GitHub Actions**。
3. 本仓库已包含 `.github/workflows/deploy.yml`。推送 `main` 后会自动安装依赖、构建并部署；也可以在 **Actions → Deploy website to GitHub Pages → Run workflow** 手动触发。
4. 部署成功后，在 **Settings → Pages** 或工作流的 `github-pages` 环境中打开网站地址。

默认项目站点地址形如 `https://你的用户名.github.io/仓库名/`。`vite.config.ts` 使用相对资源路径 `base: './'`，适配仓库子目录和根目录站点。页面导航使用页内锚点，不依赖服务器路由重写。

如果默认分支不是 `main`，请同步修改工作流的 `on.push.branches`。

## 内容与合作询单

公司名、联系电话与图片已按提供的信息更新。产品选辑根据照片中可见的鞋型、颜色和细节编写；具体材质、工艺、数量与交期通过电话沟通确认。

合作询单在浏览器中生成并下载需求文本，方便用户自行保存或发送。它不会向服务器提交信息，也不会向品牌自动发送邮件或消息。网站没有后端、数据库或登录系统，不需要配置 API 密钥。

如需收集表单、邮件通知或其他服务端功能，应另外接入合适的后端服务，并明确告知访客提交后的处理方式。

## 修改网站内容

- `src/content.ts`：品牌名、分类文案及封面、工艺介绍和合作方向。
- `src/catalog.ts`：从五类图片文件夹生成的完整目录，图片源文件对应关系。
- `src/App.tsx`：页面布局、中英文界面文案、弹窗和需求清单逻辑。
- `src/styles.css`：配色、字体、版式和移动端适配。
- `public/images/`：展示图片。保留文件名可以直接替换图片；如修改文件名，请同步更新组件或内容配置。
- `index.html`：默认页面标题、描述及浏览器主题色；运行后的页面标题由 `src/App.tsx` 按语言设置。

## 图片来源与用途

鞋款图片全部来自用户提供的 `鞋子图片/` 文件夹，按原始文件夹分为五类。全量 99 张图片均纳入 `src/catalog.ts`，原文件保持不变；网站目录图片仅等比例缩放和 JPEG 压缩，不裁切、不放大、不生成或替换鞋款本身。

| 原始分类目录 | 网站分类 | 图片数 | 保留原文件编号数 | 通用文件名的展示编号 |
| --- | --- | ---: | ---: | --- |
| `鞋子图片/商务鞋/` | `business` | 28 | 8 | `BS-001` 起 |
| `鞋子图片/休闲鞋/` | `casual` | 20 | 0 | `CS-001` 起 |
| `鞋子图片/时尚鞋/` | `fashion` | 7 | 0 | `FS-001` 起 |
| `鞋子图片/凉鞋/` | `sandals` | 32 | 10 | `SA-001` 起 |
| `鞋子图片/拖鞋/` | `slippers` | 12 | 0 | `SL-001` 起 |

`MLW24-1`、`0681` 等看似产品编号的文件名原样保留为 `code`，`isOriginalCode` 为 `true`，表示编号来自原始文件名，并非另行核实的工厂型号。微信导出和“新建文件夹”这类通用文件名分配展示编号，`isOriginalCode` 为 `false`；**展示编号用于网站检索和询单，不是工厂型号**。每类先列有原编号的照片，再按文件名自然顺序排列其他照片。商品名称按类别与顺序生成，不推断材质、颜色、工艺或规格。

网站目录图片位于 `public/images/catalog/分类/编号.jpg`，最长边不超过 1200 像素，JPEG 质量为 88。99 张原图共 14,752,496 字节（约 14.07 MiB），处理后共 10,641,073 字节（约 10.15 MiB）。`artifacts/catalog-manifest.json` 记录每张图片的来源、原文件 SHA-256、原始与输出尺寸、文件大小及编号对应关系。

可在 Windows 上的 PowerShell 7 中重新导入图片：

```powershell
./scripts/import-catalog.ps1
```

脚本使用 Windows 的 `System.Drawing`，同时更新 `src/catalog.ts`、目录图片、来源清单及每类联系表 `artifacts/catalog-contact-分类.jpg`。新增或调整文件名可能改变自动生成的展示编号，重新导入后应复核网站和询单编号。脚本不删除源文件，也不自动清理旧的输出图片。

品牌商标素材另位于 `鞋子图片/KANGBAO 商标/`，包含 3 张 PNG 和 1 份 PDF，不计入 99 张鞋款图片。图片从本站加载，无外部图片服务依赖。

`public/images/brand/` 存放首页和品牌区素材。`collection-hero.jpg` 从商务鞋 `微信图片_20261120175434_189_11.jpg` 裁切，`collection-detail.jpg` 从商务鞋 `微信图片_20261120175437_193_11.jpg` 裁切。全站仅使用 `kangbao-pdf-logo.png` 一款商标，取自 `鞋子图片/KANGBAO 商标/康宝.pdf` 第一页左侧图案，完整保留文字与人物图形，导出为 1040×1000 像素 PNG。页头、页脚及浏览器图标均引用同一文件；网站不再使用单独提供的其他 PNG 商标。源 PDF 及其他原始素材保持不变。旧图片目录的派生图片和临时 KB 图形已从发布资源移除。

## 本地字体

英文字体 Cormorant Garamond 的正常体与斜体已保存在 `public/fonts/`，由 `src/fonts.css` 加载；两份 Latin WOFF2 可变字体均支持 300–700 字重，总计 76,900 字节（约 75.1 KiB）。页面从本站读取字体，不需要访问 Google Fonts。

中文标题使用本地 Noto Serif SC 可变字体子集，覆盖 `src/App.tsx`、`src/content.ts` 和 `src/catalog.ts` 当前文案中的 407 个去重汉字、400–600 字重。子集仅 151,512 字节（约 148.0 KiB），没有下载完整中文字库；CSS 的 `unicode-range` 限定这些汉字，不会覆盖英文字体。三个字体文件合计 228,412 字节（约 223.1 KiB）。

如新增中文文案，应重新从上述三个源文件提取去重汉字，通过 Google Fonts 的 `text=` 参数下载子集，并同步更新 `src/fonts.css` 中的 `unicode-range`。当前字符清单保存在 `public/fonts/noto-serif-sc-subset-characters.txt`，原始 CSS 和下载地址保存在 `public/fonts/noto-serif-sc-subset-source.txt`；具体请求方式记录在 `public/fonts/SOURCES.txt`。不在子集中的新汉字会使用 Songti SC、宋体或设备上的系统衬线字体回退，仍可正常显示。

两款字体均采用 SIL Open Font License 1.1。Cormorant Garamond 的版权属于 Cormorant Project Authors；Noto Serif SC 的版权声明为 Google Inc.。原始许可证分别保存在 `public/fonts/OFL-Cormorant-Garamond.txt` 和 `public/fonts/OFL-Noto-Serif-SC.txt`，下载来源和日期记录在 `public/fonts/SOURCES.txt`。分发网站时请一并保留许可证与来源说明。
