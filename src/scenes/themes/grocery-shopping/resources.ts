import groceryInterior from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'grocery-shopping-store': {
      label: '便利店与超市',
      url: groceryInterior,
      portraitUrl: groceryInterior,
      backgroundImage: `linear-gradient(to top, rgb(28 35 31 / 34%), transparent 56%), url(${groceryInterior})`
    }
  }
}

export default resources
