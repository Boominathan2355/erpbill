import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import { useBusinessStore } from './business'

// Store for managing product and service listings
export const useProductStore = defineStore('products', () => {
  const businessStore = useBusinessStore()
  const storageKey = `products_${businessStore.activeBusinessId}`
  const products = ref<Product[]>(readJSONStorage<Product[]>(storageKey, []))

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
      // Use full spread to ensure all metadata like hsnCode is preserved/updated
      products.value[index] = {
        ...products.value[index]!,
        ...updatedProduct,
        id // Prevent ID change
      }
    }
  }

  const deleteProduct = (id: string) => {
    products.value = products.value.filter(p => p.id !== id)
  }

  // Persist to localStorage
  watch(products, (newProducts) => {
    writeJSONStorage(storageKey, newProducts)
  }, { deep: true })

  return { products, addProduct, updateProduct, deleteProduct }
})
