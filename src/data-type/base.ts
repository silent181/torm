import { ReactNode } from 'react'

import { BuiltinDataType } from '.'
import { DataDef, PlainObj, PresetData } from '../types'
import { isNil } from '../utils'

export interface Behaviors extends BaseDataType {
  /**
   * transform form value to server
   *
   *  update时，执行时机在getFormValueWhenEdit之后，所以formVal有可能是emptyValue()的返回值
   */
  paramGetter?: (formVal: any) => any

  /**
   * transform server value to form
   */
  formValueGetter?: (serverVal: any, record?: any) => any

  /**
   * transform server value to table cell
   */
  formatter?: (serverVal: any) => any

  extTableColumns?: () => DataDef[]
  extFormFields?: (formVal: any) => PlainObj

  cellRenderer?: (value: any, record: any) => ReactNode
}

export default class BaseDataType {
  private readonly type: BuiltinDataType
  private readonly def: DataDef
  private readonly presetData?: PresetData

  constructor(def: DataDef, presetData?: PresetData) {
    this.type = def.dataType as BuiltinDataType
    this.def = def
    this.presetData = presetData
  }

  protected getType() {
    return this.type
  }

  protected getPresetData() {
    return this.presetData
  }

  protected emptyValue(): any {
    return ''
  }

  protected isEmpty(formValue: any) {
    return isNil(formValue)
  }

  protected getPrimitiveEmptyValue() {
    const t = this.def.commonConfig?.primitiveType

    if (!t) {
      return undefined
    }

    const result = {
      string: '',
      number: 0,
    }

    return result[t]
  }

  getDef() {
    return this.def
  }

  defaultProps(): any {
    return {
      style: {
        width: '100%',
      },
    }
  }

  defaultItemProps() {
    return {}
  }

  getComponent(): any {
    return null
  }

  getFormValueWhenEdit(formValue: any) {
    if (this.def.formConfig?.allowServerClear === false) {
      return formValue
    }

    return this.isEmpty(formValue) ? this.emptyValue() : formValue
  }
}

export class WithPresets<T> extends BaseDataType {
  getCurrentPreset() {
    const def = this.getDef()
    const presetData = this.getPresetData()

    if (def.commonConfig?.presetKey && presetData) {
      const curPreset = presetData[def.commonConfig.presetKey] as T

      return curPreset
    }

    return [] as T
  }
}
