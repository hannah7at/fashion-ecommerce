import { useMemo } from "react";
import products from "../data/products.json";

const useOutfitEngine = ({ style, color, budget }) => {
  const outfit = useMemo(() => {
    let items = [...products];

    // Filter by selected style
    if (style) {
      items = items.filter((item) => item.style === style);
    }

    // Filter by selected color
    if (color) {
      items = items.filter((item) => item.color === color);
    }

    // Filter by budget
    if (budget) {
      items = items.filter((item) => item.price <= Number(budget));
    }

    // Organize products by category
    const categories = {};

    items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }

      categories[item.category].push(item);
    });

    // Pick one product from each category
    const selectedItems = Object.values(categories).map(
      (categoryItems) => categoryItems[0]
    );

    return selectedItems;
  }, [style, color, budget]);

  return {
    outfit,
    products: products,
  };
};

export default useOutfitEngine;
