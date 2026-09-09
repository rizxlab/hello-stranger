import entertainmentVenue from '@/assets/images/shorts/dk-conversations/lesson27/cinema-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'entertainment-venue': {
      label: '电影院与休闲娱乐场所',
      url: entertainmentVenue,
      portraitUrl: entertainmentVenue,
      backgroundImage: `linear-gradient(to top, rgb(28 22 34 / 38%), transparent 56%), url(${entertainmentVenue})`
    }
  }
}

export default resources
