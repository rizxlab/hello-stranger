import neighborhoodInterior from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'neighborhood-community': {
      label: '社区公共空间',
      url: neighborhoodInterior,
      portraitUrl: neighborhoodInterior,
      backgroundImage: `linear-gradient(to top, rgb(27 37 32 / 32%), transparent 58%), url(${neighborhoodInterior})`
    }
  }
}

export default resources
