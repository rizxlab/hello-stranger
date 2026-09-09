import emergencyArea from '@/assets/images/shorts/dk-conversations/lesson85/hospital-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'emergency-help': {
      label: '紧急求助场景',
      url: emergencyArea,
      portraitUrl: emergencyArea,
      backgroundImage: `linear-gradient(to top, rgb(31 30 34 / 36%), transparent 55%), url(${emergencyArea})`
    }
  }
}

export default resources
