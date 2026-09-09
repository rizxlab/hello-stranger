import publicServiceOffice from '@/assets/images/shorts/dk-conversations/lesson44/library-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'public-services-office': {
      label: '公共服务办事区域',
      url: publicServiceOffice,
      portraitUrl: publicServiceOffice,
      backgroundImage: `linear-gradient(to top, rgb(28 32 32 / 32%), transparent 58%), url(${publicServiceOffice})`
    }
  }
}

export default resources
