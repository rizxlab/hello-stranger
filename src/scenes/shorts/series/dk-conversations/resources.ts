import familyCafe from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe.jpg'
import familyCafePortrait from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import type {
  BackgroundResource,
  StoryResourceBundle
} from '@/config/storyResources'

function background(
  label: string,
  url: string,
  portraitUrl: string
): BackgroundResource {
  return {
    label,
    url,
    portraitUrl,
    backgroundImage: `linear-gradient(to top, rgb(15 37 34 / 24%), transparent 54%), url(${url})`
  }
}

const resources: StoryResourceBundle = {
  backgrounds: {
    'dk-family-cafe': background(
      '咖啡馆休息区',
      familyCafe,
      familyCafePortrait
    )
  }
}

export default resources
