<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'ghost'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  size: 'md'
})

const classes = computed(() => [
  'badge',
  'base-badge',
  `bg-${props.variant === 'info' ? 'primary' : props.variant === 'ghost' ? 'secondary' : props.variant}`,
  { 'bg-opacity-10 text-success': props.variant === 'success' },
  { 'bg-opacity-10 text-warning': props.variant === 'warning' },
  { 'bg-opacity-10 text-danger': props.variant === 'danger' },
  { 'bg-opacity-10 text-primary': props.variant === 'info' },
  { 'bg-transparent text-secondary border border-secondary': props.variant === 'ghost' },
  `size-${props.size}`
])
</script>

<template>
  <span :class="classes">
    <slot></slot>
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.size-sm { padding: 0.1rem 0.4rem; font-size: 0.65rem; }

.badge-success { background: rgba(16, 185, 129, 0.1); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.2); }
.badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.2); }
.badge-danger { background: rgba(244, 63, 94, 0.1); color: var(--color-danger); border: 1px solid rgba(244, 63, 94, 0.2); }
.badge-info { background: rgba(99, 102, 241, 0.1); color: var(--color-primary); border: 1px solid rgba(99, 102, 241, 0.2); }
.badge-ghost { background: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-color); }
</style>
