import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Transaction } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useBusinessStore } from './business'

// Financial transaction ledger store
export const useTransactionStore = defineStore('transactions', () => {
  const businessStore = useBusinessStore()
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)

  const fetchTransactions = async (force = false) => {
    if (isLoading.value) return
    if (transactions.value.length > 0 && !force) return

    isLoading.value = true
    try {
      const response = await api.get('/transactions')
      transactions.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await api.post('/transactions', transaction)
      transactions.value.push(response.data.data)
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const updateTransaction = async (updated: Transaction) => {
    try {
      const id = updated._id || updated.id
      const response = await api.put(`/transactions/${id}`, updated)
      const index = transactions.value.findIndex(t => (t._id || t.id) === id)
      if (index !== -1) {
        transactions.value[index] = response.data.data
      }
    } catch (error) {
      console.error('Failed to update transaction:', error)
    }
  }

  const deleteTransactionById = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`)
      transactions.value = transactions.value.filter(t => (t._id || t.id) !== id)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  // Analytics
  const totalIncome = computed(() => 
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() => 
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const netBalance = computed(() => totalIncome.value - totalExpense.value)

  const incomeByCategory = computed(() => {
    const categories: Record<string, number> = {}
    transactions.value
      .filter(t => t.type === 'income')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
      })
    return categories
  })

  const expenseByCategory = computed(() => {
    const categories: Record<string, number> = {}
    transactions.value
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
      })
    return categories
  })

  // Chart data (Last 30 days)
  const last30DaysTrend = computed(() => {
    const days = 30
    const now = new Date()
    const data: { date: string, income: number, expense: number }[] = []

    for (let i = days; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0] ?? ''
      
      const dayTransactions = transactions.value.filter(t => {
        const tDate = new Date(t.date).toISOString().split('T')[0] ?? ''
        return tDate === dateStr
      })

      data.push({
        date: dateStr,
        income: dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      })
    }
    return data
  })

  // Persist to localStorage
  watch(transactions, (newVal) => {
    writeJSONStorage(storageKey, newVal)
  }, { deep: true })

  return {
    transactions,
    fetchTransactions,
    addTransaction,
    deleteTransaction: deleteTransactionById,
    updateTransaction,
    totalIncome,
    totalExpense,
    netBalance,
    incomeByCategory,
    expenseByCategory,
    last30DaysTrend
  }
})
