import {
  catalogItems,
  type CatalogItem,
  type CatalogCategory,
} from "./catalog";

export type Language = "zh" | "en";
export type Bilingual = { zh: string; en: string };
export type Category = "all" | CatalogCategory;

export const brand = {
  name: "KANG BAO SHOES",
  chineseName: "康宝鞋业",
  logo: "brand/kangbao-pdf-logo.png",
  line: "THE ART OF SHOEMAKING",
  whatsappNumber: "+86 18968893710",
  whatsappHref: "https://wa.me/8618968893710",
  email: "aabbccll895@gmail.com",
};
export const asset = (file: string) =>
  `${import.meta.env.BASE_URL}images/${file}`;

export const collectionInfo: {
  id: CatalogCategory;
  label: Bilingual;
  subtitle: Bilingual;
  description: Bilingual;
}[] = [
  {
    id: "business",
    label: { zh: "商务鞋", en: "Business shoes" },
    subtitle: {
      zh: "从容应对，每个正式时刻",
      en: "Considered for the occasion.",
    },
    description: {
      zh: "商务鞋系列，为工作与正式场合提供多种鞋型选择。欢迎携带产品型号或目录编号，与我们沟通具体需求。",
      en: "Our business collection brings together footwear for the working day and formal occasions. Share the model or catalog reference with us to discuss your requirements.",
    },
  },
  {
    id: "casual",
    label: { zh: "休闲鞋", en: "Casual shoes" },
    subtitle: { zh: "日常步履，自有节奏", en: "An everyday state of mind." },
    description: {
      zh: "休闲鞋系列，探索适合日常穿搭的多种轮廓。具体鞋面材料、尺码与配色，请与我们确认。",
      en: "Explore a range of everyday silhouettes in our casual collection. Contact us to confirm upper materials, available sizes and colour options.",
    },
  },
  {
    id: "fashion",
    label: { zh: "时尚鞋", en: "Fashion shoes" },
    subtitle: { zh: "为风格，留一点不同", en: "A different point of view." },
    description: {
      zh: "时尚鞋系列，以多样的色调与鞋型搭配个人风格。可通过目录编号进一步沟通样品与开发方向。",
      en: "A selection of colours and silhouettes for an individual approach to dressing. Use the catalog reference to discuss samples and development options.",
    },
  },
  {
    id: "sandals",
    label: { zh: "凉鞋", en: "Sandals" },
    subtitle: { zh: "开放轮廓，轻松时光", en: "Open to the everyday." },
    description: {
      zh: "凉鞋系列，呈现不同鞋面结构与款式选择。图片所示规格、材料与生产安排，请咨询我们确认。",
      en: "Discover different upper constructions and silhouettes in our sandal collection. Specifications, materials and production arrangements are confirmed on enquiry.",
    },
  },
  {
    id: "slippers",
    label: { zh: "拖鞋", en: "Slippers" },
    subtitle: { zh: "自在穿脱，悠然日常", en: "Ease, without the effort." },
    description: {
      zh: "拖鞋系列，为轻松日常提供便穿款式。欢迎选定目录图片，与我们沟通配色、尺码及合作需求。",
      en: "Slip-on styles for relaxed days. Choose a catalog image and speak with us about colours, sizes and your project requirements.",
    },
  },
];

export const categories: { id: Category; label: Bilingual }[] = [
  { id: "all", label: { zh: "全部系列", en: "All collections" } },
  ...collectionInfo.map(({ id, label }) => ({ id, label })),
];

export type Product = CatalogItem & {
  number: string;
  title: Bilingual;
  caption: Bilingual;
  description: Bilingual;
};

export const products: Product[] = catalogItems.map((item, index) => {
  const collection = collectionInfo.find(
    (entry) => entry.id === item.category,
  )!;
  return {
    ...item,
    number: String(index + 1).padStart(2, "0"),
    title: collection.label,
    caption: collection.subtitle,
    description: collection.description,
  };
});

// Alternate collections in the full catalog so the opening selection includes all five.
export const orderedProducts: Product[] = [];
const groups = collectionInfo.map((collection) =>
  products.filter((item) => item.category === collection.id),
);
for (
  let index = 0;
  index < Math.max(...groups.map((group) => group.length));
  index++
) {
  for (const group of groups)
    if (group[index]) orderedProducts.push(group[index]);
}

const collectionCovers: Record<CatalogCategory, string> = {
  business: "catalog/business/bs-014.jpg",
  casual: "catalog/casual/cs-018.jpg",
  fashion: "catalog/fashion/fs-004.jpg",
  sandals: "catalog/sandals/sa-013.jpg",
  slippers: "catalog/slippers/sl-005.jpg",
};

export const collections = collectionInfo.map((collection) => {
  const items = products.filter((item) => item.category === collection.id);
  return {
    ...collection,
    count: items.length,
    image: collectionCovers[collection.id],
  };
});

export const craftSteps = [
  {
    number: "01",
    title: { zh: "选材，始于触感", en: "Material, before everything" },
    text: {
      zh: "纹理、光泽与柔韧度，是理解一块皮革的起点。我们相信，好的设计应该顺应材料的性格，让自然的细节被看见。",
      en: "Grain, sheen and suppleness are the beginning of a conversation with leather. Our approach starts with the material, allowing its natural character to guide the design.",
    },
  },
  {
    number: "02",
    title: { zh: "鞋楦，关乎分寸", en: "Proportion, shaped with intention" },
    text: {
      zh: "鞋头的弧度、足弓的支撑与鞋身的比例，共同决定一双鞋的气质。通过样品沟通与试穿调整，让美感与穿着体验取得平衡。",
      en: "The curve of a toe, the support of an arch, the balance of a profile. Sampling and fitting bring these elements together, with equal attention to appearance and how a shoe feels.",
    },
  },
  {
    number: "03",
    title: { zh: "细节，留给时间", en: "Details, made to be noticed" },
    text: {
      zh: "从缝线的节奏到边缘的收整，每一处细节都值得认真对待。经得住反复端详的完成度，是我们对制鞋的理解。",
      en: "From the rhythm of a stitch to the finish of an edge, every detail deserves consideration. The result should invite a closer look, today and over time.",
    },
  },
];

export const services = [
  { zh: "品牌开发合作", en: "Brand development" },
  { zh: "来样 / 来图开发", en: "Sample & design development" },
  { zh: "鞋款与工艺咨询", en: "Footwear & craft consultation" },
];
