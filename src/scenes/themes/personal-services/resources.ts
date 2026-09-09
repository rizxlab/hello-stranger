import personalServiceStudio from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'personal-services-studio': {
      label: '美容与个人服务空间',
      url: personalServiceStudio,
      portraitUrl: personalServiceStudio,
      backgroundImage: `linear-gradient(to top, rgb(35 30 28 / 32%), transparent 58%), url(${personalServiceStudio})`
    }
  }
}

export default resources
