export interface NavigationItem {
  label: string
  routeName: 'home' | 'stories' | 'themes' | 'short-scenes' | 'profile'
  icon: string
}

export const navigationItems: NavigationItem[] = [
  { label: '首页', routeName: 'home', icon: '⌂' },
  { label: '剧情', routeName: 'stories', icon: '◫' },
  { label: '主题分类', routeName: 'themes', icon: '▦' },
  { label: '短情景', routeName: 'short-scenes', icon: '◧' },
  { label: '我的', routeName: 'profile', icon: '◎' }
]
