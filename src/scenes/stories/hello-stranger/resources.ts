import airportCheckin from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-checkin.jpg'
import airportCheckinPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-checkin-portrait.jpg'
import airportSecurity from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-security.jpg'
import airportSecurityPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-security-portrait.jpg'
import boardingGate from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate.jpg'
import boardingGatePortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate-portrait.jpg'
import metroStation from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station.jpg'
import metroStationPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/metro-station-portrait.jpg'
import alexAvatar from '@/assets/images/stories/hello-stranger/chapter01/characters/alex.webp'
import elenaAvatar from '@/assets/images/stories/hello-stranger/chapter01/characters/elena.webp'
import linAvatar from '@/assets/images/stories/hello-stranger/chapter01/characters/lin.webp'
import mayaAvatar from '@/assets/images/stories/hello-stranger/chapter01/characters/maya.webp'
import type {
  BackgroundResource,
  StoryResourceBundle
} from '@/config/storyResources'

function background(
  label: string,
  url: string,
  portraitUrl?: string
): BackgroundResource {
  return {
    label,
    url,
    portraitUrl,
    backgroundImage: `linear-gradient(to top, rgb(15 37 34 / 28%), transparent 48%), url(${url})`
  }
}

const resources: StoryResourceBundle = {
  backgrounds: {
    'metro-station': background('地铁站', metroStation, metroStationPortrait),
    'airport-checkin': background(
      '机场值机大厅',
      airportCheckin,
      airportCheckinPortrait
    ),
    'airport-security': background(
      '机场安检区',
      airportSecurity,
      airportSecurityPortrait
    ),
    'boarding-gate': background('登机口', boardingGate, boardingGatePortrait)
  },
  avatars: {
    lin: linAvatar,
    maya: mayaAvatar,
    alex: alexAvatar,
    elena: elenaAvatar
  },
  covers: {
    'hello-stranger-cover': {
      backgroundImage: `linear-gradient(145deg, rgb(23 63 58 / 30%), rgb(23 63 58 / 68%)), url(${boardingGate})`
    }
  }
}

export default resources
