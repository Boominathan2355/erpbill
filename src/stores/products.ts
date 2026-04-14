import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useBusinessStore } from './business'

// Store for managing product and service listings
export const useProductStore = defineStore('products', () => {
  const businessStore = useBusinessStore()
  const products = ref<Product[]>([])
  const isLoading = ref(false)

  const fetchProducts = async (force = false) => {
    if (isLoading.value) return
    if (products.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/products')
      products.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await api.post('/products', product)
      products.value.push(response.data.data)
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const response = await api.put(`/products/${id}`, updatedProduct)
      const index = products.value.findIndex(p => (p._id || p.id) === id)
      if (index !== -1) {
        products.value[index] = response.data.data
      }
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const deleteProductById = async (id: string) => {
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => (p._id || p.id) !== id)
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  return { products, fetchProducts, addProduct, updateProduct, deleteProduct: deleteProductById }
})
