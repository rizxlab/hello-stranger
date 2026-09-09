import fitnessSpace from '@/assets/images/shorts/dk-conversations/lesson77/beach-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'fitness-sports-space': {
      label: '运动与户外活动空间',
      url: fitnessSpace,
      portraitUrl: fitnessSpace,
      backgroundImage: `linear-gradient(to top, rgb(24 34 36 / 30%), transparent 58%), url(${fitnessSpace})`
    }
  }
}

export default resources
