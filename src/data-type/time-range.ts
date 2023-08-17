import { DatePicker } from 'antd'
import * as changeCaseCollection from 'change-case'
import { Moment } from 'moment'

import { DataDef } from '../types'
import BaseDataType, { Behaviors } from './base'
import TimeHelper from './utils/TimeHelper'

export default class TimeRangeType extends BaseDataType implements Behaviors {
  helper: TimeHelper

  constructor(props) {
    super(props)
    this.helper = new TimeHelper(this)
  }

  private getRangeKey(range: 'start' | 'end') {
    const def = this.getDef()
    const changeCaseFn = changeCaseCollection[def.commonConfig!.rangeCase!]

    let combined = `${def.field}_${range}`

    if (def?.commonConfig?.rangePosition === 'before') {
      combined = `${range}_${def.field}`
    }

    return changeCaseFn(combined)
  }

  getComponent() {
    return DatePicker.RangePicker
  }

  emptyValue() {
    return [0, 0]
  }

  formValueGetter(serverVal: unknown, record: any) {
    const startKey = this.getRangeKey('start')
    const endKey = this.getRangeKey('end')

    return [startKey, endKey].map((k) => this.helper.formValueGetter(record[k]))
  }

  extTableColumns() {
    const def = this.getDef()
    const { headerNameStart, headerNameEnd } = def.cellConfig || {}

    const result: DataDef[] = [
      {
        ...def,
        dataType: 'time',
        field: this.getRangeKey('start'),
        headerName: headerNameStart,
      },
      {
        ...def,
        dataType: 'time',
        field: this.getRangeKey('end'),
        headerName: headerNameEnd,
      },
    ]

    return result
  }

  extFormFields(formVal: [Moment, Moment] | null) {
    const startKey = this.getRangeKey('start')
    const endKey = this.getRangeKey('end')

    return {
      [startKey]: formVal?.[0] || null,
      [endKey]: formVal?.[1] || null,
    }
  }
}
