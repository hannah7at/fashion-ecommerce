import data from "../data/products.json";

const useOutfitEngine = (product) => {
  if (!product) {
    return [];
  }

  const recommendations = data
    .filter((item) => {
      // Exclude the current product
      if (item.id === product.id) {
        return false;
      }

      // Exclude products from the same category
      if (item.category === product.category) {
        return false;
      }

      // Keep only products matching style or color
      return (
        item.style === product.style ||
        item.color === product.color
      );
    })
    .map((item) => {
      let score = 0;

      // Same style → +2
      if (item.style === product.style) {
        score += 2;
      }

      // Same color → +1
      if (item.color === product.color) {
        score += 1;
      }

      return {
        ...item,
        compatibilityScore: score,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 3);

  return recommendations;
};

export default useOutfitEngine;
