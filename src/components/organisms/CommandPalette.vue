<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from '../atoms/AppIcon.vue'

type CommandIcon =
  | 'home'
  | 'invoice'
  | 'users'
  | 'box'
  | 'settings'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'arrow-left'
  | 'search'
  | 'chevron-down'
  | 'calendar'
  | 'download'
  | 'printer'
  | 'percent'
  | 'file-text'
  | 'eye'
  | 'eye-off'
  | 'check'

export interface CommandAction {
  id: string
  label: string
  description: string
  icon: CommandIcon
  group?: string
  keywords?: string[]
  to?: string
  run?: () => void
}

interface Props {
  show: boolean
  actions: CommandAction[]
  title?: string
  subtitle?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quick Search',
  subtitle: 'Navigate the app and trigger common actions',
  placeholder: 'Search invoices, clients, reports, or settings...'
})

const emit = defineEmits<{
  close: []
  select: [action: CommandAction]
}>()

const query = ref('')
const activeIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

let previousBodyOverflow = ''
let isScrollLocked = false

const normalizedTerm = computed(() => query.value.trim().toLowerCase())

const visibleActions = computed(() => {
  const term = normalizedTerm.value

  return props.actions.filter((action) => {
    if (!term) {
      return true
    }

    const searchableText = [
      action.label,
      action.description,
      action.group,
      ...(action.keywords ?? [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(term)
  })
})

const activeAction = computed(() => visibleActions.value[activeIndex.value])

const lockScroll = () => {
  if (isScrollLocked || typeof document === 'undefined') {
    return
  }

  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  isScrollLocked = true
}

const unlockScroll = () => {
  if (!isScrollLocked || typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = previousBodyOverflow
  isScrollLocked = false
}

const moveSelection = (direction: 1 | -1) => {
  if (visibleActions.value.length === 0) {
    return
  }

  const nextIndex = activeIndex.value + direction
  activeIndex.value = (nextIndex + visibleActions.value.length) % visibleActions.value.length
}

const selectCurrentAction = () => {
  if (!activeAction.value) {
    return
  }

  emit('select', activeAction.value)
}

const handleWindowKeydown = (event: KeyboardEvent) => {
  if (!props.show) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveSelection(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveSelection(-1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectCurrentAction()
  }
}

watch(query, () => {
  activeIndex.value = 0
})

watch(
  () => props.show,
  async (isVisible) => {
    if (isVisible) {
      query.value = ''
      activeIndex.value = 0
      lockScroll()
      window.addEventListener('keydown', handleWindowKeydown)
      await nextTick()
      searchInput.value?.focus()
      return
    }

    window.removeEventListener('keydown', handleWindowKeydown)
    unlockScroll()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
  unlockScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div v-if="show" class="palette-backdrop" @click.self="emit('close')">
        <div class="palette-panel glass-card">
          <header class="palette-header">
            <div class="palette-title-block">
              <div class="palette-icon">
                <AppIcon name="search" :size="18" />
              </div>
              <div class="palette-heading">
                <h3>{{ title }}</h3>
                <p>{{ subtitle }}</p>
              </div>
            </div>

            <button class="palette-close" type="button" aria-label="Close command palette" @click="emit('close')">
              <AppIcon name="plus" :size="18" style="transform: rotate(45deg)" />
            </button>
          </header>

          <div class="palette-search">
            <AppIcon name="search" :size="18" class="search-icon" />
            <input
              ref="searchInput"
              v-model="query"
              :placeholder="placeholder"
              class="search-field"
              type="text"
              autocomplete="off"
              spellcheck="false"
            />
            <span class="shortcut-pill">Esc</span>
          </div>

          <div class="palette-results">
            <div v-if="visibleActions.length === 0" class="empty-state">
              <h4>No matching actions</h4>
              <p>Try another keyword like invoices, clients, reports, or settings.</p>
            </div>

            <div v-else class="result-list">
              <button
                v-for="(action, index) in visibleActions"
                :key="action.id"
                type="button"
                :class="['result-item', { active: index === activeIndex }]"
                @click="emit('select', action)"
                @mouseenter="activeIndex = index"
              >
                <div class="action-icon">
                  <AppIcon :name="action.icon" :size="18" />
                </div>

                <div class="action-copy">
                  <div class="action-topline">
                    <span class="action-label">{{ action.label }}</span>
                    <span v-if="action.group" class="action-group">{{ action.group }}</span>
                  </div>
                  <p>{{ action.description }}</p>
                </div>

                <div class="action-meta">
                  <span v-if="action.to" class="action-route">Open</span>
                  <AppIcon name="arrow-left" :size="16" class="action-arrow" />
                </div>
              </button>
            </div>
          </div>

          <footer class="palette-footer">
            <span><strong>Enter</strong> to run</span>
            <span><strong>Esc</strong> to close</span>
            <span><strong>Ctrl / Cmd + K</strong> to reopen</span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(1rem, 3vw, 2rem);
  padding-top: 12vh;
  background: rgba(8, 12, 24, 0.58);
  backdrop-filter: blur(14px);
}

.palette-panel {
  width: min(760px, 100%);
  max-height: min(78vh, 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.palette-title-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.palette-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-glow);
  color: var(--color-primary);
  flex-shrink: 0;
}

.palette-heading {
  min-width: 0;
}

.palette-heading h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.palette-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.palette-close {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: transparent;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.palette-close:hover {
  background: var(--bg-app);
  color: var(--text-main);
}

.palette-search {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.search-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-main);
  font-size: 1rem;
  min-width: 0;
}

.search-field::placeholder {
  color: var(--text-muted);
}

.search-icon {
  color: var(--text-muted);
}

.shortcut-pill {
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg-app);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.palette-results {
  padding: var(--spacing-sm);
  overflow-y: auto;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.result-item {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 0.95rem 1rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-align: left;
  background: transparent;
  color: var(--text-main);
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.result-item:hover {
  background: var(--bg-app);
}

.result-item.active {
  background: var(--color-primary-glow);
  box-shadow: inset 0 0 0 1px var(--color-primary);
  transform: translateY(-1px);
}

.action-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-primary);
  flex-shrink: 0;
}

.result-item.active .action-icon {
  background: rgba(255, 255, 255, 0.12);
}

.action-copy {
  flex: 1;
  min-width: 0;
}

.action-topline {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 0.2rem;
}

.action-label {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-group {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.action-copy p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.action-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-muted);
  flex-shrink: 0;
}

.action-route {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.72rem;
  font-weight: 700;
}

.action-arrow {
  transform: rotate(180deg);
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.empty-state h4 {
  margin: 0 0 0.5rem;
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 700;
}

.empty-state p {
  margin: 0;
  font-size: 0.92rem;
}

.palette-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.8rem;
}

.palette-footer strong {
  color: var(--text-main);
}

.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.18s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .palette-backdrop {
    padding: 0.75rem;
    padding-top: 7vh;
  }

  .palette-header,
  .palette-search,
  .palette-footer {
    padding-left: 0.9rem;
    padding-right: 0.9rem;
  }

  .result-item {
    padding: 0.85rem;
  }

  .action-group,
  .action-route {
    display: none;
  }
}
</style>