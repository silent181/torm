export type PresetItem = {
  /**
   * 与presetKey相对应
   */
  key: string
  getter: () => unknown | Promise<unknown>
}

export type PresetData = Record<string, unknown>

export interface PresetConfig {
  data: PresetItem[]
  fresh?: boolean
}
