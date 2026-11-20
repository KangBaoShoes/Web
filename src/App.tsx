import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  asset,
  brand,
  categories,
  collections,
  craftSteps,
  orderedProducts,
  products,
  services,
  type Bilingual,
  type Category,
  type Language,
  type Product,
} from "./content";
import { createEmailDraftLink } from "./contact";

function Arrow({
  diagonal = false,
  className = "",
}: {
  diagonal?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`arrow ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M3 12h17m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function BrandMonogram({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-monogram ${className}`}
      src={asset(brand.logo)}
      width="1040"
      height="1000"
      alt="KANGBAO 商标"
    />
  );
}

function ContactWhatsApp({
  lang,
  className = "",
}: {
  lang: Language;
  className?: string;
}) {
  return (
    <a
      className={`phone-link ${className}`}
      href={brand.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${lang === "zh" ? "通过 WhatsApp 联系" : "Contact us on WhatsApp"}: ${brand.whatsappNumber}`}
    >
      <span className="phone-label">WhatsApp:</span>
      <span className="phone-number">{brand.whatsappNumber}</span>
      <Arrow diagonal />
    </a>
  );
}

function Dialog({
  children,
  onClose,
  label,
  className = "",
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={label}
      className={`dialog ${className}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-shell">
        <button
          type="button"
          className="icon-button dialog-close"
          onClick={onClose}
          aria-label="Close / 关闭"
        >
          <span />
          <span />
        </button>
        {children}
      </div>
    </dialog>
  );
}

function Inquiry({
  lang,
  product,
  onClose,
}: {
  lang: Language;
  product: Product | null;
  onClose: () => void;
}) {
  const isZh = lang === "zh";
  const [summary, setSummary] = useState("");
  const [saved, setSaved] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resultHeading = useRef<HTMLParagraphElement>(null);
  const emailSubject = `${brand.name} — ${isZh ? "合作咨询" : "Partnership enquiry"}${product ? ` / ${product.code}` : ""}`;
  const emailLink = createEmailDraftLink(brand.email, emailSubject, summary);

  useEffect(() => {
    if (summary) resultHeading.current?.focus();
  }, [summary]);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nameInput = event.currentTarget.elements.namedItem(
      "name",
    ) as HTMLInputElement;
    const messageInput = event.currentTarget.elements.namedItem(
      "message",
    ) as HTMLTextAreaElement;
    if (!String(form.get("name")).trim()) {
      nameInput.setCustomValidity(
        isZh ? "请填写您的称呼。" : "Please enter your name.",
      );
      nameInput.reportValidity();
      return;
    }
    if (String(form.get("message")).trim().length < 5) {
      messageInput.setCustomValidity(
        isZh
          ? "请填写至少 5 个有效字符的需求说明。"
          : "Please enter at least 5 characters about your project.",
      );
      messageInput.reportValidity();
      return;
    }
    setSummary(
      [
        `${brand.name} — ${isZh ? "合作咨询" : "Partnership enquiry"}`,
        "────────────────────────────",
        `${isZh ? "联系人" : "Name"}: ${String(form.get("name")).trim()}`,
        `${isZh ? "品牌 / 公司" : "Brand / company"}: ${String(form.get("company")).trim() || "—"}`,
        `${isZh ? "电子邮箱" : "Email"}: ${String(form.get("email")).trim()}`,
        `${isZh ? "合作方向" : "Service"}: ${form.get("service")}`,
        `${isZh ? "意向鞋款" : "Selected footwear"}: ${product ? `${product.title[lang]} / ${product.code}` : isZh ? "待沟通" : "To discuss"}`,
        ...(product
          ? [
              `${isZh ? "编号类型" : "Reference type"}: ${product.isOriginalCode ? (isZh ? "原文件编号" : "Source reference") : isZh ? "目录编号，非工厂型号" : "Catalog reference, not a factory model number"}`,
            ]
          : []),
        `${isZh ? "预计数量" : "Estimated quantity"}: ${String(form.get("quantity")).trim() || (isZh ? "待沟通" : "To discuss")}`,
        "",
        isZh ? "需求说明：" : "Project details:",
        String(form.get("message")).trim(),
        "",
        `${brand.name} WhatsApp: ${brand.whatsappNumber}`,
      ].join("\n"),
    );
    setSaved(false);
    setCopyStatus("idle");
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + summary], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "KANG-BAO-SHOES-project-brief.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <Dialog
      onClose={onClose}
      label={isZh ? "合作咨询" : "Start a conversation"}
      className="inquiry-dialog"
    >
      <div className="inquiry-inner">
        <p className="eyebrow">LET’S CREATE TOGETHER</p>
        <h2>
          {isZh
            ? "好的作品，始于对话。"
            : "Every good thing begins with a conversation."}
        </h2>
        <ContactWhatsApp lang={lang} className="inquiry-phone" />
        <p className="inquiry-recipient">
          {isZh ? "收件邮箱" : "Send your enquiry to"}
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </p>
        {!summary ? (
          <>
            <p className="muted form-intro">
              {isZh
                ? "聊聊您的品牌与构想。填写后预览邮件草稿，再打开邮件应用确认发送。"
                : "Tell us about your brand and ideas. Review your email draft, then open your email app to send it."}
            </p>
            {product && (
              <p className="selected-product">
                {isZh ? "意向鞋款" : "Your selection"}
                <span>
                  {product.code} / {product.title[lang]}
                </span>
              </p>
            )}
            <form
              onSubmit={prepare}
              onInput={(event) => {
                const input = event.target as HTMLInputElement;
                input.setCustomValidity?.("");
              }}
            >
              <div className="form-grid">
                <label>
                  {isZh ? "您的称呼 *" : "Your name *"}
                  <input
                    name="name"
                    required
                    maxLength={80}
                    autoComplete="name"
                    placeholder={isZh ? "如何称呼您" : "Your name"}
                  />
                </label>
                <label>
                  {isZh ? "品牌 / 公司" : "Brand / company"}
                  <input
                    name="company"
                    maxLength={120}
                    autoComplete="organization"
                    placeholder={
                      isZh ? "品牌或公司名称" : "Your brand or company"
                    }
                  />
                </label>
                <label>
                  {isZh ? "电子邮箱 *" : "Email address *"}
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={160}
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  {isZh ? "合作方向" : "Area of interest"}
                  <select name="service">
                    {services.map((service) => (
                      <option key={service.en}>{service[lang]}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                {isZh ? "预计数量（双）" : "Estimated quantity (pairs)"}
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  max="10000000"
                  placeholder={
                    isZh
                      ? "可暂留空，后续沟通"
                      : "Optional — we can discuss this later"
                  }
                />
              </label>
              <label>
                {isZh ? "告诉我们您的构想 *" : "Tell us about your project *"}
                <textarea
                  name="message"
                  required
                  minLength={5}
                  maxLength={3000}
                  rows={3}
                  placeholder={
                    isZh
                      ? "例如：鞋款风格、皮料偏好、打样需求或计划时间…"
                      : "Style, materials, sampling needs, or your timeline…"
                  }
                />
              </label>
              <p className="form-note">
                {isZh
                  ? "内容在此页面内生成。打开邮件应用后，请由您检查并点击发送；网站不会自动发送邮件。"
                  : "Your draft is prepared on this page. Review it and press Send in your email app. This website does not send email automatically."}
              </p>
              <button
                className="button button-burgundy form-submit"
                type="submit"
              >
                {isZh ? "预览邮件草稿" : "Review email draft"}
                <Arrow />
              </button>
            </form>
          </>
        ) : (
          <div className="brief-result" aria-live="polite">
            <p ref={resultHeading} tabIndex={-1}>
              {isZh
                ? "邮件草稿已准备好，尚未发送。点击下方按钮，在您的邮件应用中确认发送。"
                : "Your email draft is ready and has not been sent. Open your email app below, review the message and press Send."}
            </p>
            <p className="email-subject">
              <strong>{isZh ? "主题：" : "Subject: "}</strong>
              {emailSubject}
            </p>
            <pre tabIndex={0}>{summary}</pre>
            <a className="button button-burgundy email-send" href={emailLink}>
              {isZh ? "打开邮件应用发送" : "Open email app to send"}
              <Arrow />
            </a>
            <p className="email-fallback">
              {isZh
                ? "如果邮件应用未打开，或草稿内容不完整，请复制或下载内容，手动发送到上方邮箱。"
                : "If your email app does not open or the draft is incomplete, copy or download the message and send it to the address above."}
            </p>
            <div className="draft-actions">
              <button className="text-link" onClick={copyDraft}>
                {isZh ? "复制邮件内容" : "Copy message"}
              </button>
              <button className="text-link" onClick={download}>
                {isZh ? "下载需求清单" : "Download brief"}
              </button>
              <button
                className="text-link edit-brief"
                onClick={() => setSummary("")}
              >
                {isZh ? "重新填写" : "Start again"}
              </button>
            </div>
            {copyStatus !== "idle" && (
              <p className="copy-status" role="status">
                {copyStatus === "copied"
                  ? isZh
                    ? "邮件内容已复制。"
                    : "Message copied."
                  : isZh
                    ? "无法自动复制，请选中上方草稿文字复制，或下载清单。"
                    : "Copy is unavailable. Select and copy the draft above, or download the brief."}
              </p>
            )}
            {saved && (
              <p className="download-status" role="status">
                {isZh
                  ? "下载已开始，请在浏览器下载列表中查看。"
                  : "Download started. Check your browser’s downloads."}
              </p>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const productButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingProductFocus = useRef<string | null>(null);
  const [activeCraft, setActiveCraft] = useState<number | null>(0);
  const [detail, setDetail] = useState<Product | null>(null);
  const [inquiry, setInquiry] = useState<{ product: Product | null } | null>(
    null,
  );
  const [privacy, setPrivacy] = useState(false);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const isZh = lang === "zh";
  const t = (zh: string, en: string) => (isZh ? zh : en);
  const pick = (text: Bilingual) => text[lang];

  useEffect(() => {
    if (pendingProductFocus.current) {
      productButtons.current.get(pendingProductFocus.current)?.focus();
      pendingProductFocus.current = null;
    }
  }, [visibleCount]);

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "en";
    document.title = `${brand.name} | ${isZh ? `${brand.chineseName} · 行有所向，履有匠心` : "The Art of Shoemaking"}`;
  }, [isZh]);

  useEffect(() => {
    if (!menuOpen) return;
    function closeMenu(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        mobileMenuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);

  const links = [
    { id: "collections", label: t("鞋履系列", "Collections") },
    { id: "craft", label: t("匠心工艺", "Our craft") },
    { id: "story", label: t("品牌理念", "Our philosophy") },
  ];
  const shownProducts = orderedProducts.filter((product) => {
    const query = search.trim().toLocaleLowerCase();
    return (
      (category === "all" || product.category === category) &&
      (!query ||
        `${product.code} ${product.name.en} ${product.name.zh} ${product.title.en} ${product.title.zh}`
          .toLocaleLowerCase()
          .includes(query))
    );
  });
  const visibleProducts = shownProducts.slice(0, visibleCount);
  const selectedCollection = collections.find((item) => item.id === category);
  function selectCategory(next: Category) {
    setCategory(next);
    setSearch("");
    setVisibleCount(12);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {t("跳至主要内容", "Skip to content")}
      </a>
      <div className="announcement">
        <span>CONSIDERED DESIGN. EXCEPTIONAL DETAIL.</span>
        <span className="announcement-zh">
          {t("以匠心，致每一步。", "A considered approach to every step.")}
        </span>
      </div>
      <header className="site-header">
        <nav
          className="desktop-nav"
          aria-label={t("主导航", "Main navigation")}
        >
          {links.slice(0, 2).map((link) => (
            <a href={`#${link.id}`} key={link.id}>
              {link.label}
            </a>
          ))}
        </nav>
        <button
          ref={mobileMenuButton}
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label={t(
            menuOpen ? "关闭菜单" : "打开菜单",
            menuOpen ? "Close menu" : "Open menu",
          )}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
        <a
          href="#"
          className="wordmark"
          aria-label={`${brand.name} ${brand.chineseName} — ${t("首页", "Home")}`}
        >
          <BrandMonogram />
          <span className="wordmark-copy">
            <span>{brand.name}</span>
            <small className="wordmark-chinese" lang="zh-CN">
              {brand.chineseName}
            </small>
          </span>
        </a>
        <div className="header-right">
          <a className="philosophy-link" href="#story">
            {t("品牌理念", "Philosophy")}
          </a>
          <button
            className="header-contact"
            onClick={() => setInquiry({ product: null })}
          >
            {t("合作咨询", "Enquire")}
            <Arrow diagonal />
          </button>
          <span className="header-divider" />
          <button
            className="language-button"
            onClick={() => {
              setLang(isZh ? "en" : "zh");
              setMenuOpen(false);
            }}
            aria-label={isZh ? "Switch to English" : "切换到中文"}
          >
            {isZh ? "EN" : "中"}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label={t("手机导航", "Mobile navigation")}
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                <Arrow diagonal />
              </a>
            ))}
            <button
              onClick={() => {
                mobileMenuButton.current?.focus();
                setMenuOpen(false);
                setInquiry({ product: null });
              }}
            >
              {t("合作咨询", "Start a conversation")}
              <Arrow diagonal />
            </button>
            <small>
              {brand.name} — {brand.line}
            </small>
          </nav>
        )}
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <img
            className="hero-image"
            src={asset("brand/collection-hero.jpg")}
            width="1706"
            height="900"
            alt={t(
              "康宝鞋业商务鞋系列棕色雕花系带鞋",
              "A brown brogue lace-up from the KANG BAO SHOES business collection",
            )}
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light">
              <span className="small-line" /> {brand.name} / THE COLLECTION
            </p>
            <h1 id="hero-heading">
              {isZh ? (
                <>
                  行有所向，
                  <br />
                  履有匠心。
                </>
              ) : (
                <>
                  Every day.
                  <br />
                  Every occasion.
                </>
              )}
            </h1>
            <p className="hero-script">
              Five collections. One considered approach.
            </p>
            <p className="hero-description">
              {t(
                "从商务鞋到自在便履，探索属于您的步履风格。",
                "From business classics to off-duty ease. Find your next collection.",
              )}
            </p>
            <a href="#collections" className="button button-light">
              {t("探索鞋履系列", "Explore the collections")}
              <Arrow />
            </a>
          </div>
          <div className="hero-bottom">
            <span>CRAFTED WITH INTENTION</span>
            <a href="#introduction">
              {t("向下探索", "SCROLL TO DISCOVER")}
              <span className="scroll-line" />
            </a>
            <span className="hero-edition">
              BUSINESS · CASUAL · FASHION · SANDALS · SLIPPERS
            </span>
          </div>
        </section>

        <section className="introduction section-wrap" id="introduction">
          <div className="section-kicker">
            <span className="tiny-star">✳</span>
            <p className="eyebrow">QUIETLY DISTINCTIVE</p>
          </div>
          <h2>
            {t(
              "真正的质感，无需声张。",
              "True character needs no introduction.",
            )}
          </h2>
          <p>
            {isZh ? (
              <>
                一双好鞋，是材料、比例与时间的默契。
                <br />
                {brand.chineseName}以克制的设计与细腻的工艺，让品质融入日常。
              </>
            ) : (
              <>
                A good shoe is a quiet agreement between material, proportion
                and time.
                <br />
                At {brand.name}, considered design brings a sense of refinement
                to the everyday.
              </>
            )}
          </p>
          <a href="#story" className="text-link">
            {t(`走近${brand.chineseName}`, "Discover our philosophy")}
            <Arrow />
          </a>
        </section>

        <section
          className="collection-directory section-wrap"
          id="collection-directory"
          aria-labelledby="directory-heading"
        >
          <div className="section-top">
            <div>
              <p className="eyebrow">FIVE WAYS TO MAKE YOUR MARK</p>
              <h2 id="directory-heading">
                {t("五大系列，步履随心。", "Find your collection.")}
              </h2>
            </div>
            <span className="section-side-note">
              {t("按系列探索产品", "Footwear for every part of your day.")}
            </span>
          </div>
          <div className="directory-grid">
            {collections.map((collection, index) => (
              <a
                key={collection.id}
                href="#collections"
                className="directory-card"
                onClick={() => selectCategory(collection.id)}
                aria-label={`${t("浏览", "Explore")} ${pick(collection.label)}`}
              >
                <div className="directory-image">
                  <img
                    src={asset(collection.image)}
                    alt={pick(collection.label)}
                    width="600"
                    height="600"
                    loading="lazy"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="directory-title">
                  <h3>{pick(collection.label)}</h3>
                  <Arrow diagonal />
                </div>
                <p>
                  {collection.count} {t("张产品图片", "catalog images")}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section
          id="collections"
          className="collections section-wrap"
          aria-labelledby="collection-heading"
        >
          <div className="section-top">
            <div>
              <p className="eyebrow">THE COLLECTIONS</p>
              <h2 id="collection-heading">
                {selectedCollection
                  ? pick(selectedCollection.label)
                  : t("探索完整产品目录。", "The footwear catalog.")}
              </h2>
            </div>
            <span className="section-side-note">
              {t(
                "找到心仪鞋款，与我们沟通",
                "Choose a style. Start a conversation.",
              )}
            </span>
          </div>
          <div className="collection-toolbar">
            <div
              className="category-tabs"
              role="group"
              aria-label={t("筛选鞋履系列", "Filter collections")}
            >
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={category === item.id ? "active" : ""}
                  aria-pressed={category === item.id}
                  onClick={() => selectCategory(item.id)}
                >
                  {pick(item.label)}
                  <span className="category-total">
                    {item.id === "all"
                      ? products.length
                      : products.filter(
                          (product) => product.category === item.id,
                        ).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="catalog-tools">
            <label className="catalog-search">
              <span>{t("搜索产品", "Search the catalog")}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(12);
                }}
                placeholder={t(
                  "输入型号、编号或分类",
                  "Model, reference or collection",
                )}
              />
            </label>
            <p className="catalog-results" role="status">
              {t(
                `显示 ${visibleProducts.length} / ${shownProducts.length} 张产品图片`,
                `Showing ${visibleProducts.length} of ${shownProducts.length} catalog images`,
              )}
            </p>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                ref={(button) => {
                  if (button) productButtons.current.set(product.id, button);
                  else productButtons.current.delete(product.id);
                }}
                className="product-card"
                onClick={() => setDetail(product)}
                aria-label={`${t("查看", "Discover")} ${product.code} ${pick(product.title)}`}
              >
                <div className={`product-image-wrap product-${product.id}`}>
                  <img
                    src={asset(product.image)}
                    alt={`${pick(product.title)} / ${product.code}`}
                    width="1200"
                    height="900"
                    loading="lazy"
                  />
                  <span className="product-index">{pick(product.title)}</span>
                  <span className="product-explore">
                    {t("探索细节", "DISCOVER THE DETAILS")}
                    <Arrow diagonal />
                  </span>
                </div>
                <div className="product-heading">
                  <div>
                    <h3>{product.code}</h3>
                    <p>{pick(product.title)}</p>
                  </div>
                  <Arrow diagonal />
                </div>
                <div className="product-caption">
                  <span>
                    {product.isOriginalCode
                      ? t("原文件编号", "Source reference")
                      : t("目录编号", "Catalog reference")}
                  </span>
                  <span>{t("查看详情", "View details")}</span>
                </div>
              </button>
            ))}
          </div>
          {shownProducts.length === 0 && (
            <div className="catalog-empty">
              <h3>{t("未找到匹配的产品", "No matching footwear")}</h3>
              <p>
                {t(
                  "请尝试其他编号，或查看全部系列。",
                  "Try another reference or explore all collections.",
                )}
              </p>
              <button
                className="button button-burgundy"
                onClick={() => selectCategory("all")}
              >
                {t("重置筛选", "Reset filters")}
                <Arrow />
              </button>
            </div>
          )}
          {visibleCount < shownProducts.length && (
            <div className="catalog-more">
              <button
                className="button button-outline"
                onClick={() => {
                  pendingProductFocus.current =
                    shownProducts[visibleCount]?.id ?? null;
                  setVisibleCount((count) => count + 12);
                }}
              >
                {t("加载更多产品", "Load more footwear")}
                <Arrow />
              </button>
            </div>
          )}
          <p className="collection-footnote">
            {t(
              "目录编号用于选图咨询，不代表工厂型号。规格与供货信息请联系我们确认。",
              "Catalog references identify images, not factory model numbers. Contact us for specifications and availability.",
            )}
          </p>
        </section>

        <section
          id="craft"
          className="craft-section"
          aria-labelledby="craft-heading"
        >
          <div className="craft-photo">
            <img
              src={asset("brand/collection-detail.jpg")}
              alt={t(
                "商务鞋系列棕色雕花鞋头与缝线细节",
                "Brogue perforations and stitching on a brown business shoe",
              )}
              loading="lazy"
              width="850"
              height="800"
            />
            <span className="photo-caption">
              A CLOSER LOOK AT WHAT MATTERS.
            </span>
            <span className="photo-corner">
              {brand.name}
              <br />
              <i>Atelier notes, No. 01</i>
            </span>
          </div>
          <div className="craft-content">
            <p className="eyebrow">THE ART OF MAKING</p>
            <h2 id="craft-heading">
              {isZh ? (
                <>
                  于细微处，
                  <br />
                  见不凡。
                </>
              ) : (
                <>
                  An uncommon care
                  <br />
                  for the little things.
                </>
              )}
            </h2>
            <p className="craft-intro">
              {t(
                "好的工艺，藏在看得见与看不见的地方。我们关注的不只是成品，还有成就它的每一个细节。",
                "Good craft lives in the details you see, and the ones you feel. We care about the finished shoe, and everything that makes it what it is.",
              )}
            </p>
            <div className="craft-accordion">
              {craftSteps.map((step, index) => (
                <div
                  key={step.number}
                  className={`craft-step ${activeCraft === index ? "expanded" : ""}`}
                >
                  <h3>
                    <button
                      aria-expanded={activeCraft === index}
                      aria-controls={`craft-panel-${index}`}
                      id={`craft-trigger-${index}`}
                      onClick={() =>
                        setActiveCraft(activeCraft === index ? null : index)
                      }
                    >
                      <span className="step-number">{step.number}</span>
                      {pick(step.title)}
                      <span className="accordion-icon">
                        {activeCraft === index ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`craft-panel-${index}`}
                    role="region"
                    aria-labelledby={`craft-trigger-${index}`}
                    hidden={activeCraft !== index}
                  >
                    <p>{pick(step.text)}</p>
                  </div>
                </div>
              ))}
            </div>
            <span className="craft-signature">
              The beauty is in the details.
            </span>
          </div>
        </section>

        <section
          id="story"
          className="story-section section-wrap"
          aria-labelledby="story-heading"
        >
          <div className="story-copy">
            <p className="eyebrow">OUR PHILOSOPHY</p>
            <h2 id="story-heading">
              {isZh ? (
                <>
                  风格会流转，
                  <br />
                  质感始终如一。
                </>
              ) : (
                <>
                  Style moves on.
                  <br />
                  Character stays.
                </>
              )}
            </h2>
            <p>
              {t(
                "我们相信，一双值得留下的鞋，不必追逐每一次潮流。它应该有恰到好处的线条、令人愿意触摸的质地，以及融入生活的从容。",
                "We believe a shoe worth keeping does not need to follow every passing trend. It needs a considered line, a texture that invites touch, and the ease to become part of everyday life.",
              )}
            </p>
            <p>
              {t(
                `这也是${brand.chineseName}希望与每一位合作伙伴共同创造的：让想法成为作品，让作品走进日常。`,
                "This is what we hope to create with every partner: ideas made tangible, and thoughtful pieces made part of a life.",
              )}
            </p>
            <div id="partnership" className="story-cooperation">
              <div className="service-list">
                {services.map((service) => (
                  <span key={service.en}>{pick(service)}</span>
                ))}
              </div>
              <button
                className="button button-burgundy"
                onClick={() => setInquiry({ product: null })}
              >
                {t("开启合作对话", "Start a conversation")}
                <Arrow />
              </button>
              <ContactWhatsApp lang={lang} className="cooperation-phone" />
              <p className="cooperation-note">
                {t(
                  "每一份构想，都值得被认真对待。",
                  "Every idea deserves a little consideration.",
                )}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <BrandMonogram />
            <a href="#">{brand.name}</a>
            <p className="footer-brand-chinese" lang="zh-CN">
              {brand.chineseName}
            </p>
            <p>{brand.line}</p>
            <span>
              {t("以匠心，致每一步。", "A considered approach to every step.")}
            </span>
          </div>
          <div className="footer-links">
            <p>{t("鞋履系列", "COLLECTIONS")}</p>
            {collections.map((collection) => (
              <a
                key={collection.id}
                href="#collections"
                onClick={() => selectCategory(collection.id)}
              >
                {pick(collection.label)}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <p>{t("保持联系", "LET’S CONNECT")}</p>
            <ContactWhatsApp lang={lang} className="footer-phone" />
            <a className="footer-email" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
            <button onClick={() => setInquiry({ product: null })}>
              {t("商务合作", "Business enquiries")}
              <Arrow diagonal />
            </button>
            <a href="#partnership">{t("合作方式", "Working together")}</a>
            <button onClick={() => setPrivacy(true)}>
              {t("隐私说明", "Privacy notice")}
            </button>
          </div>
          <a
            className="back-to-top"
            href="#"
            aria-label={t("回到顶部", "Back to top")}
          >
            <Arrow />
            <span>{t("回到顶部", "BACK TO TOP")}</span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {brand.name}. ALL RIGHTS RESERVED.
          </span>
          <span>DESIGNED WITH INTENTION. MADE FOR THE JOURNEY.</span>
        </div>
      </footer>

      {detail && (
        <Dialog
          label={`${detail.code} ${pick(detail.title)}`}
          onClose={() => setDetail(null)}
          className="product-dialog"
        >
          <div className="detail-image">
            <img
              src={asset(detail.image)}
              alt={`${pick(detail.title)} / ${detail.code}`}
            />
          </div>
          <div className="detail-content">
            <p className="eyebrow">{pick(detail.title).toLocaleUpperCase()}</p>
            <h2>{detail.code}</h2>
            <h3>{pick(detail.title)}</h3>
            <p>{pick(detail.description)}</p>
            <p className="detail-reference">
              {detail.isOriginalCode
                ? t(
                    "编号来自原始图片文件名。",
                    "Reference from the supplied image filename.",
                  )
                : t(
                    "此编号用于目录选图，不是工厂型号。",
                    "This catalog reference identifies the image; it is not a factory model number.",
                  )}
            </p>
            <dl>
              <div>
                <dt>{t("开发方向", "Development")}</dt>
                <dd>
                  {t(
                    "鞋楦 · 皮料 · 鞋底 · 细节",
                    "Last · Leather · Sole · Details",
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("合作流程", "Process")}</dt>
                <dd>
                  {t(
                    "需求沟通 → 样品确认 → 生产计划",
                    "Brief → Sample review → Production plan",
                  )}
                </dd>
              </div>
            </dl>
            <p className="detail-note">
              {t(
                "具体材质、工艺、尺码、数量与交期请联系我们确认。",
                "Please contact us to confirm materials, construction, sizes, quantities and lead times.",
              )}
            </p>
            <button
              className="button button-burgundy"
              onClick={() => {
                setInquiry({ product: detail });
                setDetail(null);
              }}
            >
              {t("咨询此鞋款", "Enquire about this style")}
              <Arrow />
            </button>
          </div>
        </Dialog>
      )}
      {inquiry && (
        <Inquiry
          lang={lang}
          product={inquiry.product}
          onClose={() => setInquiry(null)}
        />
      )}
      {privacy && (
        <Dialog
          label={t("隐私说明", "Privacy notice")}
          onClose={() => setPrivacy(false)}
          className="privacy-dialog"
        >
          <div className="inquiry-inner">
            <p className="eyebrow">YOUR PRIVACY</p>
            <h2>{t("隐私说明", "A note on privacy")}</h2>
            <p>
              {t(
                `合作需求表在当前页面内生成邮件草稿，不会自动上传或发送。点击打开邮件应用时，收件人、主题与填写的内容会交给您的邮件应用，由您确认发送到 ${brand.email}。关闭页面后不保留表单内容；复制和下载的内容由您自行保存和分享。点击 WhatsApp 链接会打开 WhatsApp 服务。`,
                `The enquiry form prepares a draft on this page without uploading or sending it automatically. Opening the email app passes the recipient, subject and your message to your email application, where you confirm sending to ${brand.email}. Form contents are not retained when this page closes. You control copied or downloaded content. WhatsApp links open the WhatsApp service.`,
              )}
            </p>
            <p>
              {t(
                "本站未设置分析或广告追踪工具。网站托管方可能为提供服务记录常规访问日志。",
                "This site does not use analytics or advertising trackers. The hosting provider may retain standard access logs to operate the service.",
              )}
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}
