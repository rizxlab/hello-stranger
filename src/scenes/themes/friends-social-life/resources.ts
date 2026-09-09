import socialSpace from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'friends-social-space': {
      label: '朋友聚会与社交空间',
      url: socialSpace,
      portraitUrl: socialSpace,
      backgroundImage: `linear-gradient(to top, rgb(30 34 29 / 32%), transparent 58%), url(${socialSpace})`
    }
  }
}

export default resources
