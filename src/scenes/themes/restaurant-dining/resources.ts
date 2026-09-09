import restaurantDiningCover from '@/assets/images/themes/restaurant-dining/restaurant-dining-cover.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'restaurant-dining-cover': {
      label: '现代餐厅用餐区',
      url: restaurantDiningCover,
      portraitUrl: restaurantDiningCover,
      backgroundImage: `linear-gradient(to top, rgb(47 28 18 / 38%), transparent 58%), url(${restaurantDiningCover})`
    }
  }
}

export default resources
