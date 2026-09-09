import bankingService from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'banking-service': {
      label: '银行服务柜台',
      url: bankingService,
      portraitUrl: bankingService,
      backgroundImage: `linear-gradient(to top, rgb(25 33 38 / 34%), transparent 58%), url(${bankingService})`
    }
  }
}

export default resources
