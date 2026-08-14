import type { DialogueLine } from '@/scenes/types'

/**
 * 管理一个剧情节点内的逐句对话。
 *
 * 本系统不了解 Vue、角色资源、选项或节点跳转。对话播放完成后，
 * 调用方再决定交给 ChoiceSystem 还是 StorySystem。
 */
export class DialogueSystem {
  private lines: readonly DialogueLine[] = []
  private currentIndex = 0

  get currentLine(): DialogueLine | null {
    if (this.isComplete) {
      return null
    }

    return this.lines[this.currentIndex] ?? null
  }

  get lineIndex(): number {
    return this.currentIndex
  }

  get lineCount(): number {
    return this.lines.length
  }

  get hasNextLine(): boolean {
    return this.currentIndex < this.lines.length - 1
  }

  get isComplete(): boolean {
    return this.currentIndex >= this.lines.length
  }

  /** 载入一组新对话，并定位到第一句。传入数据会被复制，避免外部修改。 */
  loadDialogue(lines: readonly DialogueLine[]): DialogueLine | null {
    this.lines = [...lines]
    this.currentIndex = 0
    return this.currentLine
  }

  /**
   * 推进一句对话。
   * 返回下一句；最后一句播放完后返回 null，并将 isComplete 设为 true。
   */
  advance(): DialogueLine | null {
    if (this.isComplete) {
      return null
    }

    this.currentIndex += 1
    return this.currentLine
  }

  /** 重新播放当前已载入的对话。 */
  restart(): DialogueLine | null {
    this.currentIndex = 0
    return this.currentLine
  }

  /** 清除对话并恢复到完成状态。 */
  clear(): void {
    this.lines = []
    this.currentIndex = 0
  }
}
