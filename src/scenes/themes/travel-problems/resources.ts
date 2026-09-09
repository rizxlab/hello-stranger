import travelTransit from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate.jpg'
import travelTransitPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'travel-problems-transit': {
      label: '旅行中转与服务区域',
      url: travelTransit,
      portraitUrl: travelTransitPortrait,
      backgroundImage: `linear-gradient(to top, rgb(30 29 34 / 35%), transparent 56%), url(${travelTransit})`
    }
  }
}

export default resources
