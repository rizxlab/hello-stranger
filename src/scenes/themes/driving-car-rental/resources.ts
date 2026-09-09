import drivingArea from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import drivingAreaPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'driving-car-rental-road': {
      label: '城市道路与租车区域',
      url: drivingArea,
      portraitUrl: drivingAreaPortrait,
      backgroundImage: `linear-gradient(to top, rgb(22 31 36 / 34%), transparent 58%), url(${drivingArea})`
    }
  }
}

export default resources
