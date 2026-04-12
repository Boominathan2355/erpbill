<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  variant?: 'primary' | 'glow' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: 'home' | 'invoice' | 'users' | 'box' | 'settings' | 'plus' | 'trash' | 'edit' | 'sun' | 'moon' | 'menu' | 'arrow-left' | 'search' | 'chevron-down' | 'calendar' | 'download' | 'printer' | 'percent' | 'file-text' | 'eye' | 'eye-off' | 'check'
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left'
})

const classes = computed(() => [
  'btn',
  'base-button',
  props.variant === 'primary' ? 'btn-primary' : 
  props.variant === 'ghost' ? 'btn-outline-secondary' : 
  props.variant === 'danger' ? 'btn-danger' : 
  props.variant === 'glow' ? 'btn-primary variant-glow' : 'btn-primary',
  props.size === 'sm' ? 'btn-sm' : props.size === 'lg' ? 'btn-lg' : '',
  { 'is-loading': props.loading, 'disabled placeholder-wave': props.disabled }
])

const iconSize = computed(() => {
  if (props.size === 'sm') return 16
  if (props.size === 'lg') return 24
  return 20
})
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" class="btn-ripple position-relative">
    <template v-if="loading">
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Loading...
    </template>
    <template v-else>
      <AppIcon 
        v-if="icon && iconPosition === 'left'" 
        :name="icon" 
        :size="iconSize" 
        class="btn-icon left" 
      />
      <slot></slot>
      <AppIcon 
        v-if="icon && iconPosition === 'right'" 
        :name="icon" 
        :size="iconSize" 
        class="btn-icon right" 
      />
    </template>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

/* Sizes */
.size-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; }
.size-md { padding: 0.6rem 1.2rem; font-size: 1rem; }
.size-lg { padding: 0.8rem 1.6rem; font-size: 1.125rem; }

/* Variants */
.variant-primary {
  background: var(--color-primary);
  color: white;
}
.variant-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px var(--color-primary-glow);
}

.variant-glow {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 15px var(--color-primary-glow);
}
.variant-glow:hover:not(:disabled) {
  box-shadow: 0 0 25px var(--color-primary-glow);
  transform: translateY(-1px);
}

.variant-ghost {
  background: transparent;
  color: var(--text-main);
  border-color: var(--border-color);
}
.variant-ghost:hover:not(:disabled) {
  background: var(--border-color);
}

.variant-danger {
  background: var(--color-danger);
  color: white;
}
.variant-danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon.left { margin-right: 2px; }
.btn-icon.right { margin-left: 2px; }
</style>
