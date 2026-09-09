import serviceCounter from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'delivery-post-office-counter': {
      label: '邮局与快递服务柜台',
      url: serviceCounter,
      portraitUrl: serviceCounter,
      backgroundImage: `linear-gradient(to top, rgb(28 32 36 / 34%), transparent 58%), url(${serviceCounter})`
    }
  }
}

export default resources
