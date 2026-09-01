import products from "../data/products.json";

const useOutfitEngine = (product) => {
  if (!product) {
    return [];
  }

  const suggestions = products.filter((item) => {
    if (item.id === product.id) {
      return false;
    }

    if (item.category === product.category) {
      return false;
    }

    return item.style === product.style || item.color === product.color;
  });

  return suggestions.slice(0, 3);
};

export default useOutfitEngine;
