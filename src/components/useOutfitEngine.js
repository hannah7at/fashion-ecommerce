import data from "../data/products.json";

const products = data.products;

const CATEGORY_GROUPS = {
  top: ["shirt", "t-shirt", "polo", "sweatshirt", "top"],
  pants: [
    "pants",
    "men's-pants",
    "cargo-pants",
    "men's-cargo-pants",
  ],
  shoes: [
    "shoes",
    "sports-shoes",
    "women's-shoes",
    "heels",
  ],
  accessory: [
    "accessory",
    "watch",
    "women's-watches",
    "jewelry",
    "women's-jewellery",
  ],
  scarf: ["scarf"],
};

/* ---------------------------------- */
/* CATEGORY GROUP                     */
/* ---------------------------------- */

const getCategoryGroup = (category) => {
  for (const [group, categories] of Object.entries(
    CATEGORY_GROUPS
  )) {
    if (categories.includes(category)) {
      return group;
    }
  }

  return null;
};

/* ---------------------------------- */
/* REQUIRED CATEGORIES                */
/* ---------------------------------- */

const getRequiredCategories = (product) => {
  const currentGroup = getCategoryGroup(
    product.category
  );

  switch (currentGroup) {
    case "top":
      return ["pants", "shoes", "accessory"];

    case "pants":
      return ["top", "shoes", "accessory"];

    case "shoes":
      return ["top", "pants", "accessory"];

    case "accessory":
      return ["top", "pants", "shoes"];

    case "scarf":
      return [
        "top",
        "pants",
        "shoes",
        "accessory",
      ];

    default:
      return [
        "top",
        "pants",
        "shoes",
        "accessory",
      ];
  }
};

/* ---------------------------------- */
/* COLOR NORMALIZATION                */
/* ---------------------------------- */

const normalizeColor = (color) => {
  if (!color) {
    return "";
  }

  return color
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();
};

/* ---------------------------------- */
/* COLOR FAMILIES                     */
/* ---------------------------------- */

const COLOR_FAMILIES = {
  black: ["black", "charcoal", "dark gray"],
  white: [
    "white",
    "ivory",
    "cream",
    "off white",
  ],
  beige: [
    "beige",
    "tan",
    "camel",
    "khaki",
    "brown",
  ],
  blue: [
    "blue",
    "light blue",
    "navy",
    "denim",
    "sky blue",
  ],
  green: ["green", "olive", "mint"],
  red: ["red", "burgundy", "maroon"],
  pink: ["pink", "light pink", "rose"],
  purple: ["purple", "lavender"],
  yellow: ["yellow", "mustard"],
  orange: ["orange"],
  gray: ["gray", "grey", "silver"],
};

/* ---------------------------------- */
/* GET COLOR FAMILY                   */
/* ---------------------------------- */

const getColorFamily = (color) => {
  const normalized = normalizeColor(color);

  for (const [family, colors] of Object.entries(
    COLOR_FAMILIES
  )) {
    if (colors.includes(normalized)) {
      return family;
    }
  }

  return normalized;
};

/* ---------------------------------- */
/* COLOR COMPATIBILITY                */
/* ---------------------------------- */

const areColorsCompatible = (
  color1,
  color2
) => {
  const first = getColorFamily(color1);
  const second = getColorFamily(color2);

  if (!first || !second) {
    return false;
  }

  if (first === second) {
    return true;
  }

  const compatiblePairs = [
    ["black", "white"],
    ["black", "beige"],
    ["black", "blue"],
    ["black", "red"],
    ["black", "green"],
    ["white", "beige"],
    ["white", "blue"],
    ["white", "green"],
    ["white", "pink"],
    ["white", "purple"],
    ["beige", "blue"],
    ["beige", "green"],
    ["beige", "brown"],
    ["blue", "white"],
    ["blue", "beige"],
    ["blue", "pink"],
    ["blue", "gray"],
    ["green", "beige"],
    ["green", "white"],
    ["pink", "white"],
    ["pink", "gray"],
    ["purple", "white"],
    ["red", "black"],
    ["red", "white"],
    ["gray", "black"],
    ["gray", "white"],
  ];

  return compatiblePairs.some(
    ([a, b]) =>
      (a === first && b === second) ||
      (a === second && b === first)
  );
};

/* ---------------------------------- */
/* PATTERN DETECTION                  */
/* ---------------------------------- */

const getPattern = (product) => {
  if (!product) {
    return "solid";
  }

  const text = `
    ${product.name || ""}
    ${product.description || ""}
    ${product.style || ""}
  `.toLowerCase();

  if (
    text.includes("plaid") ||
    text.includes("check") ||
    text.includes("checked") ||
    text.includes("gingham")
  ) {
    return "plaid";
  }

  if (
    text.includes("stripe") ||
    text.includes("striped") ||
    text.includes("striping")
  ) {
    return "striped";
  }

  if (
    text.includes("floral") ||
    text.includes("flower")
  ) {
    return "floral";
  }

  if (
    text.includes("printed") ||
    text.includes("print")
  ) {
    return "printed";
  }

  if (text.includes("graphic")) {
    return "graphic";
  }

  return "solid";
};

/* ---------------------------------- */
/* PATTERN COMPATIBILITY              */
/* ---------------------------------- */

const getPatternScore = (
  baseProduct,
  candidate
) => {
  const basePattern =
    getPattern(baseProduct);

  const candidatePattern =
    getPattern(candidate);

  if (
    basePattern === "solid" ||
    candidatePattern === "solid"
  ) {
    return 2;
  }

  if (basePattern === candidatePattern) {
    return -8;
  }

  if (
    [
      "plaid",
      "striped",
      "floral",
      "printed",
      "graphic",
    ].includes(basePattern) &&
    [
      "plaid",
      "striped",
      "floral",
      "printed",
      "graphic",
    ].includes(candidatePattern)
  ) {
    return -4;
  }

  return 1;
};

/* ---------------------------------- */
/* GENDER COMPATIBILITY               */
/* ---------------------------------- */

const isGenderCompatible = (
  product,
  candidate
) => {
  if (
    !product.gender ||
    !candidate.gender
  ) {
    return true;
  }

  if (candidate.gender === "unisex") {
    return true;
  }

  if (product.gender === "unisex") {
    return true;
  }

  return (
    candidate.gender ===
    product.gender
  );
};

/* ---------------------------------- */
/* SCORE CANDIDATE                    */
/* ---------------------------------- */

const scoreCandidate = (
  baseProduct,
  candidate
) => {
  let score = 0;

  /* Same style */
  if (
    baseProduct.style &&
    candidate.style &&
    baseProduct.style.toLowerCase() ===
      candidate.style.toLowerCase()
  ) {
    score += 4;
  }

  /* Compatible color */
  if (
    areColorsCompatible(
      baseProduct.color,
      candidate.color
    )
  ) {
    score += 3;
  }

  /* Exact same color */
  if (
    normalizeColor(
      baseProduct.color
    ) ===
    normalizeColor(candidate.color)
  ) {
    score -= 1;
  }

  /* Pattern intelligence */
  score += getPatternScore(
    baseProduct,
    candidate
  );

  /* Prefer different category */
  if (
    baseProduct.category !==
    candidate.category
  ) {
    score += 2;
  }

  return score;
};

/* ---------------------------------- */
/* ENGINE                             */
/* ---------------------------------- */

const useOutfitEngine = (
  product,
  excludedIds = [],
  variation = 0,
  lockedIds = []
) => {
  if (!product) {
    return {
      baseProduct: null,
      outfit: {},
      candidates: {},
    };
  }

  const requiredCategories =
    getRequiredCategories(product);

  const excludedSet = new Set(
    excludedIds
  );

  const lockedSet = new Set(
    lockedIds
  );

  /*
   * All valid candidates.
   *
   * Locked products are NOT removed
   * by excludedIds because they must
   * remain visible in the outfit.
   */
  const candidates = products
    .filter((item) => {
      /* Current product */
      if (item.id === product.id) {
        return false;
      }

      /* Same category */
      if (
        item.category ===
        product.category
      ) {
        return false;
      }

      /* Gender */
      if (
        !isGenderCompatible(
          product,
          item
        )
      ) {
        return false;
      }

      /* Known category */
      if (
        !getCategoryGroup(
          item.category
        )
      ) {
        return false;
      }

      /*
       * Don't exclude locked products.
       * They have priority.
       */
      if (
        excludedSet.has(item.id) &&
        !lockedSet.has(item.id)
      ) {
        return false;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      compatibilityScore:
        scoreCandidate(
          product,
          item
        ),
      categoryGroup:
        getCategoryGroup(
          item.category
        ),
    }))
    .sort(
      (a, b) =>
        b.compatibilityScore -
        a.compatibilityScore
    );

  const outfit = {};
  const candidatesByCategory = {};

  /* ---------------------------------- */
  /* BUILD OPTIONS FOR EACH CATEGORY   */
  /* ---------------------------------- */

  requiredCategories.forEach(
    (category) => {
      /*
       * First check whether this category
       * already has a locked product.
       */
      const lockedProduct =
        candidates.find(
          (item) =>
            item.categoryGroup ===
              category &&
            lockedSet.has(item.id)
        );

      if (lockedProduct) {
        outfit[category] =
          lockedProduct;

        candidatesByCategory[
          category
        ] = candidates.filter(
          (item) =>
            item.categoryGroup ===
            category
        );

        return;
      }

      /*
       * No locked product for this
       * category, so choose a new one.
       */
      const categoryCandidates =
        candidates
          .filter(
            (item) =>
              item.categoryGroup ===
              category
          )
          .sort(
            (a, b) =>
              b.compatibilityScore -
              a.compatibilityScore
          );

      candidatesByCategory[
        category
      ] = categoryCandidates;

      if (
        !categoryCandidates.length
      ) {
        return;
      }

      /*
       * Variation rotates through
       * available candidates.
       */
      const index =
        variation %
        categoryCandidates.length;

      outfit[category] =
        categoryCandidates[index];
    }
  );

  return {
    baseProduct: product,
    outfit,
    candidates: candidatesByCategory,
  };
};

export default useOutfitEngine;
