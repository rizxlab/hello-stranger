import { createRouter, createWebHistory } from 'vue-router'
import { developerAccess } from '@/systems/DeveloperAccessSystem'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/home',
      redirect: { name: 'home' }
    },
    {
      path: '/play/short/:shortId',
      name: 'play-short',
      component: () => import('@/views/PlayView.vue'),
      meta: { hideNavigation: true, immersive: true }
    },
    {
      path: '/play/:storyId/:chapterId',
      name: 'play',
      component: () => import('@/views/PlayView.vue'),
      meta: { hideNavigation: true, immersive: true }
    },
    {
      path: '/stories',
      name: 'stories',
      component: () => import('@/views/StoryCatalogView.vue')
    },
    {
      path: '/stories/:storyId',
      name: 'story-chapters',
      component: () => import('@/views/ChapterCatalogView.vue'),
      meta: { navigation: 'stories' }
    },
    {
      path: '/themes',
      name: 'themes',
      component: () => import('@/views/ThemeCatalogView.vue')
    },
    {
      path: '/themes/:seriesId/conversation/:experienceId',
      name: 'theme-conversation-experience',
      component: () => import('@/views/ConversationExperienceView.vue'),
      meta: { hideNavigation: true, immersive: true }
    },
    {
      path: '/themes/:themeId',
      name: 'theme-category',
      component: () => import('@/views/ThemeDirectoryView.vue'),
      meta: { navigation: 'themes' }
    },
    {
      path: '/themes/:themeId/:sectionId',
      name: 'theme-section',
      redirect: (to) => ({
        name: 'theme-category',
        params: { themeId: to.params.themeId },
        query: {
          ...to.query,
          section: String(to.params.sectionId)
        }
      })
    },
    {
      path: '/themes/:themeId/:sectionId/:topicId',
      name: 'theme-topic',
      redirect: (to) => ({
        name: 'theme-category',
        params: { themeId: to.params.themeId },
        query: {
          ...to.query,
          section: String(to.params.sectionId),
          topic: String(to.params.topicId)
        }
      })
    },
    {
      path: '/shorts',
      name: 'short-scenes',
      component: () => import('@/views/ShortSceneCatalogView.vue')
    },
    {
      path: '/shorts/series/:seriesId',
      name: 'short-scene-series',
      component: () => import('@/views/ConversationCollectionView.vue'),
      meta: { navigation: 'short-scenes' }
    },
    {
      path: '/shorts/series/:seriesId/conversation/:experienceId',
      name: 'conversation-experience',
      component: () => import('@/views/ConversationExperienceView.vue'),
      meta: { hideNavigation: true, immersive: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/developer',
      name: 'developer',
      component: () => import('@/views/DeveloperView.vue'),
      beforeEnter: () =>
        developerAccess.isUnlocked ? true : { name: 'settings' }
    }
  ]
})

export default router
