import familyCafe from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe.jpg'
import familyCafePortrait from '@/assets/images/shorts/dk-conversations/lesson15/family-cafe-portrait.jpg'
import libraryPortrait from '@/assets/images/shorts/dk-conversations/lesson44/library-portrait.jpg'
import restaurantPortrait from '@/assets/images/shorts/dk-conversations/lesson24/restaurant-portrait.jpg'
import cinemaPortrait from '@/assets/images/shorts/dk-conversations/lesson27/cinema-portrait.jpg'
import officePortrait from '@/assets/images/shorts/dk-conversations/lesson52/office-portrait.jpg'
import beachPortrait from '@/assets/images/shorts/dk-conversations/lesson77/beach-portrait.jpg'
import hospitalPortrait from '@/assets/images/shorts/dk-conversations/lesson85/hospital-portrait.jpg'
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
    ),
    'dk-library': background(
      '现代城市图书馆',
      libraryPortrait,
      libraryPortrait
    ),
    'dk-restaurant': background(
      '暖色现代餐厅',
      restaurantPortrait,
      restaurantPortrait
    ),
    'dk-office': background(
      '现代城市办公室',
      officePortrait,
      officePortrait
    ),
    'dk-cinema': background(
      '现代电影院大厅',
      cinemaPortrait,
      cinemaPortrait
    ),
    'dk-hospital': background(
      '现代医院门诊区',
      hospitalPortrait,
      hospitalPortrait
    ),
    'dk-beach': background(
      '海边沙滩',
      beachPortrait,
      beachPortrait
    )
  }
}

export default resources
