import data from "../data/products.json";

const CATEGORY_GROUPS = {
  top: ["shirt", "t-shirt", "polo", "sweatshirt", "top"],
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

const getRequiredCategories = (product) => {
  const currentGroup = getCategoryGroup(product.category);

  switch (currentGroup) {
    case "top":
      return ["pants", "shoes", "accessory", "scarf"];

    case "pants":
      return ["top", "shoes", "accessory", "scarf"];

    case "shoes":
      return ["top", "pants", "accessory", "scarf"];

    case "accessory":
      return ["top", "pants", "shoes", "scarf"];

    case "scarf":
      return ["top", "pants", "shoes", "accessory"];

    default:
      return ["top", "pants", "shoes", "accessory", "scarf"];
  }
};

const useOutfitEngine = (product) => {
  if (!product) {
    return {
      baseProduct: null,
      outfit: {},
    };
  }

  const requiredCategories = getRequiredCategories(product);

  const candidates = data.products
    .filter((item) => {
      if (item.id === product.id) {
        return false;
      }

      if (item.category === product.category) {
        return false;
      }

      return getCategoryGroup(item.category) !== null;
    })
    .map((item) => {
      let compatibilityScore = 0;

      if (item.style === product.style) {
        compatibilityScore += 2;
      }

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

  // Select the best candidate for each REQUIRED category only
  requiredCategories.forEach((category) => {
    const bestCandidate = candidates.find(
      (item) => item.categoryGroup === category
    );

    if (bestCandidate) {
      outfit[category] = bestCandidate;
    }
  });

  return {
    baseProduct: product,
    outfit,
  };
};

export default useOutfitEngine;
