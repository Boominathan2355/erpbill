import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>(readJSONStorage<Product[]>('products', []))

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(2, 9)
    }
    products.value.push(newProduct)
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const currentProduct = products.value[index]!
      products.value[index] = {
        ...currentProduct,
        ...updatedProduct,
        id: currentProduct.id,
        name: updatedProduct.name ?? currentProduct.name,
        description: updatedProduct.description ?? currentProduct.description,
        price: updatedProduct.price ?? currentProduct.price,
        unit: updatedProduct.unit ?? currentProduct.unit,
        taxRate: updatedProduct.taxRate ?? currentProduct.taxRate
      }
    }
  }

  const deleteProduct = (id: string) => {
    products.value = products.value.filter(p => p.id !== id)
  }

  // Persist to localStorage
  watch(products, (newProducts) => {
    writeJSONStorage('products', newProducts)
  }, { deep: true })

  return { products, addProduct, updateProduct, deleteProduct }
})
