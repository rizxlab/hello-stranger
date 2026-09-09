import accommodationCover from '@/assets/images/themes/accommodation/accommodation-cover.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'accommodation-cover': {
      label: '现代精品酒店大堂',
      url: accommodationCover,
      portraitUrl: accommodationCover,
      backgroundImage: `linear-gradient(to top, rgb(38 27 22 / 42%), transparent 58%), url(${accommodationCover})`
    }
  }
}

export default resources
