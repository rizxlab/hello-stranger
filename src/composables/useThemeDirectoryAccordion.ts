import { computed, reactive, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

interface ThemeDirectoryAccordionState {
  expandedSectionId: string | null
  expandedTopicId: string | null
}

const directoryStates = reactive(
  new Map<string, ThemeDirectoryAccordionState>()
)

function stateFor(scopeId: string): ThemeDirectoryAccordionState {
  const key = scopeId || 'default'
  const existing = directoryStates.get(key)
  if (existing) return existing

  const state: ThemeDirectoryAccordionState = {
    expandedSectionId: null,
    expandedTopicId: null
  }
  directoryStates.set(key, state)
  return state
}

export function useThemeDirectoryAccordion(
  scopeId: MaybeRefOrGetter<string> = 'default'
) {
  const currentState = () => stateFor(toValue(scopeId))
  const expandedSectionId = computed(
    () => currentState().expandedSectionId
  )
  const expandedTopicId = computed(
    () => currentState().expandedTopicId
  )

  function setExpandedPath(sectionId = '', topicId = ''): void {
    const state = currentState()
    state.expandedSectionId = sectionId || null
    state.expandedTopicId = sectionId && topicId ? topicId : null
  }

  function toggleSection(sectionId: string): void {
    const state = currentState()
    if (state.expandedSectionId === sectionId) {
      state.expandedSectionId = null
      state.expandedTopicId = null
      return
    }

    state.expandedSectionId = sectionId
    state.expandedTopicId = null
  }

  function toggleTopic(topicId: string): void {
    const state = currentState()
    if (!state.expandedSectionId) return

    state.expandedTopicId =
      state.expandedTopicId === topicId ? null : topicId
  }

  return {
    expandedSectionId,
    expandedTopicId,
    setExpandedPath,
    toggleSection,
    toggleTopic
  }
}
