import shopInterior from '@/assets/images/shorts/dk-conversations/lesson44/library-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'shopping-store': {
      label: '商店与服务柜台',
      url: shopInterior,
      portraitUrl: shopInterior,
      backgroundImage: `linear-gradient(to top, rgb(33 30 25 / 34%), transparent 56%), url(${shopInterior})`
    }
  }
}

export default resources
