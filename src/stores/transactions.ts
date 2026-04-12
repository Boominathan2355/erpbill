import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Transaction } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import { useBusinessStore } from './business'

// Financial transaction ledger store
export const useTransactionStore = defineStore('transactions', () => {
  const businessStore = useBusinessStore()
  const storageKey = `transactions_${businessStore.activeBusinessId}`
  const transactions = ref<Transaction[]>(readJSONStorage<Transaction[]>(storageKey, []))

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    }
    transactions.value.push(newTransaction)
  }

  const deleteTransaction = (id: string) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const updateTransaction = (updated: Transaction) => {
    const index = transactions.value.findIndex(t => t.id === updated.id)
    if (index !== -1) {
      transactions.value[index] = updated
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
    addTransaction,
    deleteTransaction,
    updateTransaction,
    totalIncome,
    totalExpense,
    netBalance,
    incomeByCategory,
    expenseByCategory,
    last30DaysTrend
  }
})
