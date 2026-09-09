import officeWorkstation from '@/assets/images/shorts/dk-conversations/shared/office-workstation-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'workplace-office': {
      label: '办公室工位',
      url: officeWorkstation,
      portraitUrl: officeWorkstation,
      backgroundImage: `linear-gradient(to top, rgb(25 30 36 / 34%), transparent 58%), url(${officeWorkstation})`
    }
  }
}

export default resources
