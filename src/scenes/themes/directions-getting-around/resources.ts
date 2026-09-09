import cityTransit from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import cityTransitPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'directions-city': {
      label: '城市街道与交通站点',
      url: cityTransit,
      portraitUrl: cityTransitPortrait,
      backgroundImage: `linear-gradient(to top, rgb(18 35 37 / 34%), transparent 56%), url(${cityTransit})`
    }
  }
}

export default resources
