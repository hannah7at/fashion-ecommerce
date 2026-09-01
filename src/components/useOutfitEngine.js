import products from '../data/products.json'

export function useOutfitEngine() {
  const getSuggestions = (product) => {
    if (!product) {
      return []
    }

    return products
      .filter(item => item.id !== product.id)
      .filter(item => item.category !== product.category)
      .map(item => {
        let score = 0

        if (item.style === product.style) {
          score += 2
        }

        if (item.color === product.color) {
          score += 1
        }

        return {
          ...item,
          score
        }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  return {
    getSuggestions
  }
}
