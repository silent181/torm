import { DatePicker } from 'antd'
import { Moment } from 'moment'

import { DataDef, PresetData } from '../types'
import { timeUtil } from '../utils'
import BaseDataType, { Behaviors } from './base'
import TimeHelper from './utils/TimeHelper'

export default class TimeType extends BaseDataType implements Behaviors {
  helper: TimeHelper

  constructor(def: DataDef, presetData?: PresetData) {
    super(def, presetData)
    this.helper = new TimeHelper(this)
  }

  getComponent(): typeof DatePicker {
    return DatePicker
  }

  emptyValue() {
    return 0
  }

  paramGetter(formVal: Moment | null | undefined) {
    return this.helper.paramGetter(formVal)
  }

  formValueGetter(serverVal: number) {
    return this.helper.formValueGetter(serverVal)
  }

  formatter(value: number | string) {
    const def = this.getDef()

    if (typeof value === 'string') {
      return value
    }

    return timeUtil.format(value, {
      valueUnit: def.commonConfig?.valueUnit,
    })
  }
}
