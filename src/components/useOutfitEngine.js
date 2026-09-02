import data from "../data/products.json";

const CATEGORY_GROUPS = {
  pants: ["pants", "men's-pants", "cargo-pants", "men's-cargo-pants"],
  shoes: ["shoes", "sports-shoes", "women's-shoes", "heels"],
  accessory: [
    "accessory",
    "watch",
    "women's-watches",
    "jewelry",
    "women's-jewellery",
  ],
  scarf: ["scarf"],
};

const getCategoryGroup = (category) => {
  for (const [group, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(category)) {
      return group;
    }
  }

  return null;
};

const useOutfitEngine = (product) => {
  if (!product) {
    return {
      baseProduct: null,
      outfit: {},
    };
  }

  const candidates = data
    .filter((item) => {
      // Exclude current product
      if (item.id === product.id) {
        return false;
      }

      // Exclude same category
      if (item.category === product.category) {
        return false;
      }

      // Only products that belong to an outfit category
      return getCategoryGroup(item.category) !== null;
    })
    .map((item) => {
      let compatibilityScore = 0;

      // Same style → +2
      if (item.style === product.style) {
        compatibilityScore += 2;
      }

      // Same color → +1
      if (item.color === product.color) {
        compatibilityScore += 1;
      }

      return {
        ...item,
        compatibilityScore,
        categoryGroup: getCategoryGroup(item.category),
      };
    })
    .sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore
    );

  const outfit = {};

  // Pick the best product from each available category
  for (const item of candidates) {
    const group = item.categoryGroup;

    if (!outfit[group]) {
      outfit[group] = item;
    }
  }

  return {
    baseProduct: product,
    outfit,
  };
};

export default useOutfitEngine;
