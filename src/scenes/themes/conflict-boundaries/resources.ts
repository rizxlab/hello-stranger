import publicSpace from '@/assets/images/shorts/dk-conversations/lesson24/restaurant-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'conflict-boundaries-public': {
      label: '公共交流空间',
      url: publicSpace,
      portraitUrl: publicSpace,
      backgroundImage: `linear-gradient(to top, rgb(34 27 24 / 36%), transparent 58%), url(${publicSpace})`
    }
  }
}

export default resources
