import supportDesk from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'phone-internet-support': {
      label: '手机与网络支持场景',
      url: supportDesk,
      portraitUrl: supportDesk,
      backgroundImage: `linear-gradient(to top, rgb(24 31 37 / 34%), transparent 58%), url(${supportDesk})`
    }
  }
}

export default resources
