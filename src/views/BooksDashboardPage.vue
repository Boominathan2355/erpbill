<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { useTransactionStore } from '../stores/transactions'
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import TransactionModal from '../components/organisms/TransactionModal.vue'

const transactionStore = useTransactionStore()
const isModalOpen = ref(false)
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const openAddModal = () => {
  isModalOpen.value = true
}

const handleSaveTransaction = (transaction: any) => {
  transactionStore.addTransaction(transaction)
  isModalOpen.value = false
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  updateChartOptions()
}

const updateChartOptions = () => {
  if (!chartInstance) return

  const trendData = transactionStore.last30DaysTrend
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 0,
      textStyle: { color: '#1e293b' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Income', 'Expense'],
      textStyle: { color: '#94a3b8' },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '10%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date.split('-').slice(1).join('/')),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.1)' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: 'Income',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.income),
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        }
      },
      {
        name: 'Expense',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.expense),
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.2)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  transactionStore.fetchTransactions()
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
})

watch(() => transactionStore.transactions, () => {
  updateChartOptions()
}, { deep: true })
</script>

<template>
  <div class="books-dashboard">
    <div class="header-actions">
      <div class="title-group">
        <h1>Books & Finance</h1>
        <p class="subtitle">Track your revenue and operating expenses</p>
      </div>
      <BaseButton variant="primary" @click="openAddModal">
        <AppIcon name="home" :size="18" />
        Add Transaction
      </BaseButton>
    </div>

    <div class="summary-section">
      <div class="stat-card glass-card income">
        <div class="stat-icon">
          <AppIcon name="check" :size="24" />
        </div>
        <div class="stat-info">
          <span class="label">Total Income</span>
          <span class="value">{{ formatCurrency(transactionStore.totalIncome) }}</span>
        </div>
      </div>

      <div class="stat-card glass-card expense">
        <div class="stat-icon">
          <AppIcon name="menu" :size="24" />
        </div>
        <div class="stat-info">
          <span class="label">Total Expenses</span>
          <span class="value">{{ formatCurrency(transactionStore.totalExpense) }}</span>
        </div>
      </div>

      <div class="stat-card glass-card balance">
        <div class="stat-icon">
          <AppIcon name="box" :size="24" />
        </div>
        <div class="stat-info">
          <span class="label">Net Balance</span>
          <span class="value" :class="{ negative: transactionStore.netBalance < 0 }">
            {{ formatCurrency(transactionStore.netBalance) }}
          </span>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-container glass-card">
        <div class="chart-header">
          <h3>Cash Flow Trend</h3>
          <span class="timeframe">Last 30 Days</span>
        </div>
        <div ref="chartRef" class="main-chart"></div>
      </div>
    </div>

    <div class="transactions-section glass-card">
      <div class="section-header">
        <h3>Recent Transactions</h3>
      </div>
      
      <div class="table-container">
        <table class="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Method</th>
              <th>Type</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transactionStore.transactions" :key="t.id">
              <td>{{ formatDate(t.date) }}</td>
              <td>
                <span class="category-chip">{{ t.category }}</span>
              </td>
              <td class="description">{{ t.description }}</td>
              <td>{{ t.paymentMethod }}</td>
              <td>
                <span :class="['type-badge', t.type]">{{ t.type }}</span>
              </td>
              <td class="text-right font-bold" :class="t.type">
                {{ t.type === 'expense' ? '-' : '+' }}{{ formatCurrency(t.amount) }}
              </td>
            </tr>
            <tr v-if="transactionStore.transactions.length === 0">
              <td colspan="6" class="empty-state">No transactions recorded yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TransactionModal 
      :show="isModalOpen" 
      @close="isModalOpen = false" 
      @save="handleSaveTransaction"
    />
  </div>
</template>

<style scoped>
.books-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.title-group h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  margin: 4px 0 0;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.income .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.expense .stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.balance .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
}

.value.negative { color: #ef4444; }

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

.chart-container {
  padding: var(--spacing-xl);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.chart-header h3 { margin: 0; }

.timeframe {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-app);
  padding: 4px 12px;
  border-radius: 999px;
}

.main-chart {
  flex: 1;
  width: 100%;
}

.transactions-section {
  padding: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.table-container {
  overflow-x: auto;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th {
  text-align: left;
  padding: var(--spacing-md);
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}

.transaction-table td {
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.category-chip {
  background: var(--bg-app);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.type-badge.income { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.type-badge.expense { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.income { color: #10b981; }
.expense { color: #ef4444; }

.font-bold { font-weight: 700; }
.text-right { text-align: right; }

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: var(--spacing-xl);
}
</style>
