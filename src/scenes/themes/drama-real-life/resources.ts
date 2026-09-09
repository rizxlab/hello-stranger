import workplace from '@/assets/images/shorts/dk-conversations/lesson52/office-portrait.jpg'
import socialSpace from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import restaurant from '@/assets/images/shorts/dk-conversations/lesson24/restaurant-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'drama-real-life-workplace': {
      label: '职场剧情空间',
      url: workplace,
      portraitUrl: workplace,
      backgroundImage: `linear-gradient(to top, rgb(25 31 33 / 36%), transparent 58%), url(${workplace})`
    },
    'drama-real-life-social': {
      label: '朋友社交空间',
      url: socialSpace,
      portraitUrl: socialSpace,
      backgroundImage: `linear-gradient(to top, rgb(31 28 24 / 34%), transparent 58%), url(${socialSpace})`
    },
    'drama-real-life-romance': {
      label: '约会交流空间',
      url: restaurant,
      portraitUrl: restaurant,
      backgroundImage: `linear-gradient(to top, rgb(37 25 24 / 36%), transparent 58%), url(${restaurant})`
    },
    'drama-real-life-family': {
      label: '家庭交流空间',
      url: socialSpace,
      portraitUrl: socialSpace,
      backgroundImage: `linear-gradient(to top, rgb(30 28 25 / 34%), transparent 58%), url(${socialSpace})`
    }
  }
}

export default resources
