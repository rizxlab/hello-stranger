import { describe, expect, it } from 'vitest'
import type { StoryChapter, StoryScene } from '@/scenes/types'
import { SceneSystem, SceneSystemError } from './SceneSystem'

function createChapter(scenes: StoryScene[]): StoryChapter {
  return {
    schemaVersion: 1,
    id: 'test-chapter',
    storyId: 'test-story',
    title: 'Test chapter',
    chapterNumber: 1,
    startSceneId: scenes[0].id,
    startNodeId: 'dialogue-node',
    characters: [{ id: 'staff', name: 'Staff' }],
    scenes,
    nodes: [
      {
        id: 'dialogue-node',
        location: 'Test location',
        background: 'test-background',
        dialogue: [
          { id: 'line', speakerId: 'staff', text: 'Hello.' }
        ]
      }
    ]
  }
}

function scene(id: string, nextSceneId?: string): StoryScene {
  return {
    id,
    title: id,
    background: 'test-background',
    objective: 'Talk to the staff member',
    actors: [
      {
        id: 'staff-hotspot',
        characterId: 'staff',
        label: 'Staff',
        placement: {
          default: { x: 50, y: 50 },
          portrait: { x: 40, y: 60 },
          landscape: { x: 55, y: 45 }
        },
        interaction: { type: 'dialogue', targetId: 'dialogue-node' }
      }
    ],
    nextSceneId
  }
}

describe('SceneSystem', () => {
  it('isolates repeated actor IDs by scene', () => {
    const system = new SceneSystem()
    system.loadChapter(createChapter([scene('scene-one', 'scene-two'), scene('scene-two')]))

    system.activateActor('staff-hotspot')
    expect(system.completeActiveInteraction().sceneComplete).toBe(true)
    system.advanceScene()

    expect(system.hasCompletedActor('staff-hotspot')).toBe(false)
    expect(() => system.activateActor('staff-hotspot')).not.toThrow()
  })

  it('validates every responsive placement variant', () => {
    const invalidScene = scene('invalid-scene')
    invalidScene.actors[0].placement.portrait = { x: 50, y: 120 }

    expect(() => new SceneSystem().loadChapter(createChapter([invalidScene])))
      .toThrow(SceneSystemError)
  })
})
