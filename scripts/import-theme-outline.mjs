import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourcePath = process.argv[2]

if (!sourcePath) {
  throw new Error('Usage: node scripts/import-theme-outline.mjs <outline-file>')
}

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const themesDirectory = join(rootDirectory, 'src/scenes/themes')
const source = await readFile(resolve(sourcePath), 'utf8')

const themeIds = {
  '01': 'accommodation',
  '02': 'airport-flight',
  '03': 'public-transportation',
  '04': 'restaurant-dining',
  '05': 'cafes-fast-food-delivery',
  '06': 'shopping',
  '07': 'grocery-shopping',
  '08': 'directions-getting-around',
  '09': 'sightseeing',
  '10': 'renting-living',
  '11': 'neighborhood',
  '12': 'workplace',
  '13': 'school-study',
  '14': 'friends-social-life',
  '15': 'dating-relationships',
  '16': 'party-nightlife',
  '17': 'medical-situations',
  '18': 'emergencies',
  '19': 'banking-money',
  '20': 'phone-internet',
  '21': 'delivery-post-office',
  '22': 'personal-services',
  '23': 'fitness-sports',
  '24': 'driving-car-rental',
  '25': 'public-services',
  '26': 'entertainment',
  '27': 'travel-problems',
  '28': 'cultural-differences',
  '29': 'everyday-problems',
  '30': 'conflict-boundaries',
  '31': 'stranger-encounters',
  '32': 'phone-calls',
  '33': 'texting-messaging',
  '34': 'life-events',
  '35': 'drama-real-life'
}

function splitThemeTitle(value) {
  const match = value.match(/^(.+?)\s+([A-Za-zÀ-ž].*)$/u)
  if (!match) return { title: value, eyebrow: `Everyday theme` }
  return { title: match[1], eyebrow: match[2] }
}

const themes = []
let theme = null
let section = null
let topic = null

for (const rawLine of source.split(/\r?\n/u)) {
  const line = rawLine.trim()
  let match = line.match(/^#{1,2} \*\*(\d{2})｜(.+)\*\*$/u)

  if (match) {
    const [, number, rawTitle] = match
    theme = {
      number,
      rawTitle,
      id: themeIds[number],
      sections: []
    }
    themes.push(theme)
    section = null
    topic = null
    continue
  }

  match = line.match(/^### \*\*(\d{2}\.\d+)｜(.+)\*\*$/u)
  if (match && theme) {
    section = {
      id: match[1],
      number: match[1],
      title: match[2],
      order: theme.sections.length + 1,
      topics: []
    }
    theme.sections.push(section)
    topic = null
    continue
  }

  match = line.match(/^\*\*(\d{2}\.\d+\.\d{2})｜(.+)\*\*$/u)
  if (match && section) {
    topic = {
      id: match[1],
      number: match[1],
      title: match[2],
      order: section.topics.length + 1,
      chapters: []
    }
    section.topics.push(topic)
    continue
  }

  match = line.match(/^- ([A-Z])｜(.+)$/u)
  if (match && section) {
    if (!topic) {
      const syntheticNumber = `${section.number}.01`
      topic = {
        id: syntheticNumber,
        number: syntheticNumber,
        title: section.title,
        order: section.topics.length + 1,
        chapters: []
      }
      section.topics.push(topic)
    }

    topic.chapters.push({
      id: `${topic.id}-${match[1].toLowerCase()}`,
      code: match[1],
      title: match[2],
      order: topic.chapters.length + 1,
      status: 'planned'
    })
  }
}

if (themes.length !== 35 || themes.some((item) => !item.id)) {
  throw new Error(`Expected 35 recognized themes, received ${themes.length}.`)
}

for (const item of themes) {
  const directory = join(themesDirectory, item.id)
  await mkdir(directory, { recursive: true })

  const existingThemePath = join(directory, 'theme.json')
  let definition = {}
  try {
    definition = JSON.parse(await readFile(existingThemePath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const parsedTitle = splitThemeTitle(item.rawTitle)
  const title = item.number === '04' ? '餐厅与吃饭' : parsedTitle.title
  const themeDefinition = {
    $schema: '../theme.schema.json',
    ...definition,
    id: item.id,
    catalogNumber: item.number,
    title,
    eyebrow: parsedTitle.eyebrow,
    order: Number(item.number)
  }
  const catalogDefinition = {
    $schema: '../theme-catalog.schema.json',
    themeId: item.id,
    sections: item.sections
  }

  await writeFile(
    existingThemePath,
    `${JSON.stringify(themeDefinition, null, 2)}\n`,
    'utf8'
  )
  await writeFile(
    join(directory, 'catalog.json'),
    `${JSON.stringify(catalogDefinition, null, 2)}\n`,
    'utf8'
  )
}

const totals = themes.reduce(
  (result, item) => {
    result.sections += item.sections.length
    for (const currentSection of item.sections) {
      result.topics += currentSection.topics.length
      for (const currentTopic of currentSection.topics) {
        result.chapters += currentTopic.chapters.length
      }
    }
    return result
  },
  { themes: themes.length, sections: 0, topics: 0, chapters: 0 }
)

console.log(JSON.stringify(totals))
