import nightlifeVenue from '@/assets/images/shorts/dk-conversations/lesson24/restaurant-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'party-nightlife-venue': {
      label: '派对与夜生活场所',
      url: nightlifeVenue,
      portraitUrl: nightlifeVenue,
      backgroundImage: `linear-gradient(to top, rgb(44 25 31 / 38%), transparent 56%), url(${nightlifeVenue})`
    }
  }
}

export default resources
