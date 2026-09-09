import citySpace from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import citySpacePortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'everyday-problems-city': {
      label: '城市日常空间',
      url: citySpace,
      portraitUrl: citySpacePortrait,
      backgroundImage: `linear-gradient(to top, rgb(24 31 35 / 34%), transparent 58%), url(${citySpace})`
    }
  }
}

export default resources
