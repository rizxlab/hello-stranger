# Services

外部能力适配层，例如本地存档、云存档或 AI 服务。系统层不直接依赖具体供应商。

`GlobalNoteStorageService` 只负责全局笔记的 200 字限制与 localStorage 持久化，并与玩家进度存档保持独立。
