import familyCafe from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe.jpg'
import familyCafePortrait from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type { StoryResourceBundle } from '@/config/storyResources'

const resources: StoryResourceBundle = {
  backgrounds: {
    'cafes-fast-food-delivery-cafe': {
      label: '现代咖啡店与快餐区',
      url: familyCafe,
      portraitUrl: familyCafePortrait,
      backgroundImage: `linear-gradient(to top, rgb(25 31 28 / 30%), transparent 54%), url(${familyCafe})`
    }
  }
}

export default resources
