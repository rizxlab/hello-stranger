import type { EnglishSkill, StoryReward } from '@/scenes/types'

/** RewardSystem 修改玩家数据所需的最小接口，避免直接依赖 Pinia。 */
export interface RewardReceiver {
  addEnglishSkill(skill: EnglishSkill, amount: number): void
  unlockVocabulary(words: readonly string[]): void
  changeRelationship(characterId: string, amount: number): void
  setFlag(flag: string, value: boolean): void
}

/** 将声明式剧情奖励应用到任意符合接口的玩家数据实现。 */
export class RewardSystem {
  applyRewards(
    rewards: readonly StoryReward[],
    receiver: RewardReceiver
  ): void {
    for (const reward of rewards) {
      this.applyReward(reward, receiver)
    }
  }

  private applyReward(reward: StoryReward, receiver: RewardReceiver): void {
    switch (reward.type) {
      case 'stat':
        receiver.addEnglishSkill(reward.stat, reward.amount)
        break
      case 'vocabulary':
        receiver.unlockVocabulary(reward.words)
        break
      case 'relationship':
        receiver.changeRelationship(reward.characterId, reward.amount)
        break
      case 'flag':
        receiver.setFlag(reward.flag, reward.value)
        break
    }
  }
}
