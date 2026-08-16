<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import SceneStage from '@/components/story/SceneStage.vue'
import StoryDialogueOverlay from '@/components/story/StoryDialogueOverlay.vue'
import type { SceneActorViewModel } from '@/components/story/sceneTypes'
import {
  getAvatarResource,
  getBackgroundResource
} from '@/config/storyResources'
import { useStorySession } from '@/composables/useStorySession'
import { getChapter } from '@/scenes'
import { getShortScene, getShortSceneSeries } from '@/scenes/shorts'
import type { ShortSceneDefinition } from '@/scenes/shorts/types'

const route = useRoute()
const session = useStorySession()
const activeShortScene = shallowRef<ShortSceneDefinition | null>(null)
const isShortRoute = computed(() => route.name === 'play-short')
const activeShortSeries = computed(() => {
  const seriesId = activeShortScene.value?.seriesId
  return seriesId ? getShortSceneSeries(seriesId) : null
})

function routeParam(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

const experienceLabel = computed(() => {
  if (activeShortScene.value) {
    return `${activeShortSeries.value?.experienceLabel ?? 'Short scene'} · ${activeShortScene.value.durationMinutes} min`
  }

  return session.chapter.value
    ? `Chapter ${String(session.chapter.value.chapterNumber).padStart(2, '0')}`
    : ''
})

const directoryRoute = computed(() =>
  isShortRoute.value
    ? activeShortSeries.value
      ? {
          name: 'short-scene-series' as const,
          params: { seriesId: activeShortSeries.value.id }
        }
      : { name: 'short-scenes' as const }
    : {
        name: 'story-chapters' as const,
        params: { storyId: session.chapter.value?.storyId ?? '' }
      }
)

const directoryLabel = computed(() =>
  isShortRoute.value
    ? activeShortSeries.value
      ? `${activeShortSeries.value.title}目录`
      : '短情景目录'
    : '章节目录'
)

const completionEyebrow = computed(() =>
  isShortRoute.value ? 'Scene complete' : 'Chapter complete'
)

const completionTitle = computed(() =>
  activeShortScene.value?.completion.title ?? '你赶上了这趟航班'
)

const completionDescription = computed(() =>
  activeShortScene.value?.completion.description ??
  '第一章已完成。你练习了从地铁购票到机场登机的四段真实交流。'
)

const background = computed(() =>
  getBackgroundResource(session.currentScene.value?.background ?? '')
)

const nextBackgrounds = computed(() => {
  const nextScene = session.nextScene.value
  return nextScene
    ? [getBackgroundResource(nextScene.background)]
    : []
})

const avatarUrl = computed(() =>
  getAvatarResource(session.currentCharacter.value?.avatar)
)

const actorModels = computed<SceneActorViewModel[]>(() => {
  session.sceneRevision.value
  const scene = session.currentScene.value
  if (!scene) {
    return []
  }

  return scene.actors.flatMap((actor) => {
    const character = session.getCharacter(actor.characterId)
    return character
      ? [{
          actor,
          character,
          avatarUrl: getAvatarResource(character.avatar),
          completed: session.hasCompletedActor(actor.id)
        }]
      : []
  })
})

const isDialogueOpen = computed(() =>
  ['dialogue', 'choices', 'feedback'].includes(session.phase.value)
)

const dialoguePhase = computed(() => {
  const phase = session.phase.value
  return phase === 'choices' || phase === 'feedback' ? phase : 'dialogue'
})

function loadSelectedChapter(): void {
  if (route.name === 'play-short') {
    const shortSceneId = routeParam(route.params.shortId)
    const shortScene = shortSceneId ? getShortScene(shortSceneId) : null
    activeShortScene.value = shortScene
    shortScene ? session.loadChapter(shortScene.chapter) : session.clear()
    return
  }

  activeShortScene.value = null
  const storyId =
    routeParam(route.params.storyId) ?? session.player.progress.storyId
  const chapterId =
    routeParam(route.params.chapterId) ?? session.player.progress.chapterId

  if (!storyId || !chapterId) {
    session.clear()
    return
  }

  const selectedChapter = getChapter(storyId, chapterId)
  selectedChapter ? session.loadChapter(selectedChapter) : session.clear()
}

watch(
  () => [
    route.name,
    route.params.storyId,
    route.params.chapterId,
    route.params.shortId
  ],
  loadSelectedChapter,
  { immediate: true }
)
</script>

<template>
  <section class="play-page">
    <div v-if="session.phase.value === 'empty'" class="play-empty">
      <p>没有找到这个剧情内容。</p>
      <RouterLink :to="directoryRoute">返回目录</RouterLink>
    </div>

    <div v-else-if="session.phase.value !== 'complete' && session.currentScene.value" class="scene-shell">
      <SceneStage
        :scene="session.currentScene.value"
        :background-source="background"
        :preload-background-sources="nextBackgrounds"
        :actors="actorModels"
        :can-advance="session.canAdvanceScene.value"
        :next-scene-title="session.nextScene.value?.title"
        @interact="session.interactWithActor"
        @advance="session.advanceScene"
      >
        <template #hud>
          <RouterLink
            :to="directoryRoute"
            class="scene-directory"
          >
            {{ directoryLabel }}
          </RouterLink>
        </template>
      </SceneStage>

      <StoryDialogueOverlay
        v-if="isDialogueOpen"
        :phase="dialoguePhase"
        :line="session.currentLine.value"
        :character="session.currentCharacter.value"
        :avatar-url="avatarUrl"
        :choices="session.availableChoices.value"
        :result="session.choiceResult.value"
        :can-close="session.canCloseInteraction.value"
        @advance-dialogue="session.advanceDialogue"
        @select-choice="session.selectChoice"
        @continue-feedback="session.continueAfterFeedback"
        @close="session.closeInteraction"
      />
    </div>

    <article v-else class="chapter-complete">
      <p class="eyebrow">{{ completionEyebrow }}</p>
      <h2>{{ completionTitle }}</h2>
      <p>{{ completionDescription }}</p>
      <div class="chapter-summary">
        <span>口语经验 {{ session.player.english.speaking }}</span>
        <span>解锁词汇 {{ session.player.vocabulary.length }}</span>
      </div>
      <div class="completion-actions">
        <button type="button" @click="session.restartChapter">重新体验</button>
        <RouterLink :to="directoryRoute">返回{{ directoryLabel }}</RouterLink>
      </div>
    </article>

    <header v-if="session.chapter.value" class="story-header">
      <div class="chapter-identity">
        <span>{{ experienceLabel }}</span>
        <strong>{{ session.chapter.value.title }}</strong>
      </div>
    </header>

  </section>
</template>

<style scoped>
.play-page,
.scene-shell {
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
}

.play-page {
  position: relative;
  overflow: hidden;
  background: #173f3a;
}

.story-header {
  position: fixed;
  z-index: 10;
  top: max(0.75rem, env(safe-area-inset-top));
  left: max(0.75rem, env(safe-area-inset-left));
  pointer-events: none;
}

.chapter-identity {
  display: grid;
  gap: 0.12rem;
  padding: 0.45rem 0.7rem;
  color: #fffaf2;
  background: rgb(23 63 58 / 58%);
  border: 1px solid rgb(255 250 242 / 18%);
  border-radius: 0.8rem;
  box-shadow: 0 0.5rem 1.4rem rgb(15 37 34 / 18%);
  backdrop-filter: blur(0.7rem);
  pointer-events: auto;
}

.chapter-identity span {
  color: rgb(255 250 242 / 68%);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chapter-identity strong {
  font-size: 0.8rem;
}

.scene-directory {
  position: absolute;
  z-index: 7;
  top: 0.75rem;
  top: max(0.75rem, env(safe-area-inset-top));
  right: 0.75rem;
  right: max(0.75rem, env(safe-area-inset-right));
  display: block;
  padding: 0.62rem 0.85rem;
  color: #fffaf2;
  background: rgb(23 63 58 / 58%);
  border: 1px solid rgb(255 250 242 / 18%);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 0.5rem 1.4rem rgb(15 37 34 / 18%);
  backdrop-filter: blur(0.7rem);
  pointer-events: auto;
}

.scene-shell {
  position: relative;
  overflow: hidden;
}

.play-empty {
  display: grid;
  place-content: center;
  gap: 1rem;
  height: 100%;
  padding: 1.5rem;
  color: #fffaf2;
  text-align: center;
}

.play-empty a {
  text-decoration: underline;
}

.chapter-complete {
  position: absolute;
  inset: 0;
  display: grid;
  gap: 1rem;
  align-content: center;
  padding: max(5rem, env(safe-area-inset-top)) max(1.4rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(1.4rem, env(safe-area-inset-left));
  color: #173f3a;
  background:
    radial-gradient(circle at 80% 12%, rgb(216 111 69 / 22%), transparent 32%),
    #f4efe6;
}

.chapter-complete h2 {
  font-size: clamp(2rem, 9vw, 3.8rem);
}

.chapter-complete > p:not(.eyebrow) {
  max-width: 34rem;
  color: #456762;
  line-height: 1.7;
}

.chapter-summary,
.completion-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.chapter-summary span {
  padding: 0.45rem 0.7rem;
  color: #b95431;
  background: rgb(216 111 69 / 12%);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.completion-actions button,
.completion-actions a {
  min-height: 2.75rem;
  padding: 0.68rem 1rem;
  border-radius: 999px;
  font-weight: 750;
}

.completion-actions button {
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  cursor: pointer;
}

.completion-actions a {
  display: inline-flex;
  align-items: center;
  color: #173f3a;
  border: 1px solid rgb(23 63 58 / 18%);
  text-decoration: none;
}

@media (min-width: 48rem) {
  .chapter-complete > * {
    width: min(100%, 42rem);
    margin-inline: auto;
  }
}
</style>
