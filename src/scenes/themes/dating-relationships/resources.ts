import relationshipVenue from '@/assets/images/shorts/dk-conversations/lesson24/restaurant-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'dating-relationships-venue': {
      label: '约会与关系交流空间',
      url: relationshipVenue,
      portraitUrl: relationshipVenue,
      backgroundImage: `linear-gradient(to top, rgb(45 28 27 / 35%), transparent 58%), url(${relationshipVenue})`
    }
  }
}

export default resources
