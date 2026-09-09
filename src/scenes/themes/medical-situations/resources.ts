import clinicInterior from '@/assets/images/shorts/dk-conversations/lesson85/hospital-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'medical-clinic': {
      label: '诊所与药店',
      url: clinicInterior,
      portraitUrl: clinicInterior,
      backgroundImage: `linear-gradient(to top, rgb(25 37 39 / 28%), transparent 58%), url(${clinicInterior})`
    }
  }
}

export default resources
