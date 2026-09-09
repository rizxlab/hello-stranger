import workspace from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'phone-calls-workspace': {
      label: '电话沟通工作空间',
      url: workspace,
      portraitUrl: workspace,
      backgroundImage: `linear-gradient(to top, rgb(26 31 34 / 35%), transparent 58%), url(${workspace})`
    }
  }
}

export default resources
