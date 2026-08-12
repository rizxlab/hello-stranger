/** 玩家英语能力字段。与后续 PlayerStore 保持同一组稳定键名。 */
export type EnglishSkill = 'speaking' | 'listening' | 'reading' | 'vocabulary'

/** 故事目录的一级条目，不包含章节正文。 */
export interface StoryDefinition {
  $schema?: string
  id: string
  title: string
  description?: string
  cover?: string
  order: number
}

/** 章节中可复用的角色定义。 */
export interface StoryCharacter {
  id: string
  name: string
  avatar?: string
}

/** 场景内热点的百分比位置，避免与具体屏幕像素耦合。 */
export interface ScenePosition {
  x: number
  y: number
}

/** 同一热点可针对不同画面方向独立定位，未配置时回退到 default。 */
export interface ScenePlacement {
  default: ScenePosition
  portrait?: ScenePosition
  landscape?: ScenePosition
}

/** 热点触发的声明式行为；后续可继续扩展 inspect、collect 等类型。 */
export type SceneInteraction = {
  type: 'dialogue'
  targetId: string
}

/** 一个可点击角色；位置和触发行为全部由剧情数据声明。 */
export interface SceneActor {
  id: string
  characterId: string
  label: string
  placement: ScenePlacement
  interaction: SceneInteraction
  required?: boolean
}

/** 玩家可自由观察并点击角色的视觉场景。 */
export interface StoryScene {
  id: string
  title: string
  background: string
  objective: string
  actors: SceneActor[]
  nextSceneId?: string
}

/** 一条可由 DialogueSystem 顺序播放的对话。speakerId 为 null 时表示旁白。 */
export interface DialogueLine {
  id: string
  speakerId: string | null
  text: string
  translation?: string
  audio?: string
}

/** 选项是否可见的声明式条件。 */
export type StoryCondition =
  | {
      type: 'minimumStat'
      stat: EnglishSkill
      value: number
    }
  | {
      type: 'hasVocabulary'
      word: string
    }
  | {
      type: 'minimumRelationship'
      characterId: string
      value: number
    }
  | {
      type: 'flag'
      flag: string
      value: boolean
    }

/** 由 RewardSystem 解释并应用到玩家状态的奖励。 */
export type StoryReward =
  | {
      type: 'stat'
      stat: EnglishSkill
      amount: number
    }
  | {
      type: 'vocabulary'
      words: string[]
    }
  | {
      type: 'relationship'
      characterId: string
      amount: number
    }
  | {
      type: 'flag'
      flag: string
      value: boolean
    }

/** 英语表达反馈。naturalness 使用 1 到 5 星，不使用“正确/错误”二元评价。 */
export interface ChoiceFeedback {
  naturalness: 1 | 2 | 3 | 4 | 5
  assessment: string
  naturalExpression?: string
  explanation: string
}

/** 玩家可选择的英语表达。 */
export interface StoryChoice {
  id: string
  text: string
  feedback: ChoiceFeedback
  nextNodeId: string
  conditions?: StoryCondition[]
  rewards?: StoryReward[]
}

/** 一个可跳转的剧情节点。对话结束后显示 choices，或直接跳转到 nextNodeId。 */
export interface StoryNode {
  id: string
  location: string
  background: string
  dialogue: DialogueLine[]
  choices?: StoryChoice[]
  nextNodeId?: string
}

/** 单个章节 JSON 的顶层结构。 */
export interface StoryChapter {
  $schema?: string
  schemaVersion: 1
  id: string
  storyId: string
  title: string
  chapterNumber: number
  summary?: string
  startSceneId: string
  startNodeId: string
  scenes: StoryScene[]
  characters: StoryCharacter[]
  nodes: StoryNode[]
}
