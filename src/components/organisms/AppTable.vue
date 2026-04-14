<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../atoms/AppIcon.vue'

export interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  hideActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No data found.',
  hideActions: false
})

const hasData = computed(() => props.data && props.data.length > 0)
</script>

<template>
  <div class="table-container table-responsive glass-card">
    <table class="table table-hover app-table mb-0">
      <thead>
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key"
            :style="{ textAlign: col.align || 'left' }"
          >
            {{ col.label }}
          </th>
          <th v-if="!hideActions" class="actions-head text-end">Actions</th>
        </tr>
      </thead>
      
      <tbody>
        <template v-if="loading">
          <tr v-for="i in 3" :key="i" class="placeholder-glow align-middle">
            <td v-for="col in columns" :key="col.key">
              <span class="placeholder col-12 rounded"></span>
            </td>
            <td><span class="placeholder col-8 rounded"></span></td>
          </tr>
        </template>
        
        <template v-else-if="hasData">
          <tr v-for="(row, index) in data" :key="row.id || index">
            <td 
              v-for="col in columns" 
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="`col-${col.key}`" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
            <td v-if="!hideActions" class="actions-cell">
              <div class="actions-wrapper">
                <slot name="actions" :row="row"></slot>
              </div>
            </td>
          </tr>
        </template>
        
        <tr v-else>
          <td :colspan="columns.length + (hideActions ? 0 : 1)" class="empty-cell">
            <div class="empty-state">
              <AppIcon name="box" :size="48" color="var(--text-muted)" />
              <p>{{ emptyMessage }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
}

td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.9375rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

tr:last-child td {
  border-bottom: none;
}

tr:not(.skeleton-row):hover td {
  background-color: rgba(99, 102, 241, 0.05);
}

.actions-head {
  text-align: right;
  width: 120px;
}

.actions-cell {
  text-align: right;
}

.actions-wrapper {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.empty-cell {
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
}
</style>
