import { ColDef } from 'ag-grid-community'

import { BaseDataType, BuiltinDataType } from '../data-type'
import { PlainObj } from './base'
import { CellConfig, CommonConfig, FormConfig, SearchConfig } from './configs'
import { PresetConfig, PresetData, PresetItem } from './preset'

export type ModelDataType = BuiltinDataType | 'custom'

export type CustomProps<T> = PlainObj | ((dataDef: DataDef<T>, presetData: PresetData) => PlainObj)

export type ExtraFields<T = any> = {
  /**
   * 表单元素需要传dataType
   */
  dataType?: ModelDataType

  /**
   * 自定义dataType
   */
  CustomDt?: typeof BaseDataType

  /**
   * 是否为id，在具有删、改行为的模型中有且仅有一个为true，
   */
  isId?: boolean

  commonConfig?: CommonConfig

  cellConfig?: CellConfig<T>

  formConfig?: FormConfig<T>

  searchConfig?: SearchConfig<T>
}

export type DataDef<T = any> = ColDef<T> & ExtraFields<T>

export interface DataDefination<T> {
  defs: DataDef<T>[]
  presets?: PresetItem[] | PresetConfig
}
