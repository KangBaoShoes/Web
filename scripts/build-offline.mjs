import { build } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "releases", "KANG-BAO-SHOES-preview");

// A classic IIFE script can be opened directly with file://, unlike the
// module script in the normal Vite web deployment. Keep both builds separate.
await build({
  configFile: false,
  root,
  plugins: [react()],
  base: "./",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: output,
    emptyOutDir: false,
    lib: {
      entry: path.join(root, "src", "main.tsx"),
      name: "KangBaoPreview",
      formats: ["iife"],
      fileName: () => "app.js",
      cssFileName: "app",
    },
  },
});

// Library CSS is emitted at the package root, while Vite's public font URLs
// retain the normal assets/ directory offset. Resolve them from app.css.
const cssPath = path.join(output, "app.css");
const css = await readFile(cssPath, "utf8");
await writeFile(cssPath, css.replaceAll("../fonts/", "./fonts/"), "utf8");

const template = await readFile(path.join(root, "index.html"), "utf8");
const html = template
  .replace('href="/images/', 'href="./images/')
  .replace(
    '<script type="module" src="/src/main.tsx"></script>',
    '<script defer src="./app.js"></script>',
  )
  .replace(
    "</head>",
    '  <link rel="stylesheet" href="./app.css" />\n  </head>',
  );
await mkdir(output, { recursive: true });
await writeFile(path.join(output, "index.html"), html, "utf8");
await writeFile(
  path.join(output, "打开说明.txt"),
  "\uFEFF" +
    [
      "KANG BAO SHOES 康宝鞋业 — 离线网站预览",
      "",
      "1. 请先完整解压收到的 ZIP 压缩包。",
      "2. 打开 KANG-BAO-SHOES-preview 文件夹，双击 index.html。",
      "3. 使用电脑上的 Edge、Chrome、Firefox 或 Safari 浏览器打开。",
      "",
      "无需安装 Node.js，无需运行命令。全部产品图片与字体均已包含。",
      "请保留 app.js、app.css、images、fonts 与 index.html 的相对位置。",
      "请勿只发送 index.html，也不要直接从压缩包中打开网页。",
      "",
      "默认英文，可点击右上角“中”切换中文。",
      "支持五大分类、编号搜索、产品详情和本地生成合作邮件草稿。",
      "点击打开邮件应用后，将预填收件人、主题与内容；请检查草稿并自行确认发送。",
      "合作邮箱：aabbccll895@gmail.com；WhatsApp：+86 18968893710。",
      "网站不会自动发送邮件，也不能确认邮件是否发出。",
      "如未配置邮件应用或预填失败，可复制草稿或下载需求清单，再用自己的邮箱发送。",
      "填写与生成草稿时信息仅在当前页面处理；点击打开邮件应用后才交给设备配置的邮件程序。",
      "复制和下载的内容由您自行保存；使用 WhatsApp 或实际发送邮件需要相应应用和网络。",
      "这份预览是打包时的固定版本，后续网站修改不会自动同步。",
      "手机应用内的文件预览可能无法运行网页脚本，建议使用电脑浏览器查看。",
      "",
      "English: Extract the entire ZIP, then open index.html in a desktop browser.",
      "No installation is needed. Keep the accompanying files and folders together.",
      "Enquiry email drafts are prepared locally. Open your email app to prefill the recipient, subject and message, then review and send the email yourself.",
      "Email: aabbccll895@gmail.com. WhatsApp: +86 18968893710.",
      "If no email app is configured, copy the draft or download the brief and send it through your own mailbox.",
      "Information stays on the page until you choose to open your email app, copy it or download it. The website does not send messages automatically or confirm delivery.",
      "Using WhatsApp or sending email requires the appropriate app and a network connection.",
      "",
      "Font licenses are included in the fonts folder.",
    ].join("\r\n"),
  "utf8",
);

console.log(`Offline preview ready: ${output}`);
