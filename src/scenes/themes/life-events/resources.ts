import socialSpace from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'life-events-social': {
      label: '分享人生近况的社交空间',
      url: socialSpace,
      portraitUrl: socialSpace,
      backgroundImage: `linear-gradient(to top, rgb(32 29 25 / 34%), transparent 58%), url(${socialSpace})`
    }
  }
}

export default resources
