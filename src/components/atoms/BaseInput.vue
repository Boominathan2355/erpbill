<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  modelValue: string | number | undefined
  label?: string
  placeholder?: string
  type?: string
  error?: string
  icon?: 'home' | 'invoice' | 'users' | 'box' | 'settings' | 'plus' | 'trash' | 'edit' | 'sun' | 'moon' | 'search' | 'file-text'
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputClasses = computed(() => [
  'form-control',
  'input-field',
  { 'is-invalid': props.error, 'has-error': props.error, 'has-icon': props.icon, 'disabled': props.disabled }
])
</script>

<template>
  <div class="base-input-container">
    <label v-if="label" class="form-label input-label">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    
    <div class="input-wrapper">
      <AppIcon 
        v-if="icon" 
        :name="icon" 
        :size="18" 
        class="input-icon" 
        :color="error ? 'var(--color-danger)' : 'var(--text-muted)'"
      />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
    </div>
    
    <transition name="fade">
      <span v-if="error" class="invalid-feedback d-block">{{ error }}</span>
    </transition>
  </div>
</template>

<style scoped>
.base-input-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  margin-left: 2px;
}

.required-star {
  color: var(--color-danger);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-main);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;
}

.has-icon {
  padding-left: 2.5rem;
}

.input-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.input-field.has-error {
  border-color: var(--color-danger);
}

.input-field.has-error:focus {
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2);
}

.input-icon {
  position: absolute;
  left: 0.8rem;
  pointer-events: none;
}

.error-message {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-top: 2px;
  margin-left: 2px;
}

.is-disabled {
  background: var(--bg-app);
  cursor: not-allowed;
  opacity: 0.7;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
