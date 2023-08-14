import { Moment } from 'moment'

import { dateFormatter } from '../../constant'
import { timeUtil } from '../../utils'
import BaseDataType from '../base'

export default class TimeHelper {
  timeTypeInstance: BaseDataType

  /**
   *
   */
  constructor(ins: BaseDataType) {
    this.timeTypeInstance = ins
  }

  paramGetter(formVal: Moment | null | undefined) {
    const def = this.timeTypeInstance.getDef()

    if (def.commonConfig?.primitiveType === 'string') {
      if (!formVal) {
        return null
      }

      return formVal.format(def.commonConfig?.serverTimeFormatter || dateFormatter)
    }

    return timeUtil.getTimeStamp(formVal, {
      returnUnit: def.commonConfig?.valueUnit,
    })
  }

  formValueGetter(serverVal: number | string) {
    const def = this.timeTypeInstance.getDef()

    return timeUtil.getFormValue(serverVal, def.commonConfig?.valueUnit, def.commonConfig?.primitiveType)
  }
}
