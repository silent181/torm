import { DataDef, PresetData } from '../types'
import BooleanType from './boolean'
import EnumType from './enum'
import ImgType from './img'
import LongString from './long-string'
import NumberType from './number'
import StringType from './string'
import TimeType from './time'
import TimeRangeype from './timeRange'
import TreeType from './tree'

export { default as BaseDataType, type Behaviors } from './base'

export const DATA_TYPES = {
  string: StringType,
  number: NumberType,
  boolean: BooleanType,
  enum: EnumType,
  tree: TreeType,
  time: TimeType,
  timeRange: TimeRangeype,
  longString: LongString,
  img: ImgType,
}

export type BuiltinDataType = keyof typeof DATA_TYPES

export const getCtor = <K extends BuiltinDataType>(dataType: K) => DATA_TYPES[dataType]

export const getDt = (def: DataDef, presetData?: PresetData) => {
  if (!def.dataType || def.isId) {
    return null
  }

  if (def.dataType === 'custom' && !def.CustomDt) {
    return null
  }

  const DataTypeCtor = def.dataType === 'custom' ? def.CustomDt! : getCtor(def.dataType as BuiltinDataType)

  const dt = new DataTypeCtor(def, presetData)

  return dt
}
