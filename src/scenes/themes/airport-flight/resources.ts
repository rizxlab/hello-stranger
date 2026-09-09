import airportCheckin from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-checkin.jpg'
import airportCheckinPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-checkin-portrait.jpg'
import airportSecurity from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-security.jpg'
import airportSecurityPortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/airport-security-portrait.jpg'
import boardingGate from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate.jpg'
import boardingGatePortrait from '@/assets/images/stories/hello-stranger/chapter01/backgrounds/boarding-gate-portrait.jpg'
import type { BackgroundResource, StoryResourceBundle } from '@/config/storyResources'

function background(
  label: string,
  url: string,
  portraitUrl: string
): BackgroundResource {
  return {
    label,
    url,
    portraitUrl,
    backgroundImage: `linear-gradient(to top, rgb(15 37 34 / 28%), transparent 52%), url(${url})`
  }
}

const resources: StoryResourceBundle = {
  backgrounds: {
    'airport-flight-checkin': background(
      '机场值机大厅',
      airportCheckin,
      airportCheckinPortrait
    ),
    'airport-flight-security': background(
      '机场安检区',
      airportSecurity,
      airportSecurityPortrait
    ),
    'airport-flight-gate': background(
      '机场登机口',
      boardingGate,
      boardingGatePortrait
    ),
    'airport-flight-cabin': background(
      '飞行途中',
      boardingGate,
      boardingGatePortrait
    ),
    'airport-flight-arrivals': background(
      '机场到达区',
      airportCheckin,
      airportCheckinPortrait
    )
  }
}

export default resources
