import cityScene from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import cityScenePortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'sightseeing-city': {
      label: '城市观光区域',
      url: cityScene,
      portraitUrl: cityScenePortrait,
      backgroundImage: `linear-gradient(to top, rgb(22 33 38 / 30%), transparent 56%), url(${cityScene})`
    }
  }
}

export default resources
