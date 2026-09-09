import schoolInterior from '@/assets/images/shorts/dk-conversations/lesson44/library-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'school-study-campus': {
      label: '学校与学习空间',
      url: schoolInterior,
      portraitUrl: schoolInterior,
      backgroundImage: `linear-gradient(to top, rgb(27 32 33 / 34%), transparent 58%), url(${schoolInterior})`
    }
  }
}

export default resources
