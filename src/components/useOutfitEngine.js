import products from '../data/products.json'

export function useOutfitEngine() {

  const getSuggestions = (product) => {

    if (!product) {
      return []
    }

    const suggestions = products
      // Remove the current product
      .filter(item => item.id !== product.id)

      // Use products from different categories
      .filter(item => item.category !== product.category)

      // Calculate compatibility score
      .map(item => {

        let score = 0

        // Same style
        if (item.style === product.style) {
          score += 2
        }

        // Same color
        if (item.color === product.color) {
          score += 1
        }

        return {
          ...item,
          score
        }
      })

      // Keep only matching products
      .filter(item => item.score > 0)

      // Best matches first
      .sort((a, b) => b.score - a.score)

      // Return maximum 3 products
      .slice(0, 3)

    return suggestions
  }

  return {
    getSuggestions
  }
}
