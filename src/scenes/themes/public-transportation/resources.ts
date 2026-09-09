import metroStation from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import metroStationPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'public-transportation-metro': {
      label: '城市公共交通站点',
      url: metroStation,
      portraitUrl: metroStationPortrait,
      backgroundImage: `linear-gradient(to top, rgb(15 37 34 / 28%), transparent 52%), url(${metroStation})`
    }
  }
}

export default resources
