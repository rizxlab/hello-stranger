import socialSpace from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'cultural-differences-social': {
      label: '跨文化交流空间',
      url: socialSpace,
      portraitUrl: socialSpace,
      backgroundImage: `linear-gradient(to top, rgb(31 29 26 / 34%), transparent 58%), url(${socialSpace})`
    }
  }
}

export default resources
