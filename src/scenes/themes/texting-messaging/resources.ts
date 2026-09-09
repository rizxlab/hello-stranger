import workspace from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'texting-messaging-workspace': {
      label: '线上沟通工作空间',
      url: workspace,
      portraitUrl: workspace,
      backgroundImage: `linear-gradient(to top, rgb(25 31 35 / 35%), transparent 58%), url(${workspace})`
    }
  }
}

export default resources
