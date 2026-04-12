<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useInvoiceStore } from '../../stores/invoices'
import { useThemeStore } from '../../stores/theme'

const props = defineProps<{
  height?: string | number
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const invoiceStore = useInvoiceStore()
const themeStore = useThemeStore()
const activeTab = ref<'today' | 'week' | 'month'>('week')

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value, themeStore.theme)
  updateChart()
}

const getCSSVar = (name: string) => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const updateChart = () => {
  if (!chart) return

  const data = getChartData()
  const primaryColor = getCSSVar('--color-primary') || '#6366f1'
  const primaryGlow = getCSSVar('--color-primary-glow') || 'rgba(99, 102, 241, 0.2)'
  const textColor = getCSSVar('--text-main') || '#f8fafc'
  const textMuted = getCSSVar('--text-muted') || '#94a3b8'
  const borderColor = getCSSVar('--border-color') || 'rgba(255, 255, 255, 0.1)'
  
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: themeStore.theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: borderColor,
      textStyle: { color: textColor },
      formatter: (params: any) => {
        const p = params[0]
        return `<div style="padding: 4px">
          <div style="font-size: 12px; opacity: 0.7">${p.name}</div>
          <div style="font-size: 16px; font-weight: 800; color: ${primaryColor}">₹${p.value.toLocaleString()}</div>
        </div>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: '15%'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textMuted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
      axisLabel: { color: textMuted, fontSize: 11 }
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: primaryColor, width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: primaryGlow },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ])
        },
        data: data.values,
        emphasis: {
          focus: 'series',
          itemStyle: { color: primaryColor, borderWidth: 2, borderColor: '#fff' }
        }
      }
    ]
  }

  chart.setOption(option)
}

const getChartData = () => {
  // Real logic would filter from invoiceStore.invoices
  // For demo, we combine real totals plus some trend data
  if (activeTab.value === 'today') {
    return {
      labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'],
      values: [1200, 4500, 3200, 8900, 5600, 2100, 1100]
    }
  } else if (activeTab.value === 'week') {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [24000, 38000, 32000, 45000, 56000, 21000, 15000]
    }
  } else {
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [180000, 250000, 195000, 320000]
    }
  }
}

watch([activeTab, () => themeStore.theme], () => {
  if (chart) {
    chart.dispose()
    initChart()
  }
})

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  setTimeout(initChart, 100) // Small delay to ensure container is ready
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div class="sales-chart-card glass-card">
    <div class="chart-header">
      <div class="header-info">
        <h3>Sales Analytics</h3>
        <p class="text-muted">Revenue performance over time</p>
      </div>
      <div class="chart-controls">
        <button 
          v-for="tab in (['today', 'week', 'month'] as const)" 
          :key="tab"
          :class="['tab-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>
    </div>
    
    <div ref="chartRef" :style="{ height: height || '350px', width: '100%' }"></div>
  </div>
</template>

<style scoped>
.sales-chart-card {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.header-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  font-size: 0.875rem;
}

.chart-controls {
  display: flex;
  background: var(--bg-app);
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 2px;
}

.tab-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.tab-btn:hover:not(.active) {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}
</style>
