import homeInterior from '@/assets/images/themes/accommodation/accommodation-cover.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'renting-home': {
      label: '住宅与租房空间',
      url: homeInterior,
      portraitUrl: homeInterior,
      backgroundImage: `linear-gradient(to top, rgb(38 29 24 / 34%), transparent 58%), url(${homeInterior})`
    }
  }
}

export default resources
